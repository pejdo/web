/**
 * Tests for the contact endpoint.
 *
 * Runs on Node's built-in test runner with type stripping, so it needs no
 * transpile step and no extra dev dependencies. These tests execute the real
 * handler rather than merely typechecking it; Resend is stubbed, so nothing
 * here sends mail or touches the network.
 *
 * Run with: npm run test:functions
 */

import { strict as assert } from 'node:assert';
import { afterEach, describe, it } from 'node:test';

import { onRequestGet, onRequestPost } from './contact.ts';

type Env = Record<string, string | undefined>;

const VALID_ENV: Env = {
  RESEND_API_KEY: 'test-key',
  CONTACT_TO: 'nikola@pejdo.com',
  CONTACT_FROM: 'web@pejdo.com',
};

/** A submission that passes validation, so each test varies only what it cares about. */
const validFields = (): Record<string, string> => ({
  name: 'Ana Horvat',
  email: 'ana@example.com',
  subject: 'Rodoslov',
  message: 'Imam fotografije iz Brotnja.',
});

interface Call {
  url: string;
  body: Record<string, unknown>;
}

/** Resend calls captured by the fetch stub. */
let calls: Call[] = [];
const realFetch = globalThis.fetch;

/**
 * Replaces global fetch with a stub that records what the handler sent.
 *
 * @param respond - Response the stubbed provider returns. Defaults to 200.
 */
function stubFetch(respond: () => Response = () => new Response('{}', { status: 200 })): void {
  calls = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    let body: Record<string, unknown> = {};
    if (typeof init?.body === 'string') body = JSON.parse(init.body);
    calls.push({ url, body });
    return respond();
  }) as typeof fetch;
}

/** Invokes the handler with the given fields, as a fetch() submission would. */
async function postJson(
  fields: Record<string, string>,
  env: Env = VALID_ENV
): Promise<{ status: number; body: { ok?: boolean; error?: string } }> {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);

  const request = new Request('https://pejdo.com/api/contact', {
    method: 'POST',
    body: form,
    headers: { accept: 'application/json' },
  });

  const response = await call(request, env);
  return { status: response.status, body: await response.json() };
}

/** Invokes the handler as a plain HTML form submission would (no accept header). */
async function postForm(fields: Record<string, string>, env: Env = VALID_ENV): Promise<Response> {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, value);

  const request = new Request('https://pejdo.com/api/contact', { method: 'POST', body: form });
  return call(request, env);
}

/** The handler reads only request and env, so the rest of the Pages context is omitted. */
function call(request: Request, env: Env): Promise<Response> {
  return (onRequestPost as unknown as (ctx: { request: Request; env: Env }) => Promise<Response>)({
    request,
    env,
  });
}

/** The HTML body handed to Resend in the most recent call. */
const sentHtml = (): string => String(calls[0]?.body.html ?? '');

/** The plain text body handed to Resend in the most recent call. */
const sentText = (): string => String(calls[0]?.body.text ?? '');

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe('configuration', () => {
  it('refuses to send when a variable is missing, without naming it', async () => {
    for (const missing of ['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM']) {
      stubFetch();
      const { status, body } = await postJson(validFields(), {
        ...VALID_ENV,
        [missing]: undefined,
      });

      assert.equal(status, 500, `${missing} unset should be a 500`);
      // The response must not disclose how the deployment is configured.
      assert.equal(JSON.stringify(body).includes(missing), false);
      assert.equal(calls.length, 0, 'must not call the provider when unconfigured');
    }
  });
});

describe('validation', () => {
  it('requires a name, a message and a plausible email', async () => {
    for (const field of ['name', 'message', 'email']) {
      stubFetch();
      const { status } = await postJson({ ...validFields(), [field]: '' });

      assert.equal(status, 422, `empty ${field} should be rejected`);
      assert.equal(calls.length, 0);
    }
  });

  it('rejects addresses that are not plausibly email addresses', async () => {
    for (const email of ['ana', 'ana@', '@example.com', 'ana@example', 'a b@c.com']) {
      stubFetch();
      const { status } = await postJson({ ...validFields(), email });

      assert.equal(status, 422, `${email} should be rejected`);
      assert.equal(calls.length, 0);
    }
  });

  it('accepts the messier addresses that real people have', async () => {
    for (const email of ['ana+rod@example.co.uk', 'ana.horvat@sub.example.hr']) {
      stubFetch();
      const { status } = await postJson({ ...validFields(), email });
      assert.equal(status, 200, `${email} should be accepted`);
    }
  });

  it('treats the subject as optional', async () => {
    stubFetch();
    const { status } = await postJson({ ...validFields(), subject: '' });

    assert.equal(status, 200);
    // Falls back to a generated subject rather than sending an empty one.
    assert.match(String(calls[0].body.subject), /pejdo\.com/);
  });

  it('uses the page default when the visitor leaves the subject empty', async () => {
    stubFetch();
    // _subject is the hidden field the contact page renders.
    const { status } = await postJson({
      ...validFields(),
      subject: '',
      _subject: 'Nova poruka s web stranice',
    });

    assert.equal(status, 200);
    assert.equal(calls[0].body.subject, 'Nova poruka s web stranice');
  });

  it('prefers the visitor’s own subject over the page default', async () => {
    stubFetch();
    await postJson({ ...validFields(), _subject: 'Nova poruka s web stranice' });

    assert.equal(calls[0].body.subject, 'Rodoslov');
  });

  it('rejects a body that is not form data', async () => {
    stubFetch();
    const request = new Request('https://pejdo.com/api/contact', {
      method: 'POST',
      body: 'not form data',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
    });

    const response = await call(request, VALID_ENV);
    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });

  it('refuses an oversized body before reading it', async () => {
    stubFetch();
    const request = new Request('https://pejdo.com/api/contact', {
      method: 'POST',
      body: new FormData(),
      headers: { accept: 'application/json', 'content-length': String(100 * 1024) },
    });

    const response = await call(request, VALID_ENV);
    assert.equal(response.status, 413);
    assert.equal(calls.length, 0);
  });
});

describe('spam handling', () => {
  it('silently discards submissions that fill the honeypot', async () => {
    stubFetch();
    const { status, body } = await postJson({ ...validFields(), _gotcha: 'bot' });

    // Reports success so the bot does not learn it was caught, but sends nothing.
    assert.equal(status, 200);
    assert.equal(body.ok, true);
    assert.equal(calls.length, 0, 'honeypot hit must not send mail');
  });

  it('still accepts a submission that leaves the honeypot empty', async () => {
    stubFetch();
    const { status } = await postJson({ ...validFields(), _gotcha: '' });

    assert.equal(status, 200);
    assert.equal(calls.length, 1);
  });

  it('stops sending once an IP passes the rate limit', async () => {
    stubFetch();
    const counters = new Map<string, string>();
    const env = {
      ...VALID_ENV,
      CONTACT_RATELIMIT: {
        get: async (key: string) => counters.get(key) ?? null,
        put: async (key: string, value: string) => void counters.set(key, value),
      },
    } as unknown as Env;

    const send = () => {
      const form = new FormData();
      for (const [key, value] of Object.entries(validFields())) form.append(key, value);
      return call(
        new Request('https://pejdo.com/api/contact', {
          method: 'POST',
          body: form,
          headers: { accept: 'application/json', 'cf-connecting-ip': '203.0.113.7' },
        }),
        env
      );
    };

    for (let i = 0; i < 5; i += 1) {
      assert.equal((await send()).status, 200, `submission ${i + 1} should be accepted`);
    }
    assert.equal((await send()).status, 429, 'the sixth submission should be refused');
    assert.equal(calls.length, 5, 'only the accepted submissions should send mail');
  });
});

describe('the email that gets sent', () => {
  it('posts to Resend with the configured sender and recipient', async () => {
    stubFetch();
    await postJson(validFields());

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.resend.com/emails');
    assert.equal(calls[0].body.from, 'web@pejdo.com');
    assert.deepEqual(calls[0].body.to, ['nikola@pejdo.com']);
  });

  it('sets reply-to to the visitor, so replying reaches them', async () => {
    stubFetch();
    await postJson(validFields());

    assert.equal(calls[0].body.reply_to, 'ana@example.com');
    // The visitor's address must never become the sender.
    assert.notEqual(calls[0].body.from, 'ana@example.com');
  });

  it('includes every submitted field in the body', async () => {
    stubFetch();
    await postJson(validFields());

    for (const value of Object.values(validFields())) {
      assert.ok(sentText().includes(value), `text body should contain ${value}`);
      assert.ok(sentHtml().includes(value), `html body should contain ${value}`);
    }
  });

  it('escapes submitted HTML rather than embedding it', async () => {
    stubFetch();
    const attack = '<img src=x onerror="alert(1)">';
    await postJson({ ...validFields(), name: attack, message: attack });

    const html = sentHtml();
    assert.equal(html.includes('<img'), false, 'raw tag must not survive');
    assert.equal(html.includes('onerror="alert'), false);
    assert.ok(html.includes('&lt;img'), 'should appear escaped');
  });

  it('strips newlines from the subject, so headers cannot be injected', async () => {
    stubFetch();
    await postJson({ ...validFields(), subject: 'Upit\r\nBcc: attacker@example.com' });

    const subject = String(calls[0].body.subject);
    assert.equal(/[\r\n]/.test(subject), false, 'subject must be a single line');
    assert.ok(subject.includes('Upit'));
  });

  it('caps the message so a client cannot post megabytes', async () => {
    stubFetch();
    await postJson({ ...validFields(), message: 'x'.repeat(20_000) });

    const xs = sentText().match(/x{100,}/)?.[0] ?? '';
    assert.equal(xs.length, 5000, 'message should be capped at 5000 characters');
  });
});

describe('provider failures', () => {
  it('reports a generic failure when Resend refuses the send', async () => {
    stubFetch(() => new Response('domain is not verified', { status: 403 }));
    const { status, body } = await postJson(validFields());

    assert.equal(status, 502);
    // The provider's wording must not reach the browser.
    assert.equal(JSON.stringify(body).includes('domain'), false);
  });

  it('survives the provider being unreachable', async () => {
    stubFetch(() => {
      throw new Error('network down');
    });
    const { status, body } = await postJson(validFields());

    assert.equal(status, 502);
    assert.equal(body.ok, false);
  });
});

describe('submissions without JavaScript', () => {
  it('redirects back to the contact page with a success flag', async () => {
    stubFetch();
    const response = await postForm(validFields());

    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), 'https://pejdo.com/contact/?poruka=ok');
  });

  it('redirects with an error flag when the input is unusable', async () => {
    stubFetch();
    const response = await postForm({ ...validFields(), email: 'nonsense' });

    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), 'https://pejdo.com/contact/?poruka=invalid');
    assert.equal(calls.length, 0);
  });

  it('sends a GET on the endpoint back to the form', async () => {
    const response = await (
      onRequestGet as unknown as (ctx: { request: Request }) => Promise<Response>
    )({ request: new Request('https://pejdo.com/api/contact') });

    assert.equal(response.status, 303);
    assert.match(String(response.headers.get('location')), /\/contact\/\?poruka=/);
  });
});
