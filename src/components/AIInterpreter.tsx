import { useState, useEffect } from "react";
import { Sparkles, HelpCircle, AlertCircle, Quote } from "lucide-react";
import { Song } from "../types";

interface AIInterpreterProps {
  currentSong: Song | null;
}

const LOADING_STEPS = [
  "Reading between the lines...",
  "Analyzing metaphorical structures...",
  "Mapping the emotional landscape...",
  "Deconstructing the lyric rhythm...",
  "Synthesizing poetic insights..."
];

export default function AIInterpreter({ currentSong }: AIInterpreterProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);

  // Reset explanation when song changes
  useEffect(() => {
    setExplanation("");
    setError("");
  }, [currentSong]);

  // Rotate loading steps
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleExplain = async () => {
    if (!currentSong) return;
    setIsLoading(true);
    setError("");
    setExplanation("");
    setLoadingStepIndex(0);

    try {
      const response = await fetch("/api/gemini/explain-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: currentSong.title,
          artist: currentSong.artist,
          lyrics: currentSong.lyrics,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze lyrics.");
      }

      setExplanation(data.explanation || "");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while asking Gemini to explain the lyrics.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentSong) {
    return (
      <div id="ai-interpreter-empty" className="flex flex-col items-center justify-center py-16 text-center text-zinc-500 bg-zinc-950/20 rounded-2xl border border-zinc-900 px-6">
        <Sparkles className="w-10 h-10 mb-4 text-zinc-700 stroke-1" />
        <h3 className="text-zinc-300 font-medium text-base">Select a Song</h3>
        <p className="text-xs text-zinc-500 max-w-xs mt-1">Play a track from the library to unlock AI lyric interpretation features.</p>
      </div>
    );
  }

  return (
    <div id="ai-interpreter-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Lyrics Column */}
      <div id="lyrics-container-card" className="lg:col-span-5 bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-6 flex flex-col h-[400px]">
        <div className="flex items-center gap-2 pb-4 border-b border-zinc-800/60 mb-4">
          <Quote className="w-4 h-4 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-200">Song Lyrics</h3>
        </div>
        <div id="lyrics-scrollable" className="flex-1 overflow-y-auto pr-2 text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap font-serif select-none custom-scrollbar">
          {currentSong.lyrics}
        </div>
      </div>

      {/* Explainer Column */}
      <div id="ai-insights-card" className="lg:col-span-7 bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-6 flex flex-col h-[400px]">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-zinc-300" />
            <h3 className="text-sm font-bold text-zinc-200">Gemini Musicologist</h3>
          </div>
          <span className="text-[10px] bg-zinc-800/80 text-zinc-400 font-medium px-2 py-0.5 rounded-md uppercase tracking-wider">
            Gemini 3.8 Flash
          </span>
        </div>

        {/* Content State */}
        <div id="ai-insights-content-area" className="flex-1 overflow-y-auto pr-1 flex flex-col justify-between">
          {!isLoading && !explanation && !error ? (
            <div className="my-auto text-center py-6 px-4">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-zinc-600 stroke-1" />
              <h4 className="text-sm font-semibold text-zinc-300">Deconstruct the Poetry</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Let Gemini analyze "${currentSong.title}" by ${currentSong.artist}. Explore the literary devices, underlying metaphors, and emotional narrative behind these lyrics.
              </p>
              <button
                id="btn-analyze-lyrics"
                onClick={handleExplain}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white active:scale-95 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4 fill-zinc-950 stroke-none" />
                Explain Lyrics with AI
              </button>
            </div>
          ) : isLoading ? (
            <div className="my-auto flex flex-col items-center justify-center text-center py-10">
              <div className="relative w-12 h-12 flex items-center justify-center mb-4">
                <span className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
                <span className="absolute inset-0 border-2 border-t-zinc-200 rounded-full animate-spin" />
              </div>
              <p className="text-sm font-medium text-zinc-300 animate-pulse">
                {LOADING_STEPS[loadingStepIndex]}
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
                Unlocking deeper song contexts...
              </p>
            </div>
          ) : error ? (
            <div className="my-auto flex flex-col items-center justify-center text-center p-4">
              <AlertCircle className="w-8 h-8 text-rose-500 mb-2 stroke-1" />
              <h4 className="text-sm font-semibold text-zinc-300">Analysis Halted</h4>
              <p className="text-xs text-rose-400 mt-1 max-w-sm leading-relaxed">{error}</p>
              <button
                id="btn-retry-analysis"
                onClick={handleExplain}
                className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              <div id="lyrics-explanation-text" className="text-zinc-300 text-sm leading-relaxed font-sans whitespace-pre-wrap pr-1">
                {explanation}
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
                  Insight generated from lyrics text
                </span>
                <button
                  id="btn-reanalyze-lyrics"
                  onClick={handleExplain}
                  className="text-xs text-zinc-400 hover:text-zinc-200 font-medium transition-all"
                >
                  Regenerate Analysis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
