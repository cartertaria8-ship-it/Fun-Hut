import type { Face } from "./types";

export function Balloon({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 130" className={className} aria-hidden>
      <path d="M50 100 Q46 115 54 128" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
      <ellipse cx="50" cy="50" rx="38" ry="46" fill={color} />
      <path d="M44 95 L56 95 L50 102 Z" fill={color} />
      <ellipse cx="36" cy="32" rx="8" ry="13" fill="white" opacity="0.45" />
    </svg>
  );
}

export function FaceView({ face, size = "md" }: { face: Face; size?: "md" | "lg" }) {
  if (face.color) return <Balloon color={face.color} className="h-[78%] w-auto text-ink" />;
  if (face.count) {
    return (
      <div className="flex max-w-full flex-wrap items-center justify-center gap-0.5 p-1 text-[clamp(1.1rem,3.6vmin,2rem)] leading-none">
        {Array.from({ length: face.count }, (_, i) => (
          <span key={i}>{face.emoji}</span>
        ))}
      </div>
    );
  }
  return (
    <>
      {face.big && (
        <span
          className={
            size === "lg"
              ? "font-display text-[clamp(4rem,16vmin,9rem)] font-bold leading-none text-ink"
              : "font-display text-[clamp(2.8rem,10vmin,5.5rem)] font-bold leading-none text-ink"
          }
        >
          {face.big}
        </span>
      )}
      {face.emoji && <span className="text-[clamp(2.6rem,9vmin,5rem)] leading-none">{face.emoji}</span>}
      {face.text && (
        <span className={size === "lg" ? "font-display text-[clamp(1.5rem,4.6vmin,2.6rem)] font-bold text-ink" : "font-display text-[clamp(0.95rem,2.6vmin,1.4rem)] font-semibold text-ink"}>
          {face.text}
        </span>
      )}
    </>
  );
}
