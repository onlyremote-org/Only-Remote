'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendSubscriptionChangedEmail } from '@/lib/email/events'

export async function updateSubscription(planId: string, status: 'active' | 'cancelled' | 'trialing' = 'active') {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // 1. Update Profile/Subscription in DB
    // Note: In a real app, this would likely be triggered by a Stripe webhook.
    // We update the profile to reflect the new tier.
    const { error } = await supabase
        .from('profiles')
        .update({
            subscription_tier: planId,
            subscription_status: status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    // 2. Send Email
    try {
        // Fetch user name for email
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()

        const firstName = profile?.full_name?.split(' ')[0]

        let emailStatus: 'started' | 'updated' | 'cancelled' = 'updated'
        if (status === 'cancelled') emailStatus = 'cancelled'
        else if (status === 'active' || status === 'trialing') emailStatus = 'started' // Simplified logic

        if (user.email) {
            await sendSubscriptionChangedEmail(
                user.email,
                firstName,
                planId === 'pro' ? 'Pro' : 'Free',
                emailStatus
            )
        }
    } catch (e) {
        console.error('Failed to send subscription email:', e)
    }

    revalidatePath('/dashboard/subscription')
    return { success: true }
}
