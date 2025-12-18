import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './profile-form'

export default async function ProfilePage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
                <p className="text-muted-foreground mt-1">Manage your public profile and account details.</p>
            </div>

            <ProfileForm
                user={{ email: user.email || '' }}
                profile={profile}
            />
        </div>
    )
}
