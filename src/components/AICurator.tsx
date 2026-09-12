import { useState, useEffect } from "react";
import { Sparkles, Compass, MapPin, Smile, HelpCircle, Check, Play, Music, Radio } from "lucide-react";
import { MoodRecommendation, VibeTranslation } from "../types";

const MOODS = [
  { id: "Focused", label: "Focused", emoji: "🎯", desc: "For deep work, writing, or coding." },
  { id: "Relaxed", label: "Relaxed", emoji: "🌿", desc: "For winding down and calming the mind." },
  { id: "High Energy", label: "High Energy", emoji: "⚡", desc: "For workouts or driving beats." },
  { id: "Melancholic", label: "Melancholic", emoji: "🌧️", desc: "For reflective, rainy-day thoughts." },
  { id: "Inspired", label: "Inspired", emoji: "🎨", desc: "For creative brainstorms and designing." },
];

const SUGGESTIONS = [
  "drinking coffee in a Tokyo coffee shop on a rainy afternoon",
  "coding a complex full-stack web app at 2 AM with low hum of servers",
  "watching autumn leaves fall in a quiet park under a grey sky",
  "driving down an empty forest highway as the sun starts to rise"
];

export default function AICurator() {
  const [activeTab, setActiveTab] = useState<"mood" | "vibe">("mood");

  // Mood State
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [moodRecommendation, setMoodRecommendation] = useState<MoodRecommendation | null>(null);
  const [isMoodLoading, setIsMoodLoading] = useState<boolean>(false);
  const [moodError, setMoodError] = useState<string>("");

  // Vibe State
  const [vibeInput, setVibeInput] = useState<string>("");
  const [vibeTranslation, setVibeTranslation] = useState<VibeTranslation | null>(null);
  const [isVibeLoading, setIsVibeLoading] = useState<boolean>(false);
  const [vibeError, setVibeError] = useState<string>("");

  const handleCurateMood = async (moodId: string) => {
    setSelectedMood(moodId);
    setIsMoodLoading(true);
    setMoodError("");
    setMoodRecommendation(null);

    try {
      const res = await fetch("/api/gemini/mood-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: moodId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to curate playlist.");
      }

      setMoodRecommendation(data);
    } catch (err: any) {
      console.error(err);
      setMoodError(err.message || "Failed to get curated playlist from Gemini.");
    } finally {
      setIsMoodLoading(false);
    }
  };

  const handleTranslateVibe = async (customVibe?: string) => {
    const input = customVibe || vibeInput;
    if (!input.trim()) return;

    if (customVibe) {
      setVibeInput(customVibe);
    }

    setIsVibeLoading(true);
    setVibeError("");
    setVibeTranslation(null);

    try {
      const res = await fetch("/api/gemini/explain-vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe: input }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to translate vibe.");
      }

      setVibeTranslation(data);
    } catch (err: any) {
      console.error(err);
      setVibeError(err.message || "Failed to translate environment into music with Gemini.");
    } finally {
      setIsVibeLoading(false);
    }
  };

  return (
    <div id="ai-curator-container" className="flex flex-col gap-6">
      {/* Sub tabs */}
      <div id="curator-workspace-tabs" className="flex items-center border-b border-zinc-900 gap-6">
        <button
          id="tab-curator-mood"
          onClick={() => setActiveTab("mood")}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === "mood" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {activeTab === "mood" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-300 rounded-full" />
          )}
          <span className="flex items-center gap-1.5">
            <Smile className="w-4 h-4" />
            Mood Curator
          </span>
        </button>
        <button
          id="tab-curator-vibe"
          onClick={() => setActiveTab("vibe")}
          className={`pb-3 text-sm font-semibold relative transition-colors ${
            activeTab === "vibe" ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {activeTab === "vibe" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-300 rounded-full" />
          )}
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            Sonic Vibe Translator
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "mood" ? (
        <div id="mood-curator-pane" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">How are you feeling?</h3>
              <p className="text-xs text-zinc-500 mt-1">Select an emotion to let Gemini curate a bespoke real-world playlist.</p>
            </div>

            <div id="moods-selector-list" className="flex flex-col gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  id={`mood-btn-${mood.id.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => handleCurateMood(mood.id)}
                  disabled={isMoodLoading}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                    selectedMood === mood.id
                      ? "bg-zinc-100/5 border-zinc-500/25 ring-1 ring-zinc-500/10"
                      : "bg-zinc-900/10 border-zinc-900/50 hover:bg-zinc-900/30 hover:border-zinc-800"
                  }`}
                >
                  <span className="text-xl flex-shrink-0 leading-none mt-0.5">{mood.emoji}</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${selectedMood === mood.id ? "text-zinc-100" : "text-zinc-300"}`}>
                      {mood.label}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed truncate">{mood.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-8 bg-zinc-900/20 border border-zinc-800/40 rounded-2xl p-6 min-h-[300px] flex flex-col justify-between">
            {!isMoodLoading && !moodRecommendation && !moodError ? (
              <div className="my-auto text-center py-8">
                <Radio className="w-10 h-10 mx-auto mb-3 text-zinc-700 stroke-1" />
                <h4 className="text-sm font-semibold text-zinc-400">Empathic Curation Workspace</h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Choose an emotion from the selector. Gemini will interpret your vibe and map it to an incredible acoustic list.
                </p>
              </div>
            ) : isMoodLoading ? (
              <div className="my-auto flex flex-col items-center justify-center text-center py-12">
                <div className="relative w-10 h-10 flex items-center justify-center mb-4">
                  <span className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
                  <span className="absolute inset-0 border-2 border-t-zinc-300 rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-zinc-300 animate-pulse">Consulting the sonic catalogs...</p>
                <p className="text-xs text-zinc-500 mt-1">Arranging harmonious chord sequences for {selectedMood} vibe...</p>
              </div>
            ) : moodError ? (
              <div className="my-auto flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-rose-400 leading-relaxed">{moodError}</p>
                <button
                  id="btn-retry-mood"
                  onClick={() => handleCurateMood(selectedMood)}
                  className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 transition-all"
                >
                  Retry Curation
                </button>
              </div>
            ) : (
              <div id="mood-curation-results" className="flex flex-col gap-5">
                {/* Intro message */}
                <div className="p-4 bg-zinc-950/30 border border-zinc-850 rounded-xl leading-relaxed">
                  <p className="text-xs text-zinc-400 italic font-sans flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
                    "{moodRecommendation?.intro}"
                  </p>
                </div>

                {/* Playlist Tracks */}
                <div className="flex flex-col gap-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pb-1">Suggested Play Queue</p>
                  {moodRecommendation?.songs.map((song, i) => (
                    <div
                      key={i}
                      id={`rec-song-${i}`}
                      className="flex items-start justify-between p-3 bg-zinc-950/20 border border-zinc-900/60 rounded-xl hover:border-zinc-850 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0 text-zinc-500">
                          <Music className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-200 truncate">
                            {song.title} <span className="text-zinc-500 font-normal">by {song.artist}</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 leading-relaxed mt-1">
                            <span className="font-medium text-zinc-500 mr-1 uppercase bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-850">
                              {song.genre}
                            </span>
                            {song.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div id="vibe-translator-pane" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-bold text-zinc-200">Describe Your Surroundings</h3>
              <p className="text-xs text-zinc-500 mt-1">What's your current landscape? We'll synthesize its technical musical equivalent.</p>
            </div>

            <div className="flex flex-col gap-3">
              <textarea
                id="vibe-text-input"
                value={vibeInput}
                onChange={(e) => setVibeInput(e.target.value)}
                placeholder="e.g. Walking in a neon-drenched alleyway with rain drumming against my umbrella..."
                rows={4}
                className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-200 text-xs p-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all placeholder:text-zinc-600 leading-relaxed resize-none"
              />

              <button
                id="btn-submit-vibe"
                onClick={() => handleTranslateVibe()}
                disabled={isVibeLoading || !vibeInput.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-bold hover:bg-white active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:active:scale-100"
              >
                <Compass className="w-4 h-4" />
                Translate Vibe to Sound
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Need Inspiration?</p>
              <div className="flex flex-col gap-1.5">
                {SUGGESTIONS.map((s, index) => (
                  <button
                    key={index}
                    id={`vibe-suggest-${index}`}
                    onClick={() => handleTranslateVibe(s)}
                    className="text-left text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-900/35 border border-zinc-900 p-2.5 rounded-xl hover:border-zinc-800 transition-colors leading-relaxed"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Render Output */}
          <div className="lg:col-span-7 bg-zinc-900/20 border border-zinc-800/40 rounded-2xl p-6 min-h-[300px] flex flex-col justify-between">
            {!isVibeLoading && !vibeTranslation && !vibeError ? (
              <div className="my-auto text-center py-8">
                <Compass className="w-10 h-10 mx-auto mb-3 text-zinc-700 stroke-1" />
                <h4 className="text-sm font-semibold text-zinc-400">Sonic Synthesis Panel</h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Input a sensory description of your environment. Gemini will break it down into tempos, instruments, scale keys, and acoustic profiles.
                </p>
              </div>
            ) : isVibeLoading ? (
              <div className="my-auto flex flex-col items-center justify-center text-center py-12">
                <div className="relative w-10 h-10 flex items-center justify-center mb-4">
                  <span className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
                  <span className="absolute inset-0 border-2 border-t-zinc-300 rounded-full animate-spin" />
                </div>
                <p className="text-sm font-medium text-zinc-300 animate-pulse">Converting visual textures to acoustic waves...</p>
                <p className="text-xs text-zinc-500 mt-1">Analyzing soundscape frequencies and micro-tonalities...</p>
              </div>
            ) : vibeError ? (
              <div className="my-auto flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-rose-400 leading-relaxed">{vibeError}</p>
                <button
                  id="btn-retry-vibe"
                  onClick={() => handleTranslateVibe()}
                  className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 transition-all"
                >
                  Retry Translation
                </button>
              </div>
            ) : (
              <div id="vibe-translation-results" className="flex flex-col gap-5">
                {/* Intro message */}
                <div className="p-4 bg-zinc-950/30 border border-zinc-850 rounded-xl leading-relaxed">
                  <p className="text-xs text-zinc-300 font-medium font-sans">
                    {vibeTranslation?.vibeDescription}
                  </p>
                </div>

                {/* Sonic Stats Box */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Suggested Tempo</p>
                    <p className="text-xs font-bold text-zinc-200 mt-1">{vibeTranslation?.sonicProfile.tempo}</p>
                  </div>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Musical Key Signature</p>
                    <p className="text-xs font-bold text-zinc-200 mt-1">{vibeTranslation?.sonicProfile.key}</p>
                  </div>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl col-span-2">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Core Instrumentation</p>
                    <p className="text-xs font-medium text-zinc-200 mt-1 leading-relaxed">{vibeTranslation?.sonicProfile.instruments}</p>
                  </div>
                  <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl col-span-2">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Atmospheric Ambience</p>
                    <p className="text-xs font-medium text-zinc-200 mt-1 leading-relaxed">{vibeTranslation?.sonicProfile.atmosphere}</p>
                  </div>
                </div>

                {/* Style Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mr-1">Genres matched:</span>
                  {vibeTranslation?.recommendedStyles.map((style, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-850 rounded-md"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
