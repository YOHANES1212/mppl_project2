'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function TransactionHistory() {
  // State Profile
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userProfile, setUserProfile] = useState({
    name: 'arya fadhiil ramadhan',
    email: 'arya@example.com',
    phone: '081234567890',
    avatarUrl: '' 
  });
  const [tempProfile, setTempProfile] = useState({ ...userProfile });

  // State History & Tab
  const [activeTab, setActiveTab] = useState('Semua'); // Semua, Proses, Selesai, Batal
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Mengambil Pesanan Aktif murni HANYA dari LocalStorage
  useEffect(() => {
    const activeOrderStr = localStorage.getItem('smartLaundry_activeOrder');
    if (activeOrderStr) {
      const activeOrder = JSON.parse(activeOrderStr);
      // Hanya menampilkan order yang dibuat dari frontend, status default 'Proses'
      setHistoryData([{ ...activeOrder, status: 'Proses' }]);
    } else {
      // Jika tidak ada transaksi sama sekali, tampilkan kosong
      setHistoryData([]);
    }
  }, []);

  // Filter Data Berdasarkan Tab
  const filteredHistory = historyData.filter(item => {
    if (activeTab === 'Semua') return true;
    return item.status === activeTab;
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTempProfile({ ...tempProfile, avatarUrl: URL.createObjectURL(file) });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setUserProfile({ ...tempProfile }); 
      setIsSaving(false); setIsProfileModalOpen(false); 
    }, 1000);
  };

  // Fungsi Warna Badge Status
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Selesai': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Proses': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Batal': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <main className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes modalPop { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-slideUp { animation: slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-modal { animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .receipt-zigzag { background-image: radial-gradient(circle at 10px 0, transparent 10px, white 11px); background-size: 20px 20px; background-repeat: repeat-x; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />

      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 shrink-0">
        <div className="p-8 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight hover:scale-105 transition-transform duration-300">
            <img src="/mesincuci.png" alt="Logo SmartLaundry" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div>Smart<span className="text-blue-600">Laundry</span></div>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <Link href="/order" className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-semibold transition-all">
            <span className="text-xl">🧺</span> Buat Pesanan
          </Link>
          <Link href="/track" className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-semibold transition-all">
            <span className="text-xl">📍</span> Lacak Cucian
          </Link>
          {/* TAB RIWAYAT TRANSAKSI AKTIF */}
          <Link href="/history" className="flex items-center gap-3 px-4 py-3.5 bg-blue-50 text-blue-700 rounded-xl font-bold transition-all shadow-sm">
            <span className="text-xl">📄</span> Riwayat Transaksi
          </Link>
        </nav>

        {/* PROFILE CARD */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => { setTempProfile({...userProfile}); setIsProfileModalOpen(true); }} className="w-full group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all duration-300 text-left focus:outline-none">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-300 group-hover:animate-pulse"></div>
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Profile" className="relative w-10 h-10 rounded-full object-cover shadow-md transition-all duration-500 group-hover:rotate-[360deg] group-hover:scale-110" />
              ) : (
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md transition-all duration-500 group-hover:rotate-[360deg] group-hover:scale-110">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors duration-300">{userProfile.name}</p>
              <p className="text-xs font-medium text-slate-500 group-hover:text-blue-400 transition-colors">Lihat Profil</p>
            </div>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <section className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <header className="px-8 py-8 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 border-b border-slate-200/50 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Riwayat Transaksi</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Daftar semua pesanan laundry Anda.</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl w-full md:w-auto">
            {['Semua', 'Proses', 'Selesai', 'Batal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-slideUp">
               <div className="text-6xl mb-4 opacity-50">📂</div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Transaksi</h3>
               <p className="text-sm text-slate-500">Silakan buat pesanan laundry pertama Anda di menu <Link href="/order" className="text-blue-600 font-bold hover:underline">Buat Pesanan</Link>.</p>
             </div>
          ) : (
            <div className="grid gap-6">
              {filteredHistory.map((item, index) => (
                <div 
                  key={item.id} 
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 animate-slideUp group flex flex-col md:flex-row gap-6 items-center"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  
                  {/* Ikon Kiri */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {item.status === 'Selesai' ? '👕' : item.status === 'Batal' ? '❌' : '🧺'}
                  </div>

                  {/* Detail Tengah */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                      <h3 className="text-lg font-black text-slate-800">{item.id}</h3>
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mb-3">{item.date}</p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="font-semibold">{item.service}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                        <span className="font-semibold">{item.weight}</span>
                      </div>
                    </div>
                  </div>

                  {/* Aksi Kanan */}
                  <div className="flex flex-col items-center md:items-end w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total</p>
                    <p className="text-2xl font-black text-blue-600 mb-4">{item.total}</p>
                    
                    <div className="flex gap-2 w-full">
                      {item.status === 'Proses' && (
                        <Link href="/track" className="flex-1 py-2 px-6 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors text-center shadow-sm">
                          Lacak
                        </Link>
                      )}
                      <button 
                        onClick={() => setSelectedReceipt(item)}
                        className={`flex-1 py-2 px-6 text-sm font-bold rounded-xl transition-colors border-2 ${item.status === 'Proses' ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300' : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 shadow-sm'}`}
                      >
                        Lihat Nota
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          MODAL E-RECEIPT (NOTA DIGITAL)
          ========================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedReceipt(null)}></div>
          
          <div className="relative w-full max-w-sm animate-modal drop-shadow-2xl">
            {/* Bagian Atas Nota */}
            <div className="bg-white rounded-t-3xl p-8 pb-4 relative z-10">
              <button onClick={() => setSelectedReceipt(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">✕</button>
              
              <div className="flex justify-center mb-4">
                <img src="/mesincuci.png" alt="Logo" className="w-12 h-12 object-contain grayscale opacity-80" />
              </div>
              <h2 className="text-xl font-black text-slate-800 text-center tracking-tight mb-1">SMARTLAUNDRY</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center mb-6">E-Receipt Resmi</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">ID Pesanan</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Waktu Transaksi</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.date}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Metode Bayar</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.payment}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500">Status</span>
                  <span className={`font-black uppercase text-[10px] px-2 py-1 rounded ${getStatusStyle(selectedReceipt.status)}`}>{selectedReceipt.status}</span>
                </div>
              </div>
            </div>

            {/* Bagian Bawah Nota (Garis Putus-putus) */}
            <div className="bg-white px-8 py-6 relative z-10 border-t-2 border-dashed border-slate-200">
               <div className="space-y-2 mb-6">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-800 font-semibold">{selectedReceipt.service}</span>
                 </div>
                 <div className="flex justify-between text-xs text-slate-500">
                   <span>Berat: {selectedReceipt.weight}</span>
                 </div>
               </div>
               
               <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
                 <span className="text-slate-500 font-bold text-sm">Total Tagihan</span>
                 <span className="text-xl font-black text-slate-900">{selectedReceipt.total}</span>
               </div>
            </div>

            {/* Efek Potongan Kertas Struk di Bawah */}
            <div className="h-4 w-full bg-white relative -mt-1 rounded-b-xl receipt-zigzag"></div>
            
            {/* Tombol Aksi Bawah */}
            <div className="mt-4 flex justify-center">
              <button onClick={() => window.print()} className="px-6 py-2.5 bg-white/20 backdrop-blur text-white text-sm font-bold rounded-full hover:bg-white/30 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Unduh Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL FORM PROFIL INTERAKTIF 
          ========================================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => !isSaving && setIsProfileModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal">
             <div className="p-8">
              <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-slate-900">Profil Saya</h2><button onClick={() => !isSaving && setIsProfileModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">✕</button></div>
              <div className="flex justify-center mb-8">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {tempProfile.avatarUrl ? ( <img src={tempProfile.avatarUrl} alt="Preview" className="w-28 h-28 rounded-full object-cover shadow-lg transition-transform duration-300 group-hover:scale-105" /> ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-105">{tempProfile.name.charAt(0).toUpperCase()}</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><svg className="w-8 h-8 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span className="text-white text-[10px] font-bold">Ubah</span></div>
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nama Lengkap</label><input type="text" value={tempProfile.name} onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-none transition-all" required /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Email</label><input type="email" value={tempProfile.email} onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-none transition-all" required /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase ml-1">WhatsApp</label><input type="tel" value={tempProfile.phone} onChange={(e) => setTempProfile({...tempProfile, phone: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-none transition-all" required /></div>
                <div className="pt-6 flex gap-3"><button type="button" onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button><button type="submit" disabled={isSaving} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">{isSaving ? 'Menyimpan...' : 'Simpan'}</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}