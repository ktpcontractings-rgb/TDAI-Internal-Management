import { useState, useRef, useEffect } from 'react';

interface VoiceChatProps {
  agentName: string;
  onVoiceInput: (text: string) => void;
  onClose: () => void;
  isAgentSpeaking: boolean;
  lastAgentMessage: string;
}

export function VoiceChat({ 
  agentName, 
  onVoiceInput, 
  onClose,
  isAgentSpeaking,
  lastAgentMessage 
}: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        // If final result, send to chat
        if (event.results[current].isFinal) {
          onVoiceInput(transcriptText);
          setTranscript('');
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [onVoiceInput]);

  // Play agent response using text-to-speech
  useEffect(() => {
    if (lastAgentMessage && isAgentSpeaking) {
      playAgentVoice(lastAgentMessage);
    }
  }, [lastAgentMessage, isAgentSpeaking]);

  const playAgentVoice = async (text: string) => {
    try {
      // Use browser's built-in speech synthesis for now (free, no API key needed)
      // Can be upgraded to ElevenLabs API later with API key
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Try to use a professional-sounding voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.lang.startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Text-to-speech error:', err);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setError('');
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const stopAgentSpeaking = () => {
    speechSynthesis.cancel();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-white/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Voice Chat</h2>
          <p className="text-gray-300 mb-6">with {agentName}</p>
          
          {/* Voice Indicator */}
          <div className="mb-6">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl transition-all ${
              isListening 
                ? 'bg-gradient-to-br from-green-600 to-emerald-600 animate-pulse' 
                : isAgentSpeaking
                ? 'bg-gradient-to-br from-purple-600 to-pink-600 animate-pulse'
                : 'bg-white/10'
            }`}>
              {isListening ? '🎤' : isAgentSpeaking ? '🔊' : '💬'}
            </div>
            <p className="text-gray-300 mt-4 min-h-[24px]">
              {isListening 
                ? 'Listening...' 
                : isAgentSpeaking 
                ? 'Agent is speaking...' 
                : 'Ready to chat'}
            </p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="mb-4 p-4 bg-white/10 rounded-xl">
              <p className="text-white text-sm">{transcript}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-3">
            {!isListening && !isAgentSpeaking && (
              <button
                onClick={startListening}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                🎤 Start Speaking
              </button>
            )}

            {isListening && (
              <button
                onClick={stopListening}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all"
              >
                ⏹️ Stop Recording
              </button>
            )}

            {isAgentSpeaking && (
              <button
                onClick={stopAgentSpeaking}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all"
              >
                🔇 Stop Agent
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full px-6 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Close Voice Chat
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-300 text-sm">
              <strong>How it works:</strong> Click "Start Speaking" to ask your question. 
              The agent will respond with voice automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
