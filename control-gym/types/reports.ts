// types/reports.ts
export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  date: string;
  description?: string;
  status?: ReportStatus;
  metadata?: ReportMetadata;
}

export type ReportType =
  | "clients"
  | "payments"
  | "attendance"
  | "memberships"
  | "revenue"
  | "staff"
  | "general";

export type ReportStatus = "completed" | "pending" | "error" | "processing";

export interface ReportMetadata {
  totalRecords?: number;
  period?: string;
  generatedBy?: string;
  fileSize?: number;
  format?: "csv" | "pdf" | "xlsx";
  [key: string]: any;
}

export interface ReportFilters {
  searchQuery?: string;
  reportType?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  statusFilter?: string;
}

export interface ExportOptions {
  format?: "csv" | "pdf" | "xlsx";
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ReportResponse {
  success: boolean;
  data?: ReportData[];
  message?: string;
  error?: string;
}

export interface ExportResponse {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}
