'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StaffMember {
  id: string;
  name: string;
  role: 'admin' | 'kurir';
  email: string;
  phone: string;
  status: 'aktif' | 'nonaktif';
  joinDate: string;
}

interface ActivityLog {
  time: string;
  actor: string;
  msg: string;
}

interface ApprovalRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'kurir' | 'admin' | 'owner';
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  note?: string;
}

const DUMMY_APPROVALS: ApprovalRequest[] = [
  { id: 'REQ-001', name: 'Fahri Ramadhan', email: 'fahri@gmail.com', phone: '081234500001', role: 'kurir', requestDate: '08 Jun 2026 · 18:30', status: 'pending' },
  { id: 'REQ-002', name: 'Dewi Permata', email: 'dewi@gmail.com', phone: '085678900002', role: 'admin', requestDate: '08 Jun 2026 · 15:12', status: 'pending' },
  { id: 'REQ-003', name: 'Hendra Kusuma', email: 'hendra@gmail.com', phone: '087700003333', role: 'kurir', requestDate: '07 Jun 2026 · 09:45', status: 'approved' },
  { id: 'REQ-004', name: 'Lia Santika', email: 'lia@gmail.com', phone: '082200004444', role: 'admin', requestDate: '06 Jun 2026 · 11:20', status: 'rejected', note: 'Kuota admin sudah penuh.' },
  { id: 'REQ-005', name: 'Bagus Wibowo', email: 'bagus@gmail.com', phone: '089900005555', role: 'owner', requestDate: '05 Jun 2026 · 14:00', status: 'pending' },
];

const DUMMY_STAFF: StaffMember[] = [
  { id: 'STF-001', name: 'Sari Indah', role: 'admin', email: 'admin@smartlaundry.id', phone: '087654321098', status: 'aktif', joinDate: '01 Jan 2026' },
  { id: 'STF-002', name: 'Budi Santoso', role: 'kurir', email: 'kurir@smartlaundry.id', phone: '081234567890', status: 'aktif', joinDate: '15 Feb 2026' },
  { id: 'STF-003', name: 'Ahmad Rizky', role: 'kurir', email: 'ahmad@smartlaundry.id', phone: '089876543210', status: 'aktif', joinDate: '01 Mar 2026' },
  { id: 'STF-004', name: 'Siti Rahma', role: 'kurir', email: 'siti@smartlaundry.id', phone: '082111222333', status: 'nonaktif', joinDate: '10 Apr 2026' },
];

const PERMISSION_SETTINGS = [
  { id: 'perm_order_view', label: 'Lihat Semua Pesanan', roles: ['admin', 'owner'], desc: 'Akses ke daftar dan detail seluruh pesanan' },
  { id: 'perm_order_update', label: 'Update Status Laundry', roles: ['admin'], desc: 'Mengubah status proses laundry' },
  { id: 'perm_kurir_assign', label: 'Assign Kurir', roles: ['admin'], desc: 'Menugaskan kurir ke pesanan' },
  { id: 'perm_kurir_task', label: 'Tugas Pickup/Delivery', roles: ['kurir'], desc: 'Melihat dan mengelola tugas antar-jemput' },
  { id: 'perm_photo_upload', label: 'Upload Foto Bukti', roles: ['kurir'], desc: 'Upload foto bukti penjemputan' },
  { id: 'perm_finance', label: 'Laporan Keuangan', roles: ['owner'], desc: 'Akses laporan keuangan dan pendapatan' },
  { id: 'perm_staff_manage', label: 'Kelola Staff', roles: ['owner'], desc: 'Tambah, edit, nonaktifkan staff' },
  { id: 'perm_log_view', label: 'Lihat Log Aktivitas', roles: ['owner'], desc: 'Melihat riwayat aktivitas sistem' },
];

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staff' | 'approval' | 'log' | 'permissions'>('dashboard');
  const [staff, setStaff] = useState<StaffMember[]>(DUMMY_STAFF);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterRole, setFilterRole] = useState<'semua' | 'admin' | 'kurir'>('semua');
  const [newStaff, setNewStaff] = useState({ name: '', role: 'kurir' as 'admin' | 'kurir', email: '', phone: '' });
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(DUMMY_APPROVALS);
  const [approvalFilter, setApprovalFilter] = useState<'semua' | 'pending' | 'approved' | 'rejected'>('pending');
  const [confirmModal, setConfirmModal] = useState<{ req: ApprovalRequest; action: 'approve' | 'reject' } | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  // Finance data (mock)
  const financeToday = 'Rp 1.240.000';
  const financeMonth = 'Rp 38.750.000';
  const financeTotal = 'Rp 194.200.000';
  const totalOrders = 312;
  const totalCustomers = 148;

  useEffect(() => {
    const saved = localStorage.getItem('smartLaundry_activityLog');
    const base: ActivityLog[] = [
      { time: '09:45', actor: 'Admin', msg: 'Status pesanan SL-48291 → "Dijemput Kurir"' },
      { time: '09:30', actor: 'Kurir', msg: 'Status pesanan SL-73510 diperbarui ke "Laundry Dijemput"' },
      { time: '08:55', actor: 'Admin', msg: 'Kurir "Budi Santoso" ditugaskan ke pesanan SL-92034' },
      { time: '08:20', actor: 'Customer', msg: 'Pesanan baru SL-92034 dibuat (Reguler, 4 Kg)' },
      { time: '07:15', actor: 'Kurir', msg: 'Status pesanan SL-61027 diperbarui ke "Pesanan Selesai"' },
      { time: '06:50', actor: 'Admin', msg: 'Status pesanan SL-55812 → "Siap Diantar"' },
    ];
    setActivityLog(saved ? [...JSON.parse(saved), ...base] : base);
  }, []);

  const toast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const toggleStaffStatus = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'aktif' ? 'nonaktif' : 'aktif' } : s));
    toast('Status staff berhasil diperbarui!');
  };

  const addStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember: StaffMember = {
      id: `STF-00${staff.length + 1}`,
      name: newStaff.name,
      role: newStaff.role,
      email: newStaff.email,
      phone: newStaff.phone,
      status: 'aktif',
      joinDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setStaff(prev => [...prev, newMember]);
    setNewStaff({ name: '', role: 'kurir', email: '', phone: '' });
    setIsAddStaffOpen(false);
    toast(`Staff ${newMember.name} berhasil ditambahkan!`);
  };

  const filteredStaff = filterRole === 'semua' ? staff : staff.filter(s => s.role === filterRole);

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  const handleApproval = (req: ApprovalRequest, action: 'approve' | 'reject') => {
    setApprovals(prev => prev.map(a => a.id === req.id
      ? { ...a, status: action === 'approve' ? 'approved' : 'rejected', note: action === 'reject' ? rejectNote || 'Ditolak oleh owner.' : undefined }
      : a
    ));
    if (action === 'approve') {
      // Auto-add to staff list
      if (req.role !== 'owner') {
        const newMember: StaffMember = {
          id: `STF-00${staff.length + 1}`,
          name: req.name,
          role: req.role as 'admin' | 'kurir',
          email: req.email,
          phone: req.phone,
          status: 'aktif',
          joinDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        };
        setStaff(prev => [...prev, newMember]);
      }
      toast(`✅ Akun ${req.name} (${req.role}) disetujui!`);
    } else {
      toast(`❌ Permohonan ${req.name} ditolak.`);
    }
    setConfirmModal(null);
    setRejectNote('');
  };

  const filteredApprovals = approvalFilter === 'semua' ? approvals : approvals.filter(a => a.status === approvalFilter);

  return (
    <main className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes modalPop { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes toastIn { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .anim-up { animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .anim-modal { animation: modalPop 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        .anim-toast { animation: toastIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />

      {/* TOAST */}
      {successMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] anim-toast">
          <div className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-2xl font-bold text-sm">
            <span className="text-xl">✅</span> {successMsg}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 flex flex-col hidden md:flex shrink-0 z-20">
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black text-white tracking-tight hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-lg shadow-lg">👑</div>
            <div>Smart<span className="text-emerald-400">Owner</span></div>
          </Link>
        </div>
        <nav className="flex-1 p-6 space-y-1">
          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Panel Owner</div>
          {[
            { id: 'dashboard', label: 'Ringkasan', icon: '📊' },
            { id: 'staff', label: 'Kelola Staff', icon: '👥' },
            { id: 'approval', label: 'Persetujuan Akun', icon: '🔔', badge: pendingCount },
            { id: 'log', label: 'Log Aktivitas', icon: '📝' },
            { id: 'permissions', label: 'Hak Akses', icon: '🔐' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-left ${activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="flex-1">{tab.label}</span>
              {'badge' in tab && (tab as { badge: number }).badge > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                  {(tab as { badge: number }).badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-4 border-t border-white/10 mt-4">
            <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Akses Cepat</div>
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-semibold transition-all text-sm">
              <span>🧾</span> Dashboard Admin
            </Link>
            <Link href="/kurir" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-semibold transition-all text-sm">
              <span>🛵</span> Dashboard Kurir
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => setIsProfileOpen(true)} className="w-full group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-left">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md">R</div>
            <div>
              <p className="text-sm font-bold text-white">Rizal Firmansyah</p>
              <p className="text-xs text-slate-400">Owner & Founder</p>
            </div>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <section className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="px-8 py-6 sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b border-slate-200/60 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {{ dashboard: 'Ringkasan Bisnis', staff: 'Kelola Staff', approval: 'Persetujuan Akun', log: 'Log Aktivitas', permissions: 'Hak Akses' }[activeTab]}
            </h1>
            <p className="text-sm text-slate-500 font-medium">SmartLaundry — Panel Owner</p>
          </div>
          {activeTab === 'staff' && (
            <button onClick={() => setIsAddStaffOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
              + Tambah Staff
            </button>
          )}
        </header>

        <div className="p-8 space-y-8">

          {/* TAB: DASHBOARD RINGKASAN */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 anim-up">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { label: 'Pendapatan Hari Ini', value: financeToday, icon: '💰', sub: 'Per 07 Jun 2026', color: 'from-emerald-500 to-teal-600' },
                  { label: 'Pendapatan Bulan Ini', value: financeMonth, icon: '📅', sub: 'Juni 2026', color: 'from-blue-600 to-cyan-500' },
                  { label: 'Total Pendapatan', value: financeTotal, icon: '🏆', sub: 'Sejak berdiri', color: 'from-violet-600 to-purple-600' },
                ].map((item, i) => (
                  <div key={i} className={`bg-gradient-to-br ${item.color} p-6 rounded-[1.75rem] text-white shadow-xl relative overflow-hidden`}>
                    <div className="absolute -top-4 -right-4 text-7xl opacity-15">{item.icon}</div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/70 mb-2">{item.label}</p>
                    <p className="text-3xl font-black mb-1">{item.value}</p>
                    <p className="text-xs font-bold text-white/60">{item.sub}</p>
                  </div>
                ))}
              </div>

              {/* Operational Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Pesanan', value: totalOrders, icon: '📋', color: 'text-slate-800' },
                  { label: 'Total Customer', value: totalCustomers, icon: '👤', color: 'text-blue-700' },
                  { label: 'Kurir Aktif', value: staff.filter(s => s.role === 'kurir' && s.status === 'aktif').length, icon: '🛵', color: 'text-amber-700' },
                  { label: 'Admin Aktif', value: staff.filter(s => s.role === 'admin' && s.status === 'aktif').length, icon: '🧾', color: 'text-violet-700' },
                ].map((s, i) => (
                  <div key={i} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity Preview */}
              <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-base font-black text-slate-900">Aktivitas Terbaru</h3>
                  <button onClick={() => setActiveTab('log')} className="text-xs font-bold text-emerald-600 hover:underline">Lihat Semua →</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {activityLog.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex items-start gap-4 px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                        log.actor === 'Admin' ? 'bg-violet-100 text-violet-700' :
                        log.actor === 'Kurir' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{log.actor.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{log.msg}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{log.actor} • {log.time} WIB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: KELOLA STAFF */}
          {activeTab === 'staff' && (
            <div className="space-y-6 anim-up">
              <div className="flex gap-2">
                {(['semua', 'admin', 'kurir'] as const).map(f => (
                  <button key={f} onClick={() => setFilterRole(f)} className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${filterRole === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                    {f === 'semua' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'semua' ? staff.length : staff.filter(s => s.role === f).length})
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredStaff.map((s, i) => (
                  <div key={s.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4 anim-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md ${s.role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 truncate">{s.name}</p>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black ${s.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>
                          {s.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{s.email}</p>
                      <p className="text-xs text-slate-400">{s.phone} • Bergabung {s.joinDate}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${s.status === 'aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {s.status === 'aktif' ? '● Aktif' : '○ Nonaktif'}
                      </span>
                      <button
                        onClick={() => toggleStaffStatus(s.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${s.status === 'aktif' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      >
                        {s.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: LOG AKTIVITAS */}
          {activeTab === 'log' && (
            <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm overflow-hidden anim-up">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Semua Log Aktivitas</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activityLog.length} entri tersimpan</p>
              </div>
              <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
                {activityLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                    <div className="shrink-0 text-xs font-bold text-slate-400 w-12 pt-0.5">{log.time}</div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                      log.actor === 'Admin' ? 'bg-violet-100 text-violet-700' :
                      log.actor === 'Kurir' ? 'bg-amber-100 text-amber-700' :
                      log.actor === 'Owner' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{log.actor.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{log.msg}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{log.actor}</p>
                    </div>
                  </div>
                ))}
                {activityLog.length === 0 && (
                  <div className="flex flex-col items-center py-16 text-center">
                    <span className="text-5xl mb-3">📝</span>
                    <p className="font-black text-slate-700">Belum ada aktivitas</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: HAK AKSES */}
          {activeTab === 'permissions' && (
            <div className="space-y-4 anim-up">
              <div className="bg-white rounded-[1.75rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">Matriks Hak Akses</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Daftar hak akses berdasarkan peran (role)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Hak Akses</th>
                        <th className="px-6 py-4 text-center text-xs font-black text-violet-600 uppercase tracking-wider">Admin 🧾</th>
                        <th className="px-6 py-4 text-center text-xs font-black text-amber-600 uppercase tracking-wider">Kurir 🛵</th>
                        <th className="px-6 py-4 text-center text-xs font-black text-emerald-600 uppercase tracking-wider">Owner 👑</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {PERMISSION_SETTINGS.map(perm => (
                        <tr key={perm.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{perm.label}</p>
                            <p className="text-xs text-slate-400">{perm.desc}</p>
                          </td>
                          {(['admin', 'kurir', 'owner'] as const).map(role => (
                            <td key={role} className="px-6 py-4 text-center">
                              {perm.roles.includes(role) ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 font-black text-sm">✓</span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300 font-black text-sm">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PERSETUJUAN AKUN */}
          {activeTab === 'approval' && (
            <div className="space-y-6 anim-up">
              {/* Summary badges */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Menunggu', value: approvals.filter(a => a.status === 'pending').length, color: 'from-amber-400 to-orange-400', icon: '⏳' },
                  { label: 'Disetujui', value: approvals.filter(a => a.status === 'approved').length, color: 'from-emerald-400 to-teal-400', icon: '✅' },
                  { label: 'Ditolak', value: approvals.filter(a => a.status === 'rejected').length, color: 'from-red-400 to-rose-400', icon: '❌' },
                ].map((s) => (
                  <div key={s.label} className={`bg-gradient-to-br ${s.color} p-5 rounded-2xl text-white shadow-lg`}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className="text-3xl font-black">{s.value}</p>
                    <p className="text-xs font-bold text-white/80">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Filter */}
              <div className="flex gap-2 flex-wrap">
                {(['pending', 'approved', 'rejected', 'semua'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setApprovalFilter(f)}
                    className={`px-4 py-2 rounded-full text-xs font-black border transition-all ${
                      approvalFilter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'
                    }`}
                  >
                    {f === 'pending' ? '⏳ Menunggu' : f === 'approved' ? '✅ Disetujui' : f === 'rejected' ? '❌ Ditolak' : 'Semua'}
                    {' '}({f === 'semua' ? approvals.length : approvals.filter(a => a.status === f).length})
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="space-y-4">
                {filteredApprovals.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="font-black text-slate-700">Tidak ada permohonan</p>
                    <p className="text-sm text-slate-400">Semua permohonan sudah diproses</p>
                  </div>
                )}
                {filteredApprovals.map((req, i) => {
                  const roleMap = { kurir: { label: 'Kurir', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: '🛵' }, admin: { label: 'Admin', color: 'bg-violet-100 text-violet-700 border-violet-300', icon: '🧾' }, owner: { label: 'Owner', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: '👑' } };
                  const r = roleMap[req.role];
                  return (
                    <div key={req.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden anim-up" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shrink-0">{r.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-black text-slate-900">{req.name}</p>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${r.color}`}>{r.label}</span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                req.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                'bg-red-50 text-red-600 border border-red-200'
                              }`}>
                                {req.status === 'pending' ? '⏳ Menunggu' : req.status === 'approved' ? '✅ Disetujui' : '❌ Ditolak'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{req.email} • {req.phone}</p>
                            <p className="text-xs text-slate-400">📅 {req.requestDate}</p>
                            {req.status === 'rejected' && req.note && (
                              <p className="text-xs text-red-600 font-medium mt-1.5 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">Alasan: {req.note}</p>
                            )}
                          </div>
                          {req.status === 'pending' && (
                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                onClick={() => setConfirmModal({ req, action: 'approve' })}
                                className="px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
                              >
                                ✓ Setujui
                              </button>
                              <button
                                onClick={() => { setConfirmModal({ req, action: 'reject' }); setRejectNote(''); }}
                                className="px-4 py-2 bg-red-50 text-red-600 text-xs font-black rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                              >
                                ✕ Tolak
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODAL: KONFIRMASI APPROVE/REJECT */}
      {confirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden anim-modal">
            <div className={`h-1.5 w-full ${confirmModal.action === 'approve' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`} />
            <div className="p-7 space-y-5">
              <div className="text-center">
                <div className="text-5xl mb-3">{confirmModal.action === 'approve' ? '✅' : '❌'}</div>
                <h2 className="text-xl font-black text-slate-900 mb-1">
                  {confirmModal.action === 'approve' ? 'Setujui Permohonan?' : 'Tolak Permohonan?'}
                </h2>
                <p className="text-sm text-slate-500">
                  {confirmModal.action === 'approve'
                    ? `Akun ${confirmModal.req.name} sebagai ${confirmModal.req.role} akan diaktifkan.`
                    : `Permohonan ${confirmModal.req.name} akan ditolak.`}
                </p>
              </div>
              {confirmModal.action === 'reject' && (
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Alasan Penolakan (opsional)</label>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Contoh: Kuota sudah penuh, posisi tidak tersedia..."
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none resize-none focus:border-red-400 focus:ring-4 focus:ring-red-400/10 transition-all"
                    rows={3}
                  />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleApproval(confirmModal.req, confirmModal.action)}
                  className={`flex-1 py-3 text-white font-bold rounded-xl shadow-md transition-all ${
                    confirmModal.action === 'approve'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:shadow-emerald-200'
                      : 'bg-gradient-to-r from-red-500 to-rose-400 hover:shadow-red-200'
                  }`}
                >
                  {confirmModal.action === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH STAFF */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddStaffOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden anim-modal">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-900 to-slate-900">
              <div>
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">Tambah Staff Baru</p>
                <h2 className="text-xl font-black text-white">Form Pendaftaran Staff</h2>
              </div>
              <button onClick={() => setIsAddStaffOpen(false)} className="w-9 h-9 flex items-center justify-center bg-white/10 text-white rounded-full hover:bg-white/20">✕</button>
            </div>
            <form onSubmit={addStaff} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Peran (Role)</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['admin', 'kurir'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewStaff(p => ({...p, role: r}))}
                      className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${newStaff.role === r ? (r === 'admin' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-amber-500 bg-amber-50 text-amber-700') : 'border-slate-100 text-slate-500'}`}
                    >
                      {r === 'admin' ? '🧾 Admin' : '🛵 Kurir'}
                    </button>
                  ))}
                </div>
              </div>
              {[
                { label: 'Nama Lengkap', key: 'name', type: 'text', placeholder: 'Nama staff' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@smartlaundry.id' },
                { label: 'No. HP', key: 'phone', type: 'tel', placeholder: '08xxxxxxxxxx' },
              ].map(field => (
                <div key={field.key} className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">{field.label}</label>
                  <input
                    type={field.type}
                    value={newStaff[field.key as keyof typeof newStaff]}
                    onChange={(e) => setNewStaff(p => ({...p, [field.key]: e.target.value}))}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    required
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAddStaffOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">Tambahkan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROFIL OWNER */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 anim-modal">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">Profil Owner</h2>
              <button onClick={() => setIsProfileOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">✕</button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">R</div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">Rizal Firmansyah</p>
                <p className="text-sm font-bold text-emerald-600">Owner & Founder</p>
              </div>
              <div className="w-full space-y-3">
                {[
                  { l: 'Email', v: 'owner@smartlaundry.id' },
                  { l: 'No. HP', v: '081122334455' },
                  { l: 'Level Akses', v: 'Super Admin / Owner' },
                  { l: 'Bergabung', v: '01 Januari 2025' },
                ].map(item => (
                  <div key={item.l} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-500">{item.l}</span>
                    <span className="text-sm font-bold text-slate-800">{item.v}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="w-full py-3 text-center font-bold text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors block">Keluar (Logout)</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
