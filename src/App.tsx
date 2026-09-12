import { useState, useEffect, useRef } from "react";
import { Sparkles, Music, Library, Sparkle, Compass, Play, Pause } from "lucide-react";
import { Song } from "./types";
import AudioVisualizer from "./components/AudioVisualizer";
import SongList from "./components/SongList";
import AIInterpreter from "./components/AIInterpreter";
import AICurator from "./components/AICurator";
import PlayerControls from "./components/PlayerControls";

export default function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "all" | "one">("none");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"library" | "lyrics" | "curator">("library");
  const [selectedTheme, setSelectedTheme] = useState<"indigo" | "amber" | "teal" | "rose" | "violet">("indigo");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load songs database from server and favorites from localStorage on mount
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("/api/songs");
        const data = await res.json();
        if (data.songs && data.songs.length > 0) {
          setSongs(data.songs);
          // Set first track as default loaded song, but keep it paused
          setCurrentSong(data.songs[0]);
        }
      } catch (err) {
        console.error("Failed to fetch songs from Express API:", err);
      }
    };

    fetchSongs();

    const storedFavs = localStorage.getItem("melody_favorites");
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error("Failed to parse favorites:", e);
      }
    }
  }, []);

  // Update theme based on the current song's configured themeColor to make it feel immersive!
  useEffect(() => {
    if (currentSong) {
      setSelectedTheme(currentSong.themeColor);
    }
  }, [currentSong]);

  // Sync HTML5 Audio element with React state
  useEffect(() => {
    if (audioRef.current && currentSong) {
      const isSrcChanged = audioRef.current.src !== currentSong.url;
      if (isSrcChanged) {
        audioRef.current.src = currentSong.url;
        audioRef.current.load();
      }
      
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Autoplay / audio trigger was interrupted:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio trigger failed:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Track Completion
  const handleTrackEnded = () => {
    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn(e));
        setCurrentTime(0);
      }
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    
    let nextSong: Song;
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      nextSong = songs[randomIndex];
    } else {
      const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
      const nextIndex = (currentIndex + 1) % songs.length;
      nextSong = songs[nextIndex];
    }
    
    setCurrentSong(nextSong);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;

    if (currentTime > 5) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
    } else {
      const currentIndex = songs.findIndex((s) => s.id === currentSong?.id);
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = songs.length - 1;
      
      setCurrentSong(songs[prevIndex]);
    }
    setIsPlaying(true);
  };

  const handleToggleFavorite = (id: string) => {
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((fid) => fid !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("melody_favorites", JSON.stringify(updated));
  };

  const handleToggleRepeat = () => {
    if (repeatMode === "none") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("none");
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Glow theme mapper for the custom immersive backdrop
  const glowThemeMap = {
    indigo: "from-indigo-900/10 via-zinc-950 to-zinc-950",
    amber: "from-amber-900/10 via-zinc-950 to-zinc-950",
    teal: "from-teal-900/10 via-zinc-950 to-zinc-950",
    rose: "from-rose-900/10 via-zinc-950 to-zinc-950",
    violet: "from-violet-900/10 via-zinc-950 to-zinc-950",
  };

  const ringColorMap = {
    indigo: "border-indigo-500/20 shadow-indigo-950/20",
    amber: "border-amber-500/20 shadow-amber-950/20",
    teal: "border-teal-500/20 shadow-teal-950/20",
    rose: "border-rose-500/20 shadow-rose-950/20",
    violet: "border-violet-500/20 shadow-violet-950/20",
  };

  return (
    <div
      id="melody-app-root"
      className={`min-h-screen bg-gradient-to-b ${glowThemeMap[selectedTheme]} text-zinc-100 flex flex-col font-sans transition-all duration-700 antialiased selection:bg-zinc-800 selection:text-zinc-100`}
    >
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={handleTrackEnded}
      />

      {/* Main Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex flex-col gap-6 md:gap-10">
        
        {/* Navigation / Header */}
        <header id="melody-header" className="flex items-center justify-between border-b border-zinc-900 pb-5">
          <div className="flex items-center gap-3">
            <div id="melody-logo" className={`w-8.5 h-8.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center`}>
              <Music className={`w-4.5 h-4.5`} style={{ color: `var(--color-${selectedTheme}-400, #38bdf8)` }} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-1.5 font-sans">
                MelodyMusic
                <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                  Web v1.0
                </span>
              </h1>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Bespoke Audio Space &amp; Gemini Musicology</p>
            </div>
          </div>

          {/* Quick theme toggles */}
          <div id="theme-selectors-wrapper" className="flex items-center gap-1.5 bg-zinc-900/50 border border-zinc-900 px-2 py-1.5 rounded-full">
            {(["indigo", "amber", "teal", "rose", "violet"] as const).map((t) => (
              <button
                key={t}
                id={`theme-dot-${t}`}
                onClick={() => setSelectedTheme(t)}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  t === "indigo" ? "bg-indigo-500" :
                  t === "amber" ? "bg-amber-500" :
                  t === "teal" ? "bg-teal-500" :
                  t === "rose" ? "bg-rose-500" : "bg-violet-500"
                } ${
                  selectedTheme === t
                    ? "border-zinc-100 scale-110"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
                title={`Switch to ${t} theme`}
              />
            ))}
          </div>
        </header>

        {/* Dashboard Grid */}
        <main id="melody-dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Player Hub */}
          <section id="now-playing-panel" className="lg:col-span-4 flex flex-col gap-6">
            <div className={`p-6 rounded-2xl bg-zinc-900/40 border ${ringColorMap[selectedTheme]} flex flex-col gap-6 transition-all duration-500 shadow-lg`}>
              
              {/* Cover Art Image Box */}
              <div id="cover-art-wrapper" className="relative aspect-square w-full rounded-xl overflow-hidden shadow-xl bg-zinc-950 flex items-center justify-center border border-zinc-850/60 group">
                {currentSong?.coverImage ? (
                  <img
                    src={currentSong.coverImage}
                    alt={currentSong.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isPlaying ? "scale-105" : "scale-100"
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Music className="w-16 h-16 text-zinc-800 stroke-1" />
                )}
                {/* Visual playback state overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button
                    id="btn-overlay-play"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 rounded-full bg-zinc-100/90 text-zinc-950 hover:bg-white transition-all transform scale-95 group-hover:scale-100 shadow-lg"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current translate-x-0.5" />}
                  </button>
                </div>
              </div>

              {/* Title & Artist & Album metadata */}
              <div id="track-details" className="text-center">
                <h2 className="text-base font-bold text-zinc-100 truncate tracking-tight">{currentSong?.title || "No Track Selected"}</h2>
                <p className="text-xs text-zinc-400 truncate mt-1">{currentSong?.artist || "Select from your library"}</p>
                <p className="text-[10px] text-zinc-600 truncate mt-0.5 italic">{currentSong?.album}</p>
              </div>

              {/* Visualizer widget */}
              <AudioVisualizer isPlaying={isPlaying} themeColor={selectedTheme} />

              {/* Navigation timeline sliders and buttons */}
              <PlayerControls
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onNext={handleNext}
                onPrev={handlePrev}
                volume={volume}
                onVolumeChange={setVolume}
                isMuted={isMuted}
                onToggleMuted={() => setIsMuted(!isMuted)}
                shuffle={shuffle}
                onToggleShuffle={() => setShuffle(!shuffle)}
                repeatMode={repeatMode}
                onToggleRepeat={handleToggleRepeat}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                themeColor={selectedTheme}
              />
            </div>
          </section>

          {/* Right Column: Workspaces (Library, AI Interpretation, AI Curators) */}
          <section id="workspace-tabs-panel" className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Upper Workspace Nav Tabs */}
            <div id="workspace-tabs-nav" className="flex items-center gap-2 p-1 bg-zinc-900/60 border border-zinc-900 rounded-xl max-w-md">
              <button
                id="btn-workspace-library"
                onClick={() => setActiveTab("library")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "library"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/40"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                Library
              </button>
              <button
                id="btn-workspace-lyrics"
                onClick={() => setActiveTab("lyrics")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "lyrics"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/40"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Sparkle className="w-3.5 h-3.5" />
                AI Lyricist
              </button>
              <button
                id="btn-workspace-curator"
                onClick={() => setActiveTab("curator")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "curator"
                    ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/40"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                AI Curator
              </button>
            </div>

            {/* Rendering matching pane */}
            <div id="workspace-pane-container" className="p-6 bg-zinc-900/10 border border-zinc-900/60 rounded-2xl min-h-[460px]">
              {activeTab === "library" && (
                <SongList
                  songs={songs}
                  currentSong={currentSong}
                  isPlaying={isPlaying}
                  onSelectSong={(song) => {
                    setCurrentSong(song);
                    setIsPlaying(true);
                  }}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {activeTab === "lyrics" && (
                <AIInterpreter currentSong={currentSong} />
              )}

              {activeTab === "curator" && (
                <AICurator />
              )}
            </div>
          </section>

        </main>
      </div>

      {/* Footer footer-tag */}
      <footer id="melody-footer" className="mt-auto border-t border-zinc-900/60 py-6 text-center text-[11px] text-zinc-600 bg-zinc-950/40 flex flex-col sm:flex-row items-center justify-between px-6 gap-2">
        <p>© 2026 MelodyMusic. Built with Google AI Studio &amp; Gemini.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Sparkle className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
            Empathic Soundscapes
          </span>
          <span>•</span>
          <span>Offline State Cache Enabled</span>
        </div>
      </footer>
    </div>
  );
}
