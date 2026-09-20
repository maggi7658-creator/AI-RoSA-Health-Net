import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Volume2, 
  Plus, 
  Clock, 
  Pill, 
  Activity, 
  Flame, 
  AlertCircle,
  Calendar,
  VolumeX
} from 'lucide-react';
import { db } from '../services/db';
import { speechService } from '../services/speech';

export default function MedicineReminders({
  isOffline,
  currentLang,
  user,
  t
}) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingReminderId, setSpeakingReminderId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New reminder form
  const [newRem, setNewRem] = useState({
    medicineName: '',
    purpose: '',
    dosage: '1 Tablet',
    time: '08:00 AM',
    period: 'Morning',
    instruction: 'After breakfast with water'
  });

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setLoading(false);
    const list = await db.reminders.toArray();
    setReminders(list);
  };

  const handleToggleTaken = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    await db.reminders.update(id, { taken: updatedStatus });
    setReminders(prev => prev.map(r => r.id === id ? { ...r, taken: updatedStatus } : r));

    if (updatedStatus) {
      speechService.speak("Great job! Medicine dose marked as taken.", currentLang);
    }
  };

  const handlePlayVoiceReminder = (rem) => {
    if (isSpeaking && speakingReminderId === rem.id) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      setSpeakingReminderId(null);
    } else {
      const patient = user?.name ? user.name.split(' ')[0] : 'Citizen';
      const textToSpeak = `Namaste ${patient}! Time for your ${rem.period} ${rem.purpose || 'medicine'}: ${rem.medicineName}. Dosage: ${rem.dosage}. Instructions: ${rem.instruction}`;
      
      setSpeakingReminderId(rem.id);
      setIsSpeaking(true);
      speechService.speak(textToSpeak, currentLang, () => {
        setIsSpeaking(false);
        setSpeakingReminderId(null);
      });
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (!newRem.medicineName) return;

    const record = {
      id: `rem-${Date.now()}`,
      ...newRem,
      taken: false,
      soundEnabled: true
    };

    await db.reminders.add(record);
    setReminders(prev => [...prev, record]);
    setShowAddModal(false);
    setNewRem({
      medicineName: '',
      purpose: '',
      dosage: '1 Tablet',
      time: '08:00 AM',
      period: 'Morning',
      instruction: 'After breakfast with water'
    });
  };

  const takenCount = reminders.filter(r => r.taken).length;
  const adherenceRate = reminders.length > 0 ? Math.round((takenCount / reminders.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="brutal-card p-5 md:p-6 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brutal-orange border-3 border-black p-3 shadow-brutal flex items-center justify-center">
            <Bell size={30} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {t.reminders.heading}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-gray-700">
              {t.reminders.subheading}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="brutal-btn brutal-btn-yellow text-xs md:text-sm px-4 py-2"
        >
          <Plus size={16} />
          <span>{t.reminders.addReminder}</span>
        </button>
      </div>

      {/* Adherence Compliance Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="brutal-card p-4 bg-brutal-mint border-3 border-black flex items-center gap-3">
          <Flame size={32} className="text-orange-600 stroke-[2.5]" />
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-gray-700 block">Senior Adherence Streak</span>
            <span className="text-2xl font-black">14 Days Clean Streak!</span>
          </div>
        </div>

        <div className="brutal-card p-4 bg-white border-3 border-black flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-gray-500 block">Today's Dosage Completed</span>
            <span className="text-2xl font-black">{takenCount} / {reminders.length} Doses</span>
          </div>
          <span className="text-xl font-black bg-brutal-yellow p-2 border-2 border-black font-mono">
            {adherenceRate}%
          </span>
        </div>

        <div className="brutal-card p-4 bg-blue-100 border-3 border-black flex items-center gap-3">
          <Activity size={30} className="text-blue-700 stroke-[2.5]" />
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-blue-900 block">Therapy Schedule</span>
            <span className="text-sm font-black">15-Min Evening Joint Walk Active</span>
          </div>
        </div>

      </div>

      {/* Reminder Cards List */}
      <div className="space-y-3">
        {reminders.map((rem) => {
          const isThisSpeaking = isSpeaking && speakingReminderId === rem.id;
          return (
            <div
              key={rem.id}
              className={`brutal-card p-4 md:p-5 flex flex-wrap items-center justify-between gap-4 transition-all ${
                rem.taken ? 'bg-green-50/80 border-green-800' : 'bg-white'
              }`}
            >
              
              <div className="flex items-center gap-4">
                {/* Custom Large Checkbox */}
                <button
                  onClick={() => handleToggleTaken(rem.id, rem.taken)}
                  className={`w-9 h-9 border-3 border-black flex items-center justify-center transition-all ${
                    rem.taken ? 'bg-brutal-mint shadow-brutal-sm' : 'bg-white hover:bg-gray-100 shadow-brutal-sm'
                  }`}
                  title={rem.taken ? "Mark not taken" : "Mark taken"}
                >
                  {rem.taken && <Check size={24} className="stroke-[4] text-black" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-base md:text-lg ${rem.taken ? 'line-through text-gray-500' : 'text-black'}`}>
                      {rem.medicineName}
                    </h3>
                    <span className="bg-brutal-cream border border-black font-mono text-[10px] font-bold px-2 py-0.5">
                      {rem.dosage}
                    </span>
                    <span className="bg-yellow-100 border border-black font-mono text-[10px] font-bold px-2 py-0.5">
                      {rem.period}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-gray-600 mt-0.5">
                    {rem.purpose} • <span className="text-black font-bold">{rem.instruction}</span>
                  </p>
                </div>
              </div>

              {/* Right: Time & Spoken Voice Button */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-mono font-black text-sm md:text-base flex items-center gap-1">
                    <Clock size={14} />
                    {rem.time}
                  </span>
                  <span className={`text-[10px] font-bold uppercase block ${rem.taken ? 'text-green-700' : 'text-amber-700'}`}>
                    {rem.taken ? t.reminders.taken : 'Due Today'}
                  </span>
                </div>

                <button
                  onClick={() => handlePlayVoiceReminder(rem)}
                  className={`brutal-btn ${isThisSpeaking ? 'brutal-btn-red text-white' : 'brutal-btn-yellow'} text-xs px-3 py-2`}
                  title="Speak reminder aloud in local language"
                >
                  {isThisSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  <span>{isThisSpeaking ? 'Stop' : t.reminders.testVoiceAlarm}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-md p-6 relative">
            
            <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
              <h3 className="font-black text-lg uppercase">
                {t.reminders.addReminder}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="border-2 border-black p-1 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block mb-1 uppercase font-mono">Medicine / Therapy Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amlodipine 5mg or Knee Exercise"
                  value={newRem.medicineName}
                  onChange={(e) => setNewRem({ ...newRem, medicineName: e.target.value })}
                  className="brutal-input w-full p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 uppercase font-mono">Purpose</label>
                  <input
                    type="text"
                    placeholder="e.g. High BP"
                    value={newRem.purpose}
                    onChange={(e) => setNewRem({ ...newRem, purpose: e.target.value })}
                    className="brutal-input w-full p-2"
                  />
                </div>

                <div>
                  <label className="block mb-1 uppercase font-mono">Dosage</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Tablet"
                    value={newRem.dosage}
                    onChange={(e) => setNewRem({ ...newRem, dosage: e.target.value })}
                    className="brutal-input w-full p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 uppercase font-mono">Time Period</label>
                  <select
                    value={newRem.period}
                    onChange={(e) => setNewRem({ ...newRem, period: e.target.value })}
                    className="brutal-input w-full p-2"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 uppercase font-mono">Alert Time</label>
                  <input
                    type="text"
                    placeholder="08:00 AM"
                    value={newRem.time}
                    onChange={(e) => setNewRem({ ...newRem, time: e.target.value })}
                    className="brutal-input w-full p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase font-mono">Instructions (Spoken in Voice Alarm)</label>
                <input
                  type="text"
                  placeholder="e.g. After breakfast with warm water"
                  value={newRem.instruction}
                  onChange={(e) => setNewRem({ ...newRem, instruction: e.target.value })}
                  className="brutal-input w-full p-2"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="brutal-btn brutal-btn-white flex-1 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="brutal-btn brutal-btn-yellow flex-1 py-2"
                >
                  Save Pill Reminder
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
