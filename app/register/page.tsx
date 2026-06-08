'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type StaffRole = 'kurir' | 'admin' | 'owner';

const staffRoles: { id: StaffRole; label: string; icon: string; desc: string; color: string; bgColor: string; textColor: string; borderColor: string }[] = [
  {
    id: 'kurir',
    label: 'Kurir',
    icon: '🛵',
    desc: 'Antar & jemput paket laundry',
    color: 'from-amber-500 to-orange-400',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-400',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: '🧾',
    desc: 'Kelola pesanan & status laundry',
    color: 'from-violet-500 to-purple-400',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    borderColor: 'border-violet-400',
  },
  {
    id: 'owner',
    label: 'Owner',
    icon: '👑',
    desc: 'Laporan keuangan & manajemen',
    color: 'from-emerald-500 to-teal-400',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-400',
  },
];

// ── Success Modal ─────────────────────────────────────────────────────────────
function SuccessModal({ role, name, onClose }: { role: StaffRole | null; name: string; onClose: () => void }) {
  const roleData = staffRoles.find((r) => r.id === role);
  const isCustomer = !role;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15,23,42,0.55)' }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
      >
        <div className={`h-1.5 w-full ${isCustomer ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : `bg-gradient-to-r ${roleData?.color}`}`} />
        <div className="p-7 space-y-5 text-center">
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl ${isCustomer ? 'bg-blue-100' : roleData?.bgColor}`}>
              {isCustomer ? '✅' : roleData?.icon}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 mb-2">
              {isCustomer ? 'Pendaftaran Berhasil!' : 'Permintaan Terkirim! 🎉'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isCustomer
                ? `Selamat datang, ${name}! Akun customer kamu sudah aktif dan siap digunakan.`
                : `Hai ${name}, permintaan akun ${roleData?.label} kamu sudah terkirim ke Owner. Kamu akan mendapat notifikasi setelah disetujui.`}
            </p>
          </div>

          {!isCustomer && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
              <p className="text-xs font-black text-amber-800 mb-2">⏳ Proses Selanjutnya:</p>
              <div className="space-y-1.5">
                {[
                  'Owner akan meninjau permohonanmu',
                  'Kamu akan dihubungi via email jika disetujui',
                  'Setelah disetujui, kamu bisa login sebagai ' + roleData?.label,
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 text-xs font-black shrink-0 mt-0.5">→</span>
                    <p className="text-xs text-amber-700 font-medium">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/login"
            onClick={onClose}
            className={`block w-full py-3.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.97] ${
              isCustomer ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : `bg-gradient-to-r ${roleData?.color}`
            }`}
          >
            {isCustomer ? 'Login Sekarang →' : 'Kembali ke Login'}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Register Form Content ─────────────────────────────────────────────────────
function RegisterContent() {
  const searchParams = useSearchParams();
  const prefilledRole = searchParams.get('role') as StaffRole | null;

  const [isStaff, setIsStaff] = useState<boolean>(!!prefilledRole && prefilledRole !== 'customer' as unknown as StaffRole);
  const [selectedStaffRole, setSelectedStaffRole] = useState<StaffRole | null>(
    prefilledRole && prefilledRole !== ('customer' as unknown as StaffRole) ? prefilledRole : null
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefilledRole && prefilledRole !== ('customer' as unknown as StaffRole)) {
      setIsStaff(true);
      setSelectedStaffRole(prefilledRole);
    }
  }, [prefilledRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    if (password !== confirm) { setError('Konfirmasi password tidak cocok.'); return; }
    if (isStaff && !selectedStaffRole) { setError('Pilih role staf yang ingin kamu daftarkan.'); return; }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
    }, 1500);
  };

  const activeStaffRole = staffRoles.find((r) => r.id === selectedStaffRole);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          * { font-family: 'Inter', sans-serif; }
          @keyframes fadeSlide { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
          @keyframes modalIn { 0%{opacity:0;transform:scale(0.92) translateY(12px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
          .anim-fade { animation: fadeSlide 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        `
      }} />

      {showSuccess && (
        <SuccessModal
          role={isStaff ? selectedStaffRole : null}
          name={name}
          onClose={() => setShowSuccess(false)}
        />
      )}

      <main className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
        {/* PANEL KIRI */}
        <div className="relative hidden lg:flex flex-col justify-center w-full lg:w-1/3 bg-slate-950 p-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-50 animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-cyan-500 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse delay-1000" />

          <div className="absolute top-12 left-10 z-10">
            <Link href="/" className="text-3xl font-black text-white tracking-tight">
              Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Laundry</span>
            </Link>
          </div>

          <div className="relative z-10 w-full max-w-sm mx-auto mt-12 space-y-5">
            <div className="backdrop-blur-xl bg-white/10 p-8 rounded-3xl border border-white/20 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Mulai Sekarang</h3>
                  <p className="text-blue-200 text-sm">Gabung dalam hitungan detik</p>
                </div>
              </div>
              <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
                Manajemen Laundry Lebih Mudah.
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm">
                Buat akun dan nikmati fitur pelacakan real-time, riwayat transaksi yang rapi, dan layanan antar-jemput praktis.
              </p>
            </div>

            {/* Role info cards */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role yang tersedia</p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">👤</span>
                  <div>
                    <p className="text-white font-bold text-sm">Customer</p>
                    <p className="text-slate-400 text-xs">Langsung aktif setelah daftar</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full font-bold border border-blue-400/20">Bebas</span>
                </div>
              </div>
              {staffRoles.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{r.icon}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{r.label}</p>
                      <p className="text-slate-400 text-xs">{r.desc}</p>
                    </div>
                    <span className="ml-auto text-xs px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full font-bold border border-amber-400/20">Perlu Approval</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL KANAN: Form */}
        <div className="w-full lg:w-2/3 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
          <div className="w-full max-w-md space-y-6 my-auto py-8">

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">Buat Akun Baru</h1>
              <p className="text-slate-500 font-medium">Lengkapi data di bawah ini untuk mendaftar.</p>
            </div>

            {/* Pilihan tipe akun */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-800">Daftar sebagai</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setIsStaff(false); setSelectedStaffRole(null); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    !isStaff
                      ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">👤</span>
                  <div className="text-center">
                    <p className={`text-sm font-black ${!isStaff ? 'text-blue-700' : 'text-slate-700'}`}>Customer</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Langsung aktif</p>
                  </div>
                  {!isStaff && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full font-bold">✓ Dipilih</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsStaff(true)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    isStaff
                      ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-100'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">🏢</span>
                  <div className="text-center">
                    <p className={`text-sm font-black ${isStaff ? 'text-amber-700' : 'text-slate-700'}`}>Staf / Owner</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Perlu persetujuan</p>
                  </div>
                  {isStaff && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-bold">✓ Dipilih</span>
                  )}
                </button>
              </div>
            </div>

            {/* Role staf selector */}
            {isStaff && (
              <div className="anim-fade space-y-3">
                <label className="text-sm font-bold text-slate-800">Pilih Role Staf</label>
                <div className="space-y-2">
                  {staffRoles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedStaffRole(r.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                        selectedStaffRole === r.id
                          ? `${r.borderColor} ${r.bgColor}`
                          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-xl shadow`}>
                        {r.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-black text-sm ${selectedStaffRole === r.id ? r.textColor : 'text-slate-700'}`}>{r.label}</p>
                        <p className="text-xs text-slate-500 font-medium">{r.desc}</p>
                      </div>
                      {selectedStaffRole === r.id && (
                        <span className={`text-xs font-black ${r.textColor}`}>✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Info persetujuan */}
                {selectedStaffRole && (
                  <div className="anim-fade p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <p className="text-xs font-black text-amber-800 mb-2">⏳ Proses Pendaftaran {activeStaffRole?.label}</p>
                    <div className="space-y-1.5">
                      {[
                        'Isi formulir di bawah dan klik "Kirim Permohonan"',
                        'Owner akan menerima dan meninjau permohonanmu',
                        'Kamu akan dihubungi melalui email setelah disetujui',
                        `Login sebagai ${activeStaffRole?.label} akan aktif setelah approval`,
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className={`shrink-0 w-4 h-4 rounded-full bg-gradient-to-br ${activeStaffRole?.color} flex items-center justify-center text-white text-xs font-black`}>
                            {i + 1}
                          </div>
                          <p className="text-xs text-amber-700 font-medium leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Nama Lengkap</label>
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                  required
                />
              </div>

              {isStaff && (
                <div className="anim-fade space-y-2">
                  <label className="text-sm font-bold text-slate-800">No. Telepon</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">Password</label>
                  <div className="relative">
                    <input
                      id="reg-password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 pr-12"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">Konfirmasi</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Ulangi password"
                    className={`w-full px-5 py-4 bg-slate-50 border-2 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white hover:border-slate-300 ${
                      confirm
                        ? confirm === password ? 'border-emerald-400 focus:border-emerald-400' : 'border-red-300 focus:border-red-400'
                        : 'border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                    }`}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <span>⚠️</span>
                  <p className="text-xs font-bold text-red-600">{error}</p>
                </div>
              )}

              <button
                id="btn-register"
                type="submit"
                disabled={isLoading}
                className={`w-full mt-2 py-4 text-sm font-bold text-white rounded-xl shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${
                  isStaff && activeStaffRole
                    ? `bg-gradient-to-r ${activeStaffRole.color} shadow-lg`
                    : 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-blue-200'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {isStaff ? 'Mengirim Permohonan...' : 'Mendaftarkan...'}
                  </span>
                ) : isStaff ? `Kirim Permohonan sebagai ${activeStaffRole?.label ?? 'Staf'} →` : 'Daftar Sekarang'}
              </button>
            </form>

            <p className="text-center text-sm font-medium text-slate-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800 hover:underline underline-offset-4 transition-all">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}