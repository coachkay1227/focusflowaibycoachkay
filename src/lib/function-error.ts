/**
 * Read the real error message out of a failed `supabase.functions.invoke` call.
 *
 * `invoke` surfaces a non-2xx response as a generic FunctionsHttpError whose
 * `message` is just "Edge Function returned a non-2xx status code". The useful
 * text (a rate-limit notice, a validation reason) lives in the response body,
 * so we read it and fall back to a plain message when there is nothing there.
 */
export async function readFunctionError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): Promise<{ message: string; status?: number; rateLimited: boolean }> {
  const context = (error as { context?: unknown })?.context;
  const response = context instanceof Response ? context : undefined;
  const status = response?.status;

  let message = "";
  if (response) {
    try {
      const cloned = response.clone();
      const body = await cloned.json();
      if (body && typeof body.error === "string") message = body.error;
    } catch {
      /* body was empty or not JSON */
    }
  }

  if (!message && error instanceof Error && error.message && status !== 429) {
    message = error.message;
  }

  return {
    message: message || fallback,
    status,
    rateLimited: status === 429,
  };
}
