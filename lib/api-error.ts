/** The backend's message for a failed request (NestJS may send a list), or the fallback. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string | string[] } } } | null)?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
}
