import nodemailer from "nodemailer";

interface WelcomeEmailParams {
  clientEmail: string;
  clientName: string;
  gymName: string;
  membershipType: string;
  startDate: Date;
  endDate?: Date;
  gmailUser: string;
  gmailAppPassword: string;
  qrCodeDataUrl?: string;
}

function createTransporter(gmailUser: string, gmailAppPassword: string) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getMembershipLabel(type: string): string {
  const labels: Record<string, string> = {
    basico: "Básico",
    pro: "Pro",
    proplus: "Pro+",
  };
  return labels[type] || type;
}

function buildWelcomeHtml(params: WelcomeEmailParams): string {
  const { clientName, gymName, membershipType, startDate, endDate, qrCodeDataUrl } = params;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#111827; padding:30px 40px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:24px; letter-spacing:1px;">${gymName}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#111827; margin:0 0 16px 0; font-size:20px;">
                ¡Hola ${clientName}!
              </h2>
              <p style="color:#4b5563; font-size:16px; line-height:1.6; margin:0 0 24px 0;">
                Te damos la bienvenida a <strong>${gymName}</strong>. Tu membresía ha sido registrada exitosamente.
              </p>
              <!-- Membership details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb; border-radius:8px; border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:20px;">
                    <h3 style="color:#111827; margin:0 0 16px 0; font-size:16px;">Detalles de tu membresía</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #e5e7eb;">Plan</td>
                        <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:bold; text-align:right; border-bottom:1px solid #e5e7eb;">${getMembershipLabel(membershipType)}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#6b7280; font-size:14px; border-bottom:1px solid #e5e7eb;">Fecha de inicio</td>
                        <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:bold; text-align:right; border-bottom:1px solid #e5e7eb;">${formatDate(startDate)}</td>
                      </tr>
                      ${
                        endDate
                          ? `<tr>
                        <td style="padding:8px 0; color:#6b7280; font-size:14px;">Fecha de vencimiento</td>
                        <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:bold; text-align:right;">${formatDate(endDate)}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>
              ${qrCodeDataUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; text-align:center;">
                <tr>
                  <td align="center" style="padding:20px;">
                    <h3 style="color:#111827; margin:0 0 12px 0; font-size:16px;">Tu código QR de acceso</h3>
                    <img src="cid:qrcode" alt="Código QR" width="200" height="200" style="border:1px solid #e5e7eb; border-radius:8px;" />
                    <p style="color:#6b7280; font-size:12px; margin:8px 0 0 0;">
                      Presentá este código en la entrada del gimnasio para ingresar.
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}
              <p style="color:#4b5563; font-size:14px; line-height:1.6; margin:24px 0 0 0;">
                Si tenés alguna consulta, no dudes en comunicarte con nosotros directamente en el gimnasio.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb; padding:20px 40px; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af; font-size:12px; margin:0;">
                ${gymName} &mdash; Gracias por ser parte de nuestro equipo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(
  params: WelcomeEmailParams,
): Promise<void> {
  try {
    const transporter = createTransporter(
      params.gmailUser,
      params.gmailAppPassword,
    );

    const attachments: nodemailer.SendMailOptions["attachments"] = [];
    if (params.qrCodeDataUrl) {
      const base64Data = params.qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
      attachments.push({
        filename: "qrcode.png",
        content: Buffer.from(base64Data, "base64"),
        cid: "qrcode",
      });
    }

    const info = await transporter.sendMail({
      from: `${params.gymName} <${params.gmailUser}>`,
      to: params.clientEmail,
      subject: `¡Bienvenido/a a ${params.gymName}!`,
      html: buildWelcomeHtml(params),
      attachments,
    });

    console.log("Email de bienvenida enviado:", info.messageId);
  } catch (err) {
    console.error("Error enviando email de bienvenida:", err);
  }
}
