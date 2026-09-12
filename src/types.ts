export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  url: string;
  duration: number; // in seconds
  genre: string;
  cover: string; // Tailwind background style classes
  themeColor: "indigo" | "amber" | "teal" | "rose" | "violet";
  coverImage: string;
  lyrics: string;
}

export interface RecommendedSong {
  title: string;
  artist: string;
  genre: string;
  reason: string;
}

export interface MoodRecommendation {
  intro: string;
  songs: RecommendedSong[];
}

export interface SonicProfile {
  tempo: string;
  key: string;
  instruments: string;
  atmosphere: string;
}

export interface VibeTranslation {
  vibeDescription: string;
  sonicProfile: SonicProfile;
  recommendedStyles: string[];
}
