import { renderBaseEmailLayout, escapeHtml } from "./baseLayout";
import { siteConfig } from "../site";

export interface AppointmentStatusEmailProps {
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

export function renderAppointmentReceivedEmail(data: AppointmentStatusEmailProps) {
  const serviceLabel = data.service_name || data.reason || (data.service_id ? `Service Ref #${data.service_id}` : "General Consultation");
  const subject = "Appointment Request Received - S.P. Consultant";

  const contentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
            <tr>
              <td style="background-color: #DBEAFE; border: 1px solid #BFDBFE; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #1E3A8A; text-transform: uppercase;">
                STATUS: REQUEST RECEIVED
              </td>
            </tr>
          </table>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0B1528; letter-spacing: -0.02em; line-height: 30px;">
            Appointment Request Received
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; line-height: 24px; color: #475569;">
            Dear <strong>${escapeHtml(data.name)}</strong>,
          </p>
          <p style="margin: 6px 0 0 0; font-size: 14px; line-height: 22px; color: #334155;">
            We have successfully received your appointment request. Our team will review your requested slot and get back to you shortly to confirm the appointment.
          </p>
        </td>
      </tr>
    </table>
    <!-- details table -->
    <table role="presentation" class="card-padding" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; width: 140px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Date</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">${escapeHtml(data.appointment_date)}</td>
            </tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Time</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">${escapeHtml(data.appointment_time)}</td>
            </tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Matter</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; color: #334155; font-weight: 500;">${escapeHtml(serviceLabel)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return { subject, text: "Your appointment request has been received.", html: renderBaseEmailLayout({ previewText: "Appointment Request Received", contentHtml }) };
}

export function renderAppointmentConfirmedEmail(data: AppointmentStatusEmailProps) {
  const serviceLabel = data.service_name || data.reason || (data.service_id ? `Service Ref #${data.service_id}` : "General Consultation");
  const subject = "Appointment Confirmed - S.P. Consultant";

  const contentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
            <tr>
              <td style="background-color: #064E3B; border: 1px solid #059669; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #ECFDF5; text-transform: uppercase;">
                STATUS: CONFIRMED
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
            Your appointment has been successfully confirmed. We look forward to our consultation.
          </p>
        </td>
      </tr>
    </table>
    <!-- details table -->
    <table role="presentation" class="card-padding" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; width: 140px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Date</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">${escapeHtml(data.appointment_date)}</td>
            </tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Time</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">${escapeHtml(data.appointment_time)}</td>
            </tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Matter</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; color: #334155; font-weight: 500;">${escapeHtml(serviceLabel)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return { subject, text: "Your appointment has been confirmed.", html: renderBaseEmailLayout({ previewText: "Appointment Confirmed", contentHtml }) };
}

export function renderAppointmentCompletedEmail(data: AppointmentStatusEmailProps) {
  const serviceLabel = data.service_name || data.reason || (data.service_id ? `Service Ref #${data.service_id}` : "General Consultation");
  const subject = "Appointment Completed - S.P. Consultant";

  const contentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
            <tr>
              <td style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #334155; text-transform: uppercase;">
                STATUS: COMPLETED
              </td>
            </tr>
          </table>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0B1528; letter-spacing: -0.02em; line-height: 30px;">
            Appointment Completed
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; line-height: 24px; color: #475569;">
            Dear <strong>${escapeHtml(data.name)}</strong>,
          </p>
          <p style="margin: 6px 0 0 0; font-size: 14px; line-height: 22px; color: #334155;">
            Thank you for consulting with S.P. Consultant. Your appointment has been marked as completed. We hope we were able to assist you with your requirements. If you have any further questions, please do not hesitate to contact us.
          </p>
        </td>
      </tr>
    </table>
    <!-- details table -->
    <table role="presentation" class="card-padding" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; width: 140px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Date</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">${escapeHtml(data.appointment_date)}</td>
            </tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Time</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">${escapeHtml(data.appointment_time)}</td>
            </tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Matter</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; color: #334155; font-weight: 500;">${escapeHtml(serviceLabel)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return { subject, text: "Your appointment has been marked as completed.", html: renderBaseEmailLayout({ previewText: "Appointment Completed", contentHtml }) };
}

export function renderAppointmentCancelledEmail(data: AppointmentStatusEmailProps) {
  const serviceLabel = data.service_name || data.reason || (data.service_id ? `Service Ref #${data.service_id}` : "General Consultation");
  const subject = "Appointment Cancelled - S.P. Consultant";

  const contentHtml = `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
            <tr>
              <td style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 4px; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #991B1B; text-transform: uppercase;">
                STATUS: CANCELLED
              </td>
            </tr>
          </table>
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0B1528; letter-spacing: -0.02em; line-height: 30px;">
            Appointment Cancelled
          </h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; line-height: 24px; color: #475569;">
            Dear <strong>${escapeHtml(data.name)}</strong>,
          </p>
          <p style="margin: 6px 0 0 0; font-size: 14px; line-height: 22px; color: #334155;">
            Your appointment has been cancelled. If this was a mistake or if you need to reschedule, please contact us.
          </p>
        </td>
      </tr>
    </table>
    <!-- details table -->
    <table role="presentation" class="card-padding" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin-bottom: 28px;">
      <tr>
        <td>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; width: 140px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Date</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">${escapeHtml(data.appointment_date)}</td>
            </tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Time</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #0B1528;">${escapeHtml(data.appointment_time)}</td>
            </tr>
            <tr>
              <td class="stacked-cell stacked-label" style="padding: 7px 0; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.04em;">Matter</td>
              <td class="stacked-cell" style="padding: 7px 0; font-size: 14px; color: #334155; font-weight: 500;">${escapeHtml(serviceLabel)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return { subject, text: "Your appointment has been cancelled.", html: renderBaseEmailLayout({ previewText: "Appointment Cancelled", contentHtml }) };
}

