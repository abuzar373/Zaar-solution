/**
 * Runs a database query and returns a fallback value if it fails.
 *
 * Public marketing pages should degrade gracefully (show an empty state)
 * rather than return a 500 when the database is briefly unreachable or has
 * not been provisioned yet.
 *
 * `NoInfer` on the fallback keeps type inference anchored to the query itself,
 * so passing `[]` as a fallback does not collapse the result type to never[].
 */
export async function safeQuery<T>(
  run: () => Promise<T>,
  fallback: NoInfer<T>,
  label = "query"
): Promise<T> {
  try {
    return await run();
  } catch (err) {
    console.error(
      `[db] ${label} failed — serving fallback:`,
      err instanceof Error ? err.message : err
    );
    return fallback as T;
  }
}
