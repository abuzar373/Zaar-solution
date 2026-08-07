export async function parseApiResponse<T extends Record<string, unknown> = Record<string, unknown>>(
  response: Response
): Promise<T> {
  const text = await response.text();

  if (!text.trim()) {
    return ({
      error: response.ok
        ? "The server returned an empty response. Please try again."
        : `Request failed with status ${response.status}. Check your server environment variables.`,
    } as unknown) as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return ({
      error: response.ok
        ? "The server returned an invalid response. Please try again."
        : `Request failed with status ${response.status}. Check your Supabase connection and deployment logs.`,
    } as unknown) as T;
  }
}
