export interface Movie {
  title: string;
  year: string | number;
  genre: string;
  description: string;
  matchReason: string;
  posterPrompt?: string; // For generating a placeholder image URL if needed
}

export interface RecommendationResponse {
  moodAnalysis: string;
  movies: Movie[];
}

export interface MoodInputState {
  text: string;
  media: File | null;
  mediaPreview: string | null;
  mediaType: 'image' | 'video' | null;
}
