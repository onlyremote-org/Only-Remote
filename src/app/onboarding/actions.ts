'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function completeOnboarding(_prevState: any, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const preferences = JSON.parse(formData.get('preferences') as string || '[]')
    const plan = formData.get('plan') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            // full_name and website are now handled at signup/profile creation not here
            job_preferences: preferences,
            subscription_tier: plan,
            subscription_status: plan === 'pro' ? 'trialing' : 'active',
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    // Send onboarding completion email
    try {
        const { sendOnboardingCompleteEmail } = await import('@/lib/email/events')
        // Get name from metadata since we don't ask for it anymore
        const fullName = user.user_metadata.full_name || ''
        const firstName = fullName.split(' ')[0]

        if (user.email) {
            await sendOnboardingCompleteEmail(user.email, firstName)
        }
    } catch (e) {
        console.error('Failed to send onboarding email:', e)
        // Don't block redirect
    }

    revalidatePath('/jobs')

    if (plan === 'pro') {
        const { createPremiumCheckout } = await import('@/app/actions/payment')
        await createPremiumCheckout('/jobs') // Redirect back to jobs after payment
    }

    redirect('/jobs')
}
