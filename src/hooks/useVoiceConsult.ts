import { useState, useEffect, useCallback } from 'react';
import { getConsultationResponse } from '../services/gemini';

export const useVoiceConsult = (isActive: boolean) => {
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isConsultantThinking, setIsConsultantThinking] = useState(false);

  const handleVoiceQuery = useCallback(async (query: string) => {
    if (query.trim().length < 3) return;
    setIsConsultantThinking(true);
    try {
      const response = await getConsultationResponse(query);
      setAiResponse(response);

      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Consultation failed:', error);
    } finally {
      setIsConsultantThinking(false);
    }
  }, []);

  useEffect(() => {
    let recognition: any = null;

    if (isActive) {
      if ('webkitSpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        let silenceTimer: any = null;
        let fullTranscript = '';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              fullTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          setTranscript(fullTranscript + interimTranscript);

          if (silenceTimer) clearTimeout(silenceTimer);

          silenceTimer = setTimeout(() => {
            if (fullTranscript.trim().length > 3) {
              handleVoiceQuery(fullTranscript.trim());
              fullTranscript = '';
            }
          }, 2500);
        };

        recognition.start();
      }
    } else {
      if (recognition) recognition.stop();
      window.speechSynthesis.cancel();
      setTranscript('');
      setAiResponse('');
    }

    return () => {
      if (recognition) recognition.stop();
      window.speechSynthesis.cancel();
    };
  }, [isActive, handleVoiceQuery]);

  return {
    transcript,
    aiResponse,
    isConsultantThinking,
  };
};
