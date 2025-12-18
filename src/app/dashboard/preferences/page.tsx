import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PreferencesForm from './preferences-form'

export default async function PreferencesPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('job_preferences')
        .eq('id', user.id)
        .single()

    const currentPreferences = profile?.job_preferences || []

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Job Preferences</h2>
                <p className="text-muted-foreground mt-1">Customize the types of jobs you want to see.</p>
            </div>

            <PreferencesForm initialPreferences={currentPreferences} />
        </div>
    )
}
