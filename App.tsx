import React, { useState } from 'react';
import { MoodInputState, RecommendationResponse } from './types';
import { getMovieRecommendations } from './services/geminiService';
import MoodInput from './components/MoodInput';
import MovieCard from './components/MovieCard';
import { Clapperboard, AlertCircle, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [inputState, setInputState] = useState<MoodInputState>({
    text: '',
    media: null,
    mediaPreview: null,
    mediaType: null,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputState.text && !inputState.media) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (inputState.media && inputState.media.size > 20 * 1024 * 1024) {
        throw new Error("File too large for this prototype (max 20MB). Please try a shorter clip or smaller image.");
      }

      const data = await getMovieRecommendations(inputState.text, inputState.media);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while analyzing your mood.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000B1D] pb-20">
      {/* Header */}
      <header className="bg-[#00132B]/90 backdrop-blur-md border-b border-[#00366D]/30 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0057B8] rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Clapperboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-brand font-bold text-white tracking-tight">MoodMatchMe</h1>
              <p className="text-xs text-[#4DACFF] font-medium tracking-wide">Powered by Elisa Viihde</p>
            </div>
          </div>
          <div className="text-blue-200/60 text-sm hidden md:block font-light">
            AI-Powered Discovery
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Intro Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight font-brand">
            Find the perfect movie for <span className="text-[#0057B8] inline-block relative">
              right now
              <svg className="absolute w-full h-2 bottom-0 left-0 text-[#0057B8] opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>.
          </h2>
          <p className="text-blue-200/80 max-w-xl mx-auto text-lg font-light">
            Upload a photo of your view, a video of your surroundings, or just tell us how you feel.
          </p>
        </div>

        {/* Input Section */}
        <div className="mb-16">
          <MoodInput 
            inputState={inputState} 
            setInputState={setInputState} 
            onAnalyze={handleAnalyze}
            isLoading={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-10 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center text-red-200">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="animate-fade-in-up">
            <div className="flex items-center space-x-4 mb-8">
              <div className="h-px bg-[#00366D] flex-grow opacity-50"></div>
              <span className="text-[#4DACFF] font-semibold text-sm uppercase tracking-widest">Recommendations</span>
              <div className="h-px bg-[#00366D] flex-grow opacity-50"></div>
            </div>

            <div className="bg-gradient-to-r from-[#00132B] to-[#00204A] rounded-2xl p-8 mb-10 border border-[#00366D]/50 shadow-xl shadow-blue-900/10">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center font-brand">
                <Sparkles className="text-[#0057B8] mr-2" size={20} />
                Mood Analysis
              </h3>
              <p className="text-blue-100 italic leading-relaxed font-light">
                "{result.moodAnalysis}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {result.movies.map((movie, index) => (
                <MovieCard key={`${movie.title}-${index}`} movie={movie} index={index} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-[#00366D]/30 text-center text-blue-300/40 text-sm">
        <p>&copy; {new Date().getFullYear()} MoodMatchMe Prototype. Elisa Viihde is a registered trademark of Elisa Oyj.</p>
      </footer>
    </div>
  );
};

export default App;