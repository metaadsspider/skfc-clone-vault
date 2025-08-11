import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===== Your existing imports remain intact =====
import { useState as useReactState, useEffect as useReactEffect } from "react";
import { Header } from "@/components/Header";
import { MatchCard } from "@/components/MatchCard";
import { TelegramPopup } from "@/components/TelegramPopup";
import { FancodeService } from "@/services/fancodeService";
import { Match } from "@/data/matches";
import { AspectRatio } from "@/components/ui/aspect-ratio";

// ===== New YouTube highlights code =====
interface Highlight {
  id: string;
  title: string;
}

const highlights: Highlight[] = [
  { id: "VryvrvQfjNw", title: "Three Half Centuries Not Enough To Seal The Win!" },
  { id: "U35NbarYAkA", title: "Epic Last Over Finish! | India v Australia" },
  { id: "NqF5yVqS5DE", title: "Last Ball Thriller! | England v South Africa" },
];

export default function MatchHighlightsWithFancode() {
  const playerRef = useRef<any>(null);
  const preloadRefs = useRef<any[]>([]);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // ===== Keep Fancode service/data logic here if needed =====
  // Example:
  // const matches = FancodeService.getMatches();

  // Load YouTube API
  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      // Main Player
      playerRef.current = new (window as any).YT.Player("yt-player", {
        videoId: highlights[currentIndex].id,
        playerVars: { controls: 0, modestbranding: 1, rel: 0, showinfo: 0 },
        events: {
          onStateChange: (e: any) => {
            setPlaying(e.data === 1);
          },
        },
      });

      // Preload hidden players
      highlights.forEach((h, idx) => {
        preloadRefs.current[idx] = new (window as any).YT.Player(`preload-${idx}`, {
          videoId: h.id,
          playerVars: { controls: 0, modestbranding: 1, rel: 0, showinfo: 0 },
        });
      });
    };
  }, []);

  const changeVideo = (newIndex: number, dir: number) => {
    setDirection(dir);
    setCurrentIndex(newIndex);

    setTimeout(() => {
      const preloadPlayer = preloadRefs.current[newIndex];
      if (preloadPlayer?.playVideo) {
        playerRef.current.loadVideoById(highlights[newIndex].id);
      }
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    if (!touchStartX.current || !touchEndX.current) return;

    const deltaX = touchStartX.current - touchEndX.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        changeVideo((currentIndex + 1) % highlights.length, 1);
      } else {
        changeVideo((currentIndex - 1 + highlights.length) % highlights.length, -1);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Existing Header */}
      <Header />

      {/* ===== New YouTube Highlight Player ===== */}
      <div
        className="relative w-full rounded-lg overflow-hidden shadow-lg aspect-video bg-black"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute w-full h-full"
          >
            <div id="yt-player" className="w-full h-full"></div>
          </motion.div>
        </AnimatePresence>

        {/* Overlay Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h2 className="text-white text-lg font-bold">{highlights[currentIndex].title}</h2>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => changeVideo((currentIndex - 1 + highlights.length) % highlights.length, -1)}
              className="px-3 py-1 bg-gray-700 text-white rounded"
            >
              ◀ Prev
            </button>
            <button
              onClick={() => (playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo())}
              className="px-4 py-1 bg-red-600 text-white rounded"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              onClick={() => changeVideo((currentIndex + 1) % highlights.length, 1)}
              className="px-3 py-1 bg-gray-700 text-white rounded"
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>

      {/* Hidden preload players */}
      <div className="hidden">
        {highlights.map((_, idx) => (
          <div key={idx} id={`preload-${idx}`}></div>
        ))}
      </div>

      {/* Existing Fancode Components */}
      {/* <MatchCard match={matches[0]} /> */}
      <TelegramPopup />
    </div>
  );
}
