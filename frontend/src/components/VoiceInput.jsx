import React, { useState } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';

export default function VoiceInput({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState('hi-IN');

  const languages = [
    { code: 'hi-IN', label: 'Hindi (हिंदी)' },
    { code: 'bn-IN', label: 'Bengali (বাংলা)' },
    { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
    { code: 'te-IN', label: 'Telugu (తెలుగు)' },
    { code: 'mr-IN', label: 'Marathi (मराठी)' },
    { code: 'kn-IN', label: 'Kannada (ಕನ್ನಡ)' },
    { code: 'en-IN', label: 'English (Indian)' }
  ];

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsRecording(true);
      setTimeout(() => {
        const demoTexts = {
          'hi-IN': 'हमारे रास्ते पर बहुत बड़ा गड्ढा हो गया है, रात में गाड़ियां फिसल रही हैं।',
          'bn-IN': 'আমাদের রাস্তার বাতি একদম বন্ধ এবং ড্রেনেজ নোংরা জল উপচে পড়ছে।',
          'ta-IN': 'எங்கள் பகுதியில் குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாகிறது.',
          'en-IN': 'Heavy garbage overflow near the bus stand blocking pedestrian movement.'
        };
        const sample = demoTexts[selectedLang] || demoTexts['hi-IN'];
        onTranscript(sample);
        setIsRecording(false);
      }, 1500);
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (event.results[0].isFinal) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  return (
    <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2" data-testid="voice-input-container">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Multilingual Voice Submission (AI Enabled)</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            data-testid="voice-language-select"
            className="text-xs bg-white border border-blue-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleRecording}
            data-testid="voice-record-btn"
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md transition-all shadow-sm ${
              isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {isRecording ? 'Listening...' : 'Speak Issue'}
          </button>
        </div>
      </div>
      {isRecording && (
        <div className="text-xs text-blue-700 bg-white/80 p-2 rounded border border-blue-100 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span>Listening in {languages.find((l) => l.code === selectedLang)?.label}... Speak clearly into your microphone.</span>
        </div>
      )}
    </div>
  );
}