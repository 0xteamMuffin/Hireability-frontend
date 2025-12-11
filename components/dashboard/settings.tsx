/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Bell,
  Moon,
  Globe,
  CreditCard,
  Trash2,
  Camera,
  Save,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/hooks";
import { profileApi, settingsApi } from "@/lib/api";

export const SettingsPage = () => {
  const { user, isLoading } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
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
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      const res = await settingsApi.updateUserDetails(formData);
      if (res.success) {
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
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
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Profile Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your account settings and preferences.
        </p>
      </header>

      {/* --- PROFILE BANNER CARD --- */}
      <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 rounded-full bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center text-slate-400 overflow-hidden">
            <User size={48} />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-indigo-400 text-white p-2 rounded-full border-2 border-white shadow-sm">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-slate-800">{user.firstName} {user.lastName}</h2>
          <p className="text-slate-500">{profile?.targetRole || "Role not set"} • Free Plan</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 text-xs font-semibold border border-indigo-100">
              @{user.username}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
              Member since {new Date(user.createdAt).getFullYear()}
            </span>
          </div>
        </div>

        <button className="bg-white text-slate-700 border border-slate-200 px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all text-sm">
          Change Avatar
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT COLUMN (Forms) --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* PERSONAL INFORMATION */}
          <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User size={20} className="text-indigo-400" /> Personal
              Information
            </h3>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSave}
                  type="button"
                  className="bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:shadow-indigo-300 transition-all flex items-center gap-2"
                >
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* PASSWORD & SECURITY */}
          <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Lock size={20} className="text-indigo-400" /> Security
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button className="text-indigo-500 font-semibold text-sm hover:underline">
                  Update Password
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* --- RIGHT COLUMN (Preferences & Billing) --- */}
        <div className="space-y-8">
          {/* PREFERENCES */}
          <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-sm h-fit">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              Preferences
            </h3>

            <div className="space-y-6">
              {/* Notification Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      Notifications
                    </p>
                    <p className="text-xs text-slate-400">Email updates</p>
                  </div>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    notifications ? "bg-indigo-400" : "bg-slate-200"
                  }`}
                >
                  <motion.div
                    animate={{ x: notifications ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Moon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      Dark Mode
                    </p>
                    <p className="text-xs text-slate-400">Reduce eye strain</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    darkMode ? "bg-indigo-400" : "bg-slate-200"
                  }`}
                >
                  <motion.div
                    animate={{ x: darkMode ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      Language
                    </p>
                    <p className="text-xs text-slate-400">English (US)</p>
                  </div>
                </div>
                <button className="text-sm font-bold text-indigo-400">
                  Change
                </button>
              </div>
            </div>
          </section>

          {/* DANGER ZONE */}
          <section className="bg-red-50/50 border border-red-100 rounded-[2rem] p-8">
            <h3 className="text-red-600 font-bold mb-2 flex items-center gap-2">
              <Trash2 size={18} /> Danger Zone
            </h3>
            <p className="text-red-400/80 text-xs mb-4">
              Deleting your account is permanent. All history and data will be
              lost.
            </p>
            <button className="text-red-500 text-sm font-semibold border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors w-full">
              Delete Account
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
