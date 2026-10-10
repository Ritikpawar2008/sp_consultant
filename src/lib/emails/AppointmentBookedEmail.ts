import { renderBaseEmailLayout, escapeHtml } from "./baseLayout";
import { siteConfig } from "../site";

export interface AppointmentBookedEmailProps {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  appointment_date: string;
  appointment_time: string;
  service_name?: string | null;
  service_id?: string | null;
  reason?: string | null;
}

export function renderAppointmentBookedEmail(data: AppointmentBookedEmailProps): {
  subject: string;
  text: string;
  html: string;
} {
  const serviceLabel =
    data.service_name ||
    data.reason ||
    (data.service_id ? `Service Ref #${data.service_id}` : "General Consultation");

  const subject = "Appointment Booked — S.P. Consultant";

  const text = `Dear ${data.name},

Your appointment has been successfully booked with S.P. Consultant.

APPOINTMENT DETAILS
----------------------------------------
Status: BOOKED (Confirmed)
Reference ID: #${data.id}
Client Name: ${data.name}
Appointment Date: ${data.appointment_date}
Appointment Time: ${data.appointment_time}
Service / Matter: ${serviceLabel}

CONSULTATION PREPARATION
Please keep any relevant property or society documents accessible for your consultation. 

CONTACT & SUPPORT
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
              <td style="background-color: #064E3B; border: 1px solid #059669; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #ECFDF5; text-transform: uppercase;">
                STATUS: BOOKED
              </td>
            </tr>
          </table>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0B1528; letter-spacing: -0.02em; line-height: 30px;">
            Appointment Confirmed
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; line-height: 24px; color: #475569;">
            Dear <strong>${escapeHtml(data.name)}</strong>,
          </p>
          <p style="margin: 6px 0 0 0; font-size: 14px; line-height: 22px; color: #334155;">
            Your appointment has been successfully booked with S.P. Consultant. Our team has scheduled your consultation slot as outlined below.
          </p>
        </td>
      </tr>
    </table>

    <!-- Structured Information Card -->
    <table role="presentation" class="card-padding" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            
            <!-- Row: Appointment ID -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; width: 140px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Appointment ID
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

            <!-- Row: Appointment Date -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Appointment Date
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">
                ${escapeHtml(data.appointment_date)}
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

            <!-- Row: Appointment Time -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Appointment Time
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
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-left: 3px solid #C59B27; background-color: #FDFBF7; padding: 16px 20px; border-radius: 4px; margin-bottom: 24px;">
      <tr>
        <td>
          <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #78350F; text-transform: uppercase; letter-spacing: 0.04em;">
            Preparation Note
          </p>
          <p style="margin: 0; font-size: 13px; line-height: 20px; color: #451A03;">
            Please have relevant documentation (society records, conveyance documents, registration papers) available during the consultation to enable an efficient review.
          </p>
        </td>
      </tr>
    </table>

    <!-- Need to reschedule -->
    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748B;">
      If you need to reschedule or have urgent questions prior to your consultation, please reach out to us at <strong style="color: #0B1528;">+91 ${escapeHtml(
        siteConfig.phones[0]
      )}</strong> or reply directly to this email.
    </p>
  `;

  const html = renderBaseEmailLayout({
    previewText: `Your appointment with S.P. Consultant on ${data.appointment_date} at ${data.appointment_time} is confirmed.`,
    contentHtml,
  });

  return { subject, text, html };
}
