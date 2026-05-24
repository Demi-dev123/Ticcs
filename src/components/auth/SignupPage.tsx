import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onSuccess: () => void;
}

export default function SignupPage({ onNavigateToLogin, onSuccess }: SignupPageProps) {
  const { signUp, isRealSupabase } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Please supply all required form fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);
      if (error) {
        setErrorMsg(error.message);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="signup-page" className="w-full min-h-[calc(100vh-56px)] flex items-center justify-center p-4 font-sans selection:bg-[#6C47FF]/20 selection:text-[#6C47FF]">
      <div className="max-w-md w-full bg-white dark:bg-[#1E1E1E] border border-neutral-200/40 dark:border-neutral-800/40 rounded-3xl p-8 shadow-card-light dark:shadow-card-dark transition-all space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Create Ticss Account
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Register below to build attendee QR codes and designs
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-mono tracking-wider uppercase">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yours@example.com"
                disabled={isLoading}
                className="w-full font-sans text-sm pl-11 pr-4 py-3 rounded-xl border border-neutral-250 dark:border-neutral-800 focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] outline-none transition-all bg-transparent text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-mono tracking-wider uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full font-sans text-sm pl-11 pr-4 py-3 rounded-xl border border-neutral-250 dark:border-neutral-800 focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] outline-none transition-all bg-transparent text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-mono tracking-wider uppercase">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full font-sans text-sm pl-11 pr-4 py-3 rounded-xl border border-neutral-250 dark:border-neutral-800 focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] outline-none transition-all bg-transparent text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <button
            id="btn-signup-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold tracking-wide bg-[#6C47FF] hover:bg-[#5B39E0] text-white flex items-center justify-center gap-2 shadow-focus active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Login redirection trigger */}
        <div className="pt-2 text-center text-xs">
          <span className="text-neutral-400">Already registered? </span>
          <button
            id="btn-goto-login"
            type="button"
            onClick={onNavigateToLogin}
            className="text-[#6C47FF] hover:underline font-semibold cursor-pointer"
          >
            Sign in instead
          </button>
        </div>

      </div>
    </div>
  );
}
