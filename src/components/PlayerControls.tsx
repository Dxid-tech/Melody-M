import React from "react";
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX } from "lucide-react";
import { Song } from "../types";

interface PlayerControlsProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMuted: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
  repeatMode: "none" | "all" | "one";
  onToggleRepeat: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  themeColor: "indigo" | "amber" | "teal" | "rose" | "violet";
}

export default function PlayerControls({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMuted,
  shuffle,
  onToggleShuffle,
  repeatMode,
  onToggleRepeat,
  currentTime,
  duration,
  onSeek,
  themeColor,
}: PlayerControlsProps) {

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
  };

  const themeColors = {
    indigo: "accent-indigo-400 bg-indigo-500",
    amber: "accent-amber-400 bg-amber-500",
    teal: "accent-teal-400 bg-teal-500",
    rose: "accent-rose-400 bg-rose-500",
    violet: "accent-violet-400 bg-violet-500",
  };

  const activeTextColor = {
    indigo: "text-indigo-400",
    amber: "text-amber-400",
    teal: "text-teal-400",
    rose: "text-rose-400",
    violet: "text-violet-400",
  }[themeColor];

  const barFillColor = {
    indigo: "bg-indigo-400",
    amber: "bg-amber-400",
    teal: "bg-teal-400",
    rose: "bg-rose-400",
    violet: "bg-violet-400",
  }[themeColor];

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div id="player-controls-container" className="w-full flex flex-col items-center gap-3">
      {/* Progress slider bar */}
      <div id="scrub-bar-wrapper" className="w-full flex items-center gap-3">
        <span className="text-[10px] text-zinc-500 font-mono w-9 text-right select-none">
          {formatTime(currentTime)}
        </span>
        <div className="flex-1 relative group flex items-center">
          <input
            id="scrub-progress-slider"
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            disabled={!currentSong}
            className={`w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-150 ${themeColors[themeColor]}`}
            style={{
              background: `linear-gradient(to right, var(--color-${themeColor}-400, #38bdf8) 0%, var(--color-${themeColor}-400, #38bdf8) ${currentPercent}%, #27272a ${currentPercent}%, #27272a 100%)`
            }}
          />
        </div>
        <span className="text-[10px] text-zinc-500 font-mono w-9 text-left select-none">
          {formatTime(duration)}
        </span>
      </div>

      {/* Button controls */}
      <div id="control-buttons-wrapper" className="w-full flex items-center justify-between">
        {/* Shuffle Button */}
        <button
          id="btn-shuffle-playback"
          disabled={!currentSong}
          onClick={onToggleShuffle}
          className={`p-1.5 rounded-full transition-colors ${
            shuffle
              ? `${activeTextColor} bg-zinc-900`
              : "text-zinc-500 hover:text-zinc-300"
          } disabled:opacity-30 disabled:hover:text-zinc-500`}
          title="Shuffle"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Prev Button */}
        <button
          id="btn-prev-track"
          disabled={!currentSong}
          onClick={onPrev}
          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all active:scale-90 disabled:opacity-30 disabled:hover:text-zinc-400"
          title="Previous Track"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        {/* Play/Pause Main Button */}
        <button
          id="btn-play-pause-toggle"
          disabled={!currentSong}
          onClick={onPlayPause}
          className={`p-3.5 rounded-full text-zinc-950 transition-all active:scale-95 shadow-md ${
            currentSong ? "hover:scale-105" : "opacity-40 cursor-not-allowed"
          } ${barFillColor}`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5.5 h-5.5 fill-current stroke-current" />
          ) : (
            <Play className="w-5.5 h-5.5 fill-current translate-x-0.5" />
          )}
        </button>

        {/* Next Button */}
        <button
          id="btn-next-track"
          disabled={!currentSong}
          onClick={onNext}
          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all active:scale-90 disabled:opacity-30 disabled:hover:text-zinc-400"
          title="Next Track"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>

        {/* Repeat Button */}
        <button
          id="btn-repeat-mode"
          disabled={!currentSong}
          onClick={onToggleRepeat}
          className={`p-1.5 rounded-full transition-colors relative ${
            repeatMode !== "none"
              ? `${activeTextColor} bg-zinc-900`
              : "text-zinc-500 hover:text-zinc-300"
          } disabled:opacity-30 disabled:hover:text-zinc-500`}
          title={`Repeat: ${repeatMode}`}
        >
          <Repeat className="w-4 h-4" />
          {repeatMode === "one" && (
            <span className={`absolute -top-0.5 -right-0.5 text-[8px] font-bold px-0.5 rounded ${barFillColor} text-zinc-950 scale-90`}>
              1
            </span>
          )}
        </button>

        {/* Volume controls */}
        <div id="volume-scrubber" className="flex items-center gap-2 w-24">
          <button
            id="btn-mute-toggle"
            disabled={!currentSong}
            onClick={onToggleMuted}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-full transition-colors disabled:opacity-30"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            id="volume-slider-range"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            disabled={!currentSong}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer focus:outline-none accent-zinc-300 disabled:opacity-30"
          />
        </div>
      </div>
    </div>
  );
}
