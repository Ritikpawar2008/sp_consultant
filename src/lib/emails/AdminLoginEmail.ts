import { renderBaseEmailLayout } from "./baseLayout";

export function renderAdminLoginEmail({ email, code }: { email: string; code: string }) {
  const subject = "Your Admin Login Code — S.P. Consultant";
  
  const htmlContent = `
    <h2 style="color: #09295a; margin-top: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">Admin Login Code</h2>
    
    <p style="color: #41607f; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Hello,<br><br>
      A login request was made for the S.P. Consultant Admin Portal using your email (<strong>${email}</strong>).
    </p>

    <div style="background-color: #f4f8fd; border: 1px solid #c7d9f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
      <p style="color: #62728a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px 0;">Your Verification Code</p>
      <div style="font-family: monospace; font-size: 32px; font-weight: 900; color: #126ce5; letter-spacing: 0.2em;">
        ${code}
      </div>
    </div>

    <p style="color: #62728a; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      This code will expire in <strong>10 minutes</strong>. 
      Please do not share this code with anyone.
    </p>

    <div style="background-color: #fffaf0; border: 1px solid #fce8cc; border-radius: 8px; padding: 16px; margin-top: 32px;">
      <p style="color: #9c6c21; font-size: 13px; font-weight: 600; margin: 0; line-height: 1.5;">
        <strong>Security Notice:</strong> If you did not request this login, you can safely ignore this email. No one can access your account without this code.
      </p>
    </div>
  `;

  const textContent = `
S.P. Consultant - Admin Login Code

A login request was made for the Admin Portal using your email (${email}).

Your Verification Code: ${code}

This code will expire in 10 minutes. Please do not share this code with anyone.

Security Notice: If you did not request this login, you can safely ignore this email. No one can access your account without this code.
  `.trim();

  return {
    subject,
    text: textContent,
    html: renderBaseEmailLayout({ contentHtml: htmlContent, previewText: `Your secure login code is ${code}` }),
  };
}
