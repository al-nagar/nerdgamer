"use client";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 60%, 60%)`;
}

function UserAvatar({ username, profileImage, size = 120 }: { username: string; profileImage?: string | null; size?: number }) {
  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={username}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );
  }
  const initials = username
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: stringToColor(username),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size / 2,
        fontWeight: "bold",
        margin: "0 auto"
      }}
    >
      {initials}
    </div>
  );
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"><FaTimes /></button>
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || "");
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [about, setAbout] = useState(user?.about || "");
  const [aboutMessage, setAboutMessage] = useState<string | null>(null);
  const [aboutError, setAboutError] = useState<string | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [viewAvatar, setViewAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setAbout(user?.about || "");
    setNewAvatar(null);
    setAvatarPreview(null);
  }, [user]);

  const validatePassword = (password: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
  };

  if (!user) {
    return <div className="text-center text-gray-400 mt-12">You must be logged in to view your profile.</div>;
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    setPwError(null);
    
    if (!validatePassword(password)) {
      setPwError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }
    if (password !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    if (!currentPassword) {
      setPwError("Current password is required.");
      return;
    }
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMessage("Password updated successfully.");
        setPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      } else {
        setPwError(data.error || "Failed to update password.");
      }
    } catch {
      setPwError("Failed to update password.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/profile/delete", { method: "POST" });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        setDeleteError(data.error || "Failed to delete account.");
      }
    } catch {
      setDeleteError("Failed to delete account.");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/';
      } else {
        setIsLoggingOut(false);
        alert('Logout failed');
      }
    } catch {
      setIsLoggingOut(false);
      alert('Logout failed');
    }
  };

  const handleChooseAvatar = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveAvatar = async () => {
    if (!newAvatar) return;
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("profileImage", newAvatar);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setAvatarModalOpen(false);
        window.location.reload();
      } else {
        const data = await res.json();
        setUploadError(data.error || "Failed to upload image.");
      }
    } catch {
      setUploadError("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploading(true);
    setUploadError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "DELETE",
      });
      if (res.ok) {
        setAvatarModalOpen(false);
        window.location.reload();
      } else {
        const data = await res.json();
        setUploadError(data.error || "Failed to delete image.");
      }
    } catch {
      setUploadError("Failed to delete image.");
    } finally {
      setUploading(false);
    }
  };

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMessage(null);
    setNameError(null);
    if (!name.trim()) {
      setNameError("Name cannot be empty.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        setNameError(data.error || "Failed to update name.");
      }
    } catch {
      setNameError("Failed to update name.");
    }
  };

  const handleAboutUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAboutMessage(null);
    setAboutError(null);
    try {
      const formData = new FormData();
      formData.append("about", about);
      const res = await fetch("/api/profile", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setAboutMessage("About updated successfully.");
        window.location.reload();
      } else {
        const data = await res.json();
        setAboutError(data.error || "Failed to update about.");
      }
    } catch {
      setAboutError("Failed to update about.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 flex flex-col items-center justify-start">
      <div className="bg-gray-900 w-full min-h-screen flex flex-col items-center">
        <div className="relative mb-6 cursor-pointer group" onClick={() => setAvatarModalOpen(true)}>
          <div className="w-36 h-36 rounded-full bg-gray-700 flex items-center justify-center shadow-lg border-4 border-blue-500 overflow-hidden group-hover:ring-4 group-hover:ring-blue-400 transition-all duration-200">
            <UserAvatar username={user.username} profileImage={user.profileImage} size={140} />
          </div>
        </div>
        <div className="w-full flex flex-col gap-6 px-0">
          <section className="bg-gray-800 p-6 w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>Profile Info</span>
            </h2>
            <form onSubmit={handleNameUpdate} className="mb-4 w-full max-w-xl">
              <label className="block text-gray-300 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 mb-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={32}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors mt-1"
                disabled={uploading}
              >
                Save Name
              </button>
              {nameMessage && <div className="text-green-400 mt-2 text-sm">{nameMessage}</div>}
              {nameError && <div className="text-red-400 mt-2 text-sm">{nameError}</div>}
            </form>
            <form onSubmit={handleAboutUpdate} className="mb-2 w-full max-w-xl">
              <label className="block text-gray-300 font-semibold mb-1">About</label>
              <textarea
                value={about}
                onChange={e => setAbout(e.target.value)}
                className="w-full px-4 py-2 mb-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                maxLength={500}
                placeholder="Tell us about yourself..."
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors mt-1"
                disabled={uploading}
              >
                Save About
              </button>
              {aboutMessage && <div className="text-green-400 mt-2 text-sm">{aboutMessage}</div>}
              {aboutError && <div className="text-red-400 mt-2 text-sm">{aboutError}</div>}
            </form>
          </section>
          <section className="bg-gray-800 p-6 w-full flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-2">Account</h2>
            <div className="mb-2">
              <span className="text-gray-400 font-semibold">Username:</span>
              <span className="text-gray-200 ml-2">{user.username}</span>
            </div>
            <div className="mb-2">
              <span className="text-gray-400 font-semibold">Email:</span>
              <span className="text-gray-200 ml-2">{user.email}</span>
            </div>
          </section>
          <section className="bg-gray-800 p-6 w-full flex flex-col items-center">
            <h2 className="text-xl font-bold text-white mb-2">Change Password</h2>
            <form onSubmit={handlePasswordUpdate} className="w-full max-w-xl">
              <div className="relative mb-2">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none pr-12"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="relative mb-2">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none pr-12"
                  placeholder="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="relative mb-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none pr-12"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors mt-2"
              >
                Update Password
              </button>
              {pwMessage && <div className="text-green-400 mt-2 text-sm">{pwMessage}</div>}
              {pwError && <div className="text-red-400 mt-2 text-sm">{pwError}</div>}
            </form>
          </section>
          <section className="bg-gray-800 p-6 w-full flex flex-col items-center mt-4">
            <h2 className="text-xl font-bold text-white mb-2">Danger Zone</h2>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
            {deleteError && <div className="text-red-400 mt-2 text-sm">{deleteError}</div>}
          </section>
          <div className="w-full flex flex-col items-center mt-6 mb-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full max-w-xs bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
      <Modal open={avatarModalOpen} onClose={() => { setAvatarModalOpen(false); setNewAvatar(null); setAvatarPreview(null); setViewAvatar(false); }}>
        {viewAvatar ? (
          <div className="flex flex-col items-center justify-center">
            <button onClick={() => setViewAvatar(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"><FaTimes /></button>
            <div className="flex flex-col items-center justify-center">
              <img
                src={avatarPreview || user.profileImage || undefined}
                alt="Avatar Large"
                className="rounded-full shadow-2xl border-4 border-blue-500"
                style={{ width: 320, height: 320, objectFit: 'cover', background: '#222' }}
              />
              <div className="text-white mt-4 text-lg font-semibold">Avatar Preview</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-40 h-40 rounded-full bg-gray-700 flex items-center justify-center shadow-lg border-4 border-blue-500 overflow-hidden mb-2">
              {avatarPreview ? (
                <img src={avatarPreview} alt="New Avatar" className="w-full h-full object-cover rounded-full" />
              ) : user.profileImage ? (
                <img src={user.profileImage} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <UserAvatar username={user.username} size={160} />
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors"
                onClick={() => setViewAvatar(true)}
                type="button"
              >
                See Avatar
              </button>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                onClick={handleChooseAvatar}
                type="button"
              >
                Choose Avatar
              </button>
              <input
                type="file"
                accept="image/*"
                ref={avatarInputRef}
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
                onClick={handleDeleteAvatar}
                type="button"
                disabled={uploading}
              >
                Delete Avatar
              </button>
              {newAvatar && (
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors mt-2"
                  onClick={handleSaveAvatar}
                  type="button"
                  disabled={uploading}
                >
                  {uploading ? "Saving..." : "Save"}
                </button>
              )}
              {uploadError && <div className="text-red-400 text-sm text-center mt-2">{uploadError}</div>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 