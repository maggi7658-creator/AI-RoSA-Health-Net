import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Volume2, 
  VolumeX, 
  Printer, 
  QrCode, 
  Calendar, 
  HeartPulse, 
  CheckCircle, 
  ShieldCheck, 
  User, 
  Clock,
  Pill,
  Share2
} from 'lucide-react';
import { speechService } from '../services/speech';
import { api } from '../services/api';

export default function DigitalPrescriptions({
  isOffline,
  currentLang,
  t
}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, [isOffline]);

  const loadPrescriptions = async () => {
    setLoading(true);
    const list = await api.getPrescriptions(isOffline);
    setPrescriptions(list);
    if (list.length > 0 && !selectedRx) {
      setSelectedRx(list[0]);
    }
    setLoading(false);
  };

  const handleToggleVoiceReadout = (rx) => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else {
      const medList = rx.medicines.map(m => `${m.name}: ${m.dosage}, ${m.timing}`).join('. ');
      const speechText = `Prescription from ${rx.doctorName} for ${rx.patientName}. Diagnosis: ${rx.diagnosis}. Medications: ${medList}. Dietary advice: ${rx.dietaryAdvice}`;
      
      speechService.speak(speechText, currentLang, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="brutal-card p-5 md:p-6 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brutal-mint border-3 border-black p-3 shadow-brutal flex items-center justify-center">
            <FileText size={30} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {t.prescriptions.heading}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-gray-700">
              {t.prescriptions.subheading}
            </p>
          </div>
        </div>

        <span className="bg-white border-2 border-black font-mono text-xs font-bold px-3 py-1.5 shadow-brutal-sm">
          {prescriptions.length} Active Prescriptions (Offline Available)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of Prescriptions */}
        <div className="space-y-3">
          <h3 className="font-black text-xs uppercase tracking-wider text-gray-600">
            Select Medical Record
          </h3>

          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              onClick={() => { setSelectedRx(rx); speechService.stopSpeaking(); setIsSpeaking(false); }}
              className={`brutal-card p-4 cursor-pointer transition-all ${
                selectedRx?.id === rx.id ? 'bg-brutal-yellow' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                <span>{rx.rxNumber}</span>
                <span>{rx.date}</span>
              </div>
              <h4 className="font-black text-sm text-black">{rx.diagnosis}</h4>
              <p className="text-xs text-gray-700 mt-1 font-semibold">{rx.doctorName}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold bg-white/70 p-1 border border-black inline-block">
                <span>{rx.medicines?.length || 0} Medicines Prescribed</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Detailed Official Prescription Sheet */}
        {selectedRx && (
          <div className="lg:col-span-2 brutal-card p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-6">
            
            {/* Rx Header with Doctor & Clinic Information */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b-3 border-black pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-2xl font-mono text-black">℞</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase text-black">
                    {selectedRx.doctorName}
                  </h3>
                </div>
                <p className="text-xs font-bold text-gray-700">{selectedRx.doctorSpecialty}</p>
                <p className="text-[11px] font-mono text-gray-600">Reg. No: {selectedRx.doctorReg} • AI-RoSA Verified</p>
              </div>

              {/* Action Buttons: Voice Read Aloud + Print */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVoiceReadout(selectedRx)}
                  className={`brutal-btn ${isSpeaking ? 'brutal-btn-red text-white' : 'brutal-btn-yellow'} text-xs px-3.5 py-2`}
                  title="Read prescription aloud in spoken voice"
                >
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>{isSpeaking ? t.prescriptions.stopVoice : t.prescriptions.readAloud}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="brutal-btn brutal-btn-white text-xs px-3 py-2"
                  title="Print official prescription"
                >
                  <Printer size={16} />
                  <span className="hidden sm:inline">{t.prescriptions.printRx}</span>
                </button>
              </div>
            </div>

            {/* Patient Vitals Card */}
            <div className="bg-brutal-cream border-2 border-black p-3.5 shadow-brutal-sm grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-600 block">Patient</span>
                <span className="font-black text-sm">{selectedRx.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-600 block">Date</span>
                <span className="font-black">{selectedRx.date}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-600 block">Blood Pressure</span>
                <span className="font-black">{selectedRx.vitals?.bp || '130/80 mmHg'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-600 block">Pulse / SpO2</span>
                <span className="font-black">{selectedRx.vitals?.pulse || '74 bpm'} • {selectedRx.vitals?.spO2 || '98%'}</span>
              </div>
            </div>

            {/* Diagnosis Statement */}
            <div className="border-2 border-black p-3 bg-yellow-50">
              <span className="text-xs font-black uppercase text-amber-900 block">
                {t.prescriptions.diagnosis}:
              </span>
              <p className="text-base font-black text-black mt-0.5">
                {selectedRx.diagnosis}
              </p>
            </div>

            {/* Medicines Prescription Table */}
            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase tracking-wider text-black flex items-center gap-1.5">
                <Pill size={15} />
                <span>Prescribed Medications & Jan Aushadhi Schedule</span>
              </h4>

              <div className="border-2 border-black overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-black text-white font-mono uppercase text-[11px]">
                    <tr>
                      <th className="p-2.5 border-r border-gray-700">Medicine (Generic First)</th>
                      <th className="p-2.5 border-r border-gray-700">Dosage</th>
                      <th className="p-2.5 border-r border-gray-700">Timing & Instructions</th>
                      <th className="p-2.5">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-black font-semibold">
                    {selectedRx.medicines.map((med, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-2.5 border-r-2 border-black font-black text-sm">
                          {med.name}
                        </td>
                        <td className="p-2.5 border-r-2 border-black font-mono">
                          {med.dosage}
                        </td>
                        <td className="p-2.5 border-r-2 border-black">
                          <span className="bg-yellow-200 px-1.5 py-0.5 border border-black font-bold block mb-1">
                            {med.timing}
                          </span>
                          <span className="text-[11px] text-gray-700 font-normal">{med.instructions}</span>
                        </td>
                        <td className="p-2.5 font-mono font-bold">
                          {med.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dietary & Lifestyle Advice */}
            {selectedRx.dietaryAdvice && (
              <div className="border-2 border-black p-3.5 bg-green-50 text-xs">
                <span className="font-black uppercase text-green-900 block mb-1">
                  {t.prescriptions.dietaryAdvice}
                </span>
                <p className="font-medium text-black">
                  {selectedRx.dietaryAdvice}
                </p>
              </div>
            )}

            {/* Verification Footer with QR Code */}
            <div className="pt-4 border-t-3 border-black flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-black text-white p-2 border-2 border-black shadow-brutal-sm">
                  <QrCode size={40} className="stroke-[2.5]" />
                </div>
                <div className="text-xs">
                  <span className="font-black uppercase flex items-center gap-1 text-green-700">
                    <ShieldCheck size={14} />
                    {t.prescriptions.qrVerified}
                  </span>
                  <p className="font-mono text-[10px] text-gray-600 mt-0.5">
                    Hash: {selectedRx.qrCodeData || selectedRx.rxNumber}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Follow-up Review</span>
                <span className="font-black text-xs bg-brutal-yellow border border-black px-2 py-0.5">
                  {selectedRx.followUpDate || 'In 4 Weeks'}
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
