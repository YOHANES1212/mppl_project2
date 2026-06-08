'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type OrderStatus = 'menunggu_kurir' | 'dijemput' | 'dicuci' | 'disetrika' | 'siap_diantar' | 'diantar' | 'selesai';

interface Order {
  id: string;
  customer: string;
  phone: string;
  service: string;
  weight: string;
  total: string;
  payment: string;
  date: string;
  status: OrderStatus;
  kurir?: string;
  address: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  menunggu_kurir: { label: 'Menunggu Kurir',  color: 'text-slate-600',   bg: 'bg-slate-100',   border: 'border-slate-200',  icon: '⏳' },
  dijemput:       { label: 'Dijemput Kurir',   color: 'text-amber-700',   bg: 'bg-amber-100',   border: 'border-amber-200',  icon: '🛵' },
  dicuci:         { label: 'Sedang Dicuci',    color: 'text-blue-700',    bg: 'bg-blue-100',    border: 'border-blue-200',   icon: '🫧' },
  disetrika:      { label: 'Setrika & Packing',color: 'text-violet-700',  bg: 'bg-violet-100',  border: 'border-violet-200', icon: '✨' },
  siap_diantar:   { label: 'Siap Diantar',     color: 'text-cyan-700',    bg: 'bg-cyan-100',    border: 'border-cyan-200',   icon: '📦' },
  diantar:        { label: 'Sedang Diantar',   color: 'text-indigo-700',  bg: 'bg-indigo-100',  border: 'border-indigo-200', icon: '🏠' },
  selesai:        { label: 'Selesai',           color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200',icon: '✅' },
};

const STATUS_FLOW: OrderStatus[] = ['menunggu_kurir','dijemput','dicuci','disetrika','siap_diantar','diantar','selesai'];

const DUMMY_ORDERS: Order[] = [
  { id: 'SL-48291', customer: 'Arya Fadhiil', phone: '081234567890', service: 'Kilat (1 Hari)', weight: '3 Kg', total: 'Rp46.000', payment: 'Transfer VA', date: '07 Jun 2026, 09:30 WIB', status: 'dijemput', kurir: 'Budi Santoso', address: 'Jl. Arjuna Utara No. 12, Grogol Petamburan' },
  { id: 'SL-73510', customer: 'Bintang Raharjo', phone: '082345678901', service: 'Reguler (3-4 Hari)', weight: '5 Kg', total: 'Rp35.000', payment: 'E-Wallet', date: '07 Jun 2026, 08:00 WIB', status: 'dicuci', kurir: 'Budi Santoso', address: 'Jl. Kedoya Raya No. 5, Kebon Jeruk' },
  { id: 'SL-61027', customer: 'Citra Dewi', phone: '083456789012', service: 'Express (6 Jam)', weight: '2 Kg', total: 'Rp30.000', payment: 'QRIS', date: '07 Jun 2026, 07:00 WIB', status: 'selesai', kurir: 'Budi Santoso', address: 'Jl. Duri Kosambi No. 8, Cengkareng' },
  { id: 'SL-92034', customer: 'Dinda Pratiwi', phone: '084567890123', service: 'Reguler (3-4 Hari)', weight: '4 Kg', total: 'Rp28.000', payment: 'Transfer VA', date: '07 Jun 2026, 10:15 WIB', status: 'menunggu_kurir', address: 'Jl. Panjang No. 3, Kebon Jeruk' },
  { id: 'SL-55812', customer: 'Eka Putra', phone: '085678901234', service: 'Kilat (1 Hari)', weight: '6 Kg', total: 'Rp72.000', payment: 'E-Wallet', date: '07 Jun 2026, 06:30 WIB', status: 'siap_diantar', kurir: 'Budi Santoso', address: 'Jl. Meruya Ilir No. 7, Kebon Jeruk' },
];

const KURIR_LIST = ['Budi Santoso', 'Ahmad Rizky', 'Siti Rahma'];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>(DUMMY_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'semua'>('semua');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'pesanan' | 'konfirmasi_kurir'>('pesanan');

  // Load active order dari customer
  useEffect(() => {
    const active = localStorage.getItem('smartLaundry_activeOrder');
    if (active) {
      const parsed = JSON.parse(active);
      const exists = orders.find(o => o.id === parsed.id);
      if (!exists) {
        setOrders(prev => [
          {
            id: parsed.id,
            customer: 'Customer Baru',
            phone: '-',
            service: parsed.service,
            weight: parsed.weight,
            total: parsed.total,
            payment: parsed.payment,
            date: parsed.date,
            status: 'menunggu_kurir',
            address: '-',
          },
          ...prev,
        ]);
      }
    }
  }, []);

  const toast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setIsProcessing(true);
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder(prev => prev?.id === orderId ? { ...prev!, status: newStatus } : prev);
      // Sync log
      const log = JSON.parse(localStorage.getItem('smartLaundry_activityLog') || '[]');
      log.unshift({ time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), actor: 'Admin', msg: `Status pesanan ${orderId} → "${statusConfig[newStatus].label}"` });
      localStorage.setItem('smartLaundry_activityLog', JSON.stringify(log.slice(0, 50)));
      setIsProcessing(false);
      setIsStatusModalOpen(false);
      toast(`Status pesanan ${orderId} berhasil diperbarui!`);
    }, 1000);
  };

  const assignKurir = (orderId: string, kurir: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, kurir } : o));
      setSelectedOrder(prev => prev?.id === orderId ? { ...prev!, kurir } : prev);
      const log = JSON.parse(localStorage.getItem('smartLaundry_activityLog') || '[]');
      log.unshift({ time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), actor: 'Admin', msg: `Kurir "${kurir}" ditugaskan ke pesanan ${orderId}` });
      localStorage.setItem('smartLaundry_activityLog', JSON.stringify(log.slice(0, 50)));
      setIsProcessing(false);
      setIsAssignOpen(false);
      toast(`Kurir berhasil ditugaskan ke pesanan ${orderId}!`);
    }, 800);
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'semua' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'menunggu_kurir').length,
    proses: orders.filter(o => ['dijemput','dicuci','disetrika','siap_diantar','diantar'].includes(o.status)).length,
    selesai: orders.filter(o => o.status === 'selesai').length,
  };

  const needsKurirConfirm = orders.filter(o => o.status === 'dijemput');

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
          <div className="flex items-center gap-3 px-6 py-4 bg-violet-600 text-white rounded-2xl shadow-2xl font-bold text-sm">
            <span className="text-xl">✅</span> {successMsg}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-950 flex flex-col hidden md:flex shrink-0 z-20">
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black text-white tracking-tight hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shadow-lg">🧾</div>
            <div>Smart<span className="text-violet-400">Admin</span></div>
          </Link>
        </div>
        <nav className="flex-1 p-6 space-y-1">
          <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Menu Admin</div>
          <button
            onClick={() => setActiveTab('pesanan')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-left ${activeTab === 'pesanan' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <span className="text-xl">📋</span> Manajemen Pesanan
            {stats.pending > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{stats.pending}</span>}
          </button>
          <button
            onClick={() => setActiveTab('konfirmasi_kurir')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-left ${activeTab === 'konfirmasi_kurir' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <span className="text-xl">🛵</span> Konfirmasi Kurir
            {needsKurirConfirm.length > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{needsKurirConfirm.length}</span>}
          </button>
          <Link href="/owner" className="flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-semibold transition-all">
            <span className="text-xl">👑</span> Dashboard Owner
          </Link>
          <Link href="/kurir" className="flex items-center gap-3 px-4 py-3.5 text-slate-400 hover:bg-white/5 hover:text-white rounded-xl font-semibold transition-all">
            <span className="text-xl">🛵</span> Dashboard Kurir
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => setIsProfileOpen(true)} className="w-full group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all text-left">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">S</div>
            <div>
              <p className="text-sm font-bold text-white">Sari Indah</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <section className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="px-8 py-6 sticky top-0 bg-slate-50/90 backdrop-blur-md z-10 border-b border-slate-200/60 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {activeTab === 'pesanan' ? 'Manajemen Pesanan' : 'Konfirmasi Pickup Kurir'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {activeTab === 'pesanan' ? `${stats.total} pesanan total — ${stats.proses} sedang diproses` : `${needsKurirConfirm.length} pesanan menunggu konfirmasi`}
            </p>
          </div>
          {activeTab === 'pesanan' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pesanan / customer..."
                  className="w-60 pl-9 pr-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-violet-400 transition-all"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </div>
          )}
        </header>

        <div className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 anim-up">
            {[
              { label: 'Total Pesanan', value: stats.total, icon: '📋', color: 'from-slate-700 to-slate-900' },
              { label: 'Menunggu Kurir', value: stats.pending, icon: '⏳', color: 'from-amber-500 to-orange-600' },
              { label: 'Sedang Diproses', value: stats.proses, icon: '🫧', color: 'from-violet-500 to-purple-600' },
              { label: 'Selesai', value: stats.selesai, icon: '✅', color: 'from-emerald-500 to-teal-600' },
            ].map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} p-5 rounded-[1.5rem] text-white shadow-lg relative overflow-hidden`}>
                <div className="absolute -top-3 -right-3 text-5xl opacity-20">{s.icon}</div>
                <p className="text-3xl font-black mb-1">{s.value}</p>
                <p className="text-xs font-bold opacity-80">{s.label}</p>
              </div>
            ))}
          </div>

          {/* TAB: MANAJEMEN PESANAN */}
          {activeTab === 'pesanan' && (
            <>
              {/* Filter Status */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterStatus('semua')} className={`px-4 py-2 rounded-full text-xs font-black transition-all border ${filterStatus === 'semua' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                  Semua ({orders.length})
                </button>
                {STATUS_FLOW.map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-full text-xs font-black transition-all border flex items-center gap-1 ${filterStatus === s ? `${statusConfig[s].bg} ${statusConfig[s].color} ${statusConfig[s].border}` : 'bg-white text-slate-500 border-slate-200'}`}>
                    <span>{statusConfig[s].icon}</span> {statusConfig[s].label} ({orders.filter(o=>o.status===s).length})
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden anim-up">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">ID Pesanan</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Layanan</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Kurir</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map((order, i) => {
                        const cfg = statusConfig[order.status];
                        const next = getNextStatus(order.status);
                        return (
                          <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-4 font-black text-slate-900">{order.id}</td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-slate-800">{order.customer}</p>
                                <p className="text-xs text-slate-400">{order.phone}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-bold text-slate-700">{order.service}</p>
                                <p className="text-xs text-slate-400">{order.weight}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                {cfg.icon} {cfg.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {order.kurir ? (
                                <span className="text-sm font-bold text-slate-700">{order.kurir}</span>
                              ) : (
                                <button onClick={() => { setSelectedOrder(order); setIsAssignOpen(true); }} className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors border border-violet-200">
                                  + Assign Kurir
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 font-black text-slate-800">{order.total}</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }} className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">Detail</button>
                                {next && (
                                  <button onClick={() => { setSelectedOrder(order); setIsStatusModalOpen(true); }} className="px-3 py-1.5 text-xs font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
                                    Update Status
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filtered.length === 0 && (
                    <div className="flex flex-col items-center py-16 text-center">
                      <span className="text-5xl mb-3">📭</span>
                      <p className="font-black text-slate-700">Tidak ada pesanan ditemukan</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB: KONFIRMASI KURIR */}
          {activeTab === 'konfirmasi_kurir' && (
            <div className="space-y-4 anim-up">
              {needsKurirConfirm.length === 0 ? (
                <div className="flex flex-col items-center py-20 text-center">
                  <span className="text-6xl mb-4">✅</span>
                  <p className="text-xl font-black text-slate-700">Semua Konfirmasi Beres!</p>
                  <p className="text-sm text-slate-400 mt-2">Tidak ada pesanan yang menunggu konfirmasi dari kurir.</p>
                </div>
              ) : needsKurirConfirm.map((order) => {
                const pickupPhoto = typeof window !== 'undefined' ? localStorage.getItem('smartLaundry_pickupPhoto_' + order.id) : null;
                return (
                  <div key={order.id} className="bg-white rounded-[1.5rem] border border-amber-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">🛵</span>
                        <div>
                          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Menunggu Konfirmasi Pickup</p>
                          <h3 className="text-xl font-black text-slate-900">{order.id}</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { l: 'Customer', v: order.customer },
                          { l: 'Layanan', v: order.service },
                          { l: 'Berat', v: order.weight },
                          { l: 'Kurir', v: order.kurir || '-' },
                        ].map(item => (
                          <div key={item.l} className="p-3 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.l}</p>
                            <p className="text-sm font-bold text-slate-800 mt-0.5">{item.v}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:w-48 shrink-0">
                      <div className="bg-slate-100 rounded-xl overflow-hidden h-32">
                        {pickupPhoto ? (
                          <img src={pickupPhoto} alt="Bukti Pickup" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                            <span className="text-3xl">📷</span>
                            <p className="text-xs font-bold">Kurir belum upload foto</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => updateStatus(order.id, 'dicuci')}
                        disabled={isProcessing}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                      >
                        {isProcessing ? 'Memproses...' : '✅ Terima & Proses Cuci'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* MODAL: DETAIL ORDER */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden anim-modal max-h-[90vh] flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-violet-900 to-slate-900">
              <div>
                <p className="text-xs font-bold text-violet-300 uppercase tracking-wider mb-1">Detail Pesanan</p>
                <h2 className="text-xl font-black text-white">{selectedOrder.id}</h2>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="w-9 h-9 flex items-center justify-center bg-white/10 text-white rounded-full hover:bg-white/20">✕</button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm border ${statusConfig[selectedOrder.status].bg} ${statusConfig[selectedOrder.status].color} ${statusConfig[selectedOrder.status].border}`}>
                {statusConfig[selectedOrder.status].icon} {statusConfig[selectedOrder.status].label}
              </div>
              <div className="space-y-3">
                {[
                  { l: 'Customer', v: selectedOrder.customer },
                  { l: 'No. HP', v: selectedOrder.phone },
                  { l: 'Alamat', v: selectedOrder.address },
                  { l: 'Layanan', v: selectedOrder.service },
                  { l: 'Berat', v: selectedOrder.weight },
                  { l: 'Total', v: selectedOrder.total },
                  { l: 'Pembayaran', v: selectedOrder.payment },
                  { l: 'Kurir', v: selectedOrder.kurir || 'Belum ditugaskan' },
                  { l: 'Tanggal', v: selectedOrder.date },
                ].map(item => (
                  <div key={item.l} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-500">{item.l}</span>
                    <span className="text-sm font-bold text-slate-800 text-right max-w-[60%]">{item.v}</span>
                  </div>
                ))}
              </div>
              {getNextStatus(selectedOrder.status) && (
                <button
                  onClick={() => { setIsDetailOpen(false); setIsStatusModalOpen(true); }}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Update Status Pesanan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE STATUS */}
      {isStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => !isProcessing && setIsStatusModalOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 anim-modal">
            <h3 className="text-xl font-black text-slate-900 mb-2">Update Status</h3>
            <p className="text-sm text-slate-500 mb-6">Pesanan <span className="font-black text-slate-800">{selectedOrder.id}</span></p>
            <div className="space-y-2 mb-6">
              {STATUS_FLOW.map((s, idx) => {
                const currentIdx = STATUS_FLOW.indexOf(selectedOrder.status);
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const isNext = idx === currentIdx + 1;
                const cfg = statusConfig[s];
                return (
                  <button
                    key={s}
                    disabled={!isNext || isProcessing}
                    onClick={() => updateStatus(selectedOrder.id, s)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      isNext ? `${cfg.bg} ${cfg.border} ${cfg.color} hover:shadow-md cursor-pointer` :
                      isCurrent ? 'bg-slate-800 border-slate-700 text-white' :
                      isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                      'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-xl">{isCompleted ? '✅' : cfg.icon}</span>
                    <span className="font-bold text-sm">{cfg.label}</span>
                    {isCurrent && <span className="ml-auto text-[10px] font-black text-white bg-white/20 px-2 py-0.5 rounded">Sekarang</span>}
                    {isNext && <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded bg-white/50">Pilih →</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setIsStatusModalOpen(false)} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Tutup</button>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN KURIR */}
      {isAssignOpen && selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => !isProcessing && setIsAssignOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 anim-modal">
            <h3 className="text-xl font-black text-slate-900 mb-2">Assign Kurir</h3>
            <p className="text-sm text-slate-500 mb-6">Pilih kurir untuk pesanan <span className="font-black text-slate-800">{selectedOrder.id}</span></p>
            <div className="space-y-3">
              {KURIR_LIST.map((k) => (
                <button
                  key={k}
                  onClick={() => assignKurir(selectedOrder.id, k)}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-violet-400 hover:bg-violet-50 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-bold">{k.charAt(0)}</div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800">{k}</p>
                    <p className="text-xs text-slate-400">Kurir SmartLaundry</p>
                  </div>
                  <span className="ml-auto text-violet-500">→</span>
                </button>
              ))}
            </div>
            <button onClick={() => setIsAssignOpen(false)} className="w-full py-3 mt-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
          </div>
        </div>
      )}

      {/* MODAL: PROFIL ADMIN */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 anim-modal">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">Profil Admin</h2>
              <button onClick={() => setIsProfileOpen(false)} className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200">✕</button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">S</div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-900">Sari Indah</p>
                <p className="text-sm font-bold text-violet-600">Administrator</p>
              </div>
              <div className="w-full space-y-3">
                {[
                  { l: 'Email', v: 'admin@smartlaundry.id' },
                  { l: 'No. HP', v: '087654321098' },
                  { l: 'Level', v: 'Admin Penuh' },
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
