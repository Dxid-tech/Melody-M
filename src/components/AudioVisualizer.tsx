import { useEffect, useState } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  themeColor: "indigo" | "amber" | "teal" | "rose" | "violet";
}

export default function AudioVisualizer({ isPlaying, themeColor }: AudioVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(Array(24).fill(12));

  // Cycle heights if playing to simulate a real-time frequency visualizer
  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(24).fill(12));
      return;
    }

    const interval = setInterval(() => {
      setHeights(
        Array(24)
          .fill(0)
          .map(() => Math.floor(Math.random() * 56) + 8) // Generate heights between 8px and 64px
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const colorMap = {
    indigo: "bg-indigo-400",
    amber: "bg-amber-400",
    teal: "bg-teal-400",
    rose: "bg-rose-400",
    violet: "bg-violet-400",
  };

  const selectedColor = colorMap[themeColor] || "bg-indigo-400";

  return (
    <div id="audio-visualizer-container" className="flex items-end justify-center gap-1 h-16 w-full max-w-sm px-4 bg-zinc-950/20 rounded-xl py-2 overflow-hidden">
      {heights.map((h, i) => (
        <div
          key={i}
          id={`visualizer-bar-${i}`}
          className={`w-1.5 rounded-t-full transition-all duration-150 ${selectedColor}`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}
