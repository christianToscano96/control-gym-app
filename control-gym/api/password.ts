import { apiClient } from "./client";

export async function requestPasswordReset(
  email: string,
): Promise<{ message: string }> {
  return apiClient("/api/password/forgot", {
    method: "POST",
    body: { email },
    skipAuth: true,
  });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiClient("/api/password/reset", {
    method: "POST",
    body: { email, code, newPassword },
    skipAuth: true,
  });
}
