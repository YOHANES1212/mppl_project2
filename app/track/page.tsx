'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function TrackLaundry() {
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

  // State Manajemen Pelacakan
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0); 
  const [pickupPhoto, setPickupPhoto] = useState<string | null>(null);

  const steps = [
    { title: 'Menunggu Kurir', desc: 'Kurir sedang bersiap menuju lokasi Anda.', icon: '🛵', kurirStatus: 'pending' },
    { title: 'Menuju Lokasi', desc: 'Kurir sedang dalam perjalanan ke alamat Anda.', icon: '📍', kurirStatus: 'menuju' },
    { title: 'Laundry Dijemput', desc: 'Cucian Anda telah dijemput oleh kurir.', icon: '📦', kurirStatus: 'dijemput' },
    { title: 'Sedang Dicuci', desc: 'Proses pencucian dengan teknologi anti-bakteri.', icon: '🫧', kurirStatus: 'dicuci' },
    { title: 'Setrika & Packing', desc: 'Pakaian disetrika rapi dan dikemas wangi.', icon: '✨', kurirStatus: 'disetrika' },
    { title: 'Sedang Diantar', desc: 'Kurir dalam perjalanan mengantar cucian Anda.', icon: '🏠', kurirStatus: 'diantar' },
    { title: 'Selesai', desc: 'Cucian sudah diterima dengan baik. Terima kasih!', icon: '🎉', kurirStatus: 'selesai' },
  ];

  // Auto-Load data dari Order Page & sync status kurir
  useEffect(() => {
    const savedOrder = localStorage.getItem('smartLaundry_activeOrder');
    if (savedOrder) {
      const parsedData = JSON.parse(savedOrder);
      setOrderData(parsedData);
      setSearchId(parsedData.id);
      setHasSearched(true);

      // Sync step dengan status kurir jika ada
      const kurirStatus = parsedData.kurirStatus;
      if (kurirStatus) {
        const stepIdx = steps.findIndex(s => s.kurirStatus === kurirStatus);
        if (stepIdx !== -1) setCurrentStep(stepIdx);
      }

      // Load foto bukti pickup jika ada
      const photo = localStorage.getItem('smartLaundry_pickupPhoto_' + parsedData.id);
      if (photo) setPickupPhoto(photo);
    }
  }, []);

  // Polling localStorage untuk update status dari kurir (setiap 3 detik)
  useEffect(() => {
    if (!orderData) return;
    const interval = setInterval(() => {
      const savedOrder = localStorage.getItem('smartLaundry_activeOrder');
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        if (parsed.kurirStatus) {
          const stepIdx = steps.findIndex(s => s.kurirStatus === parsed.kurirStatus);
          if (stepIdx !== -1) setCurrentStep(stepIdx);
        }
        const photo = localStorage.getItem('smartLaundry_pickupPhoto_' + parsed.id);
        if (photo) setPickupPhoto(photo);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [orderData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
      const savedOrder = localStorage.getItem('smartLaundry_activeOrder');
      if (savedOrder) {
        const parsedData = JSON.parse(savedOrder);
        if (parsedData.id === searchId.toUpperCase().trim()) {
          setOrderData(parsedData);
          const kurirStatus = parsedData.kurirStatus;
          if (kurirStatus) {
            const stepIdx = steps.findIndex(s => s.kurirStatus === kurirStatus);
            if (stepIdx !== -1) setCurrentStep(stepIdx);
          }
          const photo = localStorage.getItem('smartLaundry_pickupPhoto_' + parsedData.id);
          if (photo) setPickupPhoto(photo);
          return;
        }
      }
      setOrderData(null);
    }, 1200);
  };

  const simulateProgress = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(0);
    }
  };

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

  const isPickupDone = currentStep >= 2; // step 2 = "Laundry Dijemput"

  return (
    <main className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); } 70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
        @keyframes photoReveal { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .animate-slideUp { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-pulseGlow { animation: pulseGlow 2s infinite; }
        .animate-photoReveal { animation: photoReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />

      {/* 1. SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 shrink-0">
        <div className="p-8 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight hover:scale-105 transition-transform duration-300">
            <img src="/mesincuci.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <div>Smart<span className="text-blue-600">Laundry</span></div>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <Link href="/order" className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-semibold transition-all">
            <span className="text-xl">🧺</span> Buat Pesanan
          </Link>
          <Link href="/track" className="flex items-center gap-3 px-4 py-3.5 bg-blue-50 text-blue-700 rounded-xl font-bold transition-all shadow-sm">
            <span className="text-xl">📍</span> Lacak Cucian
          </Link>
          <Link href="/history" className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-semibold transition-all">
            <span className="text-xl">📄</span> Riwayat Transaksi
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => { setTempProfile({...userProfile}); setIsProfileModalOpen(true); }} className="w-full group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all duration-300 text-left">
            <div className="relative flex-shrink-0">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Profile" className="relative w-10 h-10 rounded-full object-cover shadow-md transition-all duration-500 group-hover:scale-110" />
              ) : (
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md transition-all duration-500 group-hover:scale-110">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600">{userProfile.name}</p>
              <p className="text-xs font-medium text-slate-500">Lihat Profil</p>
            </div>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <section className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-slate-50/50">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <header className="px-8 py-8 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 border-b border-slate-200/50 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pelacakan Pesanan</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Pantau proses cucian Anda secara real-time.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-72">
            <input 
              type="text" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              placeholder="Masukkan ID Pesanan..." 
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm uppercase"
            />
            <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {isSearching && <div className="absolute right-3 top-3.5"><svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg></div>}
          </form>
        </header>

        <div className="p-8 max-w-6xl mx-auto w-full">
          
          {/* TAMPILAN KOSONG */}
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-slideUp">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-5xl">📦</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Belum Ada Pesanan yang Dilacak</h3>
              <p className="text-slate-500 max-w-sm">Buat pesanan baru di menu "Buat Pesanan" atau masukkan ID Pesanan (SL-XXXXX) pada kolom pencarian di atas.</p>
            </div>
          ) : !orderData ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-slideUp">
               <div className="text-6xl mb-4">🔍</div>
               <h3 className="text-2xl font-black text-slate-800 mb-2">Pesanan Tidak Ditemukan</h3>
               <p className="text-slate-500">ID Pesanan <span className="font-bold text-slate-800">{searchId}</span> tidak terdaftar dalam sistem kami.</p>
             </div>
          ) : (
            /* DASHBOARD TRACKING AKTIF */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              <div className="lg:col-span-3 space-y-6 animate-slideUp">
                
                {/* Status Card Utama */}
                <div className="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-600/20">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-blue-200 font-bold text-sm uppercase tracking-wider mb-1">Status Saat Ini</p>
                      <h2 className="text-3xl font-black mb-2">{steps[currentStep].title}</h2>
                      <p className="text-blue-100 text-sm max-w-sm">{steps[currentStep].desc}</p>
                    </div>
                    <div className="text-5xl drop-shadow-lg animate-bounce">{steps[currentStep].icon}</div>
                  </div>

                  <button onClick={simulateProgress} className="absolute bottom-4 right-4 opacity-0 hover:opacity-100 bg-white/20 px-3 py-1 rounded-lg text-xs font-bold backdrop-blur-sm transition-opacity">
                    Simulasi Waktu ➡️
                  </button>
                </div>

                {/* FOTO BUKTI PICKUP — tampil saat step >= 2 */}
                {isPickupDone && (
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-photoReveal">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <span className="text-lg">📸</span>
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800">Foto Bukti Pickup</h3>
                        <p className="text-xs text-slate-400">Dokumentasi dari kurir saat menjemput cucian</p>
                      </div>
                      <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Terverifikasi
                      </span>
                    </div>
                    {pickupPhoto ? (
                      <div className="relative">
                        <img src={pickupPhoto} alt="Bukti Pickup" className="w-full h-56 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center font-bold text-sm text-white">B</div>
                            <div>
                              <p className="text-white font-bold text-sm">Budi Santoso — Kurir SmartLaundry</p>
                              <p className="text-white/70 text-xs">Foto diambil saat penjemputan</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-10 text-center bg-slate-50">
                        <span className="text-5xl mb-3">📷</span>
                        <p className="font-bold text-slate-600">Foto belum tersedia</p>
                        <p className="text-xs text-slate-400 mt-1">Kurir belum mengunggah foto bukti pickup</p>
                      </div>
                    )}
                    <div className="p-4 bg-emerald-50 border-t border-emerald-100">
                      <p className="text-xs font-bold text-emerald-700">
                        ✅ Cucian Anda sudah berhasil dijemput pada {steps[currentStep >= 2 ? 2 : currentStep].title.toLowerCase()} oleh kurir kami.
                      </p>
                    </div>
                  </div>
                )}

                {/* Riwayat Perjalanan */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative">
                  <h3 className="text-lg font-black text-slate-800 mb-8">Riwayat Perjalanan</h3>
                  
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.45rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                    {steps.map((step, idx) => {
                      const isActive = idx === currentStep;
                      const isCompleted = idx < currentStep;
                      const isPending = idx > currentStep;

                      return (
                        <div key={idx} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active transition-all duration-500 ${isPending ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                          
                          {idx !== steps.length - 1 && (
                            <div className={`absolute top-10 left-[1.4rem] w-0.5 h-14 -ml-px ${isCompleted ? 'bg-blue-500' : 'bg-slate-200 border-l-2 border-dashed border-slate-300'}`}></div>
                          )}

                          <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-sm transition-all duration-500 border-4 
                            ${isCompleted ? 'bg-blue-500 border-blue-100' : isActive ? 'bg-white border-blue-500 animate-pulseGlow' : 'bg-slate-100 border-white'}
                          `}>
                            {isCompleted ? (
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <span className="text-lg">{step.icon}</span>
                            )}
                          </div>
                          
                          <div className={`w-[calc(100%-4rem)] pl-6 transition-all duration-300 ${isActive ? 'scale-105 origin-left' : ''}`}>
                            <h4 className={`text-base font-black ${isActive ? 'text-blue-600' : 'text-slate-800'}`}>{step.title}</h4>
                            <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
                            {/* Tampilkan thumbnail foto di step "Laundry Dijemput" */}
                            {idx === 2 && pickupPhoto && (isActive || isCompleted) && (
                              <div className="mt-2 flex items-center gap-2">
                                <img src={pickupPhoto} alt="thumb" className="w-10 h-10 rounded-lg object-cover border-2 border-emerald-200" />
                                <span className="text-xs font-bold text-emerald-600">📸 Foto bukti tersedia</span>
                              </div>
                            )}
                            {!isPending && <p className="text-xs font-bold text-slate-400 mt-2">Update Sistem Terkini</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              <div className="lg:col-span-2 space-y-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                
                {/* Kurir Card */}
                {(currentStep === 0 || currentStep === 1 || currentStep === 5) && (
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" alt="Kurir" className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kurir SmartLaundry</p>
                      <h4 className="text-sm font-black text-slate-800">Budi Santoso</h4>
                      <p className="text-xs font-bold text-blue-600 mt-0.5">B 1234 XYZ • Honda Vario</p>
                    </div>
                    <a href="tel:08123" className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center rounded-full hover:bg-green-100 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                    </a>
                  </div>
                )}

                {/* Map */}
                <div className="bg-slate-200 w-full h-48 rounded-[2rem] overflow-hidden relative shadow-inner">
                   <iframe src="https://maps.google.com/maps?q=Universitas%20Esa%20Unggul%20Kampus%20Jakarta&t=&z=15&ie=UTF8&iwloc=&output=embed" className="absolute inset-0 w-full h-full opacity-60 mix-blend-multiply" style={{ border: 0 }}></iframe>
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60"></div>
                   <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl flex items-center justify-between border border-white/50 shadow-lg">
                      <div className="flex items-center gap-2">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                         </span>
                         <span className="text-xs font-bold text-slate-700">Live Tracking Aktif</span>
                      </div>
                      <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded">EST: 15 MNT</span>
                   </div>
                </div>

                {/* Detail Pesanan */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-slate-50 rounded-full border border-slate-100"></div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-slate-50 rounded-full border border-slate-100"></div>
                  
                  <div className="p-6 border-b-2 border-dashed border-slate-200 bg-slate-50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">ID Pesanan</p>
                    <h3 className="text-2xl font-black text-slate-800 text-center tracking-wider">{orderData.id}</h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Tanggal</span>
                      <span className="text-sm font-bold text-slate-800 text-right w-1/2">{orderData.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Layanan</span>
                      <span className="text-sm font-bold text-blue-600">{orderData.service}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Berat Cucian</span>
                      <span className="text-sm font-bold text-slate-800">{orderData.weight}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500">Metode</span>
                      <span className="text-sm font-bold text-slate-800">{orderData.payment} <span className="text-emerald-500 text-xs ml-1">({orderData.status})</span></span>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-slate-600">Total Akhir</span>
                      <span className="text-xl font-black text-slate-900">{orderData.total}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODAL PROFIL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSaving && setIsProfileModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
             <div className="p-8">
              <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-slate-900">Profil Saya</h2><button onClick={() => !isSaving && setIsProfileModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">✕</button></div>
              <div className="flex justify-center mb-8">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {tempProfile.avatarUrl ? ( <img src={tempProfile.avatarUrl} alt="Preview" className="w-28 h-28 rounded-full object-cover shadow-lg transition-transform duration-300 group-hover:scale-105" /> ) : (
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-105">{tempProfile.name.charAt(0).toUpperCase()}</div>
                  )}
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