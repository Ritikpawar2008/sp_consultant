import { renderBaseEmailLayout, escapeHtml } from "./baseLayout";

export interface AdminNotificationEmailProps {
  type: "enquiry" | "appointment";
  id: string | number;
  name: string;
  email: string;
  phone: string;
  service_name?: string | null;
  service_id?: string | number | null;
  appointment_date?: string | null;
  appointment_time?: string | null;
  status?: string | null;
  message?: string | null;
  created_at?: string | Date;
}

export function renderAdminNotificationEmail(data: AdminNotificationEmailProps): {
  subject: string;
  text: string;
  html: string;
} {
  const isAppointment = data.type === "appointment";
  const isBooked = data.status === "booked";

  const heading = isAppointment
    ? "New Appointment Request"
    : "New Website Enquiry";

  const subject = isAppointment
    ? `New Appointment Request [${isBooked ? "BOOKED" : "NOT BOOKED"}] — ${data.name}`
    : `New Website Enquiry — ${data.name}`;

  const serviceLabel =
    data.service_name ||
    (data.service_id ? `Service Ref #${data.service_id}` : "Not Specified");

  const submissionTime = data.created_at
    ? new Date(data.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " IST"
    : new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " IST";

  const statusDisplay = data.status ? data.status.toUpperCase() : "RECEIVED";

  const text = `S.P. CONSULTANT — ADMIN NOTIFICATION
==================================================
Type: ${heading}
Record ID: #${data.id}
Status: ${statusDisplay}
Submitted At: ${submissionTime}

CLIENT CONTACT DETAILS
--------------------------------------------------
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Service: ${serviceLabel}
${isAppointment ? `Appointment Date: ${data.appointment_date}\nAppointment Time: ${data.appointment_time}\n` : ""}
${data.message ? `MESSAGE / REQUIREMENT:\n${data.message}\n` : ""}
==================================================`;

  const contentHtml = `
    <!-- Header Block -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
            <tr>
              <td style="background-color: ${
                isAppointment
                  ? isBooked
                    ? "#064E3B"
                    : "#4C0519"
                  : "#0F172A"
              }; border: 1px solid ${
    isAppointment
      ? isBooked
        ? "#059669"
        : "#BE123C"
      : "#334155"
  }; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #FFFFFF; text-transform: uppercase;">
                ${escapeHtml(isAppointment ? `APPOINTMENT: ${statusDisplay}` : "NEW ENQUIRY")}
              </td>
            </tr>
          </table>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0B1528; letter-spacing: -0.02em; line-height: 30px;">
            ${escapeHtml(heading)}
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748B;">
            Submitted on ${escapeHtml(submissionTime)} &bull; Reference ID: <strong style="color: #0B1528;">#${escapeHtml(
    String(data.id)
  )}</strong>
          </p>
        </td>
      </tr>
    </table>

    <!-- Quick Scan Data Card -->
    <table role="presentation" class="card-padding" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            
            <!-- Row: Client Name -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; width: 140px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Client Name
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 15px; font-weight: 700; color: #0B1528;">
                ${escapeHtml(data.name)}
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

            <!-- Row: Email -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Email Address
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; color: #0F172A;">
                <a href="mailto:${escapeHtml(data.email)}" style="color: #0F62FE; text-decoration: none; font-weight: 600;">${escapeHtml(data.email)}</a>
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

            <!-- Row: Phone -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Phone Number
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; color: #0F172A;">
                <a href="tel:${escapeHtml(data.phone)}" style="color: #0F62FE; text-decoration: none; font-weight: 600;">${escapeHtml(data.phone)}</a>
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

            <!-- Row: Service -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Service
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #0B1528;">
                ${escapeHtml(serviceLabel)}
              </td>
            </tr>

            ${
              isAppointment
                ? `
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Appointment Schedule
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">
                ${escapeHtml(data.appointment_date || "")} &bull; ${escapeHtml(data.appointment_time || "")}
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Final Status
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: ${
                isBooked ? "#065F46" : "#9F1239"
              };">
                ${escapeHtml(statusDisplay)}
              </td>
            </tr>
            `
                : ""
            }

            ${
              data.message
                ? `
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 10px 0 4px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; vertical-align: top;">
                Message / Details
              </td>
              <td class="stacked-cell" style="padding: 10px 0 4px 0; font-size: 13px; line-height: 20px; color: #334155; white-space: pre-wrap;">
                ${escapeHtml(data.message)}
              </td>
            </tr>
            `
                : ""
            }

          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="font-size: 12px; line-height: 18px; color: #64748B;">
          Quick actions: Click above email or phone number to reply or initiate client follow-up.
        </td>
      </tr>
    </table>
  `;

  const html = renderBaseEmailLayout({
    headerSubtitle: "Internal Administration Alert",
    previewText: `[Admin Alert] ${heading} from ${data.name} (Ref #${data.id})`,
    contentHtml,
  });

  return { subject, text, html };
}
