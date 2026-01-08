'use client'

import { useState } from 'react'
import { User, Globe, Mail, Lock, Loader2, Eye, EyeOff, X } from 'lucide-react'
import { updateProfile, updatePassword } from './actions'

interface ProfileFormProps {
    user: {
        email: string
    }
    profile: {
        full_name: string | null
        website: string | null
        subscription_tier: string | null
        is_premium: boolean | null
    } | null
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Password state
    const [showPassword, setShowPassword] = useState(false)
    const [passwordError, setPasswordError] = useState('')

    const handleProfileUpdate = async (formData: FormData) => {
        setIsSaving(true)
        setMessage(null)
        try {
            const result = await updateProfile(formData)
            if (result.error) {
                setMessage({ type: 'error', text: result.error })
            } else {
                setMessage({ type: 'success', text: 'Profile updated successfully' })
                setIsEditing(false)
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' })
        } finally {
            setIsSaving(false)
        }
    }

    const handlePasswordUpdate = async (formData: FormData) => {
        setIsSaving(true)
        setPasswordError('')
        try {
            const result = await updatePassword(formData)
            if (result.error) {
                setPasswordError(result.error)
            } else {
                setMessage({ type: 'success', text: 'Password updated successfully' })
                setIsChangePasswordOpen(false)
            }
        } catch (error) {
            setPasswordError('Failed to update password')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-lg relative">
            <div className="p-6 sm:p-8 space-y-8">
                {/* Profile Header */}
                <div className="flex items-center gap-6 pb-8 border-b border-white/10">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <User className="h-10 w-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">{profile?.full_name || 'User'}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <span className="inline-flex items-center rounded-full bg-green-400/10 px-2.5 py-0.5 text-xs font-medium text-green-400 mt-2 ring-1 ring-inset ring-green-400/20">
                            {profile?.is_premium ? 'Pro Member' : 'Free Plan'}
                        </span>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Details Form */}
                <form action={handleProfileUpdate}>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    name="fullName"
                                    defaultValue={profile?.full_name || ''}
                                    disabled={!isEditing}
                                    className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    value={user.email}
                                    disabled
                                    className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-foreground opacity-75 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Website / Portfolio</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <input
                                    name="website"
                                    defaultValue={profile?.website || ''}
                                    disabled={!isEditing}
                                    className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="https://your-portfolio.com"
                                />
                            </div>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {!isEditing && (
                <div className="bg-white/5 px-6 py-4 border-t border-white/10 flex justify-between items-center">
                    <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
                    >
                        <Lock className="h-4 w-4" />
                        Change Password
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Edit Profile
                    </button>
                </div>
            )}

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-card border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsChangePasswordOpen(false)}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <h3 className="text-xl font-bold text-foreground mb-4">Change Password</h3>

                        <form action={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            {passwordError && (
                                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                                    {passwordError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
