/**
 * Google Photos - public shared album loader
 *
 * Reads the photos of a PUBLICLY SHARED Google Photos album at build time and
 * returns their CDN base URLs.
 *
 * Why no official API:
 * The Google Photos Library API restricted the `photoslibrary.readonly` scope in
 * March 2025 - an app can only read media it created itself. The Picker API is
 * the sanctioned replacement, but it requires an interactive OAuth sign-in per
 * visitor, which does not work for a public gallery on a statically built site.
 * Parsing the share page is therefore the only credential-free option.
 *
 * Consequences to be aware of:
 * - Unofficial: Google can change the page payload at any time. Every failure
 *   is non-fatal - the loader logs a warning and returns an empty array so the
 *   build never breaks.
 * - The album must be shared with "anyone with the link". Anything the link can
 *   reach is public; do not point this at private photos.
 * - Photos are fetched at build time, so new uploads appear after a rebuild.
 */

/** Hosts we accept a share link for. */
const ALLOWED_SHARE_HOSTS = ['photos.google.com', 'photos.app.goo.gl'];

/** The only host we accept image URLs from. */
const PHOTO_CDN_HOST = 'lh3.googleusercontent.com';

/**
 * Image entries in the share page payload look like:
 *   ["https://lh3.googleusercontent.com/pw/<id>",4032,3024,null,...]
 * Avatars and icons live under other paths (/a/, /a-/) and are excluded by the
 * `/pw/` prefix.
 */
const PHOTO_ENTRY =
  /\["(https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_-]+)",(\d{2,6}),(\d{2,6})/g;

/** A photo as returned by the loader - size is chosen by the caller. */
export interface GooglePhoto {
  /** CDN base URL without a size suffix. Use googlePhotoUrl() to size it. */
  baseUrl: string;
  /** Original pixel width, as reported by Google. */
  width: number;
  /** Original pixel height, as reported by Google. */
  height: number;
}

export interface FetchAlbumOptions {
  /** Upper bound on returned photos. Default 100. */
  maxPhotos?: number;
  /** Abort the request after this many milliseconds. Default 10000. */
  timeoutMs?: number;
}

/**
 * Appends a size hint to a Google Photos CDN URL.
 *
 * Google serves a resized copy for the `=w<width>-h<height>` suffix, so
 * thumbnails do not download the full-resolution original.
 *
 * @param baseUrl CDN base URL from {@link fetchGooglePhotosAlbum}
 * @param width Requested width in CSS pixels
 * @returns Sized image URL
 */
export function googlePhotoUrl(baseUrl: string, width: number): string {
  return `${baseUrl}=w${Math.round(width)}`;
}

/**
 * Loads the photos of a publicly shared Google Photos album.
 *
 * Never throws: on an invalid link, network error, or unexpected page layout it
 * logs a warning and returns an empty array so the page can fall back to local
 * photos or an empty state.
 *
 * @param shareUrl Share link, e.g. https://photos.app.goo.gl/xxxxxxxx
 * @param options Limits for the request
 * @returns Photos in album order, deduplicated
 */
export async function fetchGooglePhotosAlbum(
  shareUrl: string,
  options: FetchAlbumOptions = {}
): Promise<GooglePhoto[]> {
  const { maxPhotos = 100, timeoutMs = 10_000 } = options;

  let parsed: URL;
  try {
    parsed = new URL(shareUrl);
  } catch {
    console.warn(`[googlePhotos] Not a valid URL: ${shareUrl}`);
    return [];
  }

  if (parsed.protocol !== 'https:' || !ALLOWED_SHARE_HOSTS.includes(parsed.hostname)) {
    console.warn(
      `[googlePhotos] Refusing to fetch ${parsed.hostname}. Expected an https link on ${ALLOWED_SHARE_HOSTS.join(' or ')}.`
    );
    return [];
  }

  let html: string;
  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        // Google returns a stripped page without a browser-like User-Agent.
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'hr,en;q=0.8',
      },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    });

    if (!response.ok) {
      console.warn(
        `[googlePhotos] Album request failed with ${response.status} ${response.statusText}. Is the album shared with "anyone with the link"?`
      );
      return [];
    }

    html = await response.text();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[googlePhotos] Could not load the album: ${reason}`);
    return [];
  }

  const photos: GooglePhoto[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(PHOTO_ENTRY)) {
    const [, baseUrl, rawWidth, rawHeight] = match;

    // Defensive: the regex already pins the host, this guards future edits.
    if (new URL(baseUrl).hostname !== PHOTO_CDN_HOST) continue;
    if (seen.has(baseUrl)) continue;

    seen.add(baseUrl);
    photos.push({
      baseUrl,
      width: Number(rawWidth),
      height: Number(rawHeight),
    });

    if (photos.length >= maxPhotos) break;
  }

  if (photos.length === 0) {
    console.warn(
      '[googlePhotos] No photos found in the album page. The album may be empty, private, or Google changed its page format.'
    );
  }

  return photos;
}
