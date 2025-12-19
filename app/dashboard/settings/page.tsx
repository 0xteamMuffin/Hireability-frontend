'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Trash2,
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  Cpu,
  Code,
  Network,
  Briefcase,
  ListChecks,
  Settings2,
  ChevronDown,
} from 'lucide-react';
import { settingsApi, UserDetails, UpdateUserInput, UpdateSettingsInput } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { RoundType, ROUND_DISPLAY_INFO } from '@/lib/types';

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English (US)' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

const ROUND_ICONS: Record<RoundType, React.ReactNode> = {
  [RoundType.BEHAVIORAL]: <Users size={16} />,
  [RoundType.TECHNICAL]: <Cpu size={16} />,
  [RoundType.CODING]: <Code size={16} />,
  [RoundType.SYSTEM_DESIGN]: <Network size={16} />,
  [RoundType.HR]: <Briefcase size={16} />,
};

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingInterviewSettings, setSavingInterviewSettings] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [user, setUser] = useState<UserDetails | null>(null);
  const [formData, setFormData] = useState<UpdateUserInput>({
    firstName: '',
    lastName: '',
    bio: '',
  });

  const [preferences, setPreferences] = useState<UpdateSettingsInput>({
    notifications: true,
    language: 'en',
  });

  const [interviewSettings, setInterviewSettings] = useState({
    multiRoundEnabled: true,
    prerequisitesEnabled: true,
    defaultRounds: ['BEHAVIORAL', 'TECHNICAL'] as string[],
  });

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    setLoading(true);
    const response = await settingsApi.getUserDetails();
    if (response.success && response.data) {
      setUser(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        bio: response.data.bio || '',
      });
      if (response.data.settings) {
        setPreferences({
          notifications: response.data.settings.notifications,
          language: response.data.settings.language,
        });
        setInterviewSettings({
          multiRoundEnabled: response.data.settings.multiRoundEnabled ?? true,
          prerequisitesEnabled: response.data.settings.prerequisitesEnabled ?? true,
          defaultRounds: response.data.settings.defaultRounds ?? ['BEHAVIORAL', 'TECHNICAL'],
        });
      }
    }
    setLoading(false);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const response = await settingsApi.updateUserDetails(formData);
    if (response.success && response.data) {
      setUser(response.data);
      showMessage('success', 'Profile updated successfully');
    } else {
      showMessage('error', response.error || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handleUpdatePreferences = async (
    key: keyof UpdateSettingsInput,
    value: boolean | string,
  ) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);

    setSavingPrefs(true);
    const response = await settingsApi.updatePreferences(newPrefs);
    if (!response.success) {
      setPreferences(preferences);
      showMessage('error', 'Failed to update preferences');
    }
    setSavingPrefs(false);
  };

  const handleToggleRound = (roundType: string) => {
    setInterviewSettings((prev) => {
      const rounds = prev.defaultRounds;
      if (rounds.includes(roundType)) {
        if (rounds.length <= 1) return prev;
        return { ...prev, defaultRounds: rounds.filter((r) => r !== roundType) };
      }
      return { ...prev, defaultRounds: [...rounds, roundType] };
    });
  };

  const handleSaveInterviewSettings = async () => {
    setSavingInterviewSettings(true);
    const response = await settingsApi.updatePreferences({
      multiRoundEnabled: interviewSettings.multiRoundEnabled,
      prerequisitesEnabled: interviewSettings.prerequisitesEnabled,
      defaultRounds: interviewSettings.defaultRounds,
    });
    if (response.success) {
      showMessage('success', 'Interview settings saved successfully');
    } else {
      showMessage('error', response.error || 'Failed to save interview settings');
    }
    setSavingInterviewSettings(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    const response = await settingsApi.deleteAccount();
    if (response.success) {
      localStorage.removeItem('token');
      router.push('/signin');
    } else {
      showMessage('error', response.error || 'Failed to delete account');
    }
    setDeleting(false);
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).getFullYear().toString();
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 pb-10"
    >
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 shadow-lg ${
            message.type === 'success'
              ? 'border border-green-200 bg-green-50 text-green-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </motion.div>
      )}

      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Profile Settings</h1>
        <p className="mt-1 text-slate-500">Manage your account settings and preferences.</p>
      </header>

      <section className="flex flex-col items-center gap-8 rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md md:flex-row">
        <div className="group relative cursor-pointer">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-slate-400 shadow-lg">
            <User size={48} />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <div className="absolute right-1 bottom-1 rounded-full border-2 border-white bg-indigo-400 p-2 text-white shadow-sm">
            <Camera size={14} />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-slate-800">
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.username || 'User'}
          </h2>
          <p className="text-slate-500">Free Plan</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-500">
              @{user?.username}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Member since {user?.createdAt ? formatMemberSince(user.createdAt) : 'N/A'}
            </span>
          </div>
        </div>

        <button className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
          Change Avatar
        </button>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
              <User size={20} className="text-indigo-400" /> Personal Information
            </h3>

            <form className="space-y-5" onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 ml-1 block text-sm font-medium text-slate-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 ml-1 block text-sm font-medium text-slate-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-10 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-sm font-medium text-slate-700">Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 focus:outline-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-indigo-400 px-6 py-2.5 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500 hover:shadow-indigo-300 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Interview Settings Section */}
          <section className="rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
              <Settings2 size={20} className="text-indigo-400" /> Interview Settings
            </h3>

            <div className="space-y-6">
              {/* Multi-Round Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-500">
                    <ListChecks size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Multi-Round Interviews</p>
                    <p className="text-xs text-slate-400">Enable multi-round interview sessions</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setInterviewSettings((prev) => ({
                      ...prev,
                      multiRoundEnabled: !prev.multiRoundEnabled,
                    }))
                  }
                  className={`h-6 w-12 rounded-full p-1 transition-colors ${
                    interviewSettings.multiRoundEnabled ? 'bg-indigo-400' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: interviewSettings.multiRoundEnabled ? 24 : 0 }}
                    className="h-4 w-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* Prerequisites Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-500">
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Round Prerequisites</p>
                    <p className="text-xs text-slate-400">Require completing rounds in order</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setInterviewSettings((prev) => ({
                      ...prev,
                      prerequisitesEnabled: !prev.prerequisitesEnabled,
                    }))
                  }
                  disabled={!interviewSettings.multiRoundEnabled}
                  className={`h-6 w-12 rounded-full p-1 transition-colors ${
                    interviewSettings.prerequisitesEnabled && interviewSettings.multiRoundEnabled
                      ? 'bg-indigo-400'
                      : 'bg-slate-200'
                  } ${!interviewSettings.multiRoundEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <motion.div
                    animate={{
                      x:
                        interviewSettings.prerequisitesEnabled &&
                        interviewSettings.multiRoundEnabled
                          ? 24
                          : 0,
                    }}
                    className="h-4 w-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* Default Rounds Selection */}
              <div className="pt-2">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Default Interview Rounds
                </p>
                <p className="mb-4 text-xs text-slate-400">
                  Select which rounds to include in new interview sessions
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(RoundType).map((roundType) => {
                    const info = ROUND_DISPLAY_INFO[roundType];
                    const isSelected = interviewSettings.defaultRounds.includes(roundType);
                    return (
                      <button
                        key={roundType}
                        onClick={() => handleToggleRound(roundType)}
                        disabled={!interviewSettings.multiRoundEnabled}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        } ${!interviewSettings.multiRoundEnabled ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <div
                          className={`rounded-lg p-1.5 ${isSelected ? 'bg-indigo-100' : 'bg-slate-100'}`}
                        >
                          {ROUND_ICONS[roundType]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{info.title}</p>
                          <p className="truncate text-xs text-slate-400">
                            {info.estimatedDuration} min
                          </p>
                        </div>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                            isSelected ? 'border-indigo-400 bg-indigo-400' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <CheckCircle size={14} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveInterviewSettings}
                  disabled={savingInterviewSettings}
                  className="flex items-center gap-2 rounded-xl bg-indigo-400 px-6 py-2.5 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500 hover:shadow-indigo-300 disabled:opacity-50"
                >
                  {savingInterviewSettings ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  {savingInterviewSettings ? 'Saving...' : 'Save Interview Settings'}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Preferences Section */}
          <section className="h-fit rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md">
            <h3 className="mb-6 text-xl font-bold text-slate-800">Preferences</h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Notifications</p>
                    <p className="text-xs text-slate-400">Email updates</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleUpdatePreferences('notifications', !preferences.notifications)
                  }
                  disabled={savingPrefs}
                  className={`h-6 w-12 rounded-full p-1 transition-colors ${
                    preferences.notifications ? 'bg-indigo-400' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: preferences.notifications ? 24 : 0 }}
                    className="h-4 w-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* Language Dropdown */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Language</p>
                    <p className="text-xs text-slate-400">
                      {AVAILABLE_LANGUAGES.find((l) => l.code === preferences.language)?.name ||
                        'English (US)'}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="flex items-center gap-1 text-sm font-bold text-indigo-400"
                  >
                    Change{' '}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {showLanguageDropdown && (
                    <div className="absolute top-full right-0 z-10 mt-2 max-h-60 w-48 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                      {AVAILABLE_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            handleUpdatePreferences('language', lang.code);
                            setShowLanguageDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                            preferences.language === lang.code
                              ? 'bg-indigo-50 font-semibold text-indigo-500'
                              : 'text-slate-700'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Account Info Section */}
          <section className="h-fit rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md">
            <h3 className="mb-6 text-xl font-bold text-slate-800">Account Info</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Username</span>
                <span className="text-sm font-medium text-slate-700">@{user?.username}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Email</span>
                <span className="max-w-[150px] truncate text-sm font-medium text-slate-700">
                  {user?.email}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Member Since</span>
                <span className="text-sm font-medium text-slate-700">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-500">Plan</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-500">
                  Free
                </span>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="rounded-[2rem] border border-red-100 bg-red-50/50 p-8">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-red-600">
              <Trash2 size={18} /> Danger Zone
            </h3>
            <p className="mb-4 text-xs text-red-400/80">
              Deleting your account is permanent. All interview history, documents, and data will be
              permanently removed.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {deleting && <Loader2 size={14} className="animate-spin" />}
              Delete Account
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
