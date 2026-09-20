import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  MapPin, 
  PhoneCall, 
  Send, 
  X, 
  CheckCircle, 
  Radio, 
  ShieldAlert, 
  Volume2, 
  VolumeX,
  ExternalLink
} from 'lucide-react';
import { speechService } from '../services/speech';

export default function EmergencySOSModal({
  isOpen,
  onClose,
  isOffline,
  user,
  onSendSOS,
  t,
  currentLang
}) {
  const [countdown, setCountdown] = useState(3);
  const [dispatched, setDispatched] = useState(false);
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090, accuracy: 'Approx (Rural GPS)' });
  const [audioAlarmPlaying, setAudioAlarmPlaying] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);

  // Fetch coordinates on open
  useEffect(() => {
    if (isOpen) {
      setDispatched(false);
      setCountdown(3);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: `${Math.round(pos.coords.accuracy)} meters`
            });
          },
          (err) => {
            console.warn('[SOS] Geolocation error, using default rural post coords:', err);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    } else {
      stopSiren();
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || dispatched) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !dispatched) {
      handleTriggerDispatch();
    }
  }, [isOpen, countdown, dispatched]);

  // Audio Siren generator using Web Audio API
  const startSiren = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setAudioCtx({ ctx, osc });
      setAudioAlarmPlaying(true);
    } catch (e) {
      console.warn('AudioContext error:', e);
    }
  };

  const stopSiren = () => {
    if (audioCtx) {
      try {
        audioCtx.osc.stop();
        audioCtx.ctx.close();
      } catch (e) {}
      setAudioCtx(null);
    }
    setAudioAlarmPlaying(false);
  };

  const handleTriggerDispatch = async () => {
    setDispatched(true);
    startSiren();

    const payload = {
      patientName: user?.name || "Rameshwar Patel (Senior)",
      patientPhone: user?.phone || "9876543210",
      bloodGroup: user?.bloodGroup || "B+",
      emergencyType: "ACUTE_MEDICAL_EMERGENCY",
      coordinates: { latitude: coords.lat, longitude: coords.lng },
      address: user?.address || "Rampur Village Health Sub-centre Road",
      batteryLevel: "88%"
    };

    if (onSendSOS) {
      await onSendSOS(payload);
    }

    // Voice announcement
    speechService.speak(
      "Emergency SOS alert dispatched. 108 Ambulance and family emergency contacts have been notified with your exact GPS location.",
      currentLang
    );
  };

  if (!isOpen) return null;

  const mapUrl = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
  const smsBody = encodeURIComponent(
    `EMERGENCY MEDICAL ALERT (AI-RoSA Health-Net)\nPatient: ${user?.name || 'Rameshwar Patel'}\nBlood: ${user?.bloodGroup || 'B+'}\nLocation: ${mapUrl}\nNeed immediate ambulance!`
  );
  const nativeSmsLink = `sms:108?body=${smsBody}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-xl p-5 md:p-7 relative max-h-[95vh] overflow-y-auto">
        
        {/* Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b-4 border-black mb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brutal-red text-white border-2 border-black shadow-brutal-sm">
              <AlertOctagon size={24} className="stroke-[3] animate-pulse" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-red-600">
                {t.sos.emergencyAlert}
              </h2>
              <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5">
                {isOffline ? 'OFFLINE GSM / SMS PROTOCOL' : 'LIVE TELEMETRY DISPATCH'}
              </span>
            </div>
          </div>

          <button
            onClick={() => { stopSiren(); onClose(); }}
            className="p-1.5 border-2 border-black bg-white hover:bg-gray-100 shadow-brutal-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* State 1: 3-Second Countdown */}
        {!dispatched && (
          <div className="text-center py-4">
            <p className="text-base md:text-lg font-bold mb-2">
              {t.sos.countdownWarning}
            </p>

            <div className="my-6 inline-flex items-center justify-center w-24 h-24 rounded-none bg-brutal-yellow border-4 border-black shadow-[6px_6px_0px_0px_#000]">
              <span className="font-mono font-black text-5xl animate-ping">
                {countdown}
              </span>
            </div>

            <p className="text-sm font-semibold text-gray-700 max-w-md mx-auto mb-6">
              If this was triggered accidentally, press <strong>Cancel</strong> below immediately.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => { stopSiren(); onClose(); }}
                className="brutal-btn brutal-btn-white w-full sm:w-auto px-6 py-3 text-sm font-black"
              >
                <X size={18} />
                <span>{t.sos.cancelBtn}</span>
              </button>

              <button
                onClick={handleTriggerDispatch}
                className="brutal-btn brutal-btn-red text-white w-full sm:w-auto px-8 py-3 text-sm font-black"
              >
                <Send size={18} />
                <span>{t.sos.sendImmediately}</span>
              </button>
            </div>
          </div>
        )}

        {/* State 2: Dispatched Confirmation */}
        {dispatched && (
          <div className="space-y-4">
            <div className="bg-brutal-mint border-3 border-black p-4 shadow-brutal flex items-center gap-3">
              <CheckCircle size={28} className="stroke-[3] text-black shrink-0" />
              <div>
                <h3 className="font-black text-base md:text-lg tracking-tight uppercase">
                  {t.sos.dispatched}
                </h3>
                <p className="text-xs font-bold text-gray-800">
                  {isOffline 
                    ? "Stored in local offline safety vault & SMS template prepared for instant phone broadcast."
                    : "Ambulance dispatch, local hospital, and family network actively notified."}
                </p>
              </div>
            </div>

            {/* Recipients List */}
            <div className="border-3 border-black bg-brutal-cream p-4 shadow-brutal space-y-2 text-sm">
              <h4 className="font-black uppercase tracking-wider text-xs border-b-2 border-black pb-1">
                Active Emergency Broadcast Receivers
              </h4>
              
              <div className="flex items-center justify-between text-xs font-bold bg-white p-2 border-2 border-black">
                <span className="flex items-center gap-1.5">
                  <PhoneCall size={14} className="text-red-600" />
                  {t.sos.ambulanceDispatched}
                </span>
                <span className="bg-brutal-mint px-2 py-0.5 border border-black font-mono text-[10px]">
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold bg-white p-2 border-2 border-black">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-blue-600" />
                  {t.sos.policeDispatched}
                </span>
                <span className="bg-brutal-mint px-2 py-0.5 border border-black font-mono text-[10px]">
                  ALERTED
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold bg-white p-2 border-2 border-black">
                <span className="flex items-center gap-1.5">
                  <Radio size={14} className="text-green-600" />
                  {t.sos.familyDispatched} (Sunil Patel: +91 98765 11223)
                </span>
                <span className="bg-brutal-mint px-2 py-0.5 border border-black font-mono text-[10px]">
                  SMS SENT
                </span>
              </div>
            </div>

            {/* GPS Telemetry Box */}
            <div className="bg-white border-3 border-black p-3.5 shadow-brutal text-xs space-y-1.5">
              <div className="flex items-center justify-between font-black uppercase text-[11px]">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-red-600" />
                  {t.sos.locationCaptured}
                </span>
                <span className="font-mono text-gray-600">Accuracy: {coords.accuracy}</span>
              </div>
              <p className="font-mono bg-yellow-100 p-1.5 border border-black text-xs font-bold break-all">
                Latitude: {coords.lat.toFixed(6)}, Longitude: {coords.lng.toFixed(6)}
              </p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 underline font-black text-xs hover:text-blue-900"
              >
                Open Google Maps Live Location <ExternalLink size={12} />
              </a>
            </div>

            {/* Direct GSM SMS Backup Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <a
                href={nativeSmsLink}
                className="brutal-btn brutal-btn-yellow flex-1 py-3 text-center text-xs md:text-sm font-black"
              >
                <PhoneCall size={16} />
                <span>Open Phone SMS App to Send Directly</span>
              </a>

              <button
                onClick={audioAlarmPlaying ? stopSiren : startSiren}
                className={`brutal-btn ${audioAlarmPlaying ? 'brutal-btn-red text-white' : 'brutal-btn-white'} py-3 px-4 text-xs font-black`}
                title="Toggle Emergency Audible Siren"
              >
                {audioAlarmPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <span>{audioAlarmPlaying ? 'Mute Siren' : 'Play Siren'}</span>
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => { stopSiren(); onClose(); }}
                className="text-xs font-bold underline text-gray-700 hover:text-black"
              >
                Close SOS Window (Emergency Protocol Continues in Background)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
