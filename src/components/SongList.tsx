import { useState } from "react";
import { Search, Play, Pause, Heart, Music, Clock } from "lucide-react";
import { Song } from "../types";

interface SongListProps {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  onSelectSong: (song: Song) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function SongList({
  songs,
  currentSong,
  isPlaying,
  onSelectSong,
  favorites,
  onToggleFavorite,
}: SongListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState<string>("All");

  const genres = ["All", ...Array.from(new Set(songs.map((s) => s.genre)))];

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.album.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = activeGenre === "All" || song.genre === activeGenre;
    return matchesSearch && matchesGenre;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div id="library-section" className="flex flex-col gap-6">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 id="library-title" className="text-xl font-bold text-zinc-100">Your Sonic Library</h2>
          <p className="text-xs text-zinc-400 mt-1">Select a track to start the experience</p>
        </div>
        <div id="search-input-wrapper" className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            id="library-search"
            type="text"
            placeholder="Search tracks, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-200 text-sm pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div id="genre-filters" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {genres.map((genre) => (
          <button
            key={genre}
            id={`filter-pill-${genre.replace(/\s+/g, "-").toLowerCase()}`}
            onClick={() => setActiveGenre(genre)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              activeGenre === genre
                ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                : "bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 border border-zinc-850 hover:bg-zinc-850"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Songs Table */}
      <div id="songs-table-container" className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 text-zinc-500 text-xs uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4 hidden md:table-cell">Album</th>
              <th className="py-3 px-4 hidden sm:table-cell">Genre</th>
              <th className="py-3 px-4 w-16 text-center">
                <Clock className="w-4 h-4 mx-auto" />
              </th>
              <th className="py-3 px-4 w-16 text-center">Fav</th>
            </tr>
          </thead>
          <tbody>
            {filteredSongs.length > 0 ? (
              filteredSongs.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                const isFav = favorites.includes(song.id);
                return (
                  <tr
                    key={song.id}
                    id={`song-row-${song.id}`}
                    className={`group border-b border-zinc-900/30 hover:bg-zinc-900/20 transition-all duration-150 cursor-pointer ${
                      isCurrent ? "bg-zinc-900/10" : ""
                    }`}
                    onClick={() => onSelectSong(song)}
                  >
                    {/* Index / Play / Pause */}
                    <td className="py-3.5 px-4 text-center text-sm font-medium">
                      <div className="relative flex items-center justify-center w-6 h-6 mx-auto">
                        {isCurrent ? (
                          isPlaying ? (
                            <div className="flex items-end justify-center gap-0.5 w-4 h-4">
                              <span className="w-0.5 h-3 bg-zinc-200 rounded-full animate-pulse" />
                              <span className="w-0.5 h-4 bg-zinc-200 rounded-full animate-pulse delay-75" />
                              <span className="w-0.5 h-2 bg-zinc-200 rounded-full animate-pulse delay-150" />
                            </div>
                          ) : (
                            <Play className="w-4.5 h-4.5 text-zinc-200 fill-zinc-200" />
                          )
                        ) : (
                          <>
                            <span className="group-hover:hidden text-zinc-500">{index + 1}</span>
                            <Play className="hidden group-hover:block w-4.5 h-4.5 text-zinc-300 fill-zinc-300" />
                          </>
                        )}
                      </div>
                    </td>

                    {/* Image & Title & Artist */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-900 flex items-center justify-center">
                          {song.coverImage ? (
                            <img
                              src={song.coverImage}
                              alt={song.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Music className="w-5 h-5 text-zinc-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate transition-colors ${
                              isCurrent ? "text-zinc-100 font-semibold" : "text-zinc-300"
                            }`}
                          >
                            {song.title}
                          </p>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{song.artist}</p>
                        </div>
                      </div>
                    </td>

                    {/* Album */}
                    <td className="py-3.5 px-4 text-sm text-zinc-400 truncate hidden md:table-cell">
                      {song.album}
                    </td>

                    {/* Genre */}
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <span className="inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-zinc-900 text-zinc-400 rounded-md border border-zinc-800">
                        {song.genre}
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 text-center text-sm text-zinc-500 font-mono">
                      {formatDuration(song.duration)}
                    </td>

                    {/* Toggle Favorite */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`btn-fav-${song.id}`}
                        onClick={() => onToggleFavorite(song.id)}
                        className="p-1 hover:scale-110 active:scale-95 transition-all text-zinc-600 hover:text-rose-500"
                      >
                        <Heart
                          className={`w-4.5 h-4.5 transition-all ${
                            isFav ? "text-rose-500 fill-rose-500 scale-110" : "hover:text-rose-400"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm">
                  <Music className="w-8 h-8 mx-auto mb-2 text-zinc-700 stroke-1" />
                  No matching tracks found in your library.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
