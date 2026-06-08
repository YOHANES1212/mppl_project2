import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SmartLaundry",
  description: "Layanan laundry modern",
};

export default function Home() {
  return (
    <main className="h-screen w-full bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden">
      
      {/* 1. Navigasi Bar */}
      <nav className="shrink-0 w-full h-[10vh] min-h-[70px] flex items-center justify-between px-6 lg:px-12 border-b border-white/50 bg-white/60 backdrop-blur-md z-50 shadow-sm">
        <Link href="/" className="text-2xl font-black text-blue-800 tracking-tight">
          Smart<span className="text-blue-600">Laundry</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition shadow-md"
          >
            Daftar
          </Link>
        </div>
      </nav>

      {/* 2. Konten Utama */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 flex items-center justify-center relative">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Kolom Kiri: Teks & Aksi */}
          <div className="flex flex-col gap-5 z-10">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-full border border-emerald-200 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Gratis Ongkir min. order Rp30.000!
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
              Urusan Cucian Beres, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Tanpa Harus Stres.
              </span>
            </h1>

            <p className="text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-md">
              Layanan antar-jemput laundry modern dan transparan. Pantau
              status cucianmu secara real-time dari mana saja, kapan saja.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link 
                href="/order"
                className="flex justify-center items-center px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Mulai Pesan Sekarang
              </Link>
              <Link 
                href="/track"
                className="flex justify-center items-center px-6 py-3.5 text-sm font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
              >
                Lacak Cucian
              </Link>
            </div>
          </div>

          {/* Kolom Kanan: Card Logo dengan Animasi Loading Border (Snake Border) */}
          <div className="flex justify-center lg:justify-end relative">
            
            {/* Latar Belakang Ambient (Biru Halus di Belakang Card) */}
            <div className="absolute inset-0 bg-blue-300/30 blur-[80px] rounded-full z-0"></div>

            {/* BORDER ANIMATION WRAPPER */}
            {/* p-[4px] menentukan ketebalan garis animasinya. overflow-hidden mengunci efek hanya di pinggiran */}
            <div className="group relative w-full max-w-[380px] p-[4px] rounded-[2.2rem] overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 z-10">
              
              {/* Layer 1: Warna Outline Statis (Terlihat saat tidak di-hover) */}
              <div className="absolute inset-0 bg-slate-100 transition-opacity duration-300 group-hover:opacity-0"></div>

              {/* Layer 2: Animasi Conic Gradient Berputar (Tampil HANYA saat di-hover) */}
              {/* inset-[-100%] memastikan gradien cukup besar menutupi seluruh sudut kotak saat berputar */}
              <div className="absolute inset-[-100%] animate-[spin_2s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300
                              bg-[conic-gradient(transparent_70%,#2563eb_100%)]"></div>

              {/* Layer 3: Konten Utama (Warna Putih Solid) */}
              {/* Memotong area tengah agar border terlihat. radius harus sedikit lebih kecil dari radius luar */}
              <div className="relative z-10 bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center gap-6 h-full w-full">
                
                <div className="relative flex items-center justify-center w-full aspect-square">
                  {/* Lingkaran Luar Logo */}
                  <div className="w-48 h-48 rounded-full border-[3px] border-blue-500/20 flex items-center justify-center p-5 relative bg-white">
                    
                    <div className="w-full h-full text-blue-600 flex flex-col items-center justify-center relative z-10">
                      <svg className="w-20 h-20 mb-2 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 8h-4V7a3 3 0 0 0-3-3a3 3 0 0 0-3 3v1H5a2 2 0 0 0-2 2v1h18V10a2 2 0 0 0-2-2z"></path>
                        <path d="M10 7a1 1 0 0 1 1-1a1 1 0 0 1 1 1v1h-2V7z"></path>
                        <path d="M19 13H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2z"></path>
                        <path d="M12 18v.01"></path>
                        <path d="M7 18v.01"></path>
                        <path d="M17 18v.01"></path>
                        <path d="M12 21v.01"></path>
                        <path d="M7 21v.01"></path>
                        <path d="M17 21v.01"></path>
                      </svg>

                      <div className="absolute top-2 left-4 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-pulse"></div>
                      <div className="absolute top-6 right-6 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                      <div className="absolute top-10 left-8 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-200"></div>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 -right-2 flex flex-col gap-1.5 transform -rotate-12">
                    <div className="w-12 h-1.5 bg-blue-600 rounded-full"></div>
                    <div className="w-8 h-1.5 bg-blue-400 rounded-full ml-3"></div>
                    <div className="w-5 h-1.5 bg-blue-300 rounded-full ml-6"></div>
                  </div>
                </div>

                <p className="text-3xl font-extrabold text-slate-800 tracking-tight text-center">
                  Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Laundry</span>
                </p>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      <footer className="shrink-0 w-full h-[8vh] min-h-[50px] flex items-center justify-center text-xs sm:text-sm font-semibold text-slate-400 border-t border-slate-200 bg-white/50 backdrop-blur-sm z-10">
        &copy; 2026 Project Kelompok 5 - SmartLaundry.
      </footer>
    </main>
  );
}