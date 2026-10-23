import { useEffect, useRef, useState } from "react";

// ─── Certificate of completion — Day 14 Review ───────────────────────────────
// Drawn entirely on the device: the name the user types is used to render the
// image here and is kept only in this device's storage (au1_cert_name) so they
// can re-save it later. Nothing is sent anywhere. The result is a real <img>
// (JPEG data URL) so a long-press offers "Save to Photos" on iPhone; desktop
// gets a download link. "Add to LinkedIn" opens LinkedIn's add-certification
// form with the details prefilled; the user attaches the saved image there.

const W = 2400, H = 1600;
const INK = "#1E1B17", MUTED = "#6F675C", GOLD = "#A08A6A", PAPER = "#F6F3EC";
const SANS = "Inter, system-ui, sans-serif";

const CERT_NAME = "AmplifyU Career Growth Skills";
const ISSUER = "AmplifyU Technologies Limited";

// Logo geometry traced from public/logo-mark.png (1254px square), drawn as
// outlines so it stays sharp at any size.
const LOGO_A = "M336 946 L583 298 L668 298 L910 946 L818 946 L626 418 L428 946 Z";
const LOGO_QUEEN = "M541 946 L541 916 C580 885 597 840 597 770 L578 762 L578 748 L597 742 C597 700 585 680 561 666 C565 656 585 652 597 662 C600 650 608 644 613 640 L612 626 C600 620 602 595 625 594 C648 595 650 620 638 626 L637 640 C642 644 650 650 653 662 C665 652 685 656 688 666 C664 680 652 700 652 742 L671 748 L671 762 L652 770 C652 840 669 885 706 916 L706 946 Z";

// The six skills, 24px stroke icons.
const SKILLS = [
  { label: ["COMMUNICATION", "CLARITY"], icon: "M3 6.5h11a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H8l-3.5 3v-3H3A1.5 1.5 0 0 1 1.5 13V8A1.5 1.5 0 0 1 3 6.5z M18 10h1.5A1.5 1.5 0 0 1 21 11.5v5a1.5 1.5 0 0 1-1.5 1.5h-1v3l-3.5-3H10" },
  { label: ["STORYTELLING", "& STRUCTURE"], icon: "M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z M12 6.5v13" },
  { label: ["EXECUTIVE", "PRESENCE"], icon: "M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8z M4.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" },
  { label: ["INFLUENCE", "& RAPPORT"], icon: "M4 20v-4 M9 20v-7 M14 20v-10 M19 20V8 M3 11l5-4 4 3 7-6 M15 4h4v4" },
  { label: ["PERSONAL BRAND", "& VISIBILITY"], icon: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M12 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9z M12 11a1 1 0 1 0 0 2a1 1 0 1 0 0-2z M13 11l7-7 M17 4h3v3" },
  { label: ["DIFFICULT", "CONVERSATIONS"], icon: "M8 5a3 3 0 1 0 0 6a3 3 0 1 0 0-6z M16 5a3 3 0 1 0 0 6a3 3 0 1 0 0-6z M2.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5 M10.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" },
];

function spaced(ctx, text, x, y, spacing, align = "left") {
  // Canvas letter-spacing isn't supported everywhere; draw char by char.
  const widths = [...text].map(c => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
  let cx = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  const prev = ctx.textAlign; ctx.textAlign = "left";
  [...text].forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + spacing; });
  ctx.textAlign = prev;
  return total;
}

function drawLogo(ctx, x, y, size, color, lw) {
  // Maps the logo's 336..910 x 298..946 box into a square of `size` at (x,y).
  const s = size / 648;
  ctx.save();
  ctx.translate(x - 336 * s + (size - 574 * s) / 2, y - 298 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = color; ctx.lineWidth = lw / s; ctx.lineJoin = "miter";
  ctx.stroke(new Path2D(LOGO_A));
  ctx.stroke(new Path2D(LOGO_QUEEN));
  ctx.restore();
}

function wrap(ctx, text, maxW) {
  const words = text.split(" "); const lines = []; let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function drawCertificate(canvas, name, dateText) {
  const ctx = canvas.getContext("2d");
  canvas.width = W; canvas.height = H;

  // Paper
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#FBF9F4"); bg.addColorStop(1, PAPER);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Dark panel on the right with a light bevelled edge
  ctx.save();
  ctx.beginPath(); ctx.moveTo(2060, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(1780, H); ctx.closePath();
  const edge = ctx.createLinearGradient(1780, 0, 2100, 0);
  edge.addColorStop(0, "#E9E4DA"); edge.addColorStop(1, "#CFC6B6");
  ctx.fillStyle = edge; ctx.fill();
  ctx.beginPath(); ctx.moveTo(2110, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(1830, H); ctx.closePath();
  const dark = ctx.createLinearGradient(1830, 0, W, H);
  dark.addColorStop(0, "#2A2622"); dark.addColorStop(1, "#141210");
  ctx.fillStyle = dark; ctx.fill();
  ctx.strokeStyle = "rgba(201,180,140,0.55)"; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(2110, 0); ctx.lineTo(1830, H); ctx.stroke();
  ctx.restore();
  drawLogo(ctx, 1990, 430, 400, "rgba(176,156,122,0.75)", 8);

  ctx.textBaseline = "alphabetic";

  // Top-left mark
  drawLogo(ctx, 150, 56, 150, INK, 3.5);
  ctx.fillStyle = INK; ctx.font = `600 28px ${SANS}`;
  spaced(ctx, "AMPLIFYU", 222, 250, 8, "center");

  // Strapline
  ctx.fillStyle = MUTED; ctx.font = `400 30px ${SANS}`;
  ["COMMUNICATE.", "LEAD.", "THRIVE."].forEach((t, i) => spaced(ctx, t, 1525, 118 + i * 46, 10));
  ctx.fillStyle = GOLD; ctx.fillRect(1525, 240, 170, 2);

  // Titles
  ctx.fillStyle = INK; ctx.font = `400 40px ${SANS}`;
  spaced(ctx, "CERTIFICATE OF COMPLETION", 140, 362, 14);
  ctx.font = `800 196px ${SANS}`;
  const aw = spaced(ctx, "AMPLIFYU", 134, 560, 4);
  ctx.font = `500 34px ${SANS}`; ctx.fillText("™", 134 + aw + 10, 432);
  ctx.font = `400 74px ${SANS}`;
  spaced(ctx, "CAREER GROWTH SKILLS", 140, 662, 7);
  ctx.fillStyle = GOLD; ctx.fillRect(140, 712, 140, 3);

  // Presented to
  ctx.fillStyle = MUTED; ctx.font = `400 30px ${SANS}`;
  spaced(ctx, "THIS CERTIFICATE IS PROUDLY PRESENTED TO", 144, 790, 9);

  // Name, shrunk to fit
  const display = (name || "").trim() || "Your Name";
  let size = 136;
  ctx.font = `300 ${size}px ${SANS}`;
  while (ctx.measureText(display).width > 1520 && size > 60) { size -= 4; ctx.font = `300 ${size}px ${SANS}`; }
  ctx.fillStyle = name && name.trim() ? INK : "rgba(30,27,23,0.25)";
  ctx.fillText(display, 136, 930);

  // Description
  ctx.fillStyle = "#3A352E"; ctx.font = `400 40px ${SANS}`;
  wrap(ctx, "For completing the 14-day AmplifyU programme, developing essential career growth skills in communication, storytelling, executive presence, influence and personal brand.", 1440)
    .forEach((l, i) => ctx.fillText(l, 142, 1012 + i * 54));

  // Skills row
  const sx = 142, colW = 272, top = 1190;
  SKILLS.forEach((sk, i) => {
    const cx = sx + i * colW + colW / 2;
    ctx.fillStyle = "#E6E0D5"; ctx.beginPath(); ctx.arc(cx, top + 62, 62, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(cx - 36, top + 26); ctx.scale(3, 3);
    ctx.strokeStyle = "#5C554B"; ctx.lineWidth = 1.3 / 1; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke(new Path2D(sk.icon)); ctx.restore();
    ctx.fillStyle = INK; ctx.font = `500 22px ${SANS}`;
    sk.label.forEach((t, j) => spaced(ctx, t, cx, top + 172 + j * 34, 3.5, "center"));
    if (i < SKILLS.length - 1) { ctx.fillStyle = "#D8D1C4"; ctx.fillRect(sx + (i + 1) * colW, top + 10, 2, 210); }
  });

  // Issued by / date
  ctx.fillStyle = "#CFC7B8"; ctx.fillRect(142, 1500, 700, 2); ctx.fillRect(1030, 1500, 560, 2);
  ctx.fillStyle = INK; ctx.font = `400 36px ${SANS}`;
  ctx.fillText(ISSUER, 142, 1480);
  ctx.font = `400 38px ${SANS}`; spaced(ctx, dateText, 1032, 1480, 4);
  ctx.fillStyle = MUTED; ctx.font = `400 24px ${SANS}`;
  spaced(ctx, "ISSUED BY", 144, 1546, 8);
  spaced(ctx, "DATE OF COMPLETION", 1032, 1546, 8);
}

function lsGet(k, d = "") { try { return localStorage.getItem(k) ?? d; } catch { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch {} }

export function CertificateCard({ T, T2, isDesktop: d }) {
  // Completion date: fixed the first time the certificate is shown.
  const [issued] = useState(() => {
    let iso = lsGet("au1_cert_date");
    if (!iso) { iso = new Date().toISOString().slice(0, 10); lsSet("au1_cert_date", iso); }
    return new Date(iso + "T12:00:00");
  });
  const dateText = issued.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
  const [name, setName] = useState(() => lsGet("au1_cert_name"));
  const [img, setImg] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      try { await Promise.all(["300 100px Inter", "400 100px Inter", "500 100px Inter", "600 100px Inter", "800 100px Inter"].map(f => document.fonts.load(f))); } catch {}
      if (cancelled) return;
      const c = canvasRef.current || (canvasRef.current = document.createElement("canvas"));
      drawCertificate(c, name, dateText);
      setImg(c.toDataURL("image/jpeg", 0.92));
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [name, dateText]);

  // Only once every earlier day is complete (Day 14 itself completes when
  // the user taps Complete Programme on this page).
  const eligible = (() => { try { const dn = JSON.parse(localStorage.getItem("au1_done") || "[]"); return [1,2,3,4,5,6,7,8,9,10,11,12,13].every(n => dn.includes(n)); } catch { return false; } })();
  if (!eligible) return null;
  const hasName = name.trim().length > 0;
  const linkedIn = "https://www.linkedin.com/profile/add?" + new URLSearchParams({
    startTask: "CERTIFICATION_NAME", name: CERT_NAME, organizationName: "AmplifyU",
    issueYear: String(issued.getFullYear()), issueMonth: String(issued.getMonth() + 1),
  }).toString();
  const btn = { display: "block", width: "100%", textAlign: "center", padding: d ? "13px" : "12px", borderRadius: 4, fontFamily: T.sans, fontSize: d ? 14 : 13, fontWeight: 600, textDecoration: "none", boxSizing: "border-box" };

  return (
    <div style={{ background: T2.surface, borderRadius: d ? 6 : 8, border: "0.5px solid " + T2.border, padding: d ? "24px 26px" : "18px 18px", marginBottom: d ? 20 : 16 }}>
      <div style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 8 }}>Your certificate</div>
      <p style={{ fontFamily: T.serif, fontSize: d ? 20 : 18, fontWeight: 600, color: T2.text, lineHeight: 1.3, margin: "0 0 6px" }}>You've completed AmplifyU.</p>
      <p style={{ fontFamily: T.sans, fontSize: d ? 14 : 13, color: T2.text3, lineHeight: 1.55, margin: "0 0 14px" }}>Add the name you'd like on your certificate. It stays on this device and is never sent anywhere.</p>

      <label style={{ display: "block", fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T2.text3, marginBottom: 6 }} htmlFor="au-cert-name">Name on certificate</label>
      <input id="au-cert-name" value={name} maxLength={60} autoComplete="name" placeholder="e.g. Jordan Taylor"
        onChange={e => { setName(e.target.value); lsSet("au1_cert_name", e.target.value); }}
        style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 4, border: "0.5px solid " + T2.border, background: T2.bg, color: T2.text, fontFamily: T.sans, fontSize: 16, marginBottom: 14, outline: "none" }} />

      {img && (
        <img src={img} alt={hasName ? `AmplifyU certificate of completion for ${name.trim()}` : "AmplifyU certificate of completion preview"}
          style={{ display: "block", width: "100%", height: "auto", borderRadius: 4, border: "0.5px solid " + T2.border, boxShadow: "0 6px 24px rgba(20,18,16,0.12)", WebkitTouchCallout: "default", userSelect: "auto", marginBottom: 12 }} />
      )}

      {hasName ? (
        <>
          {d ? (
            <a href={img} download="AmplifyU-Certificate.jpg" style={{ ...btn, background: T.ink, color: T.bg, marginBottom: 10 }}>Download certificate</a>
          ) : (
            <p style={{ fontFamily: T.sans, fontSize: 13, color: T2.text3, textAlign: "center", margin: "0 0 12px" }}>Press and hold the certificate to save it to Photos.</p>
          )}
          <a href={linkedIn} target="_blank" rel="noreferrer" style={{ ...btn, border: "1px solid " + T.gold, color: T.gold, background: "transparent" }}>Add to LinkedIn →</a>
          <p style={{ fontFamily: T.sans, fontSize: 11, color: T2.text4, textAlign: "center", lineHeight: 1.5, margin: "10px 0 0" }}>LinkedIn opens with the details filled in. Attach your saved certificate there.</p>
        </>
      ) : (
        <p style={{ fontFamily: T.sans, fontSize: 12, color: T2.text4, textAlign: "center", margin: 0 }}>Add your name to save your certificate.</p>
      )}
    </div>
  );
}
