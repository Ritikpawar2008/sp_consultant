import { siteConfig } from "../site";

/**
 * Utility to escape HTML special characters for email safety.
 */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(
    /[&<>'"]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[char] || char
  );
}

export interface BaseEmailOptions {
  previewText?: string;
  headerSubtitle?: string;
  contentHtml: string;
}

/**
 * Base email layout for S.P. Consultant.
 *
 * Design characteristics:
 * - Email-client safe nested tables (Outlook, Gmail, Apple Mail compatible)
 * - Deep charcoal header (#0B1528) with subtle copper/gold accent (#C59B27)
 * - Clean off-white canvas (#F4F6F9) and pure white card (#FFFFFF)
 * - Accessible high-contrast typography, generous padding, zero emojis
 * - Footer with verified project contact details from siteConfig
 */
export function renderBaseEmailLayout({
  previewText,
  headerSubtitle = "Society Conveyance & Property Documentation Consultant",
  contentHtml,
}: BaseEmailOptions): string {
  const previewSnippet = previewText
    ? `<!--[if !mso]><!--><span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${escapeHtml(
        previewText
      )}</span><!--<![endif]-->`
    : "";

  const phonesFormatted = siteConfig.phones.join(" / +91 ");

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <title>${escapeHtml(siteConfig.name)}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F1F4F8; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding: 24px 18px !important; }
      .header-padding { padding: 24px 18px !important; }
      .card-padding { padding: 16px !important; }
      .stacked-cell { display: block !important; width: 100% !important; box-sizing: border-box; }
      .stacked-label { padding-bottom: 2px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F4F8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  ${previewSnippet}
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1F4F8;">
    <tr>
      <td align="center" style="padding: 30px 12px 40px 12px;">
        <!-- Container (max-width 600px) -->
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
          
          <!-- Header -->
          <tr>
            <td class="header-padding" align="left" style="background-color: #0B1528; padding: 32px 32px 28px 32px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.12em; color: #FFFFFF; text-transform: uppercase;">
                      S.P. CONSULTANT
                    </p>
                    <p style="margin: 6px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; color: #94A3B8; text-transform: uppercase;">
                      ${escapeHtml(headerSubtitle)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subtle Copper/Gold Accent Divider Line -->
          <tr>
            <td height="3" style="background-color: #C59B27; font-size: 1px; line-height: 3px; height: 3px;">&nbsp;</td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content-padding" style="padding: 36px 32px 36px 32px; background-color: #FFFFFF;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer Divider -->
          <tr>
            <td height="1" style="background-color: #E2E8F0; font-size: 1px; line-height: 1px; height: 1px;">&nbsp;</td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="left" style="background-color: #0B1528; padding: 28px 32px; color: #94A3B8;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 13px; line-height: 20px; color: #CBD5E1;">
                    <p style="margin: 0 0 4px 0; font-weight: 700; color: #FFFFFF; font-size: 14px; letter-spacing: 0.02em;">
                      ${escapeHtml(siteConfig.name)}
                    </p>
                    <p style="margin: 0 0 14px 0; font-size: 12px; color: #94A3B8;">
                      Professional Consultancy Services &bull; <em>${escapeHtml(siteConfig.tagline)}</em>
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #CBD5E1;">
                      <strong style="color: #FFFFFF;">Contact:</strong> +91 ${escapeHtml(phonesFormatted)}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #CBD5E1;">
                      <strong style="color: #FFFFFF;">Email:</strong> <a href="mailto:${escapeHtml(siteConfig.email)}" style="color: #D4AF37; text-decoration: none;">${escapeHtml(siteConfig.email)}</a>
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #CBD5E1;">
                      <strong style="color: #FFFFFF;">Service Area:</strong> ${escapeHtml(siteConfig.serviceArea)}
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 12px; color: #CBD5E1; line-height: 18px;">
                      <strong style="color: #FFFFFF;">Office:</strong> 
                      ${
                        siteConfig.mapUrl 
                          ? `<a href="${escapeHtml(siteConfig.mapUrl)}" style="color: #CBD5E1; text-decoration: none;">${escapeHtml(siteConfig.officeAddress)}</a>` 
                          : escapeHtml(siteConfig.officeAddress)
                      }
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #64748B; border-top: 1px solid #1E293B; padding-top: 14px;">
                      This is an automated communication sent from the S.P. Consultant website system.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
