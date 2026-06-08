'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Role = 'customer' | 'kurir' | 'admin' | 'owner';

const roles: { id: Role; label: string; desc: string; icon: string; color: string; borderColor: string; bgColor: string; textColor: string; route: string; restricted: boolean }[] = [
  {
    id: 'customer',
    label: 'Customer',
    desc: 'Buat & lacak pesanan laundry',
    icon: '👤',
    color: 'from-blue-500 to-cyan-400',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    route: '/order',
    restricted: false,
  },
  {
    id: 'kurir',
    label: 'Kurir',
    desc: 'Kelola tugas antar-jemput',
    icon: '🛵',
    color: 'from-amber-500 to-orange-400',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    route: '/kurir',
    restricted: true,
  },
  {
    id: 'admin',
    label: 'Admin',
    desc: 'Kelola pesanan & status laundry',
    icon: '🧾',
    color: 'from-violet-500 to-purple-400',
    borderColor: 'border-violet-500',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    route: '/admin',
    restricted: true,
  },
  {
    id: 'owner',
    label: 'Owner',
    desc: 'Laporan keuangan & manajemen',
    icon: '👑',
    color: 'from-emerald-500 to-teal-400',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    route: '/owner',
    restricted: true,
  },
];

const credentials: Record<Role, { email: string; password: string }> = {
  customer: { email: 'customer@smartlaundry.id', password: 'customer123' },
  kurir: { email: 'kurir@smartlaundry.id', password: 'kurir123' },
  admin: { email: 'admin@smartlaundry.id', password: 'admin123' },
  owner: { email: 'owner@smartlaundry.id', password: 'owner123' },
};

// ── Modal Peringatan Role Terbatas ────────────────────────────────────────────
function RestrictedRoleModal({
  role,
  onClose,
}: {
  role: (typeof roles)[number];
  onClose: () => void;
}) {
  const infoMap: Record<string, { badge: string; badgeColor: string; steps: string[] }> = {
    kurir: {
      badge: 'Kurir',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
      steps: [
        'Daftarkan diri kamu melalui halaman Register',
        'Pilih role "Kurir" saat mendaftar',
        'Tunggu verifikasi & persetujuan dari Owner',
        'Setelah disetujui, kamu bisa login sebagai Kurir',
      ],
    },
    admin: {
      badge: 'Admin',
      badgeColor: 'bg-violet-100 text-violet-700 border-violet-300',
      steps: [
        'Daftarkan diri kamu melalui halaman Register',
        'Pilih role "Admin" saat mendaftar',
        'Tunggu verifikasi & persetujuan dari Owner',
        'Setelah disetujui, kamu bisa login sebagai Admin',
      ],
    },
    owner: {
      badge: 'Owner',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      steps: [
        'Daftarkan diri kamu melalui halaman Register',
        'Pilih role "Owner" saat mendaftar',
        'Akun Owner akan diverifikasi secara manual',
        'Setelah terverifikasi, akses penuh akan diberikan',
      ],
    },
  };

  const info = infoMap[role.id] || infoMap['admin'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15,23,42,0.55)' }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        {/* Top accent bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${role.color}`} />

        <div className="p-7 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-2xl shadow-lg`}
              >
                {role.icon}
              </div>
              <div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${info.badgeColor} mb-1`}>
                  🔒 Akses Terbatas
                </div>
                <h2 className="text-lg font-black text-slate-900">Perlu Persetujuan Owner</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all text-lg font-bold"
            >
              ×
            </button>
          </div>

          {/* Info box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Role <span className={`font-black px-2 py-0.5 rounded-lg border text-xs ${info.badgeColor}`}>{role.label}</span> tidak bisa langsung diakses.
              Kamu perlu mendaftar dan menunggu persetujuan dari Owner.
            </p>
            <div className="space-y-2">
              {info.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className={`shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center text-white text-xs font-black shadow`}
                  >
                    {i + 1}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warning note */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-base shrink-0">⚠️</span>
            <p className="text-xs text-amber-700 font-medium leading-relaxed">
              Akun yang belum disetujui tidak dapat mengakses dashboard{' '}
              <strong>{role.label}</strong>. Pantau status persetujuan melalui email yang kamu daftarkan.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all active:scale-[0.97]"
            >
              Kembali
            </button>
            <Link
              href={`/register?role=${role.id}`}
              className={`flex-1 py-3 text-sm font-bold text-white rounded-xl text-center bg-gradient-to-r ${role.color} shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-all duration-200`}
              onClick={onClose}
            >
              Daftar Sekarang →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRestrictedModal, setShowRestrictedModal] = useState(false);

  const activeRole = roles.find((r) => r.id === selectedRole)!;

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleAutoFill = () => {
    setEmail(credentials[selectedRole].email);
    setPassword(credentials[selectedRole].password);
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Cek apakah role ini terbatas — tampilkan modal jika iya
    if (activeRole.restricted) {
      const cred = credentials[selectedRole];
      // Hanya izinkan masuk jika kredensial demo di-isi (simulasi sudah approved)
      if (email !== cred.email || password !== cred.password) {
        setShowRestrictedModal(true);
        return;
      }
    } else {
      const cred = credentials[selectedRole];
      if (email !== cred.email || password !== cred.password) {
        setError('Email atau password salah. Gunakan tombol "Isi Otomatis" untuk demo.');
        return;
      }
    }

    const cred = credentials[selectedRole];
    if (email !== cred.email || password !== cred.password) {
      setError('Email atau password salah. Gunakan tombol "Isi Otomatis" untuk demo.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      router.push(activeRole.route);
    }, 1000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeSlide { 0% { opacity: 0; transform: translateY(8px); } 100% { opacity: 1; transform: translateY(0); } }
          @keyframes modalIn { 0% { opacity: 0; transform: scale(0.92) translateY(12px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
          .anim-fade { animation: fadeSlide 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        `
      }} />

      {/* Modal Restricted */}
      {showRestrictedModal && (
        <RestrictedRoleModal
          role={activeRole}
          onClose={() => setShowRestrictedModal(false)}
        />
      )}

      <main className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
        {/* PANEL KIRI */}
        <div className="relative hidden lg:flex flex-col justify-center w-full lg:w-5/12 bg-slate-950 p-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-cyan-500 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse delay-1000" />

          <div className="absolute top-12 left-10 z-10">
            <Link href="/" className="text-3xl font-black text-white tracking-tight">
              Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Laundry</span>
            </Link>
          </div>

          <div className="relative z-10 w-full max-w-sm mx-auto mt-16 space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Akses berdasarkan peran</p>

            {roles.map((role) => (
              <div
                key={role.id}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  selectedRole === role.id
                    ? 'bg-white/15 border-white/40 scale-[1.02]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center text-xl shadow-lg`}>
                    {role.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold">{role.label}</p>
                      {role.restricted && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-white/10 text-slate-400 font-bold border border-white/10">
                          🔒 Perlu Daftar
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs">{role.desc}</p>
                  </div>
                  {selectedRole === role.id && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>
              </div>
            ))}

            {/* Info di panel kiri */}
            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                🔒 Role <strong className="text-slate-300">Kurir, Admin & Owner</strong> memerlukan pendaftaran dan persetujuan dari Owner sebelum bisa diakses.
              </p>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: Form */}
        <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 relative bg-white">
          <div className="w-full max-w-md space-y-7">

            {/* Role selector mobile */}
            <div className="flex lg:hidden gap-2 flex-wrap justify-center mb-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                    selectedRole === role.id
                      ? `${role.borderColor} ${role.bgColor} ${role.textColor}`
                      : 'border-slate-200 text-slate-500 bg-white'
                  }`}
                >
                  <span>{role.icon}</span>{role.label}
                  {role.restricted && <span className="text-xs">🔒</span>}
                </button>
              ))}
            </div>

            {/* Header */}
            <div key={selectedRole} className="anim-fade">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${activeRole.bgColor} ${activeRole.textColor}`}>
                <span>{activeRole.icon}</span>
                <span>Masuk sebagai {activeRole.label}</span>
                {activeRole.restricted && <span>🔒</span>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Selamat Datang!</h1>
              <p className="text-slate-500 font-medium">
                Masuk untuk mengakses dashboard <span className="font-bold text-slate-700">{activeRole.label}</span>.
              </p>
            </div>

            {/* Banner peringatan untuk role terbatas */}
            {activeRole.restricted && (
              <div
                key={`banner-${selectedRole}`}
                className="anim-fade flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
              >
                <span className="text-xl shrink-0">🔒</span>
                <div className="flex-1">
                  <p className="text-xs font-black text-amber-800 mb-1">Akses Terbatas — Perlu Persetujuan Owner</p>
                  <p className="text-xs text-amber-700 font-medium leading-relaxed">
                    Role <strong>{activeRole.label}</strong> hanya untuk staf yang sudah terdaftar dan disetujui. Belum terdaftar?{' '}
                    <Link href={`/register?role=${activeRole.id}`} className="underline underline-offset-2 font-black hover:text-amber-900">
                      Daftar di sini
                    </Link>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Demo hint */}
            {!activeRole.restricted && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xl">💡</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-600">Mode Demo</p>
                  <p className="text-xs text-slate-400 font-medium">Gunakan tombol di bawah untuk mengisi kredensial demo otomatis.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 ${activeRole.bgColor} ${activeRole.textColor}`}
                >
                  Isi Otomatis
                </button>
              </div>
            )}

            {/* Demo hint untuk role restricted — pakai Isi Otomatis utk simulasi akun sudah approved */}
            {activeRole.restricted && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-xl">🧪</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-600">Demo Staf</p>
                  <p className="text-xs text-slate-400 font-medium">Simulasikan login staf yang <strong>sudah disetujui</strong> owner.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 ${activeRole.bgColor} ${activeRole.textColor}`}
                >
                  Isi Demo
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={credentials[selectedRole].email}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800">Password</label>
                  <Link href="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Lupa Password?</Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <span>⚠️</span>
                  <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
              )}

              <button
                id="btn-login"
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 text-sm font-bold text-white rounded-xl shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 bg-gradient-to-r ${activeRole.color} ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Masuk...
                  </span>
                ) : `Masuk sebagai ${activeRole.label}`}
              </button>
            </form>

            <p className="text-center text-sm font-medium text-slate-600">
              Belum punya akun?{' '}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4 transition-all">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}