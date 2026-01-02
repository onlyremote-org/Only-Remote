
import { lemonSqueezySetup, listStores, listProducts, listVariants } from "@lemonsqueezy/lemonsqueezy.js";
import fs from 'fs';
import path from 'path';

// Manual .env.local parsing
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/LEMON_SQUEEZY_API_KEY=(.*)/);
// Basic parser for quoted strings or multiline if needed, but the previous one was simple.
// The key provided by user is very long and has dots.
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
    console.error("LEMON_SQUEEZY_API_KEY not found in .env.local");
    process.exit(1);
}

lemonSqueezySetup({ apiKey });

async function getIds() {
    try {
        console.log("Fetching Stores...");
        const stores = await listStores();

        if (!stores.data?.data?.length) {
            console.log("No stores found.");
            return;
        }

        const firstStoreId = stores.data.data[0].id;
        console.log(`STORE_ID: ${firstStoreId}`);

        const products = await listProducts({ filter: { storeId: firstStoreId } });

        if (products.data?.data?.length) {
            const firstProductId = products.data.data[0].id;
            const variants = await listVariants({ filter: { productId: firstProductId } });

            if (variants.data?.data?.length) {
                console.log(`VARIANT_ID: ${variants.data.data[0].id}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

getIds();
