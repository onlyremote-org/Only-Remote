import { getWelcomeEmailHtml, getOnboardingEmailHtml, getSubscriptionEmailHtml } from "./templates";

const RESEND_API_URL = "https://api.resend.com/emails";

async function sendEmail(to: string, subject: string, html: string) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.warn("Missing RESEND_API_KEY, skipping email send.");
        return;
    }

    try {
        const res = await fetch(RESEND_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Only Remote <no-reply@onlyremote.org>",
                to: [to],
                subject,
                html,
            }),
        });

        if (!res.ok) {
            console.error("Resend email failed", await res.text());
        } else {
            console.log(`Email sent to ${to}: ${subject}`);
        }
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

export async function sendWelcomeEmail(to: string, firstName?: string) {
    await sendEmail(to, "Welcome to Only Remote", getWelcomeEmailHtml({ firstName }));
}

export async function sendOnboardingCompleteEmail(to: string, firstName?: string) {
    await sendEmail(to, "Your Only Remote profile is ready", getOnboardingEmailHtml({ firstName }));
}

export async function sendSubscriptionChangedEmail(
    to: string,
    firstName: string | undefined,
    planName: string,
    status: "started" | "updated" | "cancelled"
) {
    await sendEmail(
        to,
        "Your Only Remote subscription update",
        getSubscriptionEmailHtml({ firstName, planName, status })
    );
}
