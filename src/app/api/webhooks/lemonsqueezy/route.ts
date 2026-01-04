
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { headers } from "next/headers";

// Admin client to bypass RLS for webhook updates
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const text = await request.text();
        const hmac = crypto.createHmac("sha256", process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || "");
        const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8");
        const signature = Buffer.from((await headers()).get("x-signature") || "", "utf8");

        if (!crypto.timingSafeEqual(digest, signature)) {
            return new Response("Invalid signature", { status: 401 });
        }

        const payload = JSON.parse(text);
        const eventName = payload.meta.event_name;
        const customData = payload.meta.custom_data;
        const userId = customData?.user_id;

        if (!userId) {
            return new Response("No user_id in custom_data", { status: 200 }); // Return 200 to acknowledge
        }

        if (eventName === "order_created" || eventName === "subscription_created") {
            // Update user to premium
            const { error } = await supabaseAdmin
                .from("profiles")
                .update({ is_premium: true })
                .eq("id", userId);

            if (error) {
                console.error("Supabase update failed:", error);
                return new Response(`Database update failed: ${JSON.stringify(error)}`, { status: 500 });
            }
        }

        // Handle cancellations/expirations if needed
        if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
            await supabaseAdmin
                .from("profiles")
                .update({ is_premium: false })
                .eq("id", userId);
        }

        return new Response("Webhook received", { status: 200 });
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response("Webhook handler failed", { status: 500 });
    }
}
