import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal.jsx';
import { Input } from '../common/Input.jsx';
import { Button } from '../common/Button.jsx';
import { useToast } from '../../hooks/useToast.js';
import api from '../../services/api.js';

export const CreateCommunityModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [bannerColor, setBannerColor] = useState('#4F46E5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const slugPreview = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const colorPresets = ['#4F46E5', '#0EA5E9', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#EF4444'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Community name must be at least 2 characters');
      return;
    }
    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/communities', {
        name: name.trim(),
        description: description.trim(),
        category,
        bannerColor,
      });

      if (res.data?.success) {
        success(`Created c/${res.data.community.slug} successfully!`);
        setName('');
        setDescription('');
        onClose();
        navigate(`/c/${res.data.community.slug}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create community';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Circle Community">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <div>
          <Input
            label="Community Name"
            placeholder="e.g. Mechanical Keyboards"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={30}
          />
          <p className="mt-1 text-xs text-neutral-500 font-mono">
            Direct URL preview: <span className="font-semibold text-brand-600">circleup.dev/c/{slugPreview || 'name'}</span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            {['Technology', 'Programming', 'Design', 'Gaming', 'Science', 'General', 'Entertainment', 'Education'].map(
              (cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What is this community about? What topics can members discuss?"
            required
            maxLength={500}
            className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 placeholder:text-neutral-400"
          />
          <p className="text-[11px] text-right text-neutral-400 mt-1">
            {description.length}/500 characters
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Theme Accent Color
          </label>
          <div className="flex items-center gap-2">
            {colorPresets.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBannerColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-lg transition-transform ${
                  bannerColor === c ? 'scale-110 ring-2 ring-offset-2 ring-neutral-400' : 'hover:opacity-90'
                }`}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
          <Button variant="outline" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" loading={loading}>
            Create Circle
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCommunityModal;
