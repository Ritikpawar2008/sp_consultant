import { renderBaseEmailLayout, escapeHtml } from "./baseLayout";
import { siteConfig } from "../site";

export interface EnquiryConfirmationEmailProps {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  service_name?: string | null;
  service_id?: string | number | null;
  message?: string;
  created_at?: string | Date;
}

export function renderEnquiryConfirmationEmail(data: EnquiryConfirmationEmailProps): {
  subject: string;
  text: string;
  html: string;
} {
  const serviceLabel =
    data.service_name ||
    (data.service_id ? `Service Ref #${data.service_id}` : "General Enquiry");

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

  const subject = "We've Received Your Enquiry — S.P. Consultant";

  const text = `Dear ${data.name},

Thank you for reaching out to S.P. Consultant.

We have received your enquiry and our consultancy team will review the details and get back to you shortly.

ENQUIRY SUMMARY
----------------------------------------
Enquiry ID: #${data.id}
Client Name: ${data.name}
Service / Matter: ${serviceLabel}
Submitted Date: ${submissionTime}

${data.message ? `Requirement:\n${data.message}\n\n` : ""}DIRECT CONTACT
If your matter is time-sensitive, please feel free to reach our team directly:
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
              <td style="background-color: #0F172A; border: 1px solid #334155; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #F1F5F9; text-transform: uppercase;">
                STATUS: RECEIVED
              </td>
            </tr>
          </table>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0B1528; letter-spacing: -0.02em; line-height: 30px;">
            We've Received Your Enquiry
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; line-height: 24px; color: #475569;">
            Dear <strong>${escapeHtml(data.name)}</strong>,
          </p>
          <p style="margin: 6px 0 0 0; font-size: 14px; line-height: 22px; color: #334155;">
            Thank you for contacting S.P. Consultant. We have received your documentation enquiry. A member of our consulting team will review your matter and contact you shortly.
          </p>
        </td>
      </tr>
    </table>

    <!-- Structured Information Card -->
    <table role="presentation" class="card-padding" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            
            <!-- Row: Enquiry ID -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; width: 140px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Enquiry ID
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

            <!-- Row: Selected Service -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Selected Service
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #0B1528;">
                ${escapeHtml(serviceLabel)}
              </td>
            </tr>
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

            <!-- Row: Submitted Date -->
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">
                Submitted Date
              </td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; color: #334155;">
                ${escapeHtml(submissionTime)}
              </td>
            </tr>

            ${
              data.message
                ? `
            <tr><td colspan="2" height="1" style="background-color: #EDF2F7; height: 1px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 10px 0 4px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em; vertical-align: top;">
                Requirement
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

    <!-- Direct Contact Options -->
    <p style="margin: 0; font-size: 13px; line-height: 20px; color: #64748B;">
      If your matter requires immediate assistance, please call our consulting team directly at <strong style="color: #0B1528;">+91 ${escapeHtml(
        siteConfig.phones[0]
      )}</strong>.
    </p>
  `;

  const html = renderBaseEmailLayout({
    previewText: `S.P. Consultant has received your enquiry (Ref #${data.id}).`,
    contentHtml,
  });

  return { subject, text, html };
}
