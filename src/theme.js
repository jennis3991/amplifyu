// ═══════════════════════════════════════════════════════════════════════════
// SOHO HOME DESIGN SYSTEM — v2
// Palette: Warm Parchment · Deep Charcoal · Sage Green · Linen Borders
// ═══════════════════════════════════════════════════════════════════════════
export const T = {
  // ── Backgrounds ─────────────────────────────────────────────────────────
  bg:      "#F7F3EC",    // Warm parchment — main background
  surface: "#EDE8DF",    // Linen — card surfaces
  card:    "#EDE8DF",    // Linen — nested cards
  cardDark:"#231E18",    // Walnut dark — cinematic dark surfaces

  // ── Ink ──────────────────────────────────────────────────────────────────
  ink:   "#2C2416",      // Deep charcoal brown — primary text
  text:  "#2C2416",
  text2: "#6B5E44",      // Warm muted brown — secondary text
  text3: "#8A7B66",      // Warm stone — tertiary
  text4: "#B8AFA4",      // Warm pebble — meta / placeholder

  // ── Structural dark (buttons, dark UI) ───────────────────────────────────
  navy:      "#2C2416",  // Deep charcoal — button backgrounds
  navyLight: "#EDE8DF",  // Linen light — hover states

  // ── Sage Green (primary accent — replaces brass) ─────────────────────────
  gold:      "#8A9E84",  // Muted sage green — primary accent
  goldLight: "#EBF0EB",  // Pale sage wash — tinted backgrounds
  goldDark:  "#527060",  // Deep sage — text on light, icons

  // ── Borders ──────────────────────────────────────────────────────────────
  border:  "#DDD5C4",    // Warm linen border
  divider: "#DDD5C4",    // Thin warm hairline

  // ── Status ───────────────────────────────────────────────────────────────
  green:   "#527060",    // Deep sage — success
  greenBg: "#EBF0EB",    // Sage wash
  red:     "#8B4A38",    // Terracotta — error

  // ── Terracotta accent ────────────────────────────────────────────────────
  terracotta:  "#C07055",
  terracottaBg:"#F5EDE8",

  // ── Unified sage aliases ─────────────────────────────────────────────────
  sage:   "#8A9E84",
  sageBg: "#EBF0EB",

  // ── Typography ────────────────────────────────────────────────────────────
  // Headings: Cormorant Garamond — warm editorial authority
  // UI body:  Inter 300/400 — precise and readable
  serif: "'Cormorant Garamond','Georgia',serif",
  sans:  "'Inter',-apple-system,sans-serif",

  accentMd: "#C4B9AC",
};

// SVG colour palette (used in diagram components)
export const C = {
  gold:"#B79A6B", teal:"#7BA99A", red:"#C47A7A", green:"#4A9E76",
  navyLight:"#E8EBF0", white:"rgba(255,255,255,0.88)",
  dim:"rgba(255,255,255,0.38)", faint:"rgba(255,255,255,0.07)",
};

// SVG icon stroke defaults
export const S = "#8A9E84";
export const SI = { stroke: S, strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
