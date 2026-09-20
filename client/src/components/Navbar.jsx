import React from 'react';
import { 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Globe, 
  User, 
  RefreshCw, 
  Volume2, 
  ShieldAlert,
  Type
} from 'lucide-react';
import { LANGUAGES } from '../services/translations';

export default function Navbar({
  currentLang,
  onLanguageChange,
  isOffline,
  onToggleOffline,
  fontSizeScale,
  onChangeFontSize,
  onOpenSOS,
  onOpenProfile,
  onOpenSyncDrawer,
  pendingQueueCount,
  user,
  t
}) {
  return (
    <header className="sticky top-0 z-40 bg-brutal-card border-b-4 border-black px-4 py-3 shadow-[0_4px_0_0_#000]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-brutal-yellow border-3 border-black p-2 shadow-brutal-sm flex items-center justify-center">
            <span className="font-mono font-black text-xl tracking-tighter">AI+RoSA</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-lg md:text-xl tracking-tight leading-none uppercase">
                {t.appTitle}
              </h1>
              <span className="hidden sm:inline-block bg-brutal-mint border-2 border-black text-xs font-mono font-bold px-2 py-0.5 shadow-brutal-sm">
                PWA v1.0
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-700 hidden md:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Middle: Status & Accessibility */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Online / Offline Status Badge with Toggle */}
          <button
            onClick={onToggleOffline}
            title="Click to simulate offline / online network mode"
            className={`brutal-badge text-xs transition-all ${
              isOffline 
                ? 'bg-amber-300 hover:bg-amber-400 text-black animate-pulse' 
                : 'bg-brutal-mint hover:bg-emerald-300 text-black'
            }`}
          >
            {isOffline ? <WifiOff size={14} className="stroke-[3]" /> : <Wifi size={14} className="stroke-[3]" />}
            <span>{isOffline ? t.offlineStatus : t.onlineStatus}</span>
            <span className="text-[10px] bg-black text-white px-1 py-0.2 rounded font-mono ml-1">
              {isOffline ? t.simulateOnline : t.simulateOffline}
            </span>
          </button>

          {/* Senior Font Size Zoom Controls */}
          <div className="flex items-center border-2 border-black bg-white shadow-brutal-sm rounded-none overflow-hidden">
            <button
              onClick={() => onChangeFontSize('scale-normal')}
              className={`px-2 py-1 text-xs font-black border-r-2 border-black transition-colors ${
                fontSizeScale === 'scale-normal' ? 'bg-brutal-yellow' : 'hover:bg-gray-100'
              }`}
              title="Standard font size"
            >
              A
            </button>
            <button
              onClick={() => onChangeFontSize('scale-large')}
              className={`px-2 py-1 text-sm font-black border-r-2 border-black transition-colors ${
                fontSizeScale === 'scale-large' ? 'bg-brutal-yellow' : 'hover:bg-gray-100'
              }`}
              title="Large font for seniors"
            >
              A+
            </button>
            <button
              onClick={() => onChangeFontSize('scale-xl')}
              className={`px-2.5 py-1 text-base font-black transition-colors ${
                fontSizeScale === 'scale-xl' ? 'bg-brutal-yellow' : 'hover:bg-gray-100'
              }`}
              title="Extra-large high visibility"
            >
              A++
            </button>
          </div>

          {/* Multilingual Selector */}
          <div className="relative flex items-center border-2 border-black bg-white shadow-brutal-sm px-2 py-1">
            <Globe size={15} className="mr-1 text-black" />
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-black focus:outline-none cursor-pointer pr-2"
              aria-label="Select Language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native} ({lang.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Offline Sync Queue Indicator */}
          <button
            onClick={onOpenSyncDrawer}
            className="brutal-badge bg-brutal-cream hover:bg-gray-200 cursor-pointer"
            title="View offline queue and sync progress"
          >
            <RefreshCw size={13} className={pendingQueueCount > 0 ? "animate-spin text-amber-700" : ""} />
            <span className="font-mono">{pendingQueueCount} {t.tabs.offlineSync}</span>
          </button>
        </div>

        {/* Right: Emergency SOS Button & Profile */}
        <div className="flex items-center gap-2">
          {/* User Profile */}
          <button
            onClick={onOpenProfile}
            className="brutal-btn brutal-btn-white text-xs px-2.5 py-1.5"
            title="User Health Profile & OTP Login"
          >
            <User size={15} />
            <span className="hidden sm:inline">{user?.name ? user.name.split(' ')[0] : 'Citizen Profile'}</span>
          </button>

          {/* Big Emergency SOS Trigger */}
          <button
            onClick={onOpenSOS}
            className="brutal-btn brutal-btn-red text-white text-xs md:text-sm px-3 md:px-4 py-1.5 tracking-wider uppercase animate-bounce"
            title="Double-tap or click for Emergency SOS"
          >
            <ShieldAlert size={18} className="stroke-[3]" />
            <span>{t.sosTrigger}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
