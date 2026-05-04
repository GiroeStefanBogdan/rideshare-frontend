# Design System — Heritage in Motion (DrumBun)

## Creative North Star

DrumBun rejects the cold, transactional aesthetic of commercial ride-sharing. The design language is **Modern Folk Minimalist**: clean, high-utility digital interfaces grounded by the timeless geometry of Romanian wood-carving and _IA_ (traditional blouse) embroidery.

The guiding personality: *a helpful neighbor who knows the old stories but uses a smartphone.* Trustworthy, neighborly, cultural, professional — never corporate, never cold.

---

## Brand Voice

- **Tone:** Warm and direct. Community-first, never salesy.
- **Mission framing:** Non-profit, collaborative, community-driven transport — not a commercial service.
- **Language:** Romanian UI strings are intentional and correct (e.g. "Căută Curse", "PLECĂM DIN..."). Do not translate them to English.

---

## Color Palette: The Voroneț Foundation

Named after the Voroneț Monastery, whose deep cobalt blue is one of Romania's most iconic visual symbols.

| Token | Hex | Meaning | Primary Usage |
|---|---|---|---|
| `voronet` | `#003399` | Trust, heritage, action | CTAs, active states, links, prominent accents |
| `charcoal` | `#333333` | Readability, professionalism | All body text, secondary UI elements |
| `soft-white` | `#F8F9FA` | Airy, breathing room | Page backgrounds |
| `heritage` | `#F3F4F5` | Subtle structure | Card backgrounds, dividers, decorative motifs |

**Color usage rules:**
- `voronet` is the only color for primary buttons and active navigation states. Do not use it decoratively for non-interactive elements.
- Never use pure `#000000` black — use `charcoal` for all dark text.
- Background layers for folk motifs should use `heritage` or `voronet` at very low opacity (`opacity-5` to `opacity-10`).

---

## Typography

**Primary font:** Manrope (loaded via Google Fonts or self-hosted). Fall back to any modern geometric sans-serif.

| Role | Tailwind classes | Notes |
|---|---|---|
| H1 — hero headlines | `text-4xl font-bold tracking-tight` | Emotional, high-impact |
| H2 — section headers | `text-2xl font-semibold` | Clear hierarchy |
| H3 — card headers | `text-xl font-semibold` | Component-level headers |
| Body | `text-base font-normal leading-relaxed` | Optimised for legibility |
| Accent labels | `text-xs font-semibold uppercase tracking-widest` | Field labels, tags, e.g. "PLECĂM DIN..." |

---

## The Folk Motifs

These are the heart of the visual identity. They must be used consistently and with restraint — heavy-handed use breaks the minimalist balance.

### Geometric Background Pattern
- A repeating SVG motif based on traditional Romanian wood-carving: rhombuses, X-shapes, and sun-circles
- **Usage:** Hero sections and major landing areas only
- **Opacity:** `opacity-5` to `opacity-10` — subtle texture, never dominant
- **Color:** `voronet` or `charcoal` at low opacity against `soft-white` backgrounds
- Never use the pattern as a solid fill or at full opacity

### The IA Border
- Subtle 1–2px geometric border applied to Search Cards and Ride Cards
- Implemented as `border border-heritage` with a slight inner shadow
- Do not apply to buttons, navigation, or utility components

### Section Dividers
- Use the `<FolkDivider />` component — a repeating geometric "saw-tooth" SVG at low opacity
- Never replace with a plain `<hr>` or a CSS border
- Spacing: `my-12` above and below

---

## Component Design Guidelines

### Search Module
- Floating white card: `bg-white shadow-md rounded-lg p-6`
- Input labels: accent label style (`text-xs font-semibold uppercase tracking-widest text-charcoal`)
- Primary button: `bg-voronet text-white rounded-lg px-6 py-3 hover:opacity-90 transition-opacity`
- Apply the IA border: `border border-heritage`

### Ride Cards
- Emphasise the human element: driver photo displayed in a circular mask (`rounded-full`)
- Photo size: at least `w-12 h-12` — large enough to feel personal
- Pricing: labelled clearly as "Cost Share" — no ambiguity, no hidden fee language
- Trust signals: star rating and review count always visible, never hidden behind a toggle
- Card structure: `bg-white rounded-lg shadow-sm border border-heritage p-4`

### Buttons
- **Primary:** `bg-voronet text-white rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-opacity duration-150`
- **Secondary/Ghost:** `border border-voronet text-voronet rounded-lg px-6 py-3 font-semibold hover:bg-voronet/5 transition-colors duration-150`
- **Destructive:** `bg-red-600 text-white rounded-lg` — only for irreversible actions
- All buttons: `rounded-lg` (8px) — never `rounded-full` or `rounded-none`

---

## Interaction & Motion

The motion language should feel gentle and considered — like turning a page, not a swipe.

| Interaction | Classes |
|---|---|
| Element entrance | `transition-all duration-200 ease-in-out` + slight `translate-y-1` shift |
| Interactive card hover | `hover:scale-[1.02] hover:shadow-lg transition-transform duration-150` |
| Button hover | `hover:opacity-90 transition-opacity duration-150` |
| Overlay / modal fade | `transition-opacity duration-200` |

**Keep motion subtle.** This is a community tool, not a marketing site. Avoid bouncy easings, large-scale transforms, or motion that draws attention to itself. When in doubt, a simple opacity transition is always appropriate.
