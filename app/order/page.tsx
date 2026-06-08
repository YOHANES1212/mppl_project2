'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function CustomerDashboard() {
  // State Management Pesanan
  const [layanan, setLayanan] = useState('reguler');
  const [berat, setBerat] = useState(2);
  const [alamat, setAlamat] = useState('');
  
  // State Management Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false); 
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // State Alur Pembayaran
  const [paymentStep, setPaymentStep] = useState(1); 
  const [paymentCategory, setPaymentCategory] = useState('bank'); 
  const [selectedProvider, setSelectedProvider] = useState('bca'); 
  
  // State Loading & Status
  const [isSaving, setIsSaving] = useState(false); 
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // State Timer & Copy
  const [timeLeft, setTimeLeft] = useState(600); 
  const [copiedId, setCopiedId] = useState(''); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userProfile, setUserProfile] = useState({
    name: 'arya fadhiil ramadhan',
    email: 'arya@example.com',
    phone: '081234567890',
    avatarUrl: '' 
  });

  const [tempProfile, setTempProfile] = useState({ ...userProfile });

  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    if (!isPaymentModalOpen || paymentStep !== 2 || paymentSuccess) return;
    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [isPaymentModalOpen, paymentStep, paymentSuccess]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOpenModal = () => {
    setTempProfile({ ...userProfile });
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setUserProfile({ ...tempProfile }); 
      setIsSaving(false); 
      setIsProfileModalOpen(false); 
    }, 1000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setTempProfile({ ...tempProfile, avatarUrl: imageUrl });
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  // 1. Tambahkan state ini untuk menyimpan ID resinya
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  const handleProceedToPayment = () => {
    setTimeLeft(600); 
    setPaymentStep(2); 
  };

  const handleProcessPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      
      // A. Bikin ID Unik (Misal: SL-83921)
      const newId = `SL-${Math.floor(Math.random() * 90000) + 10000}`;
      setGeneratedOrderId(newId);

      // B. Simpan data transaksinya ke Local Storage Browser
      const orderToSave = {
        id: newId,
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
        service: layanan === 'reguler' ? 'Reguler (3-4 Hari)' : layanan === 'kilat' ? 'Kilat (1 Hari)' : 'Express (6 Jam)',
        weight: `${berat} Kg`,
        total: `Rp${total.toLocaleString('id-ID')}`,
        payment: paymentCategory === 'bank' ? 'Transfer VA' : paymentCategory === 'ewallet' ? 'E-Wallet' : 'QRIS GPN',
        status: 'Lunas'
      };
      localStorage.setItem('smartLaundry_activeOrder', JSON.stringify(orderToSave));

      // C. Munculkan halaman sukses (tanpa auto-close)
      setPaymentSuccess(true);
    }, 1500);
  };

  // LOGIKA RADIUS DAN PERHITUNGAN HARGA
  const alamatLower = alamat.toLowerCase();
  const isLuarRadius = alamatLower.includes('joglo') || alamatLower.includes('kembangan') || alamatLower.includes('ciledug') || alamatLower.includes('meruya');

  const hargaPerKg = layanan === 'reguler' ? 7000 : layanan === 'kilat' ? 12000 : 15000;
  const subtotal = berat * hargaPerKg;
  
  let ongkir = 10000;
  
  if (subtotal >= 30000 && !isLuarRadius) {
    ongkir = 0; 
  } else if (isLuarRadius) {
    ongkir = 10000 + 15000;
  }

  const total = subtotal + ongkir;
  const progressOngkir = Math.min((subtotal / 30000) * 100, 100);

  // DATA PROVIDER PEMBAYARAN
  const bankProviders = [
    { id: 'bca', name: 'BCA Virtual Account', logo: '/bca.jpg', va: '3901 0812 3456 7890' },
    { id: 'bni', name: 'BNI Virtual Account', logo: '/bni.jpg', va: '8291 0812 3456 7890' },
    { id: 'mandiri', name: 'Mandiri Virtual Account', logo: '/mandiri.jpg', va: '89508 0812 3456 7890' }
  ];

  const ewalletProviders = [
    { id: 'dana', name: 'DANA', logo: '/dana.jpg', phone: '0812-3456-7890' },
    { id: 'gopay', name: 'GoPay', logo: '/gopay.jpg', phone: '0812-3456-7890' },
    { id: 'ovo', name: 'OVO', logo: '/ovo.jpg', phone: '0812-3456-7890' }
  ];

  const banners = [
    {
      id: 1, badge: 'Promo Spesial', badgeColor: 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300', dotColor: 'bg-emerald-400',
      title: 'Gratis Antar Jemput', highlight: 'Tanpa Syarat Ribet!',
      desc: 'Gratis biaya penjemputan dan pengantaran dengan minimum transaksi Rp30.000 (Maksimal radius 3 KM).',
      bgImage: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=1200&auto=format&fit=crop'
    },
    {
      id: 2, badge: 'Keunggulan Kami', badgeColor: 'bg-amber-500/20 border-amber-400/30 text-amber-300', dotColor: 'bg-amber-400',
      title: 'Kenapa Memilih', highlight: 'SmartLaundry?',
      desc: 'Proses pencucian menggunakan teknologi modern, wangi higienis tahan lama, dan anti-kusut.',
      bgImage: 'https://images.unsplash.com/photo-1545060894-3d44bcab3ea3?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  return (
    <main className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalPop { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes checkmark { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slideInRight { 0% { opacity: 0; transform: translateX(20px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes scan { 0% { transform: translateY(-100%); } 50% { transform: translateY(240px); } 100% { transform: translateY(-100%); } }
        .animate-modal { animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-check { animation: checkmark 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slideRight { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
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
          <Link href="/order" className="flex items-center gap-3 px-4 py-3.5 bg-blue-50 text-blue-700 rounded-xl font-bold transition-all">
            <span className="text-xl">🧺</span> Buat Pesanan
          </Link>
          <Link href="/track" className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-semibold transition-all">
            <span className="text-xl">📍</span> Lacak Cucian
          </Link>
          <Link href="/history" className="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl font-semibold transition-all">
            <span className="text-xl">📄</span> Riwayat Transaksi
          </Link>
        </nav>

        {/* PROFILE CARD */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleOpenModal} className="w-full group flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-all duration-300 text-left focus:outline-none">
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <header className="flex justify-between items-center px-8 py-6 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 border-b border-slate-200/50">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Buat Pesanan Baru</h1>
            <p className="text-sm text-slate-500 font-medium">Isi detail cucian Anda di bawah ini.</p>
          </div>
        </header>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            
            {/* Banner Promo Slider */}
            <div className="relative w-full h-56 sm:h-64 rounded-[2rem] overflow-hidden shadow-sm mb-8 group cursor-pointer bg-slate-900">
              <div className="flex h-full w-[200%] transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 50}%)` }}>
                {banners.map((banner) => (
                  <div key={banner.id} className="w-1/2 h-full relative">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] group-hover:scale-110" style={{ backgroundImage: `url('${banner.bgImage}')` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-transparent"></div>
                    <div className="relative h-full flex flex-col justify-center p-8 sm:p-10 z-10">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 border backdrop-blur-md rounded-full mb-4 w-max ${banner.badgeColor}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${banner.dotColor}`}></span>
                        <span className="text-xs font-bold tracking-wide uppercase">{banner.badge}</span>
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 max-w-md leading-[1.1] tracking-tight">
                        {banner.title} <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">{banner.highlight}</span>
                      </h2>
                      <p className="text-slate-300 text-sm font-medium max-w-md leading-relaxed mb-5">{banner.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20">
                {banners.map((_, idx) => (
                  <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
                ))}
              </div>
            </div>

            {/* Pilihan Layanan */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Pilih Jenis Layanan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'reguler', name: 'Reguler', desc: '3-4 Hari', price: 'Rp7.000/kg', icon: '👕' },
                  { id: 'kilat', name: 'Kilat', desc: '1 Hari', price: 'Rp12.000/kg', icon: '⚡' },
                  { id: 'express', name: 'Express', desc: '6 Jam', price: 'Rp15.000/kg', icon: '🚀' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLayanan(item.id)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${layanan === item.id ? 'border-blue-500 bg-blue-50 shadow-[0_4px_12px_rgba(59,130,246,0.15)] scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'}`}
                  >
                    {layanan === item.id && (
                      <div className="absolute top-3 right-3 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>
                    )}
                    <span className="text-3xl mb-3 block">{item.icon}</span>
                    <h3 className={`font-bold ${layanan === item.id ? 'text-blue-700' : 'text-slate-700'}`}>{item.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-1">{item.desc}</p>
                    <p className={`text-sm font-bold ${layanan === item.id ? 'text-blue-600' : 'text-slate-800'}`}>{item.price}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Estimasi Berat */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Estimasi Berat (Kg)</h2>
                <p className="text-sm text-slate-500">Berat pasti akan ditimbang kembali oleh kurir.</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <button onClick={() => setBerat(Math.max(1, berat - 1))} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-600 font-bold text-xl hover:bg-slate-100 hover:text-blue-600 transition-colors">-</button>
                <span className="w-10 text-center font-black text-2xl text-slate-800">{berat}</span>
                <button onClick={() => setBerat(berat + 1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-600 font-bold text-xl hover:bg-slate-100 hover:text-blue-600 transition-colors">+</button>
              </div>
            </div>

            {/* Detail Alamat */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 relative">
              <div className="flex-1 space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Detail Alamat Anda</h2>
                <textarea
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Jl. Arjuna Utara No. 12, Grogol Petamburan, Jakarta Barat, 11470"
                  className="w-full p-5 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none"
                  rows={4}
                />
                
                <button 
                  onClick={() => setIsMapModalOpen(true)}
                  className="group flex items-center justify-center gap-2 p-3 bg-white border-2 border-slate-100 rounded-xl hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all active:scale-95"
                >
                  <img src="/mesincuci.png" alt="Laundry Icon" className="w-6 h-6 object-contain" />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Lihat Lokasi Pusat Kami</span>
                </button>
              </div>

              <div className="sm:w-64 flex flex-col items-start gap-4 shrink-0">
                <div className="bg-slate-100/60 p-4 rounded-xl border border-slate-100 text-left w-full shadow-inner">
                  <span className="text-sm font-bold text-slate-700">📍 Radius Operasional:</span>
                  <p className="text-sm text-slate-500 leading-relaxed">Maks. 3 KM dari Kampus Esa Unggul</p>
                </div>
                
                {isLuarRadius && (
                  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-left animate-slideRight">
                    <span className="text-red-500 text-xl">⚠️</span>
                    <div>
                      <p className="text-sm font-bold text-red-700">Lokasi Di Luar Radius</p>
                      <p className="text-[10px] text-red-600 leading-tight">Alamat Anda di luar zona antar-jemput gratis. Biaya ekstra Rp15.000 diterapkan.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sticky top-28">
              <h2 className="text-xl font-black text-slate-900 mb-6">Ringkasan Pesanan</h2>

              <div className={`mb-6 p-4 rounded-2xl border relative overflow-hidden transition-all duration-500 ${isLuarRadius ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                {!isLuarRadius && progressOngkir >= 100 && (
                  <div className="absolute inset-0 bg-emerald-400/20 animate-pulse"></div>
                )}
                
                <div className="flex justify-between items-end mb-2 relative z-10">
                  <span className={`text-sm font-bold ${isLuarRadius ? 'text-red-700' : 'text-slate-700'}`}>Promo Gratis Ongkir</span>
                  
                  {isLuarRadius ? (
                    <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-1 rounded-md">Tidak Berlaku ❌</span>
                  ) : progressOngkir >= 100 ? (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md animate-bounce">Tercapai! 🎉</span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500">Min. Rp30.000</span>
                  )}
                </div>
                
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative z-10">
                  <div 
                    className={`h-full transition-all duration-700 ease-out rounded-full ${isLuarRadius ? 'bg-red-500 w-full' : progressOngkir >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: isLuarRadius ? '100%' : `${progressOngkir}%` }}
                  ></div>
                </div>
                
                {isLuarRadius ? (
                  <p className="text-[10px] font-medium text-red-600 mt-2 relative z-10 leading-tight">
                    Promo otomatis hangus karena alamat pengantaran Anda berada di luar radius pelayanan.
                  </p>
                ) : progressOngkir < 100 && (
                  <p className="text-[10px] font-medium text-slate-500 mt-2 relative z-10">
                    Tambah <span className="font-bold text-blue-600">Rp{(30000 - subtotal).toLocaleString('id-ID')}</span> lagi untuk gratis ongkir.
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-slate-600 font-medium text-sm">
                  <span>Subtotal Laundry</span>
                  <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-start font-medium text-sm">
                  <div>
                    <span className="text-slate-600">Biaya Ongkir</span>
                    {isLuarRadius && <span className="text-[10px] text-red-500 block leading-none mt-1 font-bold">+ Ekstra Jarak Jauh</span>}
                  </div>
                  {ongkir === 0 ? (
                    <span className="text-emerald-500 font-bold">Gratis</span>
                  ) : (
                    <span className={`font-bold ${isLuarRadius ? 'text-red-600' : 'text-slate-600'}`}>Rp{ongkir.toLocaleString('id-ID')}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200/60 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Total Pembayaran</span>
                  <span className="text-2xl font-black text-blue-600">Rp{total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button 
                onClick={() => { setPaymentStep(1); setIsPaymentModalOpen(true); }}
                className="w-full py-4 text-base font-bold text-white bg-blue-600 rounded-xl shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
              >
                Lanjut Pembayaran
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MODAL MAPS INFO */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMapModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal flex flex-col">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Pusat SmartLaundry</h2>
                <p className="text-sm text-slate-500 font-medium">Universitas Esa Unggul, Kebon Jeruk.</p>
              </div>
              <button onClick={() => setIsMapModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">✕</button>
            </div>
            <div className="relative w-full h-[400px] bg-slate-200">
              <iframe src="https://maps.google.com/maps?q=Universitas%20Esa%20Unggul%20Kampus%20Jakarta&t=&z=16&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0"></iframe>
            </div>
            <div className="p-6 bg-white z-10 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 text-center sm:text-left">
                <a href="https://maps.app.goo.gl/nivJsQWR6WHkUTP18" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">Lihat Rute di Google Maps ↗</a>
              </div>
              <button onClick={() => setIsMapModalOpen(false)} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl active:scale-95 transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL PEMBAYARAN (STEP 1 & STEP 2) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => !isProcessingPayment && !paymentSuccess && setIsPaymentModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-modal flex flex-col max-h-[90vh]">
            
            {/* TAMPILAN SUKSES TRANSAKSI */}
            {paymentSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center h-full">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-check">
                  <svg className="w-12 h-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Pembayaran Berhasil!</h2>
                <p className="text-slate-500 font-medium mb-8">Pesanan Anda segera diproses oleh tim kami.</p>
                
                {/* Menampilkan ID yang sama persis dengan yang disimpan di Local Storage */}
                <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-700 mb-6">
                  No. Pesanan: <span className="text-blue-600">{generatedOrderId}</span>
                </div>

                {/* Tombol Ajaib menuju Halaman Track */}
                <Link href="/track" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex justify-center">
                  Lacak Pesanan Sekarang
                </Link>
              </div>
            ) : paymentStep === 1 ? (
              <div className="flex flex-col h-full animate-slideRight">
                <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Metode Pembayaran</h2>
                  </div>
                  <button onClick={() => setIsPaymentModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full">✕</button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                    {/* ========== PERUBAHAN LABEL TAB 'VA' MENJADI 'Bank' ========== */}
                    {['bank', 'ewallet', 'qris'].map((cat) => (
                      <button key={cat} onClick={() => { setPaymentCategory(cat); setSelectedProvider(cat === 'bank' ? 'bca' : cat === 'ewallet' ? 'dana' : 'qris'); }} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${paymentCategory === cat ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                        {cat === 'bank' ? 'Bank' : cat === 'ewallet' ? 'Wallet' : 'QRIS'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {paymentCategory === 'bank' && bankProviders.map((bank) => (
                      <div key={bank.id} onClick={() => setSelectedProvider(bank.id)} className={`p-4 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${selectedProvider === bank.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-white'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-white rounded border border-slate-100 flex items-center justify-center p-1"><img src={bank.logo} alt={bank.name} className="w-full h-full object-contain" /></div>
                          <h3 className="font-bold text-slate-800 text-sm">{bank.name}</h3>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center bg-white shrink-0">{selectedProvider === bank.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}</div>
                      </div>
                    ))}
                    {paymentCategory === 'ewallet' && ewalletProviders.map((ewallet) => (
                      <div key={ewallet.id} onClick={() => setSelectedProvider(ewallet.id)} className={`p-4 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${selectedProvider === ewallet.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 bg-white'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-white rounded border border-slate-100 flex items-center justify-center p-1"><img src={ewallet.logo} alt={ewallet.name} className="w-full h-full object-contain" /></div>
                          <h3 className="font-bold text-slate-800 text-sm">{ewallet.name}</h3>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center bg-white shrink-0">{selectedProvider === ewallet.id && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}</div>
                      </div>
                    ))}
                    {paymentCategory === 'qris' && (
                      <div className="p-6 border-2 border-blue-500 bg-blue-50/50 rounded-2xl text-center"><span className="font-bold text-slate-800">Scan QRIS Instan</span></div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4 bg-slate-50 p-3 rounded-xl"><span className="text-sm font-bold text-slate-500">Total</span><span className="text-xl font-black text-blue-600">Rp{total.toLocaleString('id-ID')}</span></div>
                  <button onClick={handleProceedToPayment} className="w-full py-4 text-white font-bold rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all">Konfirmasi Pesanan</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-slideRight">
                <div className="px-6 pt-6 pb-2 bg-white sticky top-0 z-20 border-b border-slate-100 text-center">
                  <h2 className="text-xl font-black text-slate-900 mb-4">Selesaikan Pembayaran</h2>
                  <div className={`w-full flex items-center justify-between p-3 rounded-2xl border mb-4 ${timeLeft > 60 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-red-50 border-red-200 text-red-700 animate-pulse'}`}><span className="text-xs font-bold">Waktu Tersisa:</span><span className="text-lg font-black font-mono">{formatTime(timeLeft)}</span></div>
                </div>

                <div className="p-6 overflow-y-auto">
                   {paymentCategory === 'bank' && bankProviders.filter(b => b.id === selectedProvider).map((bank) => (
                    <div key={bank.id} className="text-center">
                      <div className="w-20 h-10 mx-auto bg-white rounded border border-slate-100 flex items-center justify-center p-2 mb-4"><img src={bank.logo} alt={bank.name} className="w-full h-full object-contain" /></div>
                      <p className="text-xs text-slate-500 font-medium mb-4">Gunakan Nomor VA di bawah untuk membayar.</p>
                      <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Nomor Virtual Account</p>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100">
                          <span className="font-mono font-black text-slate-800 text-xl tracking-tight">{bank.va}</span>
                          <button onClick={() => handleCopy(bank.va, bank.id)} className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${copiedId === bank.id ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>{copiedId === bank.id ? 'Salin ✓' : 'Salin'}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {paymentCategory === 'ewallet' && ewalletProviders.filter(e => e.id === selectedProvider).map((ewallet) => (
                    <div key={ewallet.id} className="text-center">
                      <div className="w-20 h-10 mx-auto bg-white rounded border border-slate-100 flex items-center justify-center p-2 mb-4"><img src={ewallet.logo} alt={ewallet.name} className="w-full h-full object-contain" /></div>
                      <p className="text-xs text-slate-500 font-medium mb-4">Transfer saldo ke nomor tujuan berikut.</p>
                      <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Nomor Tujuan</p>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100">
                          <span className="font-mono font-black text-slate-800 text-xl tracking-tight">{ewallet.phone}</span>
                          <button onClick={() => handleCopy(ewallet.phone, ewallet.id)} className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${copiedId === ewallet.id ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>{copiedId === ewallet.id ? 'Salin ✓' : 'Salin'}</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {paymentCategory === 'qris' && (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-56 h-56 bg-white p-3 rounded-2xl shadow-xl border border-slate-200 mb-4 relative overflow-hidden group"><img src="/qris.jpg" alt="QRIS" className="w-full h-full object-contain" /><div className="absolute top-0 left-0 w-full h-1 bg-blue-500/60 -translate-y-full group-hover:animate-[scan_2s_ease-in-out_infinite]"></div></div>
                      <p className="text-xs font-medium text-slate-500">Scan melalui aplikasi m-banking atau dompet digital Anda.</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                  <button onClick={handleProcessPayment} disabled={isProcessingPayment || timeLeft === 0} className={`w-full py-4 text-white font-bold rounded-xl active:scale-95 transition-all ${timeLeft === 0 ? 'bg-slate-400' : 'bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700'}`}>{isProcessingPayment ? 'Mengecek Pembayaran...' : timeLeft === 0 ? 'Waktu Habis' : 'Konfirmasi Sudah Bayar'}</button>
                  <button onClick={() => setPaymentStep(1)} className="w-full py-3 text-slate-500 font-bold text-xs mt-2">Ganti Metode Pembayaran</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL FORM PROFIL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !isSaving && setIsProfileModalOpen(false)}></div>
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