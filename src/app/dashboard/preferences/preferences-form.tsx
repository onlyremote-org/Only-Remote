'use client'

import { useState } from 'react'
import { Settings, Check, Loader2 } from 'lucide-react'
import { updatePreferences } from './actions'

const JOB_PREFERENCES = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Data Scientist',
    'Mobile Developer',
    'Customer Support',
    'Marketing',
    'Business Analyst',
    'Sales',
    'Human Resources',
    'Project Manager',
    'Finance',
    'Legal',
    'Operations',
    'Content Writing',
]

export default function PreferencesForm({ initialPreferences }: { initialPreferences: string[] }) {
    const [preferences, setPreferences] = useState<string[]>(initialPreferences)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [customPreference, setCustomPreference] = useState('')

    const togglePreference = (pref: string) => {
        setPreferences((prev) =>
            prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
        )
    }


    const addCustomPreference = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (customPreference.trim() && !preferences.includes(customPreference.trim())) {
                setPreferences([...preferences, customPreference.trim()])
                setCustomPreference('')
            }
        }
    }

    const removePreference = (pref: string) => {
        setPreferences(prev => prev.filter(p => p !== pref))
    }

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)
        try {
            const result = await updatePreferences(preferences)
            if (result.error) {
                setMessage({ type: 'error', text: result.error })
            } else {
                setMessage({ type: 'success', text: 'Preferences updated successfully' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update preferences' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="bg-card border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-8">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Settings className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Role Categories</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select the roles that match your skills and interests. We'll prioritize these in your job feed.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {JOB_PREFERENCES.map((pref) => {
                        const isSelected = preferences.includes(pref)
                        return (
                            <button
                                key={pref}
                                onClick={() => togglePreference(pref)}
                                className={`relative flex items-center p-4 rounded-lg border transition-all duration-200 w-full text-left ${isSelected
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
                                    }`}
                            >
                                <div className="flex-1 text-sm font-medium">{pref}</div>
                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        )
                    })}
                </div>

                {/* Custom Preference Input */}
                <div className="mt-6">
                    <input
                        type="text"
                        value={customPreference}
                        onChange={(e) => setCustomPreference(e.target.value)}
                        onKeyDown={addCustomPreference}
                        className="block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-foreground shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-primary sm:text-sm"
                        placeholder="Type other role and press Enter..."
                    />
                </div>

                {/* Selected Custom Preferences */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {preferences.filter(p => !JOB_PREFERENCES.includes(p)).map(pref => (
                        <span key={pref} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30">
                            {pref}
                            <button
                                type="button"
                                onClick={() => removePreference(pref)}
                                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary/30 focus:outline-none"
                            >
                                &times;
                            </button>
                        </span>
                    ))}
                </div>

                {message && (
                    <div className={`mt-6 p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <div className="bg-white/5 px-6 py-4 border-t border-white/10 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    )
}
