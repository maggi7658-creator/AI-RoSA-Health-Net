// Voice AI: Speech-to-Text & Text-to-Speech Engine for AI-RoSA Health-Net

const LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
  es: 'es-ES'
};

export class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  // Voice Input (Symptom dictation)
  startListening(langCode, onResult, onEnd, onError) {
    if (!this.recognition) {
      console.warn('[AI-RoSA Speech] Web Speech Recognition not available in this browser');
      if (onError) onError('Speech recognition not supported in this browser. Please type symptoms.');
      return false;
    }

    try {
      this.recognition.lang = LANG_MAP[langCode] || 'en-IN';
      
      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (onResult) onResult(transcript);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error('[AI-RoSA Speech] Start error:', err);
      if (onError) onError(err.message);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Voice Output (TTS Read-Aloud for Elderly Users)
  speak(text, langCode = 'en', onEnd = null) {
    if (!this.synthesis) {
      console.warn('[AI-RoSA Speech] SpeechSynthesis not supported');
      return;
    }

    // Cancel any current utterance
    this.synthesis.cancel();

    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[langCode] || 'en-IN';
    
    // Elderly-friendly rate: slightly slower and clear
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    // Pick best matching native voice if available
    const voices = this.synthesis.getVoices();
    const targetLang = LANG_MAP[langCode] || 'en-IN';
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang === targetLang);
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSpeaking() {
    return this.synthesis ? this.synthesis.speaking : false;
  }
}

export const speechService = new SpeechService();
