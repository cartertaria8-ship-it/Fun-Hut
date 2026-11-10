import { useEffect } from "react";
import { setMusicEnabled, setSoundEnabled, unlockAudio } from "@/lib/audio";
import { useGame } from "@/lib/store";

/** Applies saved sound/music/motion settings app-wide. */
export function AppEffects() {
  const { settings } = useGame();
  useEffect(() => {
    setSoundEnabled(settings.sound);
    setMusicEnabled(settings.music);
    document.documentElement.classList.toggle("calm", settings.calm);
  }, [settings]);
  useEffect(() => {
    const h = () => unlockAudio();
    window.addEventListener("pointerdown", h, { once: true });
    return () => window.removeEventListener("pointerdown", h);
  }, []);
  return null;
}
