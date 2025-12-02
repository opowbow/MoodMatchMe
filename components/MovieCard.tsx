import React, { useState } from 'react';
import { Movie } from '../types';
import { Calendar, Info, ImageOff } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  index: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, index }) => {
  const [imgError, setImgError] = useState(false);

  // Construct a search-based thumbnail URL to fetch the movie poster dynamically
  // This acts as a prototype replacement for a real TMDb API call
  const posterUrl = `https://tse4.mm.bing.net/th?q=${encodeURIComponent(movie.title + " " + movie.year + " movie poster")}&w=400&h=600&c=7&rs=1&p=0`;

  return (
    <div className="bg-[#00132B] rounded-xl overflow-hidden shadow-lg border border-[#00366D]/50 flex flex-col hover:border-[#0057B8] transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="relative h-64 overflow-hidden bg-[#000814]">
        {!imgError ? (
          <img 
            src={posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
           <div className="w-full h-full flex items-center justify-center bg-[#001D40] text-blue-500/30">
              <div className="text-center p-4">
                 <ImageOff size={32} className="mx-auto mb-2" />
                 <span className="text-xs">Poster Unavailable</span>
              </div>
           </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#00132B] to-transparent opacity-90"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
           <h3 className="text-xl font-bold text-white leading-tight mb-1 drop-shadow-md">{movie.title}</h3>
           <div className="flex items-center text-blue-200 text-sm space-x-3">
             <span className="flex items-center drop-shadow-md"><Calendar size={14} className="mr-1 opacity-70"/> {movie.year}</span>
             <span className="px-2 py-0.5 bg-[#00366D]/80 backdrop-blur-sm rounded text-[10px] uppercase tracking-wider text-white font-semibold border border-[#0057B8]/30">{movie.genre}</span>
           </div>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <p className="text-blue-100/70 text-sm mb-4 line-clamp-3 flex-grow font-light leading-relaxed">
          {movie.description}
        </p>
        
        <div className="mt-auto pt-3 border-t border-[#00366D]/30">
          <div className="flex items-start text-xs text-[#4DACFF] bg-[#0057B8]/10 p-2 rounded-lg border border-[#0057B8]/20">
            <Info size={14} className="mr-2 mt-0.5 flex-shrink-0" />
            <span>{movie.matchReason}</span>
          </div>
        </div>
      </div>
      
      <button className="w-full py-3 bg-[#001D40] hover:bg-[#0057B8] text-white font-medium text-sm transition-colors duration-200 border-t border-[#00366D]/30">
        Watch on Elisa Viihde
      </button>
    </div>
  );
};

export default MovieCard;