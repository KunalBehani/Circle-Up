import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import api from '../services/api.js';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { Settings, Save, AlertCircle } from 'lucide-react';

export const SettingsPage = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/settings');
      return;
    }
    if (user) {
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.patch('/auth/profile', {
        bio: bio.trim(),
        avatar: avatar.trim(),
      });

      if (res.data?.success) {
        updateUser(res.data.user);
        success('Profile settings updated successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile settings';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAvatarPreset = (seed) => {
    setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-neutral-200/80 pb-3 flex items-center gap-2.5">
        <div className="p-2 bg-neutral-100 text-neutral-700 rounded-xl">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Account & Profile Settings
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Customize your public bio, avatar, and view account details
          </p>
        </div>
      </div>

      <div className="editorial-card p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Read-Only Account Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-neutral-100">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Username
            </label>
            <p className="text-sm font-bold text-neutral-800">u/{user?.username}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Registered Email
            </label>
            <p className="text-sm font-medium text-neutral-600">{user?.email}</p>
          </div>
        </div>

        {/* Editable Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview & URL */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Profile Avatar
            </label>
            <div className="flex items-center gap-4 mb-3">
              <img
                src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username}`}
                alt="Avatar Preview"
                className="w-16 h-16 rounded-2xl bg-brand-50 object-cover ring-2 ring-brand-200 shadow-sm"
              />
              <div className="space-y-1">
                <p className="text-xs font-bold text-neutral-700">Choose a Seed Style</p>
                <div className="flex gap-2">
                  {['rocket', 'pixel', 'circuit', 'nebula', 'matrix'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleSelectAvatarPreset(preset)}
                      className="px-2 py-1 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Input
              label="Or Custom Avatar Image URL"
              placeholder="https://..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Public Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other community members what interests you, what you build, or what you discuss..."
              maxLength={250}
              className="w-full rounded-xl border border-neutral-300 p-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-neutral-400"
            />
            <p className="text-[11px] text-right text-neutral-400 mt-1">
              {bio.length}/250 characters
            </p>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={Save}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
