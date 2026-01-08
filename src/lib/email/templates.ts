
const LOGO_URL = "https://nbreuvbfwqtsxwcpgdeb.supabase.co/storage/v1/object/sign/Logo/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xYjM5MGE3Mi01ZmE3LTQ5OWYtYjdkMy1lYmI2ZGNjMjM2YjAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMb2dvL2xvZ28ucG5nIiwiaWF0IjoxNzY1NjAyMDk0LCJleHAiOjQ4ODc2NjYwOTR9.YVt3kOfD1GMJIUG9GPbvbYnU9_vFtET1CEFnJ1MaqaU";

export function getWelcomeEmailHtml(opts: { firstName?: string }) {
  const name = opts.firstName || "there";

  return `
  <html>
    <body style="margin:0; padding:24px; background-color:#f9fafb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif; color:#0f172a;">
      <div style="max-width:520px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:16px;">
          <img src="${LOGO_URL}" alt="Only Remote" style="height:40px; width:auto;" />
        </div>

        <div style="background-color:#ffffff; border-radius:12px; padding:24px 20px; border:1px solid #e5e7eb;">
          <p style="margin:0 0 12px; font-size:14px;">Hi ${name},</p>

          <p style="margin:0 0 12px; font-size:14px;">
            Welcome to <strong>Only Remote</strong> 👋
          </p>

          <p style="margin:0 0 12px; font-size:14px;">
            You’re all set to explore curated remote jobs and use AI to check how “ATS‑ready” your resume is.
          </p>

          <p style="margin:0 0 12px; font-size:14px;">
            Next steps:
          </p>
          <ul style="margin:0 0 16px 18px; padding:0; font-size:13px;">
            <li>Finish your profile and job preferences.</li>
            <li>Upload your resume for your first AI scan.</li>
            <li>Save roles you’re interested in and track them from your dashboard.</li>
          </ul>

          <p style="margin:0; font-size:12px; color:#9ca3af;">
            You can always access your account at <a href="https://onlyremote.org" style="color:#2563eb;">onlyremote.org</a>.
          </p>
        </div>
      </div>
    </body>
  </html>
  `;
}

export function getOnboardingEmailHtml(opts: { firstName?: string }) {
  const name = opts.firstName || "there";

  return `
  <html>
    <body style="margin:0; padding:24px; background-color:#f9fafb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif; color:#0f172a;">
      <div style="max-width:520px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:16px;">
          <img src="${LOGO_URL}" alt="Only Remote" style="height:40px; width:auto;" />
        </div>

        <div style="background-color:#ffffff; border-radius:12px; padding:24px 20px; border:1px solid #e5e7eb;">
          <p style="margin:0 0 12px; font-size:14px;">Hi ${name},</p>

          <p style="margin:0 0 12px; font-size:14px;">
            Your Only Remote profile is complete ✅
          </p>

          <p style="margin:0 0 12px; font-size:14px;">
            We’ll now prioritize remote roles that match your job titles, categories and visa preferences.
          </p>

          <p style="margin:0 0 12px; font-size:14px;">
            You can update your preferences or upload a new resume anytime from your dashboard.
          </p>

          <p style="margin:0; font-size:12px; color:#9ca3af;">
            Go to your dashboard: <a href="https://onlyremote.org/dashboard" style="color:#2563eb;">onlyremote.org/dashboard</a>
          </p>
        </div>
      </div>
    </body>
  </html>
  `;
}

export function getSubscriptionEmailHtml(opts: {
  firstName?: string;
  planName: string;   // e.g. "Pro", "Free", "Pro trial"
  status: "started" | "updated" | "cancelled";
}) {
  const name = opts.firstName || "there";
  const plan = opts.planName;

  let intro: string;

  if (opts.status === "started") {
    intro = `Your Only Remote ${plan} plan is now active 🎉`;
  } else if (opts.status === "cancelled") {
    intro = `Your Only Remote ${plan} plan has been cancelled.`;
  } else {
    intro = `Your Only Remote subscription has been updated to the ${plan} plan.`;
  }

  return `
  <html>
    <body style="margin:0; padding:24px; background-color:#f9fafb; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif; color:#0f172a;">
      <div style="max-width:520px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:16px;">
          <img src="${LOGO_URL}" alt="Only Remote" style="height:40px; width:auto;" />
        </div>

        <div style="background-color:#ffffff; border-radius:12px; padding:24px 20px; border:1px solid #e5e7eb;">
          <p style="margin:0 0 12px; font-size:14px;">Hi ${name},</p>

          <p style="margin:0 0 12px; font-size:14px;">
            ${intro}
          </p>

          <p style="margin:0 0 12px; font-size:14px;">
            With ${plan}, you can:
          </p>

          <ul style="margin:0 0 16px 18px; padding:0; font-size:13px;">
            <li>See curated remote jobs based on your profile.</li>
            <li>Use our AI resume scanner to check your fit for roles.</li>
            <li>Track saved jobs from your dashboard.</li>
          </ul>

          <p style="margin:0; font-size:12px; color:#9ca3af;">
            Manage your plan from: <a href="https://onlyremote.org/dashboard/profile" style="color:#2563eb;">Account settings</a>.
          </p>
        </div>
      </div>
    </body>
  </html>
  `;
}
