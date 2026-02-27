import { PlaceImage } from "@/components/PlaceImage";
import { useAuth } from "@/contexts/AuthContext";
import { generateContent, type GeminiMessage } from "@/services/gemini";
import { getPlaces } from "@/services/places";
import type { Place } from "@/types";
import { distanceKm, getMapsDirectionsUrl, getUserLocation } from "@/utils/geolocation";
import { useCallback, useMemo, useRef, useState } from "react";

const SYSTEM_PROMPT = `You are a friendly, knowledgeable assistant for Trinetra—an app for pilgrims and spiritual travellers. Your role is to help with:

1. **Places & sites**: Temples, holy places, dharamshalas, ghats, sacred spots, and pilgrimage circuits. Suggest what to visit and in what order when users ask.

2. **Essential services**: Medical facilities, hospitals, pharmacies, toilets, drinking water, rest areas, and parking. Pilgrims often need these urgently—give clear, practical answers.

3. **Food & stay**: Where to eat (vegetarian/sattvic options), dharamshalas, lodges, and accommodation near the pilgrimage area.

4. **Safety & lost & found**: General safety tips, what to do if someone is lost, and remind users they can report or view lost/found persons in the app’s Lost & Found section.

5. **Events & timings**: Aarti timings, festival dates, special darshan, and crowd tips when relevant.

6. **General travel**: Weather, what to carry, dress code, and local customs when appropriate.

Keep answers concise, warm, and practical. When the user asks for nearby places or suggestions, they will see place cards below your message (name, image, distance, map link)—so focus on describing options and tips rather than listing coordinates. Encourage use of "Suggest places nearby" for a list of places with map links.`;

type ChatMessage = { role: "user" | "model"; text: string };
type PlaceCard = Place & { distanceKm?: number };

export default function AssistantPage() {
  useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", text: "Hi! I’m your Trinetra assistant. Ask me anything about travel or pilgrimage, or tap **Suggest places nearby** to see places near you with names, photos, and map links." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placeCards, setPlaceCards] = useState<PlaceCard[]>([]);
  const [locationStatus, setLocationStatus] = useState<"idle" | "getting" | "done" | "denied">("idle");
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  const historyForGemini = useMemo((): GeminiMessage[] => {
    return messages
      .filter((m) => m.role === "user" || m.role === "model")
      .map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setInput("");
      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setPlaceCards([]);
      setError("");
      setLoading(true);
      try {
        const reply = await generateContent(trimmed, {
          systemPrompt: SYSTEM_PROMPT,
          history: historyForGemini.slice(-20),
        });
        setMessages((prev) => [...prev, { role: "model", text: reply }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong.";
        setError(msg);
        setMessages((prev) => [...prev, { role: "model", text: `Sorry, I couldn’t respond: ${msg}` }]);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    },
    [loading, historyForGemini, scrollToBottom]
  );

  const suggestPlacesNearby = useCallback(async () => {
    setLocationStatus("getting");
    setError("");
    const coords = await getUserLocation();
    if (!coords) {
      setLocationStatus("denied");
      setError("Location access is needed to suggest nearby places. Please enable it in your browser.");
      return;
    }
    setLocationStatus("done");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: "Suggest places nearby" },
      { role: "model", text: "Here are places near you. Tap **Open in Maps** on any card to get directions." },
    ]);
    setPlaceCards([]);
    try {
      const places = await getPlaces();
      const withDistance: PlaceCard[] = places
        .filter((p) => p.latitude != null && p.longitude != null)
        .map((p) => ({
          ...p,
          distanceKm: distanceKm(coords, { lat: p.latitude!, lng: p.longitude! }),
        }))
        .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
        .slice(0, 20);
      setPlaceCards(withDistance);
      if (withDistance.length === 0) {
        setMessages((prev) => [
          ...prev,
          { role: "model", text: "No places with location data in the app yet. Check back later or ask the admin to add places with coordinates." },
        ]);
      }
    } catch {
      setError("Failed to load places.");
    }
    setTimeout(scrollToBottom, 200);
  }, [scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] max-h-[700px] pb-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
        <p className="text-slate-600 text-sm mt-1">Pilgrimage help: temples, places, medical, food, stay, lost & found.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          "Temples & holy places",
          "Medical & toilets nearby",
          "Food & stay",
          "Lost & Found help",
          "Safety tips",
          "Best places to visit",
        ].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => sendMessage(label)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-orange-100 hover:text-orange-800 disabled:opacity-60"
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-800 text-sm border border-amber-200 flex justify-between items-center">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} className="text-amber-600 font-medium">Dismiss</button>
        </div>
      )}

      <button
        type="button"
        onClick={suggestPlacesNearby}
        disabled={locationStatus === "getting"}
        className="mb-4 w-full py-3 rounded-xl bg-orange-600 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {locationStatus === "getting" ? (
          <>Getting location…</>
        ) : (
          <>Suggest places nearby</>
        )}
      </button>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "bg-orange-600 text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 bg-slate-100 text-slate-500 text-sm">Thinking…</div>
          </div>
        )}

        {placeCards.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium text-slate-700">Places near you ({placeCards.length})</p>
            {placeCards.map((place) => (
              <div
                key={place.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <div className="flex gap-3 p-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <PlaceImage
                      src={place.imageUrl}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      containerClassName="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{place.name}</h3>
                    {place.distanceKm != null && (
                      <p className="text-slate-500 text-xs mt-0.5">
                        {place.distanceKm < 1 ? `${Math.round(place.distanceKm * 1000)} m away` : `${place.distanceKm.toFixed(1)} km away`}
                      </p>
                    )}
                    {place.latitude != null && place.longitude != null && (
                      <p className="text-slate-400 text-xs font-mono mt-0.5">
                        {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
                      </p>
                    )}
                    <a
                      href={getMapsDirectionsUrl({
                        latitude: place.latitude,
                        longitude: place.longitude,
                        address: place.address,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-orange-600 text-sm font-medium"
                    >
                      Open in Maps →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything or ask for place suggestions..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4">
          Send
        </button>
      </form>
    </div>
  );
}
