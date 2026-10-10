import { renderBaseEmailLayout, escapeHtml } from "./baseLayout";
import { siteConfig } from "../site";

export interface AppointmentNotBookedEmailProps {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  appointment_date: string;
  appointment_time: string;
  service_name?: string | null;
  service_id?: string | null;
  reason?: string | null;
  rejection_reason?: string | null;
}

export function renderAppointmentNotBookedEmail(data: AppointmentNotBookedEmailProps): {
  subject: string;
  text: string;
  html: string;
} {
  const serviceLabel =
    data.service_name ||
    data.reason ||
    (data.service_id ? `Service Ref #${data.service_id}` : "General Consultation");

  const rejectionDetail =
    data.rejection_reason ||
    "The requested time slot is currently unavailable or already reserved.";

  const subject = "Appointment Not Booked — S.P. Consultant";

  const text = `Dear ${data.name},

Thank you for your interest in scheduling a consultation with S.P. Consultant.

We regret to inform you that your requested appointment slot could not be booked at this time.

REQUEST DETAILS
----------------------------------------
Status: NOT BOOKED (Slot Unavailable)
Reference ID: #${data.id}
Client Name: ${data.name}
Requested Date: ${data.appointment_date}
Requested Time: ${data.appointment_time}
Service / Matter: ${serviceLabel}
Reason: ${rejectionDetail}

NEXT STEPS
Please select another convenient date and time on our website, or contact our office directly to arrange an alternate consultation:

Phone: +91 ${siteConfig.phones.join(" / +91 ")}
Email: ${siteConfig.email}
Service Area: ${siteConfig.serviceArea}

S.P. Consultant
Society Conveyance & Documentation Consultant
"${siteConfig.tagline}"`;

  const contentHtml = `
    <!-- Status Badge & Heading -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
            <tr>
              <td style="background-color: #4C0519; border: 1px solid #BE123C; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #FFF1F2; text-transform: uppercase;">
                STATUS: NOT BOOKED
              </td>
            </tr>
          </table>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0B1528; letter-spacing: -0.02em; line-height: 30px;">
            Appointment Not Booked
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; line-height: 24px; color: #475569;">
            Dear <strong>${escapeHtml(data.name)}</strong>,
          </p>
          <p style="margin: 6px 0 0 0; font-size: 14px; line-height: 22px; color: #334155;">
            Thank you for reaching out to S.P. Consultant. We were unable to confirm your appointment for the requested time slot because ${escapeHtml(
              rejectionDetail.toLowerCase()
            )}
          </p>
        </td>
      </tr>
    </table>

    <!-- Structured Information Card -->
    <table role="presentation" class="card-padding" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            
            <!-- Row: Reference ID -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; width: 140px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Reference ID
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #0F172A; font-family: monospace;">
                #${escapeHtml(String(data.id))}
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

            <!-- Row: Client Name -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Client Name
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #0F172A;">
                ${escapeHtml(data.name)}
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

            <!-- Row: Requested Date -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Requested Date
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">
                ${escapeHtml(data.appointment_date)}
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

            <!-- Row: Requested Time -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Requested Time
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">
                ${escapeHtml(data.appointment_time)}
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

            <!-- Row: Service / Matter -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Service / Matter
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; color: #334155; font-weight: 500;">
                ${escapeHtml(serviceLabel)}
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

    <!-- Guidance Section -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-left: 3px solid #64748B; background-color: #F8FAFC; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
      <tr>
        <td>
          <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0F172A; text-transform: uppercase; letter-spacing: 0.04em;">
            Next Step
          </p>
          <p style="margin: 0; font-size: 13px; line-height: 20px; color: #475569;">
            You can select an alternative available date and time slot, or reach out to our team directly. We will be glad to coordinate a consultation for you.
          </p>
        </td>
      </tr>
    </table>

    <!-- Direct Contact Options -->
    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748B;">
      Direct Consultation Helpline: <strong style="color: #0B1528;">+91 ${escapeHtml(
        siteConfig.phones.join(" / +91 ")
      )}</strong> &bull; Email: <a href="mailto:${escapeHtml(siteConfig.email)}" style="color: #C59B27; text-decoration: none;">${escapeHtml(siteConfig.email)}</a>
    </p>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Notice regarding your appointment request with S.P. Consultant on ${data.appointment_date}.`,
    contentHtml,
  });

  return { subject, text, html };
}
