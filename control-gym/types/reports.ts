// types/reports.ts

export type ReportType =
  | "clients"
  | "payments"
  | "attendance"
  | "memberships"
  | "revenue"
  | "staff"
  | "peak_hour"
  | "general";

export type ReportStatus = "completed" | "pending" | "error" | "processing";

export type ExportFormat = "csv" | "pdf" | "xlsx";

export interface ReportData {
  id: string;
  type: ReportType;
  title: string;
  date: string;
  description?: string;
  status?: ReportStatus;
  metadata?: ReportMetadata;
}

export interface ReportMetadata {
  totalRecords?: number;
  period?: string;
  generatedBy?: string;
  fileSize?: number;
  format?: ExportFormat;
  [key: string]: any;
}

export interface ReportFilters {
  searchQuery?: string;
  reportType?: ReportType | "";
  startDate?: Date | null;
  endDate?: Date | null;
  statusFilter?: ReportStatus | "";
}

export interface GenerateReportParams {
  type: ReportType;
  startDate?: string;
  endDate?: string;
  format?: ExportFormat;
}

export interface ExportOptions {
  format?: ExportFormat;
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
  mimeType?: string;
  error?: string;
}

export interface ReportsSummary {
  total: number;
  completed: number;
  pending: number;
  processing: number;
  error: number;
}
