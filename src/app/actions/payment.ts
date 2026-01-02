
'use server'

import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { createClient } from "@/lib/supabase/server";
import { lemonSqueezyConfig } from "@/lib/lemonsqueezy";
import { redirect } from "next/navigation";

export async function createPremiumCheckout(redirectPath: string = '/dashboard') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("User must be logged in");
    }

    if (!lemonSqueezyConfig.storeId || !lemonSqueezyConfig.variantId) {
        throw new Error("Lemon Squeezy configuration missing");
    }

    // Create checkout
    const checkout = await createCheckout(
        lemonSqueezyConfig.storeId,
        lemonSqueezyConfig.variantId,
        {
            checkoutData: {
                email: user.email,
                custom: {
                    user_id: user.id
                }
            },
            productOptions: {
                redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${redirectPath}`,
                receiptButtonText: 'Go to Dashboard',
                receiptThankYouNote: 'Thank you for upgrading to Premium!'
            }
        }
    );

    if (checkout.error) {
        console.error("Error creating checkout:", checkout.error);
        throw new Error("Failed to create checkout");
    }

    if (!checkout.data?.data?.attributes?.url) {
        throw new Error("Checkout URL not returned");
    }

    redirect(checkout.data.data.attributes.url);
}

export async function createPortalSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        throw new Error("User must be logged in");
    }

    // List subscriptions to find the active one for this user
    // Note: This relies on the email matching.
    const { listSubscriptions } = await import("@lemonsqueezy/lemonsqueezy.js");

    // Fix: Filter by email
    const subscriptions = await listSubscriptions({
        filter: { userEmail: user.email },
        include: ['order']
    });

    if (subscriptions.error) {
        console.error("Error fetching subscriptions:", subscriptions.error);
        throw new Error("Failed to fetch subscription");
    }

    // Find the first active subscription
    const activeSub = subscriptions.data?.data?.find(
        (sub: any) => sub.attributes.status === 'active' || sub.attributes.status === 'on_trial'
    );

    if (!activeSub) {
        // User has no active subscription, maybe redirect to checkout?
        // Or just throw
        throw new Error("No active subscription found");
    }

    const portalUrl = activeSub.attributes.urls.customer_portal;
    redirect(portalUrl);
}
