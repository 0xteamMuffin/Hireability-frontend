/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Bell,
  Moon,
  Globe,
  Trash2,
  Camera,
  Save,
  Loader2,
  Users,
  Cpu,
  Code,
  ListChecks,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { profileApi, settingsApi } from '@/lib/api';
import { RoundType, ROUND_DISPLAY_INFO } from '@/lib/types';

export const SettingsPage = () => {
  const { user, isLoading } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [multiRoundEnabled, setMultiRoundEnabled] = useState(true);
  const [prerequisitesEnabled, setPrerequisitesEnabled] = useState(true);
  const [defaultRounds, setDefaultRounds] = useState<string[]>(['BEHAVIORAL', 'TECHNICAL']);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const res = await profileApi.get();
      if (res.success && res.data) {
        setProfile(res.data);
      }

      const settingsRes = await settingsApi.getPreferences();
      if (settingsRes.success && settingsRes.data) {
        setNotifications(settingsRes.data.notifications);
        setDarkMode(settingsRes.data.darkMode);
        setMultiRoundEnabled(settingsRes.data.multiRoundEnabled ?? true);
        setPrerequisitesEnabled(settingsRes.data.prerequisitesEnabled ?? true);
        setDefaultRounds(settingsRes.data.defaultRounds ?? ['BEHAVIORAL', 'TECHNICAL']);
      }
    };
    fetchProfile();
  }, [user]);

  const handleToggleRound = (roundType: string) => {
    setDefaultRounds((prev) => {
      if (prev.includes(roundType)) {
        if (prev.length <= 1) return prev;
        return prev.filter((r) => r !== roundType);
      }
      return [...prev, roundType];
    });
  };

  const handleSaveInterviewSettings = async () => {
    try {
      const res = await settingsApi.updatePreferences({
        multiRoundEnabled,
        prerequisitesEnabled,
        defaultRounds,
      });
      if (res.success) {
        alert('Interview settings saved!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      const res = await settingsApi.updateUserDetails(formData);
      if (res.success) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred.');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-400" size={40} />
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
      {/* --- HEADER --- */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Profile Settings</h1>
        <p className="mt-1 text-slate-500">Manage your account settings and preferences.</p>
      </header>

      {/* --- PROFILE BANNER CARD --- */}
      <section className="flex flex-col items-center gap-8 rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md md:flex-row">
        <div className="group relative cursor-pointer">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 text-slate-400 shadow-lg">
            <User size={48} />
            {/* Hover Overlay */}
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
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-slate-500">{profile?.targetRole || 'Role not set'} • Free Plan</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
            <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-500">
              @{user.username}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Member since {new Date(user.createdAt).getFullYear()}
            </span>
          </div>
        </div>

        <button className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50">
          Change Avatar
        </button>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* --- LEFT COLUMN (Forms) --- */}
        <div className="space-y-8 lg:col-span-2">
          {/* PERSONAL INFORMATION */}
          <section className="rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
              <User size={20} className="text-indigo-400" /> Personal Information
            </h3>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
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
                    value={user.email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pr-4 pl-10 text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 ml-1 block text-sm font-medium text-slate-700">Bio</label>
                <textarea
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 focus:outline-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-indigo-400 px-6 py-2.5 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-500 hover:shadow-indigo-300"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* PASSWORD & SECURITY */}
          <section className="rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
              <Lock size={20} className="text-indigo-400" /> Security
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 ml-1 block text-sm font-medium text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 ml-1 block text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                  />
                </div>
                <div>
                  <label className="mb-1.5 ml-1 block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button className="text-sm font-semibold text-indigo-500 hover:underline">
                  Update Password
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* --- RIGHT COLUMN (Preferences & Billing) --- */}
        <div className="space-y-8">
          {/* PREFERENCES */}
          <section className="h-fit rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md">
            <h3 className="mb-6 text-xl font-bold text-slate-800">Preferences</h3>

            <div className="space-y-6">
              {/* Notification Toggle */}
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
                  onClick={() => setNotifications(!notifications)}
                  className={`h-6 w-12 rounded-full p-1 transition-colors ${
                    notifications ? 'bg-indigo-400' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: notifications ? 24 : 0 }}
                    className="h-4 w-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Moon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Dark Mode</p>
                    <p className="text-xs text-slate-400">Reduce eye strain</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`h-6 w-12 rounded-full p-1 transition-colors ${
                    darkMode ? 'bg-indigo-400' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: darkMode ? 24 : 0 }}
                    className="h-4 w-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Language</p>
                    <p className="text-xs text-slate-400">English (US)</p>
                  </div>
                </div>
                <button className="text-sm font-bold text-indigo-400">Change</button>
              </div>
            </div>
          </section>

          {/* INTERVIEW SETTINGS */}
          <section className="h-fit rounded-[2rem] border border-white bg-white/60 p-8 shadow-sm backdrop-blur-md">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
              <ListChecks size={20} className="text-indigo-400" /> Interview Settings
            </h3>

            <div className="space-y-6">
              {/* Multi-Round Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Multi-Round Mode</p>
                    <p className="text-xs text-slate-400">Enable prerequisite rounds</p>
                  </div>
                </div>
                <button
                  onClick={() => setMultiRoundEnabled(!multiRoundEnabled)}
                  className={`h-6 w-12 rounded-full p-1 transition-colors ${
                    multiRoundEnabled ? 'bg-indigo-400' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    animate={{ x: multiRoundEnabled ? 24 : 0 }}
                    className="h-4 w-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>

              {/* Prerequisites Toggle - only show when multi-round is enabled */}
              {multiRoundEnabled && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                      <Lock size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Enforce Round Order</p>
                      <p className="text-xs text-slate-400">Complete rounds in sequence</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPrerequisitesEnabled(!prerequisitesEnabled)}
                    className={`h-6 w-12 rounded-full p-1 transition-colors ${
                      prerequisitesEnabled ? 'bg-indigo-400' : 'bg-slate-200'
                    }`}
                  >
                    <motion.div
                      animate={{ x: prerequisitesEnabled ? 24 : 0 }}
                      className="h-4 w-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
              )}

              {/* Default Rounds Selection */}
              {multiRoundEnabled && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Default Interview Rounds</p>
                  <div className="space-y-2">
                    {Object.values(RoundType).map((roundType) => {
                      const info = ROUND_DISPLAY_INFO[roundType];
                      const isSelected = defaultRounds.includes(roundType);
                      return (
                        <button
                          key={roundType}
                          onClick={() => handleToggleRound(roundType)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 transition-all ${
                            isSelected
                              ? 'border-indigo-300 bg-indigo-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`rounded-lg p-2 ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}
                          >
                            {roundType === 'BEHAVIORAL' && <Users size={16} />}
                            {roundType === 'TECHNICAL' && <Cpu size={16} />}
                            {roundType === 'CODING' && <Code size={16} />}
                            {roundType === 'SYSTEM_DESIGN' && <Globe size={16} />}
                            {roundType === 'HR' && <User size={16} />}
                          </div>
                          <div className="flex-1 text-left">
                            <p
                              className={`text-sm font-medium ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}
                            >
                              {info.title}
                            </p>
                            <p className="text-xs text-slate-400">{info.estimatedDuration} min</p>
                          </div>
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveInterviewSettings}
                  className="text-sm font-semibold text-indigo-500 hover:underline"
                >
                  Save Interview Settings
                </button>
              </div>
            </div>
          </section>

          {/* DANGER ZONE */}
          <section className="rounded-[2rem] border border-red-100 bg-red-50/50 p-8">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-red-600">
              <Trash2 size={18} /> Danger Zone
            </h3>
            <p className="mb-4 text-xs text-red-400/80">
              Deleting your account is permanent. All history and data will be lost.
            </p>
            <button className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100">
              Delete Account
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
