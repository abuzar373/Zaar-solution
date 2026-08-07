/**
 * Safe JSON fetch for the browser.
 *
 * A plain `await res.json()` throws "Unexpected end of JSON input" whenever the
 * server returns an empty body or an HTML error page (crashed route, gateway
 * timeout, 502 from the host…). This helper never throws on parsing — it
 * always resolves to a useful object, or throws an Error with a readable
 * message that can be shown directly to the user.
 */
export async function fetchJson<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, { credentials: "same-origin", ...init });
  } catch {
    throw new Error("Network error — please check your connection and try again.");
  }

  const text = await res.text().catch(() => "");

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null; // HTML error page or truncated body
    }
  }

  if (!res.ok) {
    const message =
      (data as { error?: string } | null)?.error ??
      serverMessageFor(res.status);
    throw new Error(message);
  }

  if (data === null) {
    throw new Error("The server returned an unexpected response. Please try again.");
  }

  return data as T;
}

function serverMessageFor(status: number): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "That resource could not be found.";
  if (status === 413) return "That file is too large.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status === 503)
    return "The server cannot reach the database right now. Please try again shortly.";
  if (status >= 500)
    return "The server encountered an error. Please try again in a moment.";
  return `Request failed (${status}).`;
}
