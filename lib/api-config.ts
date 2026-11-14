// Matches the backend's default PORT (4500) so a missing env file still works.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4500/api/v1';
