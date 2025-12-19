import { getWelcomeEmailHtml, getOnboardingEmailHtml, getSubscriptionEmailHtml } from "./templates";

import { sendEmail } from "../email";

async function sendEmailWrapper(to: string, subject: string, html: string) {
    const { success, error } = await sendEmail({ to, subject, html });

    if (!success) {
        console.error("Resend email failed", error);
    } else {
        console.log(`Email sent to ${to}: ${subject}`);
    }
}

export async function sendWelcomeEmail(to: string, firstName?: string) {
    await sendEmailWrapper(to, "Welcome to Only Remote", getWelcomeEmailHtml({ firstName }));
}

export async function sendOnboardingCompleteEmail(to: string, firstName?: string) {
    await sendEmailWrapper(to, "Your Only Remote profile is ready", getOnboardingEmailHtml({ firstName }));
}

export async function sendSubscriptionChangedEmail(
    to: string,
    firstName: string | undefined,
    planName: string,
    status: "started" | "updated" | "cancelled"
) {
    await sendEmailWrapper(
        to,
        "Your Only Remote subscription update",
        getSubscriptionEmailHtml({ firstName, planName, status })
    );
}
