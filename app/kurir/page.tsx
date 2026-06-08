'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type TaskStatus = 'pending' | 'menuju' | 'dijemput' | 'diantar' | 'selesai';

interface KurirTask {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  service: string;
  weight: string;
  total: string;
  status: TaskStatus;
  pickupPhoto?: string;
  assignedAt: string;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; border: string; icon: string; next?: TaskStatus; nextLabel?: string }> = {
  pending:  { label: 'Menunggu Konfirmasi', color: 'text-slate-600',   bg: 'bg-slate-100',   border: 'border-slate-200',  icon: '⏳', next: 'menuju',  nextLabel: 'Mulai Menuju Lokasi' },
  menuju:   { label: 'Menuju Lokasi',        color: 'text-amber-700',   bg: 'bg-amber-100',   border: 'border-amber-200',  icon: '🛵', next: 'dijemput',nextLabel: 'Konfirmasi Dijemput' },
  dijemput: { label: 'Laundry Dijemput',     color: 'text-blue-700',    bg: 'bg-blue-100',    border: 'border-blue-200',   icon: '📦', next: 'diantar', nextLabel: 'Konfirmasi Diantar' },
  diantar:  { label: 'Laundry Diantar',      color: 'text-violet-700',  bg: 'bg-violet-100',  border: 'border-violet-200', icon: '🏠', next: 'selesai', nextLabel: 'Selesai' },
  selesai:  { label: 'Pesanan Selesai',      color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200',icon: '✅' },
};

const DUMMY_TASKS: KurirTask[] = [
  {
    id: 'SL-48291',
    customerName: 'Arya Fadhiil',
    address: 'Jl. Arjuna Utara No. 12, Grogol Petamburan',
    phone: '081234567890',
    service: 'Kilat (1 Hari)',
    weight: '3 Kg',
    total: 'Rp46.000',
    status: 'pending',
    assignedAt: '07 Jun 2026, 09:30 WIB',
  },
  {
    id: 'SL-73510',
    customerName: 'Bintang Raharjo',
    address: 'Jl. Kedoya Raya No. 5, Kebon Jeruk',
    phone: '082345678901',
    service: 'Reguler (3-4 Hari)',
    weight: '5 Kg',
    total: 'Rp35.000',
    status: 'menuju',
    assignedAt: '07 Jun 2026, 08:00 WIB',
  },
  {
    id: 'SL-61027',
    customerName: 'Citra Dewi',
    address: 'Jl. Duri Kosambi No. 8, Cengkareng',
    phone: '083456789012',
    service: 'Express (6 Jam)',
    weight: '2 Kg',
    total: 'Rp30.000',
    status: 'selesai',
    assignedAt: '07 Jun 2026, 07:00 WIB',
  },
];

export default function KurirDashboard() {
  const [tasks, setTasks] = useState<KurirTask[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartLaundry_kurirTasks');
      return saved ? JSON.parse(saved) : DUMMY_TASKS;
    }
    return DUMMY_TASKS;
  });

  const [selectedTask, setSelectedTask] = useState<KurirTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ taskId: string; nextStatus: TaskStatus } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeFilter, setActiveFilter] = useState<'semua' | TaskStatus>('semua');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('smartLaundry_kurirTasks', JSON.stringify(tasks));
  }, [tasks]);

  const updateStatus = (taskId: string, nextStatus: TaskStatus) => {
    setIsProcessing(true);
    setTimeout(() => {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));
      if (nextStatus === 'dijemput') {
        const task = tasks.find(t => t.id === taskId);
        if (task?.pickupPhoto) {
          localStorage.setItem('smartLaundry_pickupPhoto_' + taskId, task.pickupPhoto);
        }
        // update order status for customer track page
        localStorage.setItem('smartLaundry_orderStatus_' + taskId, nextStatus);
      }
      // sync with active order
      const activeOrder = localStorage.getItem('smartLaundry_activeOrder');
      if (activeOrder) {
        const parsed = JSON.parse(activeOrder);
        if (parsed.id === taskId) {
          parsed.kurirStatus = nextStatus;
          localStorage.setItem('smartLaundry_activeOrder', JSON.stringify(parsed));
        }
      }
      // log activity
      const log = JSON.parse(localStorage.getItem('smartLaundry_activityLog') || '[]');
      log.unshift({ time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), actor: 'Kurir', msg: `Status pesanan ${taskId} diperbarui ke "${statusConfig[nextStatus].label}"` });
      localStorage.setItem('smartLaundry_activityLog', JSON.stringify(log.slice(0, 50)));

      setIsProcessing(false);
      setIsConfirmOpen(false);
      setConfirmAction(null);
      setSelectedTask(prev => prev?.id === taskId ? { ...prev!, status: nextStatus } : prev);
      setSuccessMsg(`Status berhasil diperbarui ke "${statusConfig[nextStatus].label}"!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1200);
  };

  const handlePhotoUpload = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, pickupPhoto: base64 } : t));
      setSelectedTask(prev => prev?.id === taskId ? { ...prev!, pickupPhoto: base64 } : prev);
      localStorage.setItem('smartLaundry_pickupPhoto_' + taskId, base64);
      setSuccessMsg('Foto bukti pickup berhasil diunggah!');
      setTimeout(() => setSuccessMsg(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  const openDetail = (task: KurirTask) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const openConfirm = (taskId: string, nextStatus: TaskStatus) => {
    setConfirmAction({ taskId, nextStatus });
    setIsConfirmOpen(true);
  };

  const filteredTasks = activeFilter === 'semua' ? tasks : tasks.filter(t => t.status === activeFilter);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    aktif: tasks.filter(t => ['menuju', 'dijemput', 'diantar'].includes(t.status)).length,
    selesai: tasks.filter(t => t.status === 'selesai').length,
  };

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

      {/* SUCCESS TOAST */}
      {successMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] anim-toast">
          <div className="flex items-center gap-3 px-6 py-4 bg-emerald-600 text-white rounded-2xl shadow-2xl font-bold text-sm">
            <span className="text-xl">✅</span> {successMsg}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 flex flex-col hidden md:flex shrink-0 z-20">
        {/* Logo */}
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black text-white tracking-tight hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-lg shadow-lg">🛵</div>
            <div>Smart<span className="text-amber-400">Kurir</span></div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-6 space-y-1">
          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Menu Utama</div>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-amber-500/20 text-amber-400 rounded-xl font-bold transition-all text-left border border-amber-500/30">
            <span className="text-xl">📋</span> Daftar Tugas
          </button>
          <Link href="/track" className="flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-semibold transition-all">
            <span className="text-xl">📍</span> Lacak Pesanan
          </Link>
        </nav>

        {/* Profile Kurir */}
        <div className="p-4 border-t border-white/10">
          <button onClick={() => setIsProfileOpen(true)} className="w-full group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-left">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md">B</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Budi Santoso</p>
              <p className="text-xs text-slate-400">B 1234 XYZ • Honda Vario</p>
            </div>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <section className="flex-1 flex flex-col h-screen overflow-y-auto">

        {/* Header */}
        <header className="px-8 py-6 sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b border-slate-200/60 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Dashboard Kurir</h1>
            <p className="text-sm text-slate-500 font-medium">Selamat pagi, Budi! Kamu punya <span className="font-black text-amber-600">{stats.aktif} tugas aktif</span> hari ini.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Online</span>
          </div>
        </header>

        <div className="p-8 space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-up">
            {[
              { label: 'Total Tugas', value: stats.total, icon: '📋', color: 'from-slate-700 to-slate-900' },
              { label: 'Menunggu', value: stats.pending, icon: '⏳', color: 'from-slate-500 to-slate-700' },
              { label: 'Sedang Aktif', value: stats.aktif, icon: '🛵', color: 'from-amber-500 to-orange-600' },
              { label: 'Selesai Hari Ini', value: stats.selesai, icon: '✅', color: 'from-emerald-500 to-teal-600' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} p-5 rounded-[1.5rem] text-white shadow-lg relative overflow-hidden`}>
                <div className="absolute -top-3 -right-3 text-5xl opacity-20">{s.icon}</div>
                <p className="text-3xl font-black mb-1">{s.value}</p>
                <p className="text-xs font-bold opacity-80">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['semua', 'pending', 'menuju', 'dijemput', 'diantar', 'selesai'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-black transition-all border ${
                  activeFilter === f
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {f === 'semua' ? 'Semua' : statusConfig[f as TaskStatus].label}
                {f !== 'semua' && (
                  <span className="ml-1.5 opacity-60">{tasks.filter(t => t.status === f).length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Task Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTasks.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center py-20 text-center">
                <span className="text-6xl mb-4">📭</span>
                <p className="text-xl font-black text-slate-700">Tidak Ada Tugas</p>
                <p className="text-sm text-slate-400 mt-2">Belum ada tugas untuk filter ini.</p>
              </div>
            ) : filteredTasks.map((task, i) => {
              const cfg = statusConfig[task.status];
              const nextStatus = cfg.next;
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden anim-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{task.assignedAt}</p>
                        <h3 className="text-lg font-black text-slate-900">{task.id}</h3>
                      </div>
                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <span>{cfg.icon}</span> {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                        {task.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{task.customerName}</p>
                        <p className="text-xs text-slate-400">{task.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <span className="text-sm mt-0.5">📍</span>
                      <p className="text-xs font-medium text-slate-600 leading-relaxed">{task.address}</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">{task.service}</span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{task.weight}</span>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{task.total}</span>
                    </div>

                    {task.pickupPhoto && (
                      <div className="relative rounded-xl overflow-hidden h-24 bg-slate-100">
                        <img src={task.pickupPhoto} alt="Bukti Pickup" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                          <span className="text-white text-[10px] font-bold">📸 Foto Bukti Pickup</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="px-5 pb-5 flex gap-2 flex-wrap">
                    <button
                      onClick={() => openDetail(task)}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Detail
                    </button>
                    {task.status !== 'selesai' && (
                      <>
                        {/* Upload foto bukti saat status menuju atau dijemput */}
                        {(task.status === 'menuju' || task.status === 'dijemput') && (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={photoInputRef}
                              onChange={(e) => handlePhotoUpload(task.id, e)}
                            />
                            <button
                              onClick={() => photoInputRef.current?.click()}
                              className="px-3 py-2.5 text-xs font-bold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
                            >
                              📸 Foto
                            </button>
                          </>
                        )}
                        {nextStatus && (
                          <button
                            onClick={() => openConfirm(task.id, nextStatus)}
                            className="flex-1 py-2.5 text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all"
                          >
                            {cfg.nextLabel}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODAL: DETAIL TUGAS */}
      {isDetailOpen && selectedTask && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden anim-modal max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Detail Tugas</p>
                <h2 className="text-xl font-black text-white">{selectedTask.id}</h2>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="w-9 h-9 flex items-center justify-center bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">✕</button>
            </div>

            <div className="overflow-y-auto">
              {/* Status */}
              <div className="p-6 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Status Saat Ini</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm border ${statusConfig[selectedTask.status].bg} ${statusConfig[selectedTask.status].color} ${statusConfig[selectedTask.status].border}`}>
                  <span className="text-lg">{statusConfig[selectedTask.status].icon}</span>
                  {statusConfig[selectedTask.status].label}
                </div>
              </div>

              {/* Info Customer */}
              <div className="p-6 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-4">Informasi Customer</p>
                <div className="space-y-3">
                  {[
                    { label: 'Nama', value: selectedTask.customerName },
                    { label: 'No. HP', value: selectedTask.phone },
                    { label: 'Alamat', value: selectedTask.address },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                      <span className="text-sm font-bold text-slate-800 text-right max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail Pesanan */}
              <div className="p-6 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-4">Detail Pesanan</p>
                <div className="space-y-3">
                  {[
                    { label: 'Layanan', value: selectedTask.service },
                    { label: 'Estimasi Berat', value: selectedTask.weight },
                    { label: 'Total', value: selectedTask.total },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                      <span className="text-sm font-bold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Foto Bukti */}
              <div className="p-6 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase mb-4">Foto Bukti Pickup</p>
                {selectedTask.pickupPhoto ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <img src={selectedTask.pickupPhoto} alt="Bukti Pickup" className="w-full h-48 object-cover" />
                    <div className="p-3 bg-emerald-50 flex items-center gap-2">
                      <span className="text-emerald-600">✅</span>
                      <span className="text-xs font-bold text-emerald-700">Foto bukti sudah diunggah & terkirim ke customer</span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                    <span className="text-4xl mb-3 block">📷</span>
                    <p className="text-sm font-bold text-slate-500 mb-3">Belum ada foto bukti</p>
                    {(selectedTask.status === 'menuju' || selectedTask.status === 'dijemput') && (
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
                        📸 Upload Foto Sekarang
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(selectedTask.id, e)} />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Aksi Status */}
              {selectedTask.status !== 'selesai' && statusConfig[selectedTask.status].next && (
                <div className="p-6">
                  <button
                    onClick={() => {
                      openConfirm(selectedTask.id, statusConfig[selectedTask.status].next!);
                    }}
                    className="w-full py-4 font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all"
                  >
                    {statusConfig[selectedTask.status].icon} {statusConfig[selectedTask.status].nextLabel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI AKSI */}
      {isConfirmOpen && confirmAction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center anim-modal">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
              {statusConfig[confirmAction.nextStatus].icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Konfirmasi Aksi</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">
              Apakah kamu yakin ingin mengubah status pesanan <span className="font-black text-slate-800">{confirmAction.taskId}</span> menjadi{' '}
              <span className={`font-black ${statusConfig[confirmAction.nextStatus].color}`}>"{statusConfig[confirmAction.nextStatus].label}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsConfirmOpen(false); setConfirmAction(null); }}
                disabled={isProcessing}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => updateStatus(confirmAction.taskId, confirmAction.nextStatus)}
                disabled={isProcessing}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Memproses...
                  </span>
                ) : 'Ya, Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PROFIL */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 anim-modal">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">Profil Kurir</h2>
              <button onClick={() => setIsProfileOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">✕</button>
            </div>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-lg">B</div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">Budi Santoso</p>
                <p className="text-sm font-bold text-amber-600 mt-1">Kurir SmartLaundry</p>
              </div>
              <div className="w-full space-y-3 mt-2">
                {[
                  { label: 'No. Kendaraan', value: 'B 1234 XYZ' },
                  { label: 'Kendaraan', value: 'Honda Vario 2023' },
                  { label: 'No. HP', value: '081234567890' },
                  { label: 'Rating', value: '⭐ 4.9 / 5.0' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    <span className="text-sm font-bold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
              <Link href="/login" className="w-full py-3 mt-2 text-center font-bold text-sm text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors block">
                Keluar (Logout)
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
