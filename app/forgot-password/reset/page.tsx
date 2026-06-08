'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Redirect countdown setelah sukses
  useEffect(() => {
    if (!done) return;
    if (countdown <= 0) {
      router.push('/login');
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [done, countdown, router]);

  // Password strength
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strength = getStrength(newPassword);
  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'][strength];
  const strengthText = ['', 'text-red-600', 'text-amber-600', 'text-blue-600', 'text-emerald-600'][strength];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setDone(true);
    }, 1400);
  };

  // Mask email for display
  const maskEmail = (em: string) => {
    if (!em) return '';
    const [name, domain] = em.split('@');
    const masked = name.slice(0, 2) + '****' + name.slice(-1);
    return `${masked}@${domain}`;
  };

  if (!email) {
    return (
      <div className="text-center space-y-4">
        <p className="text-slate-600 font-medium">Sesi tidak valid. Silakan mulai ulang proses lupa password.</p>
        <Link href="/forgot-password" className="inline-block px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors">
          Kembali
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ── SUCCESS STATE ── */}
      {done ? (
        <div className="anim-scale space-y-6 text-center">
          <div className="flex justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-pulse" style={{ animationDuration: '2s' }} />
              <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Password Berhasil Direset! 🎉</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Password untuk akun <span className="font-bold text-slate-700">{maskEmail(email)}</span> telah berhasil diubah.<br />
              Silakan login dengan password baru kamu.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-emerald-700">
              Mengarahkan ke halaman login dalam{' '}
              <span className="text-2xl font-black">{countdown}</span>
              {' '}detik...
            </p>
          </div>

          <Link
            href="/login"
            id="btn-go-login"
            className="inline-block w-full py-4 text-sm font-bold text-white rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 text-center"
          >
            Langsung Login Sekarang →
          </Link>
        </div>
      ) : (
        /* ── FORM STATE ── */
        <div className="anim-up space-y-6">
          <div className="flex justify-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse" style={{ animationDuration: '2.5s' }} />
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 mb-2">Buat Password Baru</h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Untuk akun <span className="font-bold text-slate-700">{maskEmail(email)}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800">Password Baru</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-bold ${strengthText}`}>Kekuatan: {strengthLabel}</p>
                </div>
              )}

              {/* Password hints */}
              {newPassword && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Min. 8 karakter', ok: newPassword.length >= 8 },
                    { label: 'Huruf kapital', ok: /[A-Z]/.test(newPassword) },
                    { label: 'Angka', ok: /[0-9]/.test(newPassword) },
                    { label: 'Simbol', ok: /[^A-Za-z0-9]/.test(newPassword) },
                  ].map(({ label, ok }) => (
                    <div key={label} className={`flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span>{ok ? '✅' : '⭕'}</span>
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800">Konfirmasi Password Baru</label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Ulangi password baru"
                  className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:ring-4 hover:border-slate-300 pr-12 ${
                    confirmPassword
                      ? confirmPassword === newPassword
                        ? 'border-emerald-400 focus:border-emerald-400 focus:ring-emerald-500/10'
                        : 'border-red-300 focus:border-red-400 focus:ring-red-500/10'
                      : 'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
                {confirmPassword && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-sm">
                    {confirmPassword === newPassword ? '✅' : '❌'}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <span>⚠️</span>
                <p className="text-xs font-semibold text-red-600">{error}</p>
              </div>
            )}

            <button
              id="btn-reset-password"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-sm font-bold text-white rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Menyimpan Password...
                </span>
              ) : 'Reset Password'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { 0%{opacity:0;transform:scale(0.92)} 100%{opacity:1;transform:scale(1)} }
        .anim-up { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .anim-scale { animation: scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}} />

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/login" className="text-2xl font-black text-slate-900 tracking-tight">
            Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Laundry</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 p-8 border border-slate-100">
          <Suspense fallback={
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          }>
            <ResetPasswordContent />
          </Suspense>
        </div>

        <p className="text-center text-sm font-medium text-slate-500 mt-6">
          <Link href="/forgot-password" className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4 transition-all">
            ← Kembali
          </Link>
        </p>
      </div>
    </main>
  );
}
