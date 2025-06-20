"use client";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!user) {
    return <div className="text-center text-gray-400 mt-12">You must be logged in to view your profile.</div>;
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    setPwError(null);
    if (password.length < 8) {
      setPwError("Password must be at least 8 characters.");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 py-16 px-4 flex justify-center items-start">
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Profile</h1>
        <div className="mb-8">
          <div className="text-white text-lg font-semibold mb-2">Username:</div>
          <div className="text-gray-300 mb-4">{user.username}</div>
          <div className="text-white text-lg font-semibold mb-2">Email:</div>
          <div className="text-gray-300 mb-4">{user.email}</div>
        </div>
        <form onSubmit={handlePasswordUpdate} className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Update Password</h2>
          <input
            type="password"
            className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white focus:outline-none"
            placeholder="Current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            minLength={8}
            required
          />
          <input
            type="password"
            className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white focus:outline-none"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />
          <input
            type="password"
            className="w-full px-4 py-2 mb-3 rounded bg-gray-700 text-white focus:outline-none"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
          >
            Update Password
          </button>
          {pwMessage && <div className="text-green-400 mt-2 text-sm">{pwMessage}</div>}
          {pwError && <div className="text-red-400 mt-2 text-sm">{pwError}</div>}
        </form>
        <div className="border-t border-gray-700 pt-6">
          <h2 className="text-xl font-bold text-white mb-4">Danger Zone</h2>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Account"}
          </button>
          {deleteError && <div className="text-red-400 mt-2 text-sm">{deleteError}</div>}
        </div>
      </div>
    </div>
  );
} 