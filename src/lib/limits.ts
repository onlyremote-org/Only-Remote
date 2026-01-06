import { createClient } from '@/lib/supabase/server'

export const MAX_FREE_SCANS = 3
export const MAX_FREE_COVER_LETTERS = 3

export type UsageType = 'resume_scan' | 'cover_letter'

export async function checkUsageLimit(userId: string, type: UsageType) {
    const supabase = await createClient()

    // Fetch profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_tier, resume_scans_count, cover_letters_count, usage_reset_date, is_premium')
        .eq('id', userId)
        .single()

    if (error || !profile) {
        throw new Error('Failed to fetch user profile')
    }

    // Pro users are unlimited
    // Check both subscription_tier string AND is_premium boolean for robustness
    if (profile.subscription_tier === 'pro' || profile.is_premium === true) {
        return { allowed: true, limit: Infinity, count: 0 }
    }

    // Free User Logic
    const now = new Date()
    const lastReset = profile.usage_reset_date ? new Date(profile.usage_reset_date) : new Date(0)

    // Check if we need to reset (if last reset was more than 30 days ago)
    const daysSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceReset >= 30) {
        // Reset counts
        await supabase.from('profiles').update({
            resume_scans_count: 0,
            cover_letters_count: 0,
            usage_reset_date: now.toISOString()
        }).eq('id', userId)

        // Return fresh state
        return {
            allowed: true,
            limit: type === 'resume_scan' ? MAX_FREE_SCANS : MAX_FREE_COVER_LETTERS,
            count: 0
        }
    }

    // Check limits
    const currentCount = type === 'resume_scan' ? (profile.resume_scans_count || 0) : (profile.cover_letters_count || 0)
    const limit = type === 'resume_scan' ? MAX_FREE_SCANS : MAX_FREE_COVER_LETTERS

    if (currentCount >= limit) {
        return { allowed: false, limit, count: currentCount }
    }

    return { allowed: true, limit, count: currentCount }
}

export async function incrementUsage(userId: string, type: UsageType) {
    const supabase = await createClient()

    // We strictly increment, assuming checkUsageLimit was called before.
    const column = type === 'resume_scan' ? 'resume_scans_count' : 'cover_letters_count'

    // Fetch current count explicitly
    const { data, error } = await supabase.from('profiles').select(column).eq('id', userId).single()

    if (error) {
        console.error('Error fetching current usage:', error)
        return
    }

    // Explicitly cast to any or record to access dynamic column
    const current = (data as Record<string, any>)?.[column] || 0
    const next = current + 1

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ [column]: next })
        .eq('id', userId)

    if (updateError) {
        console.error('Error incrementing usage:', updateError)
    }
}
