import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { Input } from '../components/common/Input.jsx';
import { Button } from '../components/common/Button.jsx';
import { LogIn, Key, Mail, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { success, error: toastError } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please provide your username/email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await login(identifier.trim(), password);
      if (res.success) {
        success('Welcome back to CircleUp!');
        navigate(redirectPath);
      } else {
        setError(res.message);
        toastError(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (user, pass) => {
    setIdentifier(user);
    setPassword(pass);
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="editorial-card p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Log in to CircleUp
          </h1>
          <p className="text-xs text-neutral-500">
            Enter your credentials to manage your communities, posts, and votes
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Username"
            placeholder="demo_user or demo@circleup.dev"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            icon={Mail}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={Key}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Account Quick-Fill Card for Evaluation */}
        <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-200/60 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-brand-900">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Demo Evaluation Credentials</span>
          </div>
          <p className="text-neutral-600 leading-snug">
            Click to auto-populate seeded test account credentials:
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleFillDemo('demo_user', 'password123')}
              className="px-2.5 py-1 bg-white hover:bg-neutral-50 rounded-lg border border-brand-200 text-[11px] font-semibold text-brand-700 transition-colors shadow-subtle"
            >
              u/demo_user
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('alex_coder', 'password123')}
              className="px-2.5 py-1 bg-white hover:bg-neutral-50 rounded-lg border border-brand-200 text-[11px] font-semibold text-brand-700 transition-colors shadow-subtle"
            >
              u/alex_coder
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          <span>New to CircleUp? </span>
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
