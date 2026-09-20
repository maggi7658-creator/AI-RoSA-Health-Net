import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Stethoscope, 
  FileText, 
  Pill, 
  TestTube, 
  Bell, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  HeartPulse,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Navbar from './components/Navbar';
import EmergencySOSModal from './components/EmergencySOSModal';
import AIHealthBot from './components/AIHealthBot';
import DoctorConsultation from './components/DoctorConsultation';
import DigitalPrescriptions from './components/DigitalPrescriptions';
import PharmacyComparison from './components/PharmacyComparison';
import DiagnosticCenters from './components/DiagnosticCenters';
import MedicineReminders from './components/MedicineReminders';
import OfflineSyncDrawer from './components/OfflineSyncDrawer';
import AuthProfileModal from './components/AuthProfileModal';
import { TRANSLATIONS } from './services/translations';
import { db, seedInitialData, getPendingQueue } from './services/db';
import { api } from './services/api';

export default function App() {
  // Global App States
  const [currentLang, setCurrentLang] = useState('en');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [fontSizeScale, setFontSizeScale] = useState('scale-normal');
  const [activeTab, setActiveTab] = useState('triage');
  const [pendingQueueCount, setPendingQueueCount] = useState(0);

  // Modals
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSyncDrawerOpen, setIsSyncDrawerOpen] = useState(false);

  // User health profile
  const [user, setUser] = useState({
    phone: "9876543210",
    name: "Rameshwar Patel",
    age: 68,
    bloodGroup: "B+",
    address: "House 14, Ward 3, Rampur Village, Dist. Varanasi, UP",
    chronicConditions: ["Hypertension", "Mild Osteoarthritis"],
    emergencyContacts: [
      { name: "Sunil Patel (Son)", phone: "+91 98765 11223" },
      { name: "Village Health Volunteer", phone: "+91 98444 55667" }
    ]
  });

  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Initialize DB and network listeners
  useEffect(() => {
    seedInitialData();
    refreshQueueCount();

    const handleOnline = () => {
      setIsOffline(false);
      refreshQueueCount();
    };
    const handleOffline = () => {
      setIsOffline(true);
      refreshQueueCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshQueueCount = async () => {
    try {
      const q = await getPendingQueue();
      setPendingQueueCount(q.length);
    } catch (e) {
      console.warn('Queue count error:', e);
    }
  };

  const handleToggleOffline = () => {
    setIsOffline(prev => !prev);
  };

  const handleSendSOS = async (payload) => {
    await api.triggerSOS(payload, isOffline);
    refreshQueueCount();
  };

  const navItems = [
    { id: 'triage', label: t.tabs.triage, icon: Bot, badgeColor: 'bg-brutal-yellow' },
    { id: 'doctors', label: t.tabs.doctors, icon: Stethoscope, badgeColor: 'bg-brutal-blue' },
    { id: 'prescriptions', label: t.tabs.prescriptions, icon: FileText, badgeColor: 'bg-brutal-mint' },
    { id: 'pharmacy', label: t.tabs.pharmacy, icon: Pill, badgeColor: 'bg-brutal-yellow' },
    { id: 'diagnostics', label: t.tabs.diagnostics, icon: TestTube, badgeColor: 'bg-brutal-purple' },
    { id: 'reminders', label: t.tabs.reminders, icon: Bell, badgeColor: 'bg-brutal-orange' }
  ];

  return (
    <div className={`min-h-screen bg-brutal-canvas brutal-grid-pattern ${fontSizeScale} pb-24 selection:bg-brutal-yellow selection:text-black`}>
      
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        fontSizeScale={fontSizeScale}
        onChangeFontSize={setFontSizeScale}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSyncDrawer={() => setIsSyncDrawerOpen(true)}
        pendingQueueCount={pendingQueueCount}
        user={user}
        t={t}
      />

      {/* Senior Emergency Quick-Alert Banner */}
      <div className="bg-brutal-yellow border-b-3 border-black px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm font-black">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span>🚨 Rural Elderly Health Line:</span>
            <span className="bg-black text-white px-2 py-0.5 font-mono text-xs">
              Call 108 for Ambulance
            </span>
          </div>
          
          <button
            onClick={() => setIsSOSOpen(true)}
            className="text-red-700 underline hover:text-black flex items-center gap-1 font-black cursor-pointer"
          >
            <span>{t.doubleTapSos}</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* Active Tab Content */}
        {activeTab === 'triage' && (
          <AIHealthBot
            onConsultDoctor={(spec) => {
              setActiveTab('doctors');
            }}
            onCheckPharmacy={() => setActiveTab('pharmacy')}
            onBookLab={() => setActiveTab('diagnostics')}
            onTriggerSOS={() => setIsSOSOpen(true)}
            isOffline={isOffline}
            currentLang={currentLang}
            t={t}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorConsultation
            isOffline={isOffline}
            user={user}
            onPrescriptionCreated={(rx) => {
              setActiveTab('prescriptions');
              refreshQueueCount();
            }}
            t={t}
          />
        )}

        {activeTab === 'prescriptions' && (
          <DigitalPrescriptions
            isOffline={isOffline}
            currentLang={currentLang}
            t={t}
          />
        )}

        {activeTab === 'pharmacy' && (
          <PharmacyComparison
            isOffline={isOffline}
            user={user}
            t={t}
          />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticCenters
            isOffline={isOffline}
            user={user}
            t={t}
          />
        )}

        {activeTab === 'reminders' && (
          <MedicineReminders
            isOffline={isOffline}
            currentLang={currentLang}
            user={user}
            t={t}
          />
        )}

      </main>

      {/* Sticky Bottom Brutalist Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-4 border-black p-2 shadow-[0_-4px_0_0_#000]">
        <div className="max-w-4xl mx-auto flex items-center justify-around gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-none transition-all flex-1 ${
                  isActive 
                    ? `${item.badgeColor} border-2 border-black shadow-brutal-sm font-black` 
                    : 'text-gray-700 hover:bg-gray-100 font-bold border-2 border-transparent'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : ''} />
                <span className="text-[10px] md:text-xs mt-0.5 tracking-tight truncate max-w-[90px] text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        isOffline={isOffline}
        user={user}
        onSendSOS={handleSendSOS}
        t={t}
        currentLang={currentLang}
      />

      {/* Offline Sync Drawer */}
      <OfflineSyncDrawer
        isOpen={isSyncDrawerOpen}
        onClose={() => setIsSyncDrawerOpen(false)}
        isOffline={isOffline}
        onSyncCompleted={refreshQueueCount}
      />

      {/* User Health Profile & Auth Modal */}
      <AuthProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onUserUpdate={(updated) => setUser(updated)}
        isOffline={isOffline}
      />

    </div>
  );
}
