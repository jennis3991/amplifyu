import { useState } from 'react';
import { T } from '../theme.js';
import { THEORY_DATA, FURTHER_READING } from '../data.js';
import { DIAGRAMS, MODULE_ICONS } from '../diagrams.jsx';
import { THEORY_IMAGES } from '../images.js';

export function EditorialTheoryCard({ day, t, image }) {
  const [open, setOpen] = useState(false);
  const goldDark = "#9A8054";
  const goldLight = "#F0E8D8";

  return (
    <div style={{
      background: "#FDFAF5",
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "0 4px 32px rgba(17,28,46,0.10)",
      border: "1px solid rgba(138,158,132,0.18)",
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, 
${T.gold}, rgba(138,158,132,0.25))` }} />

      <div style={{ padding: "16px 20px 0" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: goldLight, border: "1px solid rgba(138,158,132,0.3)",
          borderRadius: 6, padding: "4px 11px", marginBottom: 12,
        }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: goldDark, 
textTransform: "uppercase", letterSpacing: 2 }}>
            The Framework
          </span>
        </div>
        <h2 style={{
          fontFamily: T.serif, fontSize: 30, fontWeight: 700, color: 
T.navy,
          lineHeight: 1.12, letterSpacing: "-0.4px", margin: "0 0 4px",
        }}>
          {t.theory.split(" \u00b7 ")[0].split(" (")[0]}
        </h2>
        {image.subtitle && (
          <p style={{ fontSize: 13, color: "#9BA5AF", fontStyle: "italic", 
margin: 0 }}>{image.subtitle}</p>
        )}
      </div>

      <div style={{ margin: "14px 20px", padding: "15px 17px", background: 
T.navy, borderRadius: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 11 
}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" 
style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="11" cy="8" r="5" stroke={T.gold} strokeWidth="1.4" 
/>
            <path d="M9 15h4M10 17h2" stroke={T.gold} strokeWidth="1.3" 
strokeLinecap="round" />
          </svg>
          <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, 
color: "rgba(255,255,255,0.95)", lineHeight: 1.45, margin: 0 }}>
            {image.insight}
          </p>
        </div>
      </div>

      {image.captionPosition === "above" && (
        <div style={{ margin: "0 20px 10px", padding: "14px 18px", 
background: T.navy, borderRadius: 12, borderBottom: `2px solid ${T.gold}` 
}}>
          <div style={{ fontSize: 9, fontWeight: 800, color: T.gold, 
textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 7 }}>
            {image.captionLabel}
          </div>
          <p style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, 
lineHeight: 1.5, margin: 0, color: "rgba(255,250,242,0.95)" }}>
            {image.captionText}
          </p>
        </div>
      )}

      <div style={{ position: "relative", margin: "0 20px 16px", 
borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 16px rgba(17,28,46,0.18)" }}>
        {image.imageTablet ? (
          <picture>
            <source media="(min-width: 768px)" srcSet={image.imageTablet}/>
            <img src={image.image} alt={image.alt} style={{ width: "100%", height: "auto", display: "block" }}/>
          </picture>
        ) : (
          <img src={image.image} alt={image.alt} style={{ width: "100%", display: "block", aspectRatio: "1 / 1", objectFit: "cover", objectPosition: image.imgObjectPosition || "center" }}/>
        )}
        {image.captionPosition !== "above" && (
          <>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 
0, height: "55%", background: "linear-gradient(to top, rgba(20,15,8,0.85) 0%, rgba(20,15,8,0.5) 50%, rgba(20,15,8,0) 100%)", pointerEvents: "none" 
}} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 
0, padding: "20px 22px 22px", color: "white" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: T.gold, 
textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 8 
}}>{image.captionLabel}</div>
              <p style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 
600, lineHeight: 1.45, margin: 0, color: "rgba(255,250,242,0.97)", 
textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>{image.captionText}</p>
            </div>
          </>
        )}
      </div>

      <div style={{ height: 1, background: "rgba(17,28,46,0.07)", margin: 
"0 20px" }} />

      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, 
marginBottom: 10 }}>
          <div style={{ width: 3, height: 18, background: T.gold, 
borderRadius: 2 }} />
          <span style={{ fontSize: 10, fontWeight: 800, color: goldDark, 
textTransform: "uppercase", letterSpacing: 2 }}>The Science</span>
        </div>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, 
margin: 0 }}>{t.concept}</p>
      </div>

      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", 
padding: "14px 20px", background: open ? goldLight : "transparent", 
border: "none", borderTop: "1px solid rgba(138,158,132,0.18)", cursor: 
"pointer", display: "flex", alignItems: "center", justifyContent: 
"space-between", textAlign: "left", transition: "background 0.2s" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: goldDark, 
textTransform: "uppercase", letterSpacing: 2, marginBottom: 2 }}>In Your 
World</div>
          {!open && <div style={{ fontSize: 13, color: "#6B7280" }}>Tap to 
see how this applies to you</div>}
        </div>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" 
style={{ transform: open ? "rotate(180deg)" : "none", transition: 
"transform 0.22s", flexShrink: 0 }}>
          <path d="M4 7l5 5 5-5" stroke={goldDark} strokeWidth="1.8" 
strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "4px 20px 20px" }}>
          <p style={{ fontFamily: T.serif, fontSize: 15, fontStyle: 
"italic", color: "#1A1C22", lineHeight: 1.8, margin: 0 }}>{t.life}</p>
        </div>
      )}
    </div>
  );
}

export function TheoryCard({ day }) {
  const t = THEORY_DATA[day - 1];
  const Diagram = DIAGRAMS[day - 1];
  if (!t) return null;
  const image = THEORY_IMAGES[day];
  if (image) return <EditorialTheoryCard day={day} t={t} image={image} />;
  if (!Diagram) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: T.cardDark, borderRadius: 2, overflow: 
"hidden" }}>
        <div style={{ height: 2, background: `linear-gradient(90deg, 
${T.gold}, rgba(138,158,132,0.2))` }} />
        <div style={{ padding: "20px 20px 22px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: T.gold, 
textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            {"Theory \u00b7 "}{t.theory}
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", 
lineHeight: 1.65, margin: "0 0 16px" }}>{t.concept}</p>
          <div style={{ background: "rgba(255,255,255,0.025)", border: 
"1px solid rgba(255,255,255,0.06)", borderRadius: 2, padding: "16px 10px 10px", display: "flex", justifyContent: "center", overflowX: "auto", 
marginBottom: 16 }}>
            <Diagram />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" 
}}>
            <div style={{ width: 2, flexShrink: 0, alignSelf: "stretch", 
background: T.gold, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", 
lineHeight: 1.65, margin: 0 }}>{t.life}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
