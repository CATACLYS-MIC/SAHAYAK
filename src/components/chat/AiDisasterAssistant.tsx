import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';
import {
  MessageSquare, Mic, MicOff, Send, X, Volume2, VolumeX,
  Square, ShieldAlert, AlertTriangle, CheckCircle2,
  ExternalLink, Sparkles, Phone, Compass, ChevronDown,
  Maximize2, Minimize2, RefreshCw, Layers, Radio, Sliders,
  Play, Pause, AlertCircle, Landmark, Check, Globe, ShieldCheck
} from 'lucide-react';
import { useTranslation, Language, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { useAppState } from '@/lib/store';
import { useWebSpeech, LANGUAGE_SPEECH_PROFILES } from '@/lib/speech';
import { SpeechAudioWave } from './SpeechAudioWave';
import { VoiceSettingsModal } from './VoiceSettingsModal';
import { CitizenReportModal } from './CitizenReportModal';
import { EmergencyContactsModal } from './EmergencyContactsModal';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  voiceSummary?: string;
  isEmergency?: boolean;
  emergencyType?: string;
  verification?: {
    status: 'Verified' | 'Likely true' | 'Unverified' | 'Misleading' | 'False' | 'Unable to verify';
    claim: string;
    evidence: string;
    sources: string[];
    reasoning: string;
    context: string;
    confidence: 'High' | 'Medium' | 'Low';
    timestamp: string;
  };
  sources?: Array<{
    title: string;
    uri?: string;
    type: string;
  }>;
  actionExecuted?: string;
  suggestedFollowUps?: string[];
}

export function AiDisasterAssistant() {
  const { t, language, setLanguage } = useTranslation();
  const { currentLocation } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();

  // Dialog & Visibility State
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalType, setReportModalType] = useState<'flood' | 'landslide' | 'road_blockage' | 'trapped' | 'fire' | 'general'>('general');
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Conversation State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasEmergencyActive, setHasEmergencyActive] = useState(false);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Speech Controller
  const {
    support,
    isListening,
    isSpeaking,
    isPaused,
    transcript,
    interimTranscript,
    speechError,
    availableVoices,
    activeVoice,
    activeProfile,
    speechRate,
    autoSpeakEnabled,
    autoSendOnSilence,
    currentlySpokenText,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    testVoiceSample,
    setSpeechRate,
    setAutoSpeakEnabled,
    setAutoSendOnSilence,
    setActiveVoice,
    clearError
  } = useWebSpeech(language, {
    onAutoSubmit: (capturedText) => {
      if (capturedText && capturedText.trim()) {
        handleSendMessage(capturedText.trim());
      }
    }
  });

  // When transcript arrives from speech recognition, synchronize with input if not auto-sent
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Listen for global assistant voice open requests
  useEffect(() => {
    const handleGlobalVoiceOpen = () => {
      setIsOpen(true);
      setTimeout(() => {
        startListening();
      }, 250);
    };

    window.addEventListener('sahayak:open-voice-assistant', handleGlobalVoiceOpen);
    return () => {
      window.removeEventListener('sahayak:open-voice-assistant', handleGlobalVoiceOpen);
    };
  }, [startListening]);

  // Initial welcome message based on language
  useEffect(() => {
    if (messages.length === 0) {
      const isNe = language === 'ne';
      const isNew = language === 'new';
      const isMai = language === 'mai';
      const isHi = language === 'hi';

      let welcomeContent = `Hello! I am **SAHAYAK Central AI Disaster Assistant** for Nepal.

I am integrated directly with live national telemetry from **NDRRMA (BIPAD Portal)**, **DHM (River Watch)**, and the **Department of Roads (DOR Navigate)**.

**You can ask me to:**
- 🌊 Check flood warnings & river gauges (*"What is the water level at Narayani?"*)
- 🛣️ Check highway & landslide blockages (*"Is Prithvi Highway open right now?"*)
- 🔍 Verify disaster news & rumors (*"Verify Koshi Barrage rumor"*)
- 🏠 Find nearby evacuation shelters (*"Show me nearby shelters"*)
- 🚨 Report incidents or hazards (*"Report a landslide"*)
- 🎙️ Interact via voice in Nepali, English, Nepal Bhasa, Maithili, or Hindi`;

      let voiceSumm = 'Welcome to SAHAYAK Disaster Assistant. I am ready to assist with real-time disaster intelligence and safety.';
      let followUps = ['Is Prithvi Highway blocked?', 'Verify Koshi Barrage rumor', 'Show nearby evacuation shelters', 'Emergency hotlines'];

      if (isNe) {
        welcomeContent = `नमस्कार! म **सहयाक केन्द्रीय एआई विपद् सहायक (SAHAYAK Central Disaster AI)** हुँ।

म नेपालको राष्ट्रिय विपद् पोर्टलहरू (NDRRMA BIPAD, जल तथा मौसम विज्ञान विभाग DHM, र सडक विभाग DOR) सँग प्रत्यक्ष जोडिएको छु।

**तपाईंले मलाई सोध्न सक्नुहुन्छ:**
- 🌊 बाढी, पहिरो तथा मौसम चेतावनी ("नारायणी नदीमा बाढीको स्थिति के छ?")
- 🛣️ राजमार्ग तथा सडक अवरोध ("पृथ्वी राजमार्ग खुल्यो कि बन्द छ?")
- 🔍 समाचार तथा अफवाह परीक्षण ("के कोशी ब्यारेज फुट्ने हल्ला साँचो हो?")
- 🏠 नजिकैका सुरक्षित आश्रयस्थल वा आपतकालीन सम्पर्क नम्बरहरू
- 🚨 विपद् वा सडक अवरोध दर्ता ("पहिरो रिपोर्ट गर्नुहोस्")
- 🎙️ आवाज वा पाठ दुवै माध्यमबाट कुराकानी गर्नुहोस्`;
        voiceSumm = 'नमस्कार, म सहयाक विपद् सहायक हुँ। म तपाईंलाई विपद् सुरक्षा र जानकारीमा मद्दत गर्न सक्छु।';
        followUps = ['पृथ्वी राजमार्गको स्थिति के छ?', 'कोशी ब्यारेजको हल्ला साँचो हो?', 'नजिकैका सुरक्षित आश्रयस्थल', 'आपतकालीन नम्बरहरू देखाउनुहोस्'];
      } else if (isNew) {
        welcomeContent = `ज्वजलपा! जि **सहयाक केन्द्रीय एआई विपद् सहायक (SAHAYAK Disaster AI)** खः।

जि नेपालया राष्ट्रिय विपद् पोर्टलत (NDRRMA BIPAD, जल तथा मौसम विज्ञान विभाग DHM, व सडक विभाग DOR) नापं प्रत्यक्ष स्वानाच्वनागु दु।

**छिं जितः न्यनेफु:**
- 🌊 खुसिबाढी, चलः व मौसम सूचना ("नारायणी खुसिया स्थिति गथे दु?")
- 🛣️ राजमार्ग व लँ पनेगु अवस्था ("पृथ्वी राजमार्ग चालु दु ला?")
- 🔍 खँ व हल्लाया सत्यता परीक्षण ("कोशी ब्यारेजया खँ साँचो खः ला?")
- 🏠 सतिक च्वंगु सुरक्षित बासस्थान वा आपतकालीन नम्बरत
- 🎙️ न्ववानाः वा च्वयाः संवाद यानादिसँ`;
        voiceSumm = 'ज्वजलपा, जि सहयाक विपद् सहायक खः। जिं छितः बाढी, चलः व सुरक्षाया जानकारी बीफु।';
        followUps = ['पृथ्वी राजमार्गया स्थिति छु दु?', 'कोशी ब्यारेजया हल्ला साँचो खः ला?', 'सतिक च्वंगु सुरक्षित थाय्', 'आपतकालीन नम्बर'];
      } else if (isMai) {
        welcomeContent = `प्रणाम! हम **सहयाक केन्द्रीय एआई आपदा सहायक (SAHAYAK Disaster AI)** छी।

हम नेपालक राष्ट्रिय आपदा पोर्टल (NDRRMA BIPAD, जल तथा मौसम विज्ञान विभाग DHM, आ सडक विभाग DOR) सँ सीधा जुडल छी।

**अहाँ हमरा सँ पुछि सकैत छी:**
- 🌊 बाढि, पहिर आ मौसम चेतावनी ("नारायणी नदीमे बाढिक स्थिति की अछि?")
- 🛣️ राजमार्ग आ सडक अवरोध ("पृथ्वी राजमार्ग खुलल अछि कि बन्द?")
- 🔍 समाचार आ अफवाह परीक्षण ("कोशी ब्यारेज केर अफवाह सत्य अछि?")
- 🏠 निकटतम सुरक्षित आश्रयस्थल वा आपातकालीन सम्पर्क नम्बर
- 🎙️ आवाज वा पाठ दुनू माध्यम सँ संवाद करू`;
        voiceSumm = 'प्रणाम, हम सहयाक आपदा सहायक छी। अहाँ बाढि, सडक आ आश्रयस्थल केर जानकारी लऽ सकैत छी।';
        followUps = ['पृथ्वी राजमार्गक स्थिति की अछि?', 'कोशी ब्यारेज केर अफवाह साँच अछि?', 'निकटतम सुरक्षित आश्रयस्थल', 'आपातकालीन सम्पर्क'];
      } else if (isHi) {
        welcomeContent = `नमस्ते! मैं **सहायक केन्द्रीय एआई आपदा मित्र (SAHAYAK Disaster AI)** हूँ।

मैं नेपाल के राष्ट्रीय आपदा पोर्टलों (NDRRMA BIPAD, जल तथा मौसम विज्ञान विभाग DHM, और सड़क विभाग DOR) से सीधे जुड़ा हुआ हूँ।

**आप मुझसे पूछ सकते हैं:**
- 🌊 बाढ़, भूस्खलन और मौसम चेतावनियाँ ("नारायणी नदी में जलस्तर क्या है?")
- 🛣️ राजमार्ग और सड़क अवरोध स्थिति ("पृथ्वी राजमार्ग खुला है या बंद?")
- 🔍 समाचार और अफवाह सत्यापन ("क्या कोशी बैराज की अफवाह सच है?")
- 🏠 नजदीकी सुरक्षित आश्रय स्थल और आपातकालीन नंबर
- 🎙️ आवाज (Voice) या टेक्स्ट दोनों में सहायता प्राप्त करें`;
        voiceSumm = 'नमस्ते! मैं सहायक आपदा मित्र हूँ। मैं आपको बाढ़, भूस्खलन और सुरक्षित आश्रयों की सटीक जानकारी दे सकता हूँ।';
        followUps = ['पृथ्वी राजमार्ग की स्थिति क्या है?', 'कोशी बैराज की अफवाह सच है?', 'नजदीकी सुरक्षित आश्रय स्थल', 'आपातकालीन हेल्पलाइन'];
      }

      setMessages([
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: welcomeContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          voiceSummary: voiceSumm,
          suggestedFollowUps: followUps
        }
      ]);
    }
  }, [language]);

  // Dispatch App Action triggered by Assistant
  const executeAppAction = (action?: { type: string; payload?: any; feedbackMessage?: string }) => {
    if (!action || !action.type || action.type === 'NONE') return undefined;

    const msg = action.feedbackMessage || 'Action executed';

    switch (action.type) {
      case 'NAVIGATE':
        if (action.payload?.path) {
          navigate(action.payload.path);
        }
        break;

      case 'SET_LANGUAGE':
        if (action.payload?.language) {
          setLanguage(action.payload.language as Language);
        }
        break;

      case 'OPEN_REPORT_MODAL':
        setReportModalType(action.payload?.disasterType || 'general');
        setShowReportModal(true);
        break;

      case 'SHOW_EMERGENCY_CONTACTS':
        setShowContactsModal(true);
        break;

      case 'SHOW_SHELTERS':
        navigate('/facilities');
        break;

      case 'SHOW_DOR_ROADS':
        navigate('/routes');
        break;

      case 'SHOW_DHM_FLOOD':
        navigate('/weather-risk');
        break;

      default:
        break;
    }

    return msg;
  };

  // Send Message handler
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText || isLoading) return;

    // Reset input
    setInputValue('');
    stopListening();
    stopSpeaking();
    clearError();

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          })),
          language,
          currentLocationName: currentLocation?.name || 'Kathmandu',
          currentLocationId: currentLocation?.id || 'loc-1',
          currentPath: location.pathname,
          isVoiceMode: isListening
        })
      });

      const data = await res.json();

      let actionExecutedFeedback: string | undefined = undefined;
      if (data.action && data.action.type !== 'NONE') {
        actionExecutedFeedback = executeAppAction(data.action);
      }

      if (data.isEmergency) {
        setHasEmergencyActive(true);
      }

      const assistantMessage: Message = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Information retrieved.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        voiceSummary: data.voiceSummary,
        isEmergency: data.isEmergency,
        emergencyType: data.emergencyType,
        verification: data.verification,
        sources: data.sources,
        actionExecuted: actionExecutedFeedback,
        suggestedFollowUps: data.suggestedFollowUps
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Automatically speak voice summary or reply if autoSpeakEnabled
      if (autoSpeakEnabled) {
        speak(data.voiceSummary || data.reply);
      }
    } catch (err) {
      console.warn('Assistant request failed:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: language === 'ne'
          ? 'माफ गर्नुहोस्, नेटवर्कमा समस्या आयो। कृपया पुन: प्रयास गर्नुहोस् वा सिधै आपतकालीन हटलाइन ११४९ मा सम्पर्क गर्नुहोस्।'
          : 'Network interruption encountered. Please retry or dial national emergency helpline 1149 directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Likely true':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Unverified':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Misleading':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'False':
        return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <>
      {/* 1. Global Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[2000] flex items-center space-x-2 group">
          {/* Quick Voice Trigger Pill */}
          <button
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => startListening(), 250);
            }}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-lg hover:border-red-500 transition-all hover:scale-105"
            title={`Ask SAHAYAK by Voice (${activeProfile.nativeName})`}
          >
            <Mic className="h-3.5 w-3.5 text-red-500 animate-pulse" />
            <span>Voice AI ({activeProfile.nativeName})</span>
          </button>

          {/* Main Floating Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/30"
            aria-label="Open SAHAYAK Disaster Assistant"
          >
            {/* Beacon Pulse Ring */}
            <span className="absolute -inset-1 rounded-full bg-red-500 opacity-40 animate-ping pointer-events-none" />
            <MessageSquare className="h-6 w-6 relative z-10" />
            
            {/* Telemetry live beacon dot */}
            <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 z-10" />
          </button>
        </div>
      )}

      {/* 2. Chatbot Dialog Panel */}
      {isOpen && (
        <div
          className={`fixed z-[2000] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 flex flex-col ${
            isExpanded
              ? 'inset-4 sm:inset-10 rounded-2xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[490px] h-[660px] max-h-[90vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 rounded-t-2xl shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="relative p-2 rounded-xl bg-red-600 text-white shadow-xs">
                <ShieldAlert className="h-5 w-5" />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    SAHAYAK Disaster AI
                  </h3>
                  <span className="px-1.5 py-0.5 text-[10px] font-black rounded-sm bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 uppercase tracking-wider">
                    {activeProfile.primaryRecognitionTag}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                  <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                  <span>DHM • NDRRMA • DOR Grounded</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {/* Language Selector Quick Pill */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                title="Change Assistant Language"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>

              {/* Audio Stop Button (when speaking) */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-200 transition-colors animate-pulse"
                  title="Stop voice readout"
                >
                  <Square className="h-4 w-4 fill-current" />
                </button>
              )}

              {/* Voice Settings Button */}
              <button
                onClick={() => setShowVoiceSettings(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Voice & Speech Settings"
              >
                <Sliders className="h-4 w-4" />
              </button>

              {/* Expand / Shrink */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Restore window size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  stopSpeaking();
                  stopListening();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Emergency Hotline Strip */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold shrink-0 shadow-xs">
            <span className="flex items-center space-x-1.5">
              <Phone className="h-3 w-3 animate-pulse" />
              <span>Emergency Hotlines:</span>
            </span>
            <div className="flex items-center space-x-2">
              <a href="tel:100" className="hover:underline px-1.5 py-0.5 rounded-sm bg-white/20">Police 100</a>
              <a href="tel:102" className="hover:underline px-1.5 py-0.5 rounded-sm bg-white/20">Ambulance 102</a>
              <a href="tel:101" className="hover:underline px-1.5 py-0.5 rounded-sm bg-white/20">Fire 101</a>
              <a href="tel:1149" className="hover:underline px-1.5 py-0.5 rounded-sm bg-white/20">NEOC 1149</a>
              <button
                onClick={() => setShowContactsModal(true)}
                className="hover:underline ml-1 font-extrabold"
              >
                More »
              </button>
            </div>
          </div>

          {/* Speech Error Banner if any */}
          {speechError && (
            <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>{speechError}</span>
              </div>
              <button
                onClick={clearError}
                className="text-amber-600 hover:text-amber-800 font-bold ml-2 text-[10px]"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Emergency Alert Banner (if emergency query occurred) */}
          {hasEmergencyActive && (
            <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-900/60 flex items-center justify-between animate-in slide-in-from-top duration-300">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 animate-bounce" />
                <span className="text-xs font-bold text-red-800 dark:text-red-200">
                  Urgent Emergency Directives Active
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href="tel:100"
                  className="px-2 py-1 text-[10px] font-bold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Call 100
                </a>
                <button
                  onClick={() => navigate('/facilities')}
                  className="px-2 py-1 text-[10px] font-bold rounded-md bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 transition-colors"
                >
                  Find Shelters
                </button>
              </div>
            </div>
          )}

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-950/20">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              const textBeingSpoken = msg.voiceSummary || msg.content;
              const isCurrentPlaying = isSpeaking && currentlySpokenText === textBeingSpoken;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center space-x-1.5 mb-1.5 text-[10px] font-medium text-slate-400 px-1">
                    <span>{isAssistant ? 'SAHAYAK Disaster AI' : 'You'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Bubble Container */}
                  <div
                    className={`rounded-2xl transition-all ${
                      isAssistant
                        ? msg.isEmergency
                          ? 'w-full max-w-[95%] sm:max-w-[90%] bg-red-50/90 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 text-slate-900 dark:text-slate-100 shadow-md p-4 sm:p-5 space-y-3 rounded-tl-xs'
                          : 'w-full max-w-[95%] sm:max-w-[90%] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm p-4 sm:p-5 space-y-3 rounded-tl-xs'
                        : 'bg-red-600 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] sm:max-w-[80%] shadow-xs font-medium text-xs sm:text-sm leading-relaxed'
                    }`}
                  >
                    {/* Assistant Card Header Tag */}
                    {isAssistant && (
                      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 rounded-md bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                            S
                          </div>
                          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100">
                            Nepal Disaster Response AI
                          </span>
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200/80 dark:border-emerald-800/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Telemetry Grounded
                          </span>
                        </div>
                        {msg.isEmergency && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-red-600 text-white animate-pulse">
                            🚨 High Priority
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Executed Banner */}
                    {msg.actionExecuted && (
                      <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{msg.actionExecuted}</span>
                      </div>
                    )}

                    {/* News Verification Card */}
                    {msg.verification && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3 text-red-500" />
                            Official Fact Check
                          </span>
                          <span className={`px-2.5 py-0.5 text-xs font-black rounded-full border ${getVerificationBadge(msg.verification.status)}`}>
                            {msg.verification.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">1. Claim: </span>
                            <span className="text-slate-600 dark:text-slate-400">{msg.verification.claim}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">2. Evidence: </span>
                            <span className="text-slate-600 dark:text-slate-400">{msg.verification.evidence}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">3. Source(s): </span>
                            <span className="text-slate-600 dark:text-slate-400">{msg.verification.sources?.join('; ')}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">4. Reasoning: </span>
                            <span className="text-slate-600 dark:text-slate-400">{msg.verification.reasoning}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">5. Important context: </span>
                            <span className="text-slate-600 dark:text-slate-400">{msg.verification.context}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>Confidence: <strong className="text-slate-700 dark:text-slate-300">{msg.verification.confidence}</strong></span>
                            <span>{new Date(msg.verification.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message Body (Markdown rendered for Assistant, plain text for User) */}
                    {isAssistant ? (
                      <div className="markdown-body text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                        <Markdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-3 mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-2.5 mb-1 flex items-center gap-1.5">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1 flex items-center gap-1.5">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2 last:mb-0">
                                {children}
                              </p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-slate-900 dark:text-white">
                                {children}
                              </strong>
                            ),
                            ul: ({ children }) => (
                              <ul className="space-y-1.5 my-2 pl-0.5 list-none">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="space-y-1.5 my-2 pl-4 list-decimal text-slate-700 dark:text-slate-300">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex items-start space-x-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                                <div className="flex-1">{children}</div>
                              </li>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                              >
                                <span>{children}</span>
                                <ExternalLink className="h-2.5 w-2.5 inline shrink-0" />
                              </a>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-3 border-red-500 pl-3 my-2 text-xs italic text-slate-600 dark:text-slate-400 bg-red-50/60 dark:bg-red-950/20 py-1.5 rounded-r">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children }) => (
                              <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 font-mono text-[11px] font-semibold">
                                {children}
                              </code>
                            )
                          }}
                        >
                          {msg.content}
                        </Markdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-medium">
                        {msg.content}
                      </div>
                    )}

                    {/* Sourced Reference Links & Telemetry Cards */}
                    {isAssistant && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5">
                            <Landmark className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                              Verified Official Sources & Grounding
                            </span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                            Official Registry
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {msg.sources.map((src, idx) => (
                            <a
                              key={idx}
                              href={src.uri || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 transition-all text-xs"
                            >
                              <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                {src.title}
                              </span>
                              <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-500 shrink-0 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audio Playback Trigger on Assistant Response */}
                    {isAssistant && support.speechSynthesis && (
                      <div className="mt-2.5 pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                        {isCurrentPlaying ? (
                          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-semibold">
                            <SpeechAudioWave isActive={true} color="red" barCount={5} />
                            <span>Reading aloud ({activeProfile.nativeName})...</span>
                            <button
                              onClick={stopSpeaking}
                              className="ml-2 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950/70 hover:bg-red-200 text-red-700 dark:text-red-300 text-[10px] font-bold"
                            >
                              Stop
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => speak(textBeingSpoken)}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/70 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors font-medium"
                            title={`Listen in ${activeProfile.name}`}
                          >
                            <Volume2 className="h-3.5 w-3.5 text-red-500" />
                            <span>Listen in {activeProfile.nativeName}</span>
                          </button>
                        )}
                        <span className="text-[10px] text-slate-400">
                          Voice AI • {activeVoice?.name ? activeVoice.name.slice(0, 15) : activeProfile.primaryRecognitionTag}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Suggested Follow-ups Chips */}
                  {isAssistant && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 px-1 max-w-[92%]">
                      {msg.suggestedFollowUps.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(chip)}
                          className="px-3 py-1 text-[11px] font-medium rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 shadow-2xs hover:shadow-xs transition-all text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Typing Indicator */}
            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 max-w-[320px] shadow-xs">
                <div className="flex space-x-1">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-xs font-medium">Grounding with DHM, DOR & NDRRMA...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggested Prompts Strip (Bottom) */}
          <div className="px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200/80 dark:border-slate-800 flex items-center space-x-1.5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
            <button
              onClick={() => handleSendMessage('Is there flood in Sindhupalchok?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-500 hover:text-red-600 transition-colors font-medium"
            >
              🌊 Sindhupalchok Flood Status
            </button>
            <button
              onClick={() => handleSendMessage('Is Prithvi Highway blocked?')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-500 hover:text-red-600 transition-colors font-medium"
            >
              🛣️ Prithvi Highway Status
            </button>
            <button
              onClick={() => handleSendMessage('Show me nearby shelters')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-500 hover:text-red-600 transition-colors font-medium"
            >
              🏠 Nearby Shelters
            </button>
            <button
              onClick={() => handleSendMessage('Verify Koshi Barrage rumor')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-red-500 hover:text-red-600 transition-colors font-medium"
            >
              🔍 Verify News Claim
            </button>
            <button
              onClick={() => {
                setReportModalType('landslide');
                setShowReportModal(true);
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 transition-colors font-bold"
            >
              🚨 Report Hazard
            </button>
          </div>

          {/* Live Voice-to-Text Status & Transcription Strip */}
          {isListening && (
            <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/60 border-t border-red-200 dark:border-red-800 flex flex-col space-y-1 shrink-0">
              <div className="flex items-center justify-between text-xs text-red-700 dark:text-red-300">
                <div className="flex items-center space-x-2">
                  <SpeechAudioWave isActive={true} color="red" barCount={7} />
                  <span className="font-bold">
                    Listening ({activeProfile.nativeName} • {activeProfile.primaryRecognitionTag})...
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {autoSendOnSilence && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 font-semibold">
                      Auto-Send on pause
                    </span>
                  )}
                  <button
                    onClick={stopListening}
                    className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold hover:bg-red-700"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Real-time interim transcript preview */}
              <div className="text-xs text-slate-700 dark:text-slate-200 italic truncate font-medium">
                {interimTranscript || transcript || 'Speak your question or report now...'}
              </div>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              {/* Voice Mic Button */}
              {support.speechRecognition ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening
                      ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-400 animate-pulse'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title={
                    isListening
                      ? 'Stop Voice Input'
                      : `Voice Input (${activeProfile.nativeName} • ${activeProfile.primaryRecognitionTag})`
                  }
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-red-500" />}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or an Android browser.')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                  title="Web Speech Recognition unsupported"
                >
                  <MicOff className="h-4 w-4" />
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isListening
                    ? `Listening in ${activeProfile.nativeName}... speak now`
                    : language === 'ne'
                    ? 'विपद् सम्बन्धी सोध्नुहोस् वा निर्देशन दिनुहोस्...'
                    : language === 'new'
                    ? 'विपद् व सुरक्षा सम्बन्धी न्यनादिसँ...'
                    : language === 'mai'
                    ? 'आपदा आ सडक स्थितिक बारेमे पुछू...'
                    : language === 'hi'
                    ? 'आपदा, सड़क या सुरक्षित आश्रयों के बारे में पूछें...'
                    : 'Ask about disasters, road status, shelters, or verify news...'
                }
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white shadow-xs transition-all"
                title="Send Message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        language={language}
        onLanguageChange={setLanguage}
        speechRate={speechRate}
        onSpeechRateChange={setSpeechRate}
        autoSpeak={autoSpeakEnabled}
        onAutoSpeakChange={setAutoSpeakEnabled}
        autoSend={autoSendOnSilence}
        onAutoSendChange={setAutoSendOnSilence}
        availableVoices={availableVoices}
        activeVoice={activeVoice}
        onVoiceSelect={setActiveVoice}
        isSpeaking={isSpeaking}
        onTestVoice={() => testVoiceSample(language)}
        onStopSpeaking={stopSpeaking}
      />

      {/* 4. Global Modals Triggerable Directly by the Assistant */}
      <CitizenReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        initialDisasterType={reportModalType}
      />

      <EmergencyContactsModal
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
      />
    </>
  );
}
