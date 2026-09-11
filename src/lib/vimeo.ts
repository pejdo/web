/**
 * Vimeo - build-time metadata via the public oEmbed endpoint.
 *
 * Vimeo's oEmbed API needs no API key or OAuth for public videos, so it works
 * from a static build. It returns the title, poster thumbnail, duration, and
 * intrinsic dimensions, which is everything needed to render a click-to-play
 * facade.
 *
 * Deliberately NOT used: the `html` field of the oEmbed response, which is a
 * ready-made <iframe> snippet. Injecting third-party HTML would hand Vimeo
 * control over the attributes on our page. The iframe is built locally instead,
 * from a validated numeric video id.
 *
 * Every failure is non-fatal: the loader logs a warning and returns null so the
 * build never breaks on a deleted, private, or unreachable video.
 */

const OEMBED_ENDPOINT = 'https://vimeo.com/api/oembed.json';

/** Hosts we accept a video link for. */
const ALLOWED_HOSTS = ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'];

/** Metadata needed to render a video facade. */
export interface VimeoVideo {
  /** Numeric Vimeo id, safe to interpolate into a player URL */
  id: string;
  /** Video title, used as the iframe title and visible heading */
  title: string;
  /** Poster image URL, or null when Vimeo returned none */
  thumbnailUrl: string | null;
  /** Poster width in pixels, when known */
  thumbnailWidth: number | null;
  /** Poster height in pixels, when known */
  thumbnailHeight: number | null;
  /** Runtime in seconds, when known */
  duration: number | null;
  /** Intrinsic video width, used for the aspect ratio */
  width: number;
  /** Intrinsic video height, used for the aspect ratio */
  height: number;
  /** Uploader name, when known */
  authorName: string | null;
  /**
   * Unlisted-video hash (the `h=` parameter). Required in the player URL for
   * unlisted videos, omitted otherwise.
   */
  hash: string | null;
}

export interface FetchVimeoOptions {
  /** Requested poster/player width. Default 1280. */
  width?: number;
  /** Abort the request after this many milliseconds. Default 10000. */
  timeoutMs?: number;
}

/**
 * Extracts the numeric id and optional unlisted hash from a Vimeo URL.
 *
 * Handles the common shapes:
 *   https://vimeo.com/123456789
 *   https://vimeo.com/123456789/abcdef1234   (unlisted)
 *   https://vimeo.com/123456789?h=abcdef1234 (unlisted)
 *   https://player.vimeo.com/video/123456789
 *
 * @param url Any Vimeo video URL
 * @returns The id and hash, or null when the URL is not a recognised Vimeo video
 */
export function parseVimeoUrl(url: string): { id: string; hash: string | null } | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.includes(parsed.hostname)) return null;

  // Path segments, ignoring the /video/ prefix that player URLs carry.
  const segments = parsed.pathname.split('/').filter((segment) => segment && segment !== 'video');

  const id = segments[0];
  if (!id || !/^\d+$/.test(id)) return null;

  // The hash may arrive as a second path segment or as the `h` query parameter.
  const candidate = segments[1] ?? parsed.searchParams.get('h') ?? null;
  const hash = candidate && /^[A-Za-z0-9]+$/.test(candidate) ? candidate : null;

  return { id, hash };
}

/**
 * Builds the player URL for an embedded Vimeo video.
 *
 * `dnt=1` asks Vimeo not to track the session. Autoplay is only meaningful
 * after a click, which is the sole way the facade loads the iframe.
 *
 * @param video Video to embed
 * @param autoplay Start playing as soon as the iframe loads
 * @returns Player URL for the iframe src
 */
export function vimeoPlayerUrl(video: Pick<VimeoVideo, 'id' | 'hash'>, autoplay = false): string {
  const params = new URLSearchParams({ dnt: '1' });
  if (video.hash) params.set('h', video.hash);
  if (autoplay) params.set('autoplay', '1');
  return `https://player.vimeo.com/video/${video.id}?${params.toString()}`;
}

/** Formats a duration in seconds as m:ss, or h:mm:ss past an hour. */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Reads public metadata for a Vimeo video at build time.
 *
 * Never throws: returns null on an invalid URL, a private or deleted video, a
 * network error, or an unexpected payload.
 *
 * @param url Vimeo video URL
 * @param options Request limits
 * @returns Video metadata, or null when it cannot be read
 */
export async function fetchVimeoVideo(
  url: string,
  options: FetchVimeoOptions = {}
): Promise<VimeoVideo | null> {
  const { width = 1280, timeoutMs = 10_000 } = options;

  const parsed = parseVimeoUrl(url);
  if (!parsed) {
    console.warn(`[vimeo] Not a recognised Vimeo video URL: ${url}`);
    return null;
  }

  // Rebuild a canonical URL so only the validated id and hash are sent on.
  const canonical = parsed.hash
    ? `https://vimeo.com/${parsed.id}/${parsed.hash}`
    : `https://vimeo.com/${parsed.id}`;

  const endpoint = `${OEMBED_ENDPOINT}?${new URLSearchParams({
    url: canonical,
    width: String(width),
  })}`;

  let payload: Record<string, unknown>;
  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      console.warn(
        `[vimeo] oEmbed request for video ${parsed.id} failed with ${response.status} ${response.statusText}. The video may be private, deleted, or not embeddable.`
      );
      return null;
    }

    payload = (await response.json()) as Record<string, unknown>;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[vimeo] Could not load metadata for video ${parsed.id}: ${reason}`);
    return null;
  }

  const asNumber = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;
  const asString = (value: unknown): string | null =>
    typeof value === 'string' && value.length > 0 ? value : null;

  // Only accept a poster served from Vimeo's own CDN.
  const rawThumbnail = asString(payload.thumbnail_url);
  let thumbnailUrl: string | null = null;
  if (rawThumbnail) {
    try {
      const thumbHost = new URL(rawThumbnail).hostname;
      if (thumbHost.endsWith('vimeocdn.com')) thumbnailUrl = rawThumbnail;
      else console.warn(`[vimeo] Ignoring off-CDN thumbnail host: ${thumbHost}`);
    } catch {
      console.warn('[vimeo] Ignoring malformed thumbnail URL.');
    }
  }

  return {
    id: parsed.id,
    hash: parsed.hash,
    title: asString(payload.title) ?? `Vimeo video ${parsed.id}`,
    thumbnailUrl,
    thumbnailWidth: asNumber(payload.thumbnail_width),
    thumbnailHeight: asNumber(payload.thumbnail_height),
    duration: asNumber(payload.duration),
    width: asNumber(payload.width) ?? 1280,
    height: asNumber(payload.height) ?? 720,
    authorName: asString(payload.author_name),
  };
}

/**
 * Reads metadata for several videos, keeping album order and dropping any that
 * cannot be read.
 *
 * @param urls Vimeo video URLs
 * @param options Request limits
 * @returns Metadata for the videos that resolved
 */
export async function fetchVimeoVideos(
  urls: string[],
  options: FetchVimeoOptions = {}
): Promise<VimeoVideo[]> {
  const results = await Promise.all(urls.map((url) => fetchVimeoVideo(url, options)));
  return results.filter((video): video is VimeoVideo => video !== null);
}
