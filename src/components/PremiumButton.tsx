
'use client'

import { createPremiumCheckout } from "@/app/actions/payment";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export function PremiumButton() {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            await createPremiumCheckout();
        } catch (error) {
            console.error("Checkout failed", error);
        } finally {
            // Usually redirect happens before this, but in case of error:
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0"
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Upgrade to Premium
        </Button>
    );
}
