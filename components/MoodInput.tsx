import React, { useRef, useState, useEffect } from 'react';
import { MoodInputState } from '../types';
import { Upload, X, Image as ImageIcon, Video, Sparkles, Mic, MicOff } from 'lucide-react';

interface MoodInputProps {
  inputState: MoodInputState;
  setInputState: React.Dispatch<React.SetStateAction<MoodInputState>>;
  onAnalyze: () => void;
  isLoading: boolean;
}

// Type definition for the Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const MoodInput: React.FC<MoodInputProps> = ({ inputState, setInputState, onAnalyze, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video/');
      const previewUrl = URL.createObjectURL(file);

      setInputState(prev => ({
        ...prev,
        media: file,
        mediaPreview: previewUrl,
        mediaType: isVideo ? 'video' : 'image'
      }));
    }
  };

  const clearMedia = () => {
    if (inputState.mediaPreview) {
      URL.revokeObjectURL(inputState.mediaPreview);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setInputState(prev => ({
      ...prev,
      media: null,
      mediaPreview: null,
      mediaType: null
    }));
  };

  const clearText = () => {
    setInputState(prev => ({ ...prev, text: '' }));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
          } else {
              interim += event.results[i][0].transcript;
          }
      }
      
      if (final) {
          setInputState(prev => ({
              ...prev,
              text: prev.text ? `${prev.text} ${final}` : final
          }));
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript) {
         setInputState(prev => ({
            ...prev,
            text: prev.text ? `${prev.text} ${finalTranscript}` : finalTranscript
         }));
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#00132B] p-6 rounded-2xl shadow-xl shadow-black/40 border border-[#00366D]/50">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
            <label className="text-blue-100/80 text-sm font-medium">
            Describe your mood or upload a visual
            </label>
            {isListening && (
                <span className="flex items-center text-xs text-red-400 font-bold animate-pulse">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Listening...
                </span>
            )}
        </div>
        
        <div className="relative">
            <textarea
            className={`w-full bg-[#000814] border rounded-lg p-4 pr-12 text-white placeholder-blue-500/30 focus:ring-2 focus:ring-[#0057B8] focus:border-transparent transition-all outline-none resize-none h-28 ${isListening ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-[#00366D]'}`}
            placeholder={isListening ? "Listening..." : "I'm feeling nostalgic for the 80s..."}
            value={inputState.text}
            onChange={(e) => setInputState(prev => ({ ...prev, text: e.target.value }))}
            disabled={isLoading}
            />
            
            {inputState.text && !isLoading && (
              <button
                  onClick={clearText}
                  className="absolute top-3 right-3 p-1 text-blue-400/50 hover:text-white hover:bg-[#00366D] rounded-full transition-colors"
                  title="Clear text"
              >
                  <X size={16} />
              </button>
            )}

            <button
                onClick={toggleListening}
                disabled={isLoading}
                className={`absolute right-3 bottom-3 p-2 rounded-full transition-all duration-200 ${
                    isListening 
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
                    : 'bg-[#00132B] text-blue-400 hover:text-white hover:bg-[#00366D]'
                }`}
                title={isListening ? "Stop recording" : "Use voice input"}
            >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
        </div>
      </div>

      <div className="mb-6">
        {!inputState.mediaPreview ? (
          <div 
            onClick={triggerFileUpload}
            className={`border-2 border-dashed border-[#00366D] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#0057B8] hover:bg-[#001D40] transition-all group ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="w-12 h-12 bg-[#001D40] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#0057B8] transition-colors border border-[#00366D]">
              <Upload className="text-[#4DACFF] group-hover:text-white" size={20} />
            </div>
            <p className="text-blue-100 font-medium">Click to upload media</p>
            <p className="text-blue-300/50 text-xs mt-1">Supports Images & Short Videos</p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-[#00366D] bg-[#000814]">
            <button 
              onClick={clearMedia}
              className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white p-1 rounded-full backdrop-blur-sm transition-colors z-10"
            >
              <X size={16} />
            </button>
            
            {inputState.mediaType === 'video' ? (
              <video 
                src={inputState.mediaPreview} 
                className="w-full h-48 object-contain bg-black" 
                controls
              />
            ) : (
              <img 
                src={inputState.mediaPreview} 
                alt="Upload preview" 
                className="w-full h-48 object-contain bg-black"
              />
            )}
            
            <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-full text-xs text-white backdrop-blur-sm flex items-center">
              {inputState.mediaType === 'video' ? <Video size={12} className="mr-1"/> : <ImageIcon size={12} className="mr-1"/>}
              {inputState.media?.name}
            </div>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*,video/*"
        />
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading || (!inputState.text && !inputState.media)}
        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center transition-all shadow-lg
          ${isLoading || (!inputState.text && !inputState.media)
            ? 'bg-[#001D40] text-blue-500/30 cursor-not-allowed border border-[#00366D]/30' 
            : 'bg-[#0057B8] hover:bg-[#004799] shadow-blue-900/30 hover:scale-[1.01]'
          }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing Mood...
          </>
        ) : (
          <>
            <Sparkles size={18} className="mr-2" />
            Find Movies
          </>
        )}
      </button>
    </div>
  );
};

export default MoodInput;