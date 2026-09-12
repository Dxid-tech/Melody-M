import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client utility
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Track Database
const SONGS = [
  {
    id: "track-1",
    title: "Retro Future",
    artist: "Synth Horizon",
    album: "Digital Neon",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 372,
    genre: "Synthwave",
    cover: "bg-indigo-950/40 border border-indigo-500/20 shadow-indigo-950/20",
    themeColor: "indigo",
    coverImage: "https://images.unsplash.com/photo-1515462277126-270d878326e5?q=80&w=300&auto=format&fit=crop",
    lyrics: "Walking through the neon light\nDigital waves in the night\nCyber dreams and glowing streams\nNothing is quite what it seems\n\nRetro future takes me high\nUnderneath the electric sky\nGrid lines stretch into the dark\nWaiting for the guiding spark...\n\nNo more boundaries, no more walls\nWhen the cyber sunset calls\nWe're just data, we're just sound\nLost in what we finally found."
  },
  {
    id: "track-2",
    title: "Chill Horizon",
    artist: "Lofi Dreamer",
    album: "Coffee & Rain",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 425,
    genre: "Lofi Hip Hop",
    cover: "bg-amber-950/40 border border-amber-500/20 shadow-amber-950/20",
    themeColor: "amber",
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop",
    lyrics: "Rain drops on the window pane\nSip of coffee, wash the pain\nSmooth beats floating in the air\nWe're just drifting here and there\n\nTime slows down to let us breathe\nAll the worries we can leave\nLofi records on repeat\nHeartbeat matches every beat...\n\nFading sunlight on the floor\nWho could ask for any more\nQuiet moments, peaceful mind\nLeaving all the rush behind."
  },
  {
    id: "track-3",
    title: "Ambient Dream",
    artist: "Stellar Echo",
    album: "Cosmic Serenade",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: 302,
    genre: "Ambient",
    cover: "bg-teal-950/40 border border-teal-500/20 shadow-teal-950/20",
    themeColor: "teal",
    coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=300&auto=format&fit=crop",
    lyrics: "Lost within the solar wind\nWhere the galaxy begins\nSoft vibrations start to glow\nIn the cosmic ebb and flow\n\nFloating in a sea of stars\nFar away from Earth and Mars\nAmbient dreams will carry on\nUntil the universe is gone...\n\nSilent whispers of the void\nPast the dust and asteroid\nDrifting light-years in a spark\nFinding comfort in the dark."
  },
  {
    id: "track-4",
    title: "Sunset Vibe",
    artist: "Summer Wave",
    album: "Beachside Session",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: 318,
    genre: "Chillout",
    cover: "bg-rose-950/40 border border-rose-500/20 shadow-rose-950/20",
    themeColor: "rose",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop",
    lyrics: "Golden rays upon the shore\nI couldn't ask for any more\nOcean waves are singing low\nAs the sun begins to go\n\nFeel the warm breeze on your face\nTime stands still in this sweet place\nLet the sunset take the night\nEverything will be alright...\n\nSinking deep into the sand\nHolding music in your hand\nOrange sky and purple hue\nJust a perfect view of you."
  },
  {
    id: "track-5",
    title: "Midnight Drive",
    artist: "Retro Racer",
    album: "Overdrive",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    duration: 516,
    genre: "Synthwave",
    cover: "bg-violet-950/40 border border-violet-500/20 shadow-violet-950/20",
    themeColor: "violet",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop",
    lyrics: "Headlights cut the velvet night\nEighty-eight and feeling right\nEngine roars a steady tune\nCruising under a neon moon\n\nGas pedal pressed to the floor\nAlways searching for something more\nMidnight drive will never end\nJust around another bend...\n\nSynthesizer in my veins\nWashing out the daily strains\nBlack tarmac and silver line\nEverything is feeling fine."
  }
];

// API Routes
app.get("/api/songs", (req, res) => {
  res.json({ songs: SONGS });
});

// Gemini Endpoint: Explain Lyrics
app.post("/api/gemini/explain-lyrics", async (req, res) => {
  const { title, artist, lyrics } = req.body;

  if (!title || !artist || !lyrics) {
    res.status(400).json({ error: "Missing song title, artist, or lyrics." });
    return;
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are an expert musicologist and lyricist. Analyze and interpret the following lyrics for the song "${title}" by "${artist}".
Provide a beautiful, insightful, and poetic analysis (approx 200-250 words) that describes:
1. The overall narrative and emotional vibe.
2. The deeper symbolic meaning behind the words.
3. Notable metaphors or literary devices.

Keep the tone mature, artistic, and deeply resonant. Format with clean, readable paragraph breaks.

Lyrics:
${lyrics}`,
    });

    res.json({ explanation: response.text });
  } catch (error: any) {
    console.error("Gemini Lyrics Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze lyrics with Gemini." });
  }
});

// Gemini Endpoint: Mood Recommendation Playlist
app.post("/api/gemini/mood-playlist", async (req, res) => {
  const { mood } = req.body;

  if (!mood) {
    res.status(400).json({ error: "Missing mood parameter." });
    return;
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `The user is feeling: "${mood}".
As an empathetic AI Music Curator, generate a custom 5-song playlist of famous, real-world songs that perfectly match, elevate, or soothe this mood.
Format your output in a clean JSON format.

Return a JSON object matching this structure:
{
  "intro": "A beautiful 2-sentence description of the vibe and how these songs help with this mood.",
  "songs": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "genre": "Genre",
      "reason": "A 1-sentence explanation of why this song fits the user's mood."
    }
  ]
}

Ensure the response is strict JSON. Do not include markdown wraps or anything except the JSON string itself in responseMimeType if supported, or write raw JSON.`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Mood Playlist Error:", error);
    res.status(500).json({ error: error.message || "Failed to curate playlist with Gemini." });
  }
});

// Gemini Endpoint: Explain custom vibe prompt
app.post("/api/gemini/explain-vibe", async (req, res) => {
  const { vibe } = req.body;

  if (!vibe) {
    res.status(400).json({ error: "Missing vibe description." });
    return;
  }

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `The user describes their setting/vibe as: "${vibe}".
Provide a highly imaginative, poetic sonic translation of this vibe.
Format your output in a clean JSON format:
{
  "vibeDescription": "A poetic, sensory description of this mood translating visual details into soundscapes (2-3 sentences).",
  "sonicProfile": {
    "tempo": "e.g., 72 BPM, slow and relaxed",
    "key": "e.g., F minor, cozy and introspective",
    "instruments": "e.g., Rhodes electric piano, vinyl crackle, warm sub-bass",
    "atmosphere": "e.g., Cinematic, intimate, rain-washed"
  },
  "recommendedStyles": ["e.g., Lofi Hip-Hop", "Ambient Noir", "Bedroom Pop"]
}

Ensure the response is strict JSON. Do not include markdown wraps, just return the raw JSON object.`,
      config: {
        responseMimeType: "application/json",
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Vibe Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze vibe with Gemini." });
  }
});

// Start server and handle Vite middleware / Static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
