import { HAIR_COLOURS, SKIN_TONES, itemById } from "@/lib/avatar-items";
import type { AvatarLook } from "@/lib/store";

export function Avatar({ look, className }: { look: AvatarLook; className?: string }) {
  const skin = SKIN_TONES[look.skin] ?? SKIN_TONES[0];
  const hairC = HAIR_COLOURS[look.hairColor] ?? HAIR_COLOURS[0];
  const hair = itemById(look.hair)?.value ?? "short";
  const outfit = itemById(look.outfit)?.value ?? "orange";
  const shoes = itemById(look.shoes)?.value ?? "red";
  const hat = itemById(look.hat)?.value ?? "";
  const glasses = itemById(look.glasses)?.value ?? "";
  const pack = itemById(look.backpack)?.value ?? "";
  const girl = look.gender === "girl";

  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label="Player avatar">
      {pack && <rect x="38" y="138" width="124" height="70" rx="22" fill={pack} />}
      {hair === "long" && <path d="M48 80 Q46 160 70 168 L130 168 Q154 160 152 80 Z" fill={hairC} />}
      {/* body: girls wear a flared dress, boys a shirt with shorts */}
      {girl ? (
        <>
          <rect x="70" y="196" width="22" height="30" rx="10" fill={skin} />
          <rect x="108" y="196" width="22" height="30" rx="10" fill={skin} />
          <path d="M66 150 Q66 132 100 130 Q134 132 134 150 L154 204 Q100 218 46 204 Z" fill={outfit} />
          <path d="M60 186 Q100 198 140 186" stroke="white" strokeOpacity="0.5" strokeWidth="5" fill="none" />
        </>
      ) : (
        <>
          <rect x="66" y="204" width="28" height="22" rx="10" fill={skin} />
          <rect x="106" y="204" width="28" height="22" rx="10" fill={skin} />
          <path d="M58 150 Q58 132 100 130 Q142 132 142 150 L144 182 L56 182 Z" fill={outfit} />
          <path d="M60 180 L140 180 L142 210 L104 210 L100 196 L96 210 L58 210 Z" fill="oklch(0.42 0.08 255)" />
        </>
      )}
      <ellipse cx="78" cy="228" rx="22" ry="10" fill={shoes} />
      <ellipse cx="122" cy="228" rx="22" ry="10" fill={shoes} />
      {/* head */}
      <circle cx="100" cy="86" r="52" fill={skin} />
      <circle cx="48" cy="90" r="11" fill={skin} />
      <circle cx="152" cy="90" r="11" fill={skin} />
      {hair === "short" && <path d="M48 82 Q50 30 100 30 Q150 30 152 82 Q130 56 100 58 Q70 56 48 82 Z" fill={hairC} />}
      {hair === "long" && <path d="M48 86 Q48 30 100 30 Q152 30 152 86 Q128 54 100 56 Q72 54 48 86 Z" fill={hairC} />}
      {hair === "curly" && (
        <g fill={hairC}>
          {[52, 70, 90, 110, 130, 148].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 40 : 52} r="18" />
          ))}
        </g>
      )}
      {hair === "puffs" && (
        <g fill={hairC}>
          <circle cx="54" cy="44" r="22" />
          <circle cx="146" cy="44" r="22" />
          <path d="M52 76 Q56 36 100 36 Q144 36 148 76 Q126 56 100 58 Q74 56 52 76 Z" />
        </g>
      )}
      {hair === "spiky" && <path d="M50 78 L58 36 L74 56 L86 26 L100 52 L114 24 L126 54 L142 34 L150 78 Q126 58 100 60 Q74 58 50 78 Z" fill={hairC} />}
      {/* face */}
      <circle cx="80" cy="92" r="8" fill="oklch(0.25 0.04 260)" />
      <circle cx="120" cy="92" r="8" fill="oklch(0.25 0.04 260)" />
      <circle cx="83" cy="89" r="2.6" fill="white" />
      <circle cx="123" cy="89" r="2.6" fill="white" />
      {girl && (
        <g stroke="oklch(0.25 0.04 260)" strokeWidth="3" strokeLinecap="round">
          <path d="M71 86 L65 80 M75 83 L72 76" />
          <path d="M129 86 L135 80 M125 83 L128 76" />
        </g>
      )}
      <circle cx="68" cy="110" r="8" fill="oklch(0.75 0.13 20)" opacity="0.45" />
      <circle cx="132" cy="110" r="8" fill="oklch(0.75 0.13 20)" opacity="0.45" />
      <path d="M84 112 Q100 128 116 112" stroke={girl ? "oklch(0.6 0.18 15)" : "oklch(0.3 0.06 30)"} strokeWidth="5" fill="none" strokeLinecap="round" />
      {glasses === "round" && (
        <g stroke="oklch(0.3 0.05 260)" strokeWidth="4" fill="white" fillOpacity="0.15">
          <circle cx="80" cy="92" r="16" />
          <circle cx="120" cy="92" r="16" />
          <path d="M96 92 L104 92" />
        </g>
      )}
      {glasses === "star" && (
        <g fontSize="40" textAnchor="middle" dominantBaseline="central">
          <text x="80" y="92">⭐</text>
          <text x="120" y="92">⭐</text>
        </g>
      )}
      {hat && (
        <text x="100" y="34" fontSize="62" textAnchor="middle" dominantBaseline="central">
          {hat}
        </text>
      )}
    </svg>
  );
}
