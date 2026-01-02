
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

if (!apiKey) {
    console.warn("LEMON_SQUEEZY_API_KEY not found in environment variables");
}

lemonSqueezySetup({
    apiKey: apiKey!,
    onError: (error) => console.error("Lemon Squeezy Error:", error),
});

export const lemonSqueezyConfig = {
    storeId,
    variantId,
    webhookSecret
};
