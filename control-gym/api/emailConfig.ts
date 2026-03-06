import { apiClient } from "./client";

export interface EmailConfigResponse {
  gmailUser: string;
  isConfigured: boolean;
}

export interface UpdateEmailConfigData {
  gmailUser: string;
  gmailAppPassword: string;
}

export type EmailConfigScope = "admin" | "superadmin";

const getEmailConfigEndpoint = (scope: EmailConfigScope) =>
  scope === "superadmin" ? "/api/superadmin/email-config" : "/api/admin/email-config";

export async function fetchEmailConfig(
  scope: EmailConfigScope = "admin",
): Promise<EmailConfigResponse> {
  return apiClient<EmailConfigResponse>(getEmailConfigEndpoint(scope));
}

export async function updateEmailConfig(
  data: UpdateEmailConfigData,
  scope: EmailConfigScope = "admin",
): Promise<EmailConfigResponse & { message: string }> {
  return apiClient(getEmailConfigEndpoint(scope), {
    method: "PUT",
    body: data,
  });
}
