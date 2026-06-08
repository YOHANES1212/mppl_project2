'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DEMO_EMAILS = [
  'customer@smartlaundry.id',
  'kurir@smartlaundry.id',
  'admin@smartlaundry.id',
  'owner@smartlaundry.id',
];

type Step = 'email' | 'otp' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  // ── STEP 1: Submit email ──────────────────────────────────────────────────
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const found = DEMO_EMAILS.find((em) => em === email.trim().toLowerCase());
    if (!found) {
      setError('Email tidak terdaftar di sistem. Coba gunakan email demo yang tersedia.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setSentTo(email.trim().toLowerCase());
      setIsLoading(false);
      setStep('otp');
    }, 1400);
  };

  // ── STEP 2: OTP input ─────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }
    // Demo: accept any 6-digit code
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/forgot-password/reset?email=' + encodeURIComponent(sentTo));
    }, 1200);
  };

  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  // ── Mask email ────────────────────────────────────────────────────────────
  const maskEmail = (em: string) => {
    const [name, domain] = em.split('@');
    const masked = name.slice(0, 2) + '****' + name.slice(-1);
    return `${masked}@${domain}`;
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans p-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes fadeUp { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { 0%{opacity:0;transform:scale(0.92)} 100%{opacity:1;transform:scale(1)} }
        @keyframes pulse-ring { 0%{transform:scale(0.9);opacity:0.6} 50%{transform:scale(1.05);opacity:0.3} 100%{transform:scale(0.9);opacity:0.6} }
        .anim-up { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .anim-scale { animation: scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .otp-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .otp-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.12); outline: none; }
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

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 p-8 border border-slate-100">

          {/* ── STEP: EMAIL ── */}
          {step === 'email' && (
            <div key="email" className="anim-up space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-blue-100 animate-pulse" style={{ animationDuration: '2.5s' }} />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900 mb-2">Lupa Password?</h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Masukkan email akunmu. Kami akan mengirimkan kode OTP untuk mereset password.
                </p>
              </div>

              {/* Email demo hint */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-amber-700 mb-2">💡 Mode Demo — Email yang terdaftar:</p>
                <div className="space-y-1">
                  {DEMO_EMAILS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => { setEmail(em); setError(''); }}
                      className="block w-full text-left text-xs text-amber-600 font-medium hover:text-amber-800 hover:underline underline-offset-2 transition-colors"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">Alamat Email</label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="contoh@smartlaundry.id"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <span className="text-base">⚠️</span>
                    <p className="text-xs font-semibold text-red-600">{error}</p>
                  </div>
                )}

                <button
                  id="btn-send-otp"
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
                      Mengirim OTP...
                    </span>
                  ) : 'Kirim Kode OTP'}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP: OTP ── */}
          {step === 'otp' && (
            <div key="otp" className="anim-up space-y-6">
              <div className="flex justify-center">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-violet-100 animate-pulse" style={{ animationDuration: '2.5s' }} />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-400 rounded-full flex items-center justify-center shadow-lg shadow-violet-200">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900 mb-2">Cek Email Kamu</h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Kode OTP 6 digit telah dikirim ke<br />
                  <span className="font-bold text-slate-700">{maskEmail(sentTo)}</span>
                </p>
              </div>

              {/* Demo OTP hint */}
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-violet-700">🔑 Mode Demo</p>
                <p className="text-xs text-violet-600 mt-1">Masukkan <strong>kode OTP apapun</strong> (6 angka) untuk melanjutkan.</p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-800 mb-3 block text-center">Masukkan Kode OTP</label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="otp-input w-12 h-14 text-center text-xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl"
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <span>⚠️</span>
                    <p className="text-xs font-semibold text-red-600">{error}</p>
                  </div>
                )}

                <button
                  id="btn-verify-otp"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 text-sm font-bold text-white rounded-xl shadow-lg bg-gradient-to-r from-violet-500 to-purple-400 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Memverifikasi...
                    </span>
                  ) : 'Verifikasi Kode'}
                </button>
              </form>

              <div className="text-center space-y-2">
                <p className="text-xs text-slate-500">Tidak menerima email?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                >
                  Kirim Ulang Kode
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); setOtp(['','','','','','']); }}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                ← Ganti Email
              </button>
            </div>
          )}
        </div>

        {/* Back to login */}
        <p className="text-center text-sm font-medium text-slate-500 mt-6">
          Ingat password?{' '}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4 transition-all">
            Kembali Login
          </Link>
        </p>
      </div>
    </main>
  );
}
