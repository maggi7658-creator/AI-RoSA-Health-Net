import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  CheckCircle, 
  Star, 
  Clock, 
  Calendar, 
  FileText, 
  Languages, 
  UserCheck,
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export default function DoctorConsultation({
  isOffline,
  user,
  onPrescriptionCreated,
  t
}) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [callNotes, setCallNotes] = useState([
    { sender: 'Dr. Rajeshwar Sharma', text: 'Namaste Rameshwar ji! I can hear you clearly. How is your knee stiffness today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [rxIssuedNotice, setRxIssuedNotice] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, [specialtyFilter, isOffline]);

  const loadDoctors = async () => {
    setLoading(true);
    const params = specialtyFilter !== 'All' ? { specialty: specialtyFilter } : {};
    const list = await api.getDoctors(params, isOffline);
    setDoctors(list);
    setLoading(false);
  };

  const handleStartConsultation = (doctor) => {
    setActiveDoctor(doctor);
    setInCall(true);
    setRxIssuedNotice(false);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: user?.name || 'Patient', text: chatInput };
    setCallNotes(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate doctor reply
    setTimeout(() => {
      const docReply = {
        sender: activeDoctor?.name || 'Doctor',
        text: 'Understood. Based on your symptoms, I am issuing an official digital prescription with generic Jan Aushadhi medicines for optimal affordability.'
      };
      setCallNotes(prev => [...prev, docReply]);
    }, 1200);
  };

  const handleIssuePrescription = async () => {
    const rxPayload = {
      doctorName: activeDoctor?.name || 'Dr. Rajeshwar Sharma',
      doctorSpecialty: activeDoctor?.specialty || 'Geriatrician',
      doctorReg: 'MCI-48201',
      patientName: user?.name || 'Rameshwar Patel (Age: 68)',
      diagnosis: 'Seasonal Bronchial Allergy & Age-Related Knee Joint Wear',
      vitals: { bp: '132/84 mmHg', pulse: '74 bpm', spO2: '98%' },
      medicines: [
        {
          name: 'Telmisartan 40mg (Generic)',
          dosage: '1 tablet once daily',
          timing: 'Morning after breakfast',
          duration: '30 Days',
          instructions: 'Take with warm water. Monitor morning BP.'
        },
        {
          name: 'Paracetamol 500mg (Generic Jan Aushadhi)',
          dosage: '1 tablet when feverish',
          timing: 'After meals',
          duration: '3 Days',
          instructions: 'For fever above 99°F.'
        },
        {
          name: 'Calcium 500mg + Vitamin D3',
          dosage: '1 tablet daily',
          timing: 'After lunch',
          duration: '30 Days',
          instructions: 'For knee joint strength.'
        }
      ],
      dietaryAdvice: 'Avoid heavy cold foods. Drink lukewarm water. Perform 15 minutes of non-weight-bearing ankle & knee flexes.',
      audioAdvice: `Namaste. Your digital prescription from ${activeDoctor?.name} is ready. Take your medications on time and avoid cold drinks.`
    };

    const result = await api.issuePrescription(rxPayload, isOffline);
    setRxIssuedNotice(true);
    if (onPrescriptionCreated) {
      onPrescriptionCreated(result.prescription);
    }
  };

  const specialties = ['All', 'Geriatrician', 'General Physician', 'Cardiologist', 'Dermatologist'];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="brutal-card p-5 md:p-6 bg-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brutal-blue border-3 border-black p-3 shadow-brutal flex items-center justify-center">
            <Stethoscope size={30} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
              {t.doctors.heading}
            </h2>
            <p className="text-xs md:text-sm font-semibold text-gray-700">
              {t.doctors.subheading}
            </p>
          </div>
        </div>

        {/* Specialty Filter */}
        <div className="flex flex-wrap gap-2">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialtyFilter(spec)}
              className={`border-2 border-black text-xs font-black px-3 py-1.5 shadow-brutal-sm transition-all ${
                specialtyFilter === spec 
                  ? 'bg-brutal-yellow' 
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* State 1: Active Live WebRTC Consultation Call Room */}
      {inCall && activeDoctor && (
        <div className="brutal-card p-4 md:p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-4">
          
          {/* Room Header */}
          <div className="flex items-center justify-between border-b-3 border-black pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
              <h3 className="font-black text-base md:text-lg uppercase">
                {t.doctors.inCall}: {activeDoctor.name} ({activeDoctor.specialty})
              </h3>
            </div>

            <button
              onClick={() => setInCall(false)}
              className="brutal-btn brutal-btn-red text-white text-xs px-3.5 py-1.5"
            >
              <PhoneOff size={16} />
              <span>{t.doctors.endCall}</span>
            </button>
          </div>

          {/* Video Grid Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Doctor Primary Video Stream */}
            <div className="md:col-span-2 relative bg-gray-900 border-3 border-black aspect-video flex items-center justify-center overflow-hidden shadow-brutal">
              <img
                src={activeDoctor.avatar}
                alt={activeDoctor.name}
                className="w-full h-full object-cover opacity-90"
              />
              
              <div className="absolute top-3 left-3 bg-black/80 text-white border border-white text-xs font-mono font-bold px-2 py-1">
                {activeDoctor.name} • Certified Geriatrician
              </div>

              <div className="absolute bottom-3 left-3 bg-brutal-mint text-black border-2 border-black text-xs font-black px-2 py-0.5">
                ● WEBRTC ENCRYPTED STREAM (HD)
              </div>

              {/* Patient Picture-in-Picture Self Feed */}
              <div className="absolute bottom-3 right-3 w-28 md:w-36 aspect-video bg-neutral-800 border-2 border-white shadow-brutal-sm flex items-center justify-center text-white text-[11px] font-mono">
                {videoOff ? (
                  <span className="text-gray-400">Camera Off</span>
                ) : (
                  <div className="text-center p-1">
                    <span className="block font-bold">You (Self)</span>
                    <span className="text-[9px] text-green-400">Mic Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Consultation Chat & Doctor Notes */}
            <div className="flex flex-col border-3 border-black bg-brutal-canvas p-3 shadow-brutal h-[320px] md:h-auto">
              <div className="font-black text-xs uppercase tracking-wider border-b-2 border-black pb-1 mb-2 flex items-center gap-1.5">
                <MessageSquare size={14} />
                <span>Live Doctor Notes & Advice</span>
              </div>

              {/* Chat Message Thread */}
              <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
                {callNotes.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`p-2 border-2 border-black ${
                      msg.sender.startsWith('Dr.') 
                        ? 'bg-blue-100 mr-4' 
                        : 'bg-yellow-100 ml-4'
                    }`}
                  >
                    <span className="font-black block text-[10px] uppercase text-gray-700">
                      {msg.sender}
                    </span>
                    <p className="font-medium text-black mt-0.5">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="mt-2 flex gap-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask doctor a question..."
                  className="brutal-input flex-1 p-1.5 text-xs rounded-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="brutal-btn brutal-btn-yellow p-1.5 text-xs"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>

          </div>

          {/* Video / Call Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMicMuted(!micMuted)}
                className={`brutal-btn ${micMuted ? 'brutal-btn-red text-white' : 'brutal-btn-white'} text-xs px-3 py-2`}
              >
                {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
                <span>{micMuted ? 'Unmute' : 'Mute Mic'}</span>
              </button>

              <button
                onClick={() => setVideoOff(!videoOff)}
                className={`brutal-btn ${videoOff ? 'brutal-btn-red text-white' : 'brutal-btn-white'} text-xs px-3 py-2`}
              >
                {videoOff ? <VideoOff size={16} /> : <Video size={16} />}
                <span>{videoOff ? 'Start Video' : 'Stop Video'}</span>
              </button>
            </div>

            {/* Doctor Issue Prescription Action */}
            <div className="flex items-center gap-2">
              {rxIssuedNotice ? (
                <div className="bg-brutal-mint border-2 border-black px-3 py-1.5 font-black text-xs flex items-center gap-1.5">
                  <CheckCircle size={16} />
                  <span>{t.doctors.prescriptionGenerated}!</span>
                </div>
              ) : (
                <button
                  onClick={handleIssuePrescription}
                  className="brutal-btn brutal-btn-yellow text-xs md:text-sm px-4 py-2 font-black"
                >
                  <FileText size={16} />
                  <span>Doctor: Issue Signed Digital Rx</span>
                </button>
              )}
            </div>

          </div>

        </div>
      )}

      {/* State 2: Verified Doctor Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {doctors.map((doc) => (
          <div key={doc.id} className="brutal-card p-5 bg-white flex flex-col justify-between">
            
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-16 h-16 object-cover border-3 border-black shadow-brutal-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-base md:text-lg text-black">{doc.name}</h3>
                      {doc.verified && (
                        <UserCheck size={16} className="text-blue-600 shrink-0" title="Verified Medical Practitioner" />
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-700">{doc.qualification}</p>
                    <span className="inline-block mt-1 bg-brutal-purple border border-black font-mono text-[10px] font-bold px-1.5 py-0.5">
                      {doc.specialty}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-black bg-yellow-100 border border-black px-1.5 py-0.5">
                    <Star size={12} className="fill-black" />
                    <span>{doc.rating}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 block mt-1">
                    {doc.reviewsCount} reviews
                  </span>
                </div>
              </div>

              <p className="text-xs font-medium text-gray-800 mt-3 p-2 bg-brutal-cream border border-black">
                {doc.about}
              </p>

              {/* Meta information */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-bold">
                <div className="flex items-center gap-1 text-gray-700">
                  <Clock size={13} />
                  <span>Exp: {doc.experience}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-700">
                  <Languages size={13} />
                  <span>{doc.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">{t.doctors.fee}</span>
                <span className="font-black text-lg">₹{doc.consultationFee}</span>
              </div>

              <button
                onClick={() => handleStartConsultation(doc)}
                className="brutal-btn brutal-btn-blue text-xs md:text-sm px-4 py-2"
              >
                <Video size={16} />
                <span>{t.doctors.startCall}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
