import { apiClient } from "./client";

export interface EmailConfigResponse {
  gmailUser: string;
  isConfigured: boolean;
}

export interface UpdateEmailConfigData {
  gmailUser: string;
  gmailAppPassword: string;
}

export async function fetchEmailConfig(): Promise<EmailConfigResponse> {
  return apiClient<EmailConfigResponse>("/api/admin/email-config");
}

export async function updateEmailConfig(
  data: UpdateEmailConfigData,
): Promise<EmailConfigResponse & { message: string }> {
  return apiClient("/api/admin/email-config", {
    method: "PUT",
    body: data,
  });
}
