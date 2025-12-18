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

    const fullName = formData.get('fullName') as string
    const website = formData.get('website') as string
    const preferences = JSON.parse(formData.get('preferences') as string || '[]')
    const plan = formData.get('plan') as string

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            website: website,
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
        const firstName = fullName.split(' ')[0]
        // We need the user's email. It might be in user object or we fetch it.
        // user object from auth.getUser() has email.
        if (user.email) {
            await sendOnboardingCompleteEmail(user.email, firstName)
        }
    } catch (e) {
        console.error('Failed to send onboarding email:', e)
        // Don't block redirect
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}
