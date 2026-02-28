import { ReportData } from "@/types/reports";

// ─── Shared Styles ──────────────────────────────────────────────
const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
    padding: 32px;
    background: #fff;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 3px solid #007AFF;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .header h1 {
    font-size: 22px;
    color: #007AFF;
    margin: 0;
  }
  .header .date {
    font-size: 12px;
    color: #6b7280;
  }
  .header .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .badge-completed { background: #d1fae5; color: #065f46; }
  .badge-pending { background: #fef3c7; color: #92400e; }
  .description {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 20px;
    line-height: 1.5;
  }
  .stats-grid {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .stat-card {
    flex: 1;
    min-width: 120px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }
  .stat-card .value {
    font-size: 28px;
    font-weight: 700;
    color: #007AFF;
    margin-bottom: 4px;
  }
  .stat-card .label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .stat-card.green .value { color: #10b981; }
  .stat-card.red .value { color: #ef4444; }
  .stat-card.amber .value { color: #f59e0b; }
  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: #374151;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    font-size: 12px;
  }
  th {
    background: #007AFF;
    color: #fff;
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  th:first-child { border-radius: 8px 0 0 0; }
  th:last-child { border-radius: 0 8px 0 0; }
  td {
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
    color: #374151;
  }
  tr:nth-child(even) { background: #f9fafb; }
  tr:hover { background: #eff6ff; }
  .bar-container {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .bar-label {
    width: 80px;
    font-size: 12px;
    color: #374151;
    text-align: right;
  }
  .bar-track {
    flex: 1;
    height: 24px;
    background: #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #007AFF, #60a5fa);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 8px;
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    min-width: 30px;
  }
  .pie-container {
    display: flex;
    gap: 24px;
    align-items: center;
    margin-bottom: 24px;
  }
  .pie-legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }
  .legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .footer {
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 10px;
    color: #9ca3af;
    text-align: center;
  }
`;

// ─── Helper: format date ────────────────────────────────────────
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ─── Helper: safe value ─────────────────────────────────────────
function esc(val: any): string {
  if (val === null || val === undefined) return "-";
  return String(val).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Column label translations ──────────────────────────────────
const columnLabels: Record<string, string> = {
  name: "Nombre",
  email: "Email",
  phone: "Teléfono",
  membershipType: "Membresía",
  membershipEnd: "Vencimiento",
  active: "Activo",
  status: "Estado",
  role: "Rol",
  createdAt: "Creado",
  clientName: "Cliente",
  method: "Método",
  date: "Fecha",
  denyReason: "Razón",
  expiresAt: "Vence",
  label: "Hora",
  value: "Visitas",
};

function getLabel(key: string): string {
  return columnLabels[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

// ─── Build table from array data ────────────────────────────────
function buildTable(data: any[], maxRows = 50): string {
  if (!data.length) return "<p>Sin datos</p>";
  const keys = Object.keys(data[0]).filter(
    (k) => !k.startsWith("_") && k !== "__v" && k !== "password" && k !== "avatar",
  );
  const rows = data.slice(0, maxRows);
  return `
    <table>
      <thead>
        <tr>${keys.map((k) => `<th>${getLabel(k)}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (item) =>
              `<tr>${keys
                .map((k) => {
                  let val = item[k];
                  if (typeof val === "boolean") val = val ? "Si" : "No";
                  if (k === "status")
                    val = val === "allowed" ? "Permitido" : val === "denied" ? "Denegado" : val;
                  return `<td>${esc(val)}</td>`;
                })
                .join("")}</tr>`,
          )
          .join("")}
      </tbody>
    </table>
    ${data.length > maxRows ? `<p style="color:#6b7280;font-size:11px;">Mostrando ${maxRows} de ${data.length} registros</p>` : ""}
  `;
}

// ─── Build bar chart from array of {label, value} ───────────────
function buildBarChart(data: { label: string; value: number }[]): string {
  if (!data.length) return "";
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return `
    <div style="margin-bottom:24px;">
      ${data
        .map(
          (d) => `
        <div class="bar-container">
          <div class="bar-label">${esc(d.label)}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${Math.max((d.value / maxVal) * 100, 5)}%">
              ${d.value}
            </div>
          </div>
        </div>`,
        )
        .join("")}
    </div>
  `;
}

// ─── PDF Template per report type ───────────────────────────────

function clientsTemplate(report: ReportData): string {
  const raw = report.metadata?._rawData as any[];
  if (!raw) return "<p>Sin datos</p>";
  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="value">${raw.length}</div><div class="label">Total Clientes</div></div>
      <div class="stat-card green"><div class="value">${raw.filter((c: any) => c.active !== false).length}</div><div class="label">Activos</div></div>
      <div class="stat-card red"><div class="value">${raw.filter((c: any) => c.active === false).length}</div><div class="label">Inactivos</div></div>
    </div>
    <div class="section-title">Listado de Clientes</div>
    ${buildTable(raw)}
  `;
}

function revenueTemplate(report: ReportData): string {
  const m = report.metadata || {};
  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="value">$${Number(m.monthlyRevenue || 0).toLocaleString()}</div><div class="label">Ingresos Mensuales</div></div>
      <div class="stat-card green"><div class="value">${esc(m.revenuePercent)}</div><div class="label">Variación</div></div>
      <div class="stat-card"><div class="value">${esc(m.todayCheckIns)}</div><div class="label">Check-ins Hoy</div></div>
      <div class="stat-card red"><div class="value">${esc(m.todayDenied)}</div><div class="label">Denegados Hoy</div></div>
    </div>
  `;
}

function attendanceTemplate(report: ReportData): string {
  const raw = report.metadata?._rawData;
  if (!raw) return "<p>Sin datos</p>";

  // Weekly attendance has weeklyAttendance array
  if (raw.weeklyAttendance) {
    return `
      <div class="stats-grid">
        <div class="stat-card"><div class="value">${raw.totalWeekly}</div><div class="label">Total Semanal</div></div>
        <div class="stat-card green"><div class="value">${esc(raw.trendPercent)}</div><div class="label">Tendencia</div></div>
        <div class="stat-card"><div class="value">${esc(raw.highlightDay)}</div><div class="label">Día Destacado</div></div>
      </div>
      <div class="section-title">Asistencia por Día</div>
      ${buildBarChart(raw.weeklyAttendance)}
    `;
  }

  // Check-ins array
  if (Array.isArray(raw)) {
    const allowed = raw.filter((c: any) => c.status === "allowed").length;
    const denied = raw.filter((c: any) => c.status === "denied").length;
    return `
      <div class="stats-grid">
        <div class="stat-card"><div class="value">${raw.length}</div><div class="label">Total Accesos</div></div>
        <div class="stat-card green"><div class="value">${allowed}</div><div class="label">Permitidos</div></div>
        <div class="stat-card red"><div class="value">${denied}</div><div class="label">Denegados</div></div>
      </div>
      <div class="section-title">Registro de Accesos</div>
      ${buildTable(raw)}
    `;
  }

  return "<p>Sin datos</p>";
}

function membershipsTemplate(report: ReportData): string {
  const raw = report.metadata?._rawData;
  if (!raw) return "<p>Sin datos</p>";

  // Distribution data
  if (raw.basico !== undefined) {
    const total = raw.total || raw.basico + raw.pro + raw.proplus;
    const data = [
      { label: "Basico", value: raw.basico, color: "#60a5fa" },
      { label: "Pro", value: raw.pro, color: "#007AFF" },
      { label: "Pro+", value: raw.proplus, color: "#1e3a5f" },
    ];
    return `
      <div class="stats-grid">
        <div class="stat-card"><div class="value">${total}</div><div class="label">Total Membresías</div></div>
        ${data.map((d) => `<div class="stat-card"><div class="value" style="color:${d.color}">${d.value}</div><div class="label">${d.label}</div></div>`).join("")}
      </div>
      <div class="section-title">Distribución de Membresías</div>
      ${buildBarChart(data)}
    `;
  }

  // Expiring memberships
  if (raw.clients) {
    return `
      <div class="stats-grid">
        <div class="stat-card amber"><div class="value">${raw.count}</div><div class="label">Por Vencer</div></div>
      </div>
      <div class="section-title">Clientes con Membresía por Vencer</div>
      ${buildTable(raw.clients)}
    `;
  }

  return "<p>Sin datos</p>";
}

function activityTemplate(report: ReportData): string {
  const m = report.metadata || {};
  const rate = Number(m.activityRate || 0);
  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="value">${rate}%</div><div class="label">Tasa de Actividad</div></div>
      <div class="stat-card green"><div class="value">${esc(m._rawData?.activeCount)}</div><div class="label">Activos</div></div>
      <div class="stat-card red"><div class="value">${esc(m._rawData?.inactiveCount)}</div><div class="label">Inactivos</div></div>
    </div>
    <div class="section-title">Actividad de Clientes</div>
    <div style="margin:24px auto;width:200px;height:200px;border-radius:50%;background:conic-gradient(#10b981 0% ${rate}%, #ef4444 ${rate}% 100%);position:relative;">
      <div style="position:absolute;top:25%;left:25%;width:50%;height:50%;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:24px;font-weight:700;color:#374151;">${rate}%</span>
      </div>
    </div>
    <div style="display:flex;justify-content:center;gap:24px;margin-top:12px;">
      <div class="legend-item"><div class="legend-dot" style="background:#10b981;"></div>Activos</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ef4444;"></div>Inactivos</div>
    </div>
  `;
}

function staffTemplate(report: ReportData): string {
  const raw = report.metadata?._rawData as any[];
  if (!raw) return "<p>Sin datos</p>";
  const active = raw.filter((s: any) => s.active !== false).length;
  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="value">${raw.length}</div><div class="label">Total Personal</div></div>
      <div class="stat-card green"><div class="value">${active}</div><div class="label">Activos</div></div>
      <div class="stat-card red"><div class="value">${raw.length - active}</div><div class="label">Inactivos</div></div>
    </div>
    <div class="section-title">Listado de Personal</div>
    ${buildTable(raw)}
  `;
}

function peakHoursTemplate(report: ReportData): string {
  const raw = report.metadata?._rawData as { label: string; value: number }[];
  if (!raw || !Array.isArray(raw)) return "<p>Sin datos</p>";
  const top = raw.reduce((m, h) => (h.value > m.value ? h : m), raw[0]);
  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="value">${esc(top.label)}</div><div class="label">Hora Pico</div></div>
      <div class="stat-card green"><div class="value">${top.value}</div><div class="label">Max Visitas</div></div>
    </div>
    <div class="section-title">Distribución por Hora</div>
    ${buildBarChart(raw)}
  `;
}

// ─── Main: Generate PDF HTML ────────────────────────────────────

export function generateReportHTML(report: ReportData): string {
  let bodyContent = "";

  switch (report.id) {
    case "report-clients":
      bodyContent = clientsTemplate(report);
      break;
    case "report-revenue":
      bodyContent = revenueTemplate(report);
      break;
    case "report-attendance":
      bodyContent = attendanceTemplate(report);
      break;
    case "report-checkins":
      bodyContent = attendanceTemplate(report);
      break;
    case "report-memberships":
      bodyContent = membershipsTemplate(report);
      break;
    case "report-expiring":
      bodyContent = membershipsTemplate(report);
      break;
    case "report-activity":
      bodyContent = activityTemplate(report);
      break;
    case "report-staff":
      bodyContent = staffTemplate(report);
      break;
    case "report-peak-hours":
      bodyContent = peakHoursTemplate(report);
      break;
    default:
      bodyContent = genericTemplate(report);
  }

  const statusClass =
    report.status === "completed" ? "badge-completed" : "badge-pending";
  const statusText =
    report.status === "completed" ? "Completado" : "Pendiente";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${esc(report.title)}</h1>
          <div class="date">${formatDate(report.date)}</div>
        </div>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>
      ${report.description ? `<div class="description">${esc(report.description)}</div>` : ""}
      ${bodyContent}
      <div class="footer">
        Generado el ${formatDate(new Date().toISOString())} &bull; Control Gym
      </div>
    </body>
    </html>
  `;
}

// ─── Generic fallback ───────────────────────────────────────────
function genericTemplate(report: ReportData): string {
  const raw = report.metadata?._rawData;
  if (!raw) {
    const meta = report.metadata || {};
    const entries = Object.entries(meta).filter(([k]) => !k.startsWith("_"));
    if (entries.length === 0) return "<p>Sin datos disponibles</p>";
    return `
      <div class="stats-grid">
        ${entries.map(([k, v]) => `<div class="stat-card"><div class="value">${esc(v)}</div><div class="label">${getLabel(k)}</div></div>`).join("")}
      </div>
    `;
  }
  if (Array.isArray(raw)) return buildTable(raw);
  return `<pre style="font-size:12px;background:#f9fafb;padding:16px;border-radius:8px;overflow:auto;">${JSON.stringify(raw, null, 2)}</pre>`;
}
