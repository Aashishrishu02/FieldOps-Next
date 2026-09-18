import nodemailer from "nodemailer";

const smtpPort = Number(
  process.env.SMTP_PORT || 465
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,

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
    process.env.APP_URL ||
    "http://localhost:3000";

  await transporter.sendMail({
    from:
      process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_USER,

    to,

    subject: "Your FieldOps Account Credentials",

    text: `
Hello ${name},

Your FieldOps account has been created successfully.

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
      <div
        style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 600px;
          margin: auto;
        "
      >
        <h2>FieldOps Account Created</h2>

        <p>Hello ${name},</p>

        <p>
          Your FieldOps account has been created successfully.
        </p>

        <p>
          <strong>Login URL:</strong><br />
          <a href="${appUrl}">
            ${appUrl}
          </a>
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

type PasswordResetEmailParams = {
  to: string;
  name: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: PasswordResetEmailParams) {
  await transporter.sendMail({
    from:
      process.env.SMTP_FROM_EMAIL ||
      process.env.SMTP_USER,

    to,

    subject: "Reset Your FieldOps Password",

    text: `
Hello ${name},

We received a request to reset your FieldOps password.

Use the following link to create a new password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
FieldOps Team
    `.trim(),

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 600px;
          margin: auto;
        "
      >
        <h2>Reset Your FieldOps Password</h2>

        <p>Hello ${name},</p>

        <p>
          We received a request to reset your FieldOps password.
        </p>

        <p>
          Click the button below to create a new password:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 18px;
              background: #111827;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>
        </p>

        <p>
          Or copy this link into your browser:
        </p>

        <p
          style="
            word-break: break-all;
          "
        >
          ${resetUrl}
        </p>

        <p>
          This link will expire in
          <strong>15 minutes</strong>.
        </p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>

        <p>
          Regards,<br />
          FieldOps Team
        </p>
      </div>
    `,
  });
}