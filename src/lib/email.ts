import { Resend } from "resend";
import {
  renderAppointmentBookedEmail,
  renderAppointmentNotBookedEmail,
  renderEnquiryConfirmationEmail,
  renderAdminNotificationEmail,
} from "./emails";

/**
 * Server-side Resend email utility for S.P. Consultant.
 *
 * - Kept strictly server-side (never exposed to browser bundles).
 * - RESEND_API_KEY is read from server environment.
 * - Handles enquiry and appointment email workflows with corporate templates.
 */

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not configured in the environment.");
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export function getFromEmail(): string {
  return (
    process.env.CONTACT_FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    "S.P. Consultant <onboarding@resend.dev>"
  );
}

export function getAdminEmail(): string {
  return process.env.CONTACT_TO_EMAIL || process.env.ADMIN_EMAIL || "omwelkar1@gmail.com";
}

export interface EnquiryEmailData {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  service_id?: number | string | null;
  service_name?: string | null;
  message: string;
  created_at?: string | Date;
}

export interface AppointmentEmailData {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  service_id?: string | null;
  service_name?: string | null;
  reason?: string | null;
  status: string;
  rejection_reason?: string | null;
  created_at?: string | Date;
}

// ==========================================
// ENQUIRY EMAILS
// ==========================================

export async function sendAdminEnquiryNotification(data: EnquiryEmailData) {
  const resend = getResendClient();
  if (!resend) throw new Error("Resend is not configured (RESEND_API_KEY missing)");

  const from = getFromEmail();
  const to = getAdminEmail();

  const { subject, text, html } = renderAdminNotificationEmail({
    type: "enquiry",
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    service_id: data.service_id,
    service_name: data.service_name,
    message: data.message,
    created_at: data.created_at,
  });

  return resend.emails.send({
    from,
    to: [to],
    replyTo: data.email,
    subject,
    text,
    html,
  });
}

export async function sendVisitorEnquiryConfirmation(data: EnquiryEmailData) {
  const resend = getResendClient();
  if (!resend) throw new Error("Resend is not configured (RESEND_API_KEY missing)");

  const from = getFromEmail();
  const to = data.email;

  const { subject, text, html } = renderEnquiryConfirmationEmail({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    service_id: data.service_id,
    service_name: data.service_name,
    message: data.message,
    created_at: data.created_at,
  });

  return resend.emails.send({
    from,
    to: [to],
    subject,
    text,
    html,
  });
}

// ==========================================
// APPOINTMENT EMAILS
// ==========================================

import {
  renderAppointmentReceivedEmail,
  renderAppointmentConfirmedEmail,
  renderAppointmentCompletedEmail,
  renderAppointmentCancelledEmail,
} from "./emails";

export async function sendAppointmentReceivedEmail(data: AppointmentEmailData) {
  const resend = getResendClient();
  if (!resend) throw new Error("Resend is not configured (RESEND_API_KEY missing)");

  const from = getFromEmail();
  const to = data.email;

  const { subject, text, html } = renderAppointmentReceivedEmail({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    service_name: data.service_name,
    service_id: data.service_id,
    reason: data.reason,
  });

  return resend.emails.send({
    from,
    to: [to],
    subject,
    text,
    html,
  });
}

export async function sendAppointmentStatusEmail(data: AppointmentEmailData, newStatus: string) {
  const resend = getResendClient();
  if (!resend) throw new Error("Resend is not configured (RESEND_API_KEY missing)");

  const from = getFromEmail();
  const to = data.email;

  let emailContent;
  if (newStatus === "confirmed") {
    emailContent = renderAppointmentConfirmedEmail(data);
  } else if (newStatus === "completed" || newStatus === "done") {
    emailContent = renderAppointmentCompletedEmail(data);
  } else if (newStatus === "cancelled") {
    emailContent = renderAppointmentCancelledEmail(data);
  } else {
    return null;
  }

  return resend.emails.send({
    from,
    to: [to],
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html,
  });
}

export async function sendAppointmentFailureEmail(data: AppointmentEmailData) {
  const resend = getResendClient();
  if (!resend) throw new Error("Resend is not configured (RESEND_API_KEY missing)");

  const from = getFromEmail();
  const to = data.email;

  const { subject, text, html } = renderAppointmentNotBookedEmail({
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    service_name: data.service_name,
    service_id: data.service_id,
    reason: data.reason,
    rejection_reason: data.rejection_reason,
  });

  return resend.emails.send({
    from,
    to: [to],
    subject,
    text,
    html,
  });
}

export async function sendAdminAppointmentNotification(data: AppointmentEmailData) {
  const resend = getResendClient();
  if (!resend) throw new Error("Resend is not configured (RESEND_API_KEY missing)");

  const from = getFromEmail();
  const to = getAdminEmail();

  const { subject, text, html } = renderAdminNotificationEmail({
    type: "appointment",
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    appointment_date: data.appointment_date,
    appointment_time: data.appointment_time,
    service_id: data.service_id,
    service_name: data.service_name,
    status: data.status,
    message: data.reason || data.rejection_reason,
    created_at: data.created_at,
  });

  return resend.emails.send({
    from,
    to: [to],
    replyTo: data.email,
    subject,
    text,
    html,
  });
}

export async function sendAdminLoginOtp(email: string, code: string) {
  const resend = getResendClient();
  if (!resend) throw new Error("Resend is not configured (RESEND_API_KEY missing)");

  const { renderAdminLoginEmail } = require("./emails/AdminLoginEmail");
  const { subject, text, html } = renderAdminLoginEmail({ email, code });

  const result = await resend.emails.send({
    from: getFromEmail(),
    to: [email],
    subject,
    text,
    html,
  });

  if (result.error) {
    throw new Error(`Resend API Error: ${result.error.message}`);
  }

  return result;
}




