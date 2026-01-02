
import { lemonSqueezySetup, listSubscriptions } from "@lemonsqueezy/lemonsqueezy.js";
import 'dotenv/config';

const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

if (!apiKey) {
    process.exit(1);
}

lemonSqueezySetup({ apiKey });

async function check() {
    console.log(typeof listSubscriptions);
}

check();
