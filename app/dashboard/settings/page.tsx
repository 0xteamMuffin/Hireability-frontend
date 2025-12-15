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
  Trash2,
  Camera,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { settingsApi, UserDetails, UpdateUserInput, UpdateSettingsInput } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [user, setUser] = useState<UserDetails | null>(null);
  const [formData, setFormData] = useState<UpdateUserInput>({
    firstName: "",
    lastName: "",
    bio: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [preferences, setPreferences] = useState<UpdateSettingsInput>({
    notifications: true,
    darkMode: false,
    language: "en",
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
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        bio: response.data.bio || "",
      });
      if (response.data.settings) {
        setPreferences({
          notifications: response.data.settings.notifications,
          darkMode: response.data.settings.darkMode,
          language: response.data.settings.language,
        });
      }
    }
    setLoading(false);
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const response = await settingsApi.updateUserDetails(formData);
    if (response.success && response.data) {
      setUser(response.data);
      showMessage("success", "Profile updated successfully");
    } else {
      showMessage("error", response.error || "Failed to update profile");
    }
    setSaving(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }
    
    setSavingPassword(true);
    const response = await settingsApi.updatePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    
    if (response.success) {
      showMessage("success", "Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      showMessage("error", response.error || "Failed to update password");
    }
    setSavingPassword(false);
  };

  const handleUpdatePreferences = async (key: keyof UpdateSettingsInput, value: boolean | string) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    
    setSavingPrefs(true);
    const response = await settingsApi.updatePreferences(newPrefs);
    if (!response.success) {
      setPreferences(preferences);
      showMessage("error", "Failed to update preferences");
    }
    setSavingPrefs(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    setDeleting(true);
    const response = await settingsApi.deleteAccount();
    if (response.success) {
      localStorage.removeItem("token");
      router.push("/signin");
    } else {
      showMessage("error", response.error || "Failed to delete account");
    }
    setDeleting(false);
  };

  const formatMemberSince = (dateString: string) => {
    return new Date(dateString).getFullYear().toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </motion.div>
      )}

      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Profile Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your account settings and preferences.
        </p>
      </header>

      <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="relative group cursor-pointer">
          <div className="w-28 h-28 rounded-full bg-slate-200 border-4 border-white shadow-lg flex items-center justify-center text-slate-400 overflow-hidden">
            <User size={48} />
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 bg-indigo-400 text-white p-2 rounded-full border-2 border-white shadow-sm">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-slate-800">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user?.username || "User"}
          </h2>
          <p className="text-slate-500">Free Plan</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-500 text-xs font-semibold border border-indigo-100">
              @{user?.username}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
              Member since {user?.createdAt ? formatMemberSince(user.createdAt) : "N/A"}
            </span>
          </div>
        </div>

        <button className="bg-white text-slate-700 border border-slate-200 px-6 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-all text-sm">
          Change Avatar
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User size={20} className="text-indigo-400" /> Personal Information
            </h3>

            <form className="space-y-5" onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                    value={user?.email || ""}
                    disabled
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
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 transition-all resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:shadow-indigo-300 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white/60 backdrop-blur-md border border-white rounded-[2rem] p-8 shadow-sm h-fit">
            <h3 className="text-xl font-bold text-slate-800 mb-6">
              Preferences
            </h3>

            <div className="space-y-6">
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
                  onClick={() => handleUpdatePreferences("notifications", !preferences.notifications)}
                  disabled={savingPrefs}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    preferences.notifications ? "bg-indigo-400" : "bg-slate-200"
                  }`}
                >
                  <motion.div
                    animate={{ x: preferences.notifications ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

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
                  onClick={() => handleUpdatePreferences("darkMode", !preferences.darkMode)}
                  disabled={savingPrefs}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    preferences.darkMode ? "bg-indigo-400" : "bg-slate-200"
                  }`}
                >
                  <motion.div
                    animate={{ x: preferences.darkMode ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      Language
                    </p>
                    <p className="text-xs text-slate-400">
                      {preferences.language === "en" ? "English (US)" : preferences.language}
                    </p>
                  </div>
                </div>
                <button className="text-sm font-bold text-indigo-400">
                  Change
                </button>
              </div>
            </div>
          </section>

          <section className="bg-red-50/50 border border-red-100 rounded-[2rem] p-8">
            <h3 className="text-red-600 font-bold mb-2 flex items-center gap-2">
              <Trash2 size={18} /> Danger Zone
            </h3>
            <p className="text-red-400/80 text-xs mb-4">
              Deleting your account is permanent. All history and data will be
              lost.
            </p>
            <button 
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="text-red-500 text-sm font-semibold border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors w-full flex items-center justify-center gap-2 disabled:opacity-50"
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
