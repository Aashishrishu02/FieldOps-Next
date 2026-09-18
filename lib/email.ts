import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

type CredentialEmailParams = {
  to: string;
  name: string;
  email: string;
  temporaryPassword: string;
  role: string;
};

export async function sendUserCredentialsEmail({
  to,
  name,
  email,
  temporaryPassword,
  role,
}: CredentialEmailParams) {
  const appUrl =
    process.env.APP_URL || "http://localhost:3000";

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_USER,

    to,

    subject: "Your FieldOps Account Credentials",

    text: `
Hello ${name},

Your FieldOps account has been created.

Login URL:
${appUrl}

Email:
${email}

Temporary Password:
${temporaryPassword}

Role:
${role}

Please log in using these credentials and change your password after your first login.

Regards,
FieldOps Team
    `.trim(),

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>FieldOps Account Created</h2>

        <p>Hello ${name},</p>

        <p>
          Your FieldOps account has been created successfully.
        </p>

        <p>
          <strong>Login URL:</strong><br />
          <a href="${appUrl}">${appUrl}</a>
        </p>

        <p>
          <strong>Email:</strong><br />
          ${email}
        </p>

        <p>
          <strong>Temporary Password:</strong><br />
          ${temporaryPassword}
        </p>

        <p>
          <strong>Role:</strong><br />
          ${role}
        </p>

        <p>
          Please log in using these credentials and
          change your password after your first login.
        </p>

        <p>
          Regards,<br />
          FieldOps Team
        </p>
      </div>
    `,
  });
}