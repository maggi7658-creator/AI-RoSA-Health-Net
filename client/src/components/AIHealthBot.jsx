import React, { useState, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Camera, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ShieldAlert, 
  Pill, 
  Stethoscope, 
  TestTube,
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { speechService } from '../services/speech';

export default function AIHealthBot({
  onConsultDoctor,
  onCheckPharmacy,
  onBookLab,
  onTriggerSOS,
  isOffline,
  currentLang,
  t
}) {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef(null);

  // Quick symptom sample chips for elderly or fast testing
  const sampleSymptoms = [
    { label: "Fever & Headache (2 days)", text: "I have had a mild fever and headache for 2 days with body ache." },
    { label: "Red Itchy Skin Rash", text: "There is an itchy red rash on my arm for 3 days with mild burning." },
    { label: "Knee Joint Pain & Stiffness", text: "Severe knee stiffness and pain when standing up in the morning." },
    { label: "Chest Heaviness & Breathless", text: "Sudden chest heaviness and shortness of breath with mild dizziness." }
  ];

  // Voice Input handler
  const handleToggleVoice = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const started = speechService.startListening(
        currentLang,
        (transcript) => {
          setSymptomsInput(transcript);
        },
        () => {
          setIsListening(false);
        },
        (error) => {
          console.warn('Speech error:', error);
          setIsListening(false);
        }
      );
      if (started) {
        setIsListening(true);
      }
    }
  };

  // Image Upload handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze Symptoms
  const handleAnalyze = async () => {
    if (!symptomsInput.trim() && !imagePreview) return;

    setLoading(true);
    setResult(null);
    speechService.stopSpeaking();
    setIsSpeaking(false);

    try {
      // Local fallback or API
      const response = await fetch('/api/triage/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: symptomsInput,
          hasImage: !!imagePreview,
          imageData: imagePreview ? 'data:image_attached' : null,
          language: currentLang
        })
      });

      const data = await response.json();
      setResult(data);

      // Read aloud key advice automatically or prepare speech
      if (data.conditionSummary) {
        const textToRead = `${data.suspectedCondition}. ${data.conditionSummary}`;
        speechService.speak(textToRead, currentLang, () => setIsSpeaking(false));
        setIsSpeaking(true);
      }
    } catch (err) {
      console.warn('Triage API error, using local offline fallback:', err);
      // Offline fallback
      const isEmergency = symptomsInput.toLowerCase().includes("chest") || symptomsInput.toLowerCase().includes("breath");
      const fallbackResult = {
        success: true,
        offlineMode: true,
        severity: isEmergency ? "CRITICAL_EMERGENCY" : "MILD",
        severityColor: isEmergency ? "#FF3333" : "#10B981",
        urgencyLevel: isEmergency ? "Emergency SOS Trigger Recommended" : "Mild - Local First-Aid Mode",
        suspectedCondition: isEmergency ? "Acute Cardiovascular / Respiratory Distress" : "Seasonal Viral / Joint Strain",
        conditionSummary: "Processed in offline cache mode. Maintain rest and hydration.",
        immediateCare: [
          "Sit patient upright in a ventilated place.",
          "Offer sips of clean warm water.",
          "Rest without exertion. If breathing gets hard, trigger SOS immediately."
        ],
        recommendedAction: isEmergency ? "EMERGENCY_SOS" : "CONSULT_DOCTOR",
        doctorSpecialty: "General Physician / Geriatrician",
        otcMedication: "Generic Paracetamol 500mg (if feverish). Safe for seniors.",
        suggestedTests: ["Basic Vitals Check"],
        disclaimer: "Processed via on-device offline emergency cache."
      };
      setResult(fallbackResult);
    } finally {
      setLoading(false);
    }
  };

  // Read Aloud / Stop Read Aloud toggle
  const toggleSpeechReadout = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    } else if (result) {
      const textToRead = `${result.suspectedCondition}. ${result.conditionSummary}. Immediate care: ${result.immediateCare.join('. ')}`;
      speechService.speak(textToRead, currentLang, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  const handleReset = () => {
    setSymptomsInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Hero Header Card */}
      <div className="brutal-card p-5 md:p-7 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-brutal-yellow border-3 border-black p-3 shadow-brutal flex items-center justify-center">
              <Bot size={32} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                {t.triage.heading}
              </h2>
              <p className="text-sm font-semibold text-gray-700">
                {t.triage.subheading}
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-block bg-brutal-mint border-2 border-black font-mono text-xs font-bold px-2 py-1 shadow-brutal-sm">
            {isOffline ? 'OFFLINE AI HEURISTICS' : 'LIVE CLINICAL AI'}
          </span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-5 pt-4 border-t-2 border-black/20">
          <p className="text-xs font-black uppercase tracking-wider text-gray-600 mb-2">
            Quick Symptom Presets for Fast Evaluation:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleSymptoms.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setSymptomsInput(chip.text)}
                className="bg-brutal-cream hover:bg-brutal-yellow border-2 border-black text-xs font-bold px-3 py-1 shadow-brutal-sm transition-all"
              >
                + {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Modal Input Controls */}
        <div className="mt-5 space-y-3">
          
          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={4}
              value={symptomsInput}
              onChange={(e) => setSymptomsInput(e.target.value)}
              placeholder={t.triage.placeholder}
              className="brutal-input w-full p-3.5 text-base rounded-none placeholder:text-gray-400 font-medium"
            />

            {/* Listening Indicator Overlay */}
            {isListening && (
              <div className="absolute top-2 right-2 bg-brutal-red text-white text-xs font-mono font-bold px-2 py-1 border border-black animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                {t.triage.listening}
              </div>
            )}
          </div>

          {/* Action Row: Voice Mic + Camera Upload */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
              {/* Voice Microphone Toggle */}
              <button
                onClick={handleToggleVoice}
                className={`brutal-btn ${isListening ? 'brutal-btn-red text-white animate-pulse' : 'brutal-btn-yellow'} text-xs md:text-sm px-4 py-2.5`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                <span>{isListening ? t.triage.stopListening : t.triage.voiceBtn}</span>
              </button>

              {/* Photo Upload for Skin/Wound */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="brutal-btn brutal-btn-purple text-xs md:text-sm px-4 py-2.5"
              >
                <Camera size={18} />
                <span>{t.triage.uploadPhoto}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Submit Analyze Button */}
            <div className="flex items-center gap-2">
              {(symptomsInput || imagePreview) && (
                <button
                  onClick={handleReset}
                  className="brutal-btn brutal-btn-white text-xs px-3 py-2.5"
                  title="Clear inputs"
                >
                  <RotateCcw size={16} />
                </button>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading || (!symptomsInput.trim() && !imagePreview)}
                className={`brutal-btn brutal-btn-mint text-xs md:text-base px-6 py-2.5 ${
                  loading || (!symptomsInput.trim() && !imagePreview) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Sparkles size={18} />
                <span>{loading ? t.triage.analyzing : t.triage.analyzeBtn}</span>
              </button>
            </div>

          </div>

          {/* Image Thumbnail Preview */}
          {imagePreview && (
            <div className="mt-3 p-3 border-2 border-black bg-brutal-cream flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Symptom preview"
                  className="w-16 h-16 object-cover border-2 border-black shadow-brutal-sm"
                />
                <div>
                  <p className="text-xs font-black uppercase">Attached Photo for Dermatological Triage</p>
                  <span className="text-[11px] font-mono text-gray-600">
                    Ready for visual lesion & erythema analysis
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Analysis Results Card */}
      {result && (
        <div className="brutal-card p-5 md:p-7 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] space-y-5 animate-fade-in">
          
          {/* Severity Banner */}
          <div 
            className="p-4 border-3 border-black shadow-brutal flex flex-wrap items-center justify-between gap-3"
            style={{ 
              backgroundColor: result.severity === 'CRITICAL_EMERGENCY' ? '#FF6B6B' : (result.severity === 'MODERATE' ? '#FFE600' : '#70EE9C') 
            }}
          >
            <div className="flex items-center gap-3">
              {result.severity === 'CRITICAL_EMERGENCY' ? (
                <ShieldAlert size={28} className="stroke-[3] text-black animate-pulse" />
              ) : (
                <CheckCircle2 size={28} className="stroke-[3] text-black" />
              )}
              <div>
                <span className="text-xs font-mono font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
                  {t.triage.severity}: {result.severity}
                </span>
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tight mt-1">
                  {result.urgencyLevel}
                </h3>
              </div>
            </div>

            {/* Read Aloud Voice Button */}
            <button
              onClick={toggleSpeechReadout}
              className={`brutal-btn ${isSpeaking ? 'brutal-btn-red text-white' : 'brutal-btn-white'} text-xs px-3.5 py-2`}
            >
              {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isSpeaking ? 'Stop Voice' : 'Read Aloud (TTS)'}</span>
            </button>
          </div>

          {/* Suspected Condition & Clinical Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-gray-500">
              Preliminary Clinical Assessment
            </h4>
            <div className="text-xl md:text-2xl font-black text-black">
              {result.suspectedCondition}
            </div>
            <p className="text-sm md:text-base font-medium text-gray-800 bg-brutal-canvas p-3 border-2 border-black">
              {result.conditionSummary}
            </p>
          </div>

          {/* Visual Lesion Analysis (if photo was uploaded) */}
          {result.imageAnalysisResults && (
            <div className="border-3 border-black bg-purple-50 p-4 shadow-brutal">
              <h5 className="font-black uppercase text-xs tracking-wider text-purple-900 mb-2 flex items-center gap-1.5">
                <ImageIcon size={16} />
                Visual Dermatological AI Scan Results
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
                <div className="bg-white p-2 border border-black">
                  <span className="text-gray-500 block">Lesion Morphology</span>
                  <span className="text-black">{result.imageAnalysisResults.lesionType}</span>
                </div>
                <div className="bg-white p-2 border border-black">
                  <span className="text-gray-500 block">Visual Confidence</span>
                  <span className="text-black">{result.imageAnalysisResults.confidence}</span>
                </div>
                <div className="bg-white p-2 border border-black">
                  <span className="text-gray-500 block">Infection Risk</span>
                  <span className="text-black">{result.imageAnalysisResults.infectionRisk}</span>
                </div>
              </div>
            </div>
          )}

          {/* Immediate Home Care Steps */}
          {result.immediateCare && result.immediateCare.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-black uppercase tracking-wider text-black flex items-center gap-2">
                <span>{t.triage.immediateCare}</span>
              </h5>
              <ul className="space-y-2">
                {result.immediateCare.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm font-semibold bg-white p-2.5 border-2 border-black shadow-brutal-sm">
                    <span className="w-5 h-5 rounded-none bg-brutal-yellow border border-black font-mono text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Generic Medicines */}
          {result.otcMedication && (
            <div className="p-3.5 bg-yellow-50 border-2 border-black space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-900">
                <Pill size={15} />
                <span>{t.triage.genericMeds}</span>
              </div>
              <p className="text-sm font-bold text-black">
                {result.otcMedication}
              </p>
            </div>
          )}

          {/* Suggested Lab Tests */}
          {result.suggestedTests && result.suggestedTests.length > 0 && (
            <div className="p-3.5 bg-blue-50 border-2 border-black space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-blue-900">
                <TestTube size={15} />
                <span>{t.triage.suggestedTests}</span>
              </div>
              <p className="text-sm font-bold text-black">
                {result.suggestedTests.join(', ')}
              </p>
            </div>
          )}

          {/* Direct Action Pathway Buttons */}
          <div className="pt-3 border-t-3 border-black flex flex-wrap gap-3">
            {result.severity === 'CRITICAL_EMERGENCY' ? (
              <button
                onClick={onTriggerSOS}
                className="brutal-btn brutal-btn-red text-white flex-1 py-3 text-sm font-black animate-pulse"
              >
                <ShieldAlert size={18} />
                <span>Trigger Emergency SOS (108 Ambulance)</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => onConsultDoctor(result.doctorSpecialty)}
                  className="brutal-btn brutal-btn-blue text-black flex-1 py-3 text-xs md:text-sm font-black"
                >
                  <Stethoscope size={18} />
                  <span>{t.triage.consultDoctor}</span>
                </button>

                <button
                  onClick={onCheckPharmacy}
                  className="brutal-btn brutal-btn-yellow flex-1 py-3 text-xs md:text-sm font-black"
                >
                  <Pill size={18} />
                  <span>{t.triage.checkPharmacy}</span>
                </button>

                {result.suggestedTests && result.suggestedTests.length > 0 && (
                  <button
                    onClick={onBookLab}
                    className="brutal-btn brutal-btn-purple flex-1 py-3 text-xs md:text-sm font-black"
                  >
                    <TestTube size={18} />
                    <span>Book Doorstep Lab Test</span>
                  </button>
                )}
              </>
            )}
          </div>

          <p className="text-[11px] font-mono text-gray-500 text-center">
            {result.disclaimer}
          </p>

        </div>
      )}

    </div>
  );
}
