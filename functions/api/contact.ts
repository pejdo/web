/**
 * Contact form handler for pejdo.com — Cloudflare Pages Function.
 *
 * Receives the POST from the form on /contact and sends the message by email
 * through Resend (https://resend.com). The site is a static build with no
 * server, so this file is the only server-side code in the project. Cloudflare
 * Pages maps functions/api/contact.ts to POST /api/contact automatically.
 *
 * Required environment variables (set in the Cloudflare dashboard, never here):
 *   RESEND_API_KEY   Resend API key. Secret.
 *   CONTACT_TO       Recipient, e.g. nikola@pejdo.com
 *   CONTACT_FROM     Verified sender on a domain you own, e.g. web@pejdo.com
 *
 * Security posture:
 * - The API key exists only in the environment and is never sent to the browser.
 * - Submissions are rate limited per IP when a KV namespace is bound.
 * - A honeypot field catches naive bots without inconveniencing real visitors.
 * - Every submitted value is untrusted: length-capped, stripped of CR/LF before
 *   going anywhere near a mail header, and HTML-escaped in the HTML body.
 * - The visitor's address goes in Reply-To, never in From, so a submission
 *   cannot be used to spoof a sender on pejdo.com.
 * - Provider errors are logged but never echoed to the visitor.
 */

interface Env {
  RESEND_API_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  /** Optional KV namespace for rate limiting. When absent, limiting is skipped. */
  CONTACT_RATELIMIT?: RateLimitStore;
}

/**
 * The slice of Cloudflare's KV API this function uses.
 *
 * Declared locally rather than pulling in @cloudflare/workers-types: this is the
 * only server-side file in the project, and a full types package for one handler
 * would be more dependency than it is worth. Cloudflare supplies the real
 * implementation at runtime.
 */
interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

/** Cloudflare invokes the handler with the request and the bound environment. */
type PagesFunctionHandler = (context: { request: Request; env: Env }) => Promise<Response>;

/** Upper bound on each field, guarding against oversized payloads. */
const LIMITS = {
  name: 100,
  email: 200,
  subject: 200,
  message: 5000,
} as const;

/** Max submissions accepted from one IP within the window. */
const RATE_LIMIT = { max: 5, windowSeconds: 3600 };

/** Total request body we are willing to read, in bytes. */
const MAX_BODY_BYTES = 64 * 1024;

/** Page the visitor is returned to, with the result flag appended. */
const CONTACT_PATH = '/contact/';

interface ContactFields {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/** Escapes the five characters that are unsafe in HTML text and attributes. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips characters that would let a value break out of a mail header.
 * Applied to anything interpolated into a header such as Subject or Reply-To.
 */
function sanitiseHeader(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

/**
 * Conservative email shape check.
 *
 * Deliberately not RFC 5322 complete: the aim is to reject obvious rubbish and
 * anything carrying header-injection characters, not to adjudicate exotic but
 * legal addresses.
 */
function isPlausibleEmail(value: string): boolean {
  if (value.length > LIMITS.email) return false;
  if (/[\r\n\s,;]/.test(value)) return false;
  return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(value);
}

/** A JSON response with the given status. */
function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

/**
 * Redirects back to the contact page with a status flag, for ordinary (non-JS)
 * form submissions. The flag drives the banner shown to the visitor.
 */
function redirectTo(request: Request, status: 'ok' | 'error' | 'invalid'): Response {
  const target = new URL(CONTACT_PATH, new URL(request.url).origin);
  target.searchParams.set('poruka', status);
  return Response.redirect(target.toString(), 303);
}

/**
 * Counts submissions per IP and reports whether this one exceeds the limit.
 * Returns false when no KV namespace is bound, so the form still works without
 * rate limiting configured.
 */
async function isRateLimited(env: Env, ip: string): Promise<boolean> {
  if (!env.CONTACT_RATELIMIT || !ip) return false;

  const key = `contact:${ip}`;
  try {
    const current = Number((await env.CONTACT_RATELIMIT.get(key)) ?? '0');
    if (current >= RATE_LIMIT.max) return true;

    await env.CONTACT_RATELIMIT.put(key, String(current + 1), {
      expirationTtl: RATE_LIMIT.windowSeconds,
    });
    return false;
  } catch {
    // A KV failure must not block a legitimate message.
    return false;
  }
}

/** Reads and validates the form fields. Returns null when input is unusable. */
function readFields(form: FormData): ContactFields | null {
  const get = (key: string, limit: number): string =>
    String(form.get(key) ?? '')
      .trim()
      .slice(0, limit);

  const name = get('name', LIMITS.name);
  const email = get('email', LIMITS.email);
  const message = get('message', LIMITS.message);

  // The visitor's own subject wins. `_subject` is the default the page sets as a
  // hidden field, used when the visitor leaves the Predmet field empty.
  const subject = get('subject', LIMITS.subject) || get('_subject', LIMITS.subject);

  if (!name || !message || !isPlausibleEmail(email)) return null;

  return { name, email, subject, message };
}

export const onRequestPost: PagesFunctionHandler = async ({ request, env }) => {
  // Reply with JSON when the form was submitted by fetch() rather than natively.
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const fail = (status: 'error' | 'invalid', httpStatus: number, detail: string) =>
    wantsJson ? json({ ok: false, error: detail }, httpStatus) : redirectTo(request, status);

  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    // Name the absent variables in the logs only: which ones are missing is what
    // makes this diagnosable. The visitor sees the same generic failure either way.
    const missing = (['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM'] as const).filter(
      (name) => !env[name]
    );
    console.error(`[contact] Missing configuration: ${missing.join(', ')}.`);
    return fail('error', 500, 'Server nije konfiguriran.');
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) {
    return fail('invalid', 413, 'Poruka je prevelika.');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail('invalid', 400, 'Neispravan zahtjev.');
  }

  // Honeypot: a field hidden from people. Anything filling it is a bot, so the
  // submission is silently accepted and discarded rather than visibly rejected.
  if (String(form.get('_gotcha') ?? '').length > 0) {
    return wantsJson ? json({ ok: true }, 200) : redirectTo(request, 'ok');
  }

  const fields = readFields(form);
  if (!fields) {
    return fail('invalid', 422, 'Provjerite ime, e-mail i poruku.');
  }

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  if (await isRateLimited(env, ip)) {
    return fail('error', 429, 'Previše poruka. Pokušajte kasnije.');
  }

  const subject = sanitiseHeader(fields.subject || `Nova poruka s pejdo.com — ${fields.name}`);

  // Plain text carries the message; HTML is a convenience copy. Both are built
  // from sanitised values.
  const text = [
    `Ime: ${fields.name}`,
    `E-mail: ${fields.email}`,
    fields.subject ? `Predmet: ${fields.subject}` : null,
    '',
    fields.message,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const html = `
    <table role="presentation" style="font-family: system-ui, sans-serif; font-size: 15px;">
      <tr><td><strong>Ime</strong></td><td>${escapeHtml(fields.name)}</td></tr>
      <tr><td><strong>E-mail</strong></td><td>${escapeHtml(fields.email)}</td></tr>
      ${
        fields.subject
          ? `<tr><td><strong>Predmet</strong></td><td>${escapeHtml(fields.subject)}</td></tr>`
          : ''
      }
    </table>
    <hr />
    <p style="white-space: pre-wrap; font-family: system-ui, sans-serif; font-size: 15px;">${escapeHtml(
      fields.message
    )}</p>
  `.trim();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        // From must stay on a domain verified with Resend. The visitor's address
        // goes to reply_to, so replying reaches them directly.
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: sanitiseHeader(fields.email),
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      // Log the provider's reason, but never expose it to the visitor.
      console.error(`[contact] Resend responded ${response.status}: ${await response.text()}`);
      if (response.status === 403) {
        // Nearly always an unverified sending domain, which is the most common
        // setup mistake and otherwise looks like a generic send failure.
        console.error(
          '[contact] Check that CONTACT_FROM uses a domain verified at resend.com/domains.'
        );
      }
      return fail('error', 502, 'Poruku trenutno nije moguće poslati.');
    }
  } catch (error) {
    console.error(`[contact] Send failed: ${error instanceof Error ? error.message : error}`);
    return fail('error', 502, 'Poruku trenutno nije moguće poslati.');
  }

  return wantsJson ? json({ ok: true }, 200) : redirectTo(request, 'ok');
};

/** A GET on the endpoint is not meaningful; point the visitor back at the form. */
export const onRequestGet: PagesFunctionHandler = async ({ request }) =>
  redirectTo(request, 'invalid');
