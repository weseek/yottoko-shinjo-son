---
name: frontend-design
description: Create accessible, visually refined, production-grade frontend interfaces for municipal applications. Use this skill when implementing UI components, pages, or layouts. Ensures designs achieve both aesthetic sophistication and accessibility for a wide age range including elderly users.
---

This skill guides creation of accessible yet visually polished frontend interfaces for municipal applications. Accessibility and visual refinement are not opposing goals — they reinforce each other. Pursue both with equal commitment.

The user provides frontend requirements: a component, page, application, or interface to build. Context includes a municipal application used by a wide age range including elderly users, for a municipality known for its cherry blossoms (桜).

## Design Thinking

Before coding, understand the context and commit to a CLEAR, ACCESSIBLE, and VISUALLY REFINED direction:
- **Purpose**: What problem does this interface solve? Who uses it? Always assume users include elderly and less tech-savvy people.
- **Tone**: Clean, trustworthy, warm, and sophisticated. Government/civic applications should feel reliable, approachable, and **well-crafted**. Avoid both sterile coldness and excessive decoration.
- **Constraints**: WCAG AA compliance is mandatory. Minimum font size 16px. Line height 1.5+. Contrast ratio 4.5:1+. These constraints are the foundation — build beauty on top of them, never at their expense.
- **Differentiation**: What makes this EASY TO USE and PLEASANT TO LOOK AT? Reduce cognitive load while creating a sense of visual quality and civic pride.

**CRITICAL**: Accessibility is non-negotiable. But "accessible" must never mean "bland." Every interface should feel like it was designed with care, intention, and aesthetic sensibility.

Then implement working code that is:
- Production-grade and functional
- Clear, readable, and immediately understandable
- Visually refined with a cohesive, warm design language
- Accessible to users of all ages and abilities

## Brand Identity: 桜 (Cherry Blossom) Theme

This municipality is known for its cherry blossoms. The design language should subtly reflect this identity without becoming kitschy or overly literal.

### Color System

Use CSS custom properties for all colors. The palette draws from cherry blossoms, their branches, and the spring sky:

```css
:root {
  /* === Primary: 桜 (Sakura Pink) === */
  --color-primary-50:  #fef2f4;    /* 淡桜 — very light background tint */
  --color-primary-100: #fce7eb;    /* 薄桜 — light background, hover states */
  --color-primary-200: #f9c2cc;    /* 桜花 — borders, subtle accents */
  --color-primary-300: #f4899e;    /* 紅桜 — icons, badges, decorative elements */
  --color-primary-400: #e95d7a;    /* 濃桜 — primary buttons, key actions */
  --color-primary-500: #d63d5e;    /* 深桜 — primary button hover, active links */
  --color-primary-600: #b42a4a;    /* 紅梅 — pressed states, strong emphasis */
  --color-primary-700: #8c1f39;    /* 暗紅 — high-contrast text on light bg */

  /* === Secondary: 若葉 (Fresh Green) === */
  --color-secondary-50:  #f0f9f1;
  --color-secondary-100: #d5f0d8;
  --color-secondary-200: #a8deb0;
  --color-secondary-300: #6bc278;
  --color-secondary-400: #4aa85a;  /* success states, positive indicators */
  --color-secondary-500: #357a40;

  /* === Neutral: 墨 (Sumi Ink) === */
  --color-neutral-0:   #ffffff;
  --color-neutral-50:  #f8f7f6;    /* warm off-white background */
  --color-neutral-100: #f0eeec;    /* card backgrounds, secondary bg */
  --color-neutral-200: #e2dfdb;    /* borders, dividers */
  --color-neutral-300: #c5c0b9;    /* disabled text, placeholders */
  --color-neutral-400: #9a9489;    /* secondary text (use sparingly, check contrast) */
  --color-neutral-500: #706a60;    /* secondary text on light bg — meets 4.5:1 on white */
  --color-neutral-600: #4d4840;    /* body text */
  --color-neutral-700: #33302b;    /* headings, primary text */
  --color-neutral-800: #1e1c19;    /* strongest text */

  /* === Semantic === */
  --color-error:       #c53030;
  --color-error-bg:    #fff5f5;
  --color-warning:     #b7791f;
  --color-warning-bg:  #fffff0;
  --color-success:     #357a40;
  --color-success-bg:  #f0f9f1;
  --color-info:        #2b6cb0;
  --color-info-bg:     #ebf8ff;

  /* === Decorative (used sparingly for visual richness) === */
  --color-accent-wisteria: #8b7ec8;  /* 藤色 — optional accent */
  --color-accent-sky:      #6ba3d6;  /* 空色 — links, informational elements */

  /* === Shadows === */
  --shadow-sm:  0 1px 2px rgba(30, 28, 25, 0.06);
  --shadow-md:  0 2px 8px rgba(30, 28, 25, 0.08);
  --shadow-lg:  0 4px 16px rgba(30, 28, 25, 0.10);
  --shadow-xl:  0 8px 32px rgba(30, 28, 25, 0.12);

  /* === Transitions === */
  --transition-fast:   150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow:   400ms ease;
}
```

### Color Usage Principles

- **Primary (桜)** is reserved for key actions, navigation highlights, and brand moments. Do not overuse — its impact comes from restraint.
- **Neutrals** carry the majority of the interface. The warm undertone (not pure gray) gives everything a gentle, organic quality.
- **Semantic colors** are fixed and must never be repurposed. Red means error. Green means success.
- **Decorative accents** (wisteria, sky) are optional touches for visual variety, not core UI elements.
- **Never rely on color alone** to convey meaning. Always pair with icons, labels, or patterns.

## Frontend Design Guidelines

### Typography

- Use highly legible fonts: `"BIZ UDPGothic"`, `"Noto Sans JP"`, or system sans-serif as fallback.
- Body text minimum **16px**, prefer **18px** for primary content.
- Line height **1.6+** for body, **1.3** for headings.
- Use `text-wrap: balance` for headings, `text-wrap: pretty` for body.
- Use `font-feature-settings: "palt"` for Japanese text proportional spacing.
- Use `tabular-nums` for data and numbers.
- **Type scale** should be clear and consistent:
  - Display: 32–40px, weight 700, `--color-neutral-800`
  - H1: 28px, weight 700
  - H2: 24px, weight 600
  - H3: 20px, weight 600
  - Body: 18px, weight 400, `--color-neutral-600`
  - Caption/Small: 14px minimum, `--color-neutral-500`

### Visual Refinement

These elements add sophistication without harming accessibility:

- **Layered surfaces**: Use `--shadow-sm` through `--shadow-xl` to create depth. Cards, modals, and dropdowns should feel like they float above the page with soft, warm shadows.
- **Rounded corners**: Use `border-radius: 8px` for cards and containers, `12px` for modals, `6px` for buttons and inputs. Consistent rounding creates a friendly, modern feel.
- **Subtle gradients**: Light linear gradients on headers or hero sections (e.g., `--color-primary-50` to `--color-neutral-0`) add warmth without distraction.
- **White space as luxury**: Generous padding (24px–32px in cards, 48px–64px section spacing) signals quality. Never cram.
- **Micro-animations**: Subtle transitions on hover/focus (scale, opacity, color shifts at `--transition-fast`). Always respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- **Decorative 桜 touches**: Optionally use subtle sakura motifs (a small petal icon, a blush gradient, a thin sakura-colored top border on the page header). Keep it understated — one or two touches per view maximum.

### Color & Theme

- Use a restrained, high-contrast palette rooted in the 桜 color system above.
- CSS variables for all colors — no hardcoded values.
- Limit accent colors to **one primary + one secondary** per view.
- All text must meet **4.5:1** contrast ratio (3:1 for large text ≥24px or bold ≥18.5px).
- Dark-on-light for all body text. Reverse (light-on-dark) only for primary buttons and banners.
- Consider **dark mode** as a future enhancement, using the same variable structure.

### Spacing & Touch Targets

- Touch targets minimum **44×44px**. Prefer **48×48px** for primary actions.
- Adequate spacing between interactive elements: minimum **8px** gap.
- Use an **8px grid** system for consistent spacing.
- Padding inside interactive elements: minimum **12px 20px** for buttons.

### Layout

- Predictable, conventional layouts. **Do not reinvent navigation patterns.**
- Clear visual hierarchy through size, weight, color, and spacing.
- Logical reading order that matches DOM order.
- Responsive: mobile-first, works well on tablets (common among elderly users).
- Maximum content width **720px** for reading, **1200px** for application layouts.
- Use CSS Grid and Flexbox. Avoid floats.

### Components & States

- **Buttons**: Clear primary/secondary/tertiary hierarchy. Primary uses `--color-primary-400` with white text. Secondary uses outlined style. All have visible focus rings (`3px solid --color-primary-300` with `2px offset`).
- **Cards**: White background, `--shadow-sm`, `border-radius: 8px`. Hover state adds `--shadow-md` with smooth transition. Interactive cards must have clear focus states.
- **Forms**: Labels always above inputs. Error messages immediately below the field in `--color-error` with an icon. Inputs have generous padding (12px 16px), visible borders, and clear focus states (border color change + shadow).
- **Navigation**: Current page clearly indicated with `--color-primary-400` accent. Breadcrumbs for depth > 2 levels.
- **Loading**: Skeleton screens preferred over spinners. If using spinners, add text label ("読み込み中...").
- **Empty states**: Friendly illustration or icon + helpful message + clear action.

### Feedback & Communication

- Error messages written in **plain, polite Japanese**. Never use error codes alone.
- Success confirmations must be **unambiguous** — use checkmark icon + text + green accent.
- Toast notifications appear top-center, persist for at least 5 seconds, and are dismissible.
- Progress indicators for multi-step processes with clear step labels.

### Icons & Labels

- Always pair icons with text labels for primary navigation and actions.
- Never use icon-only buttons for critical functions.
- Use a consistent icon set (e.g., Lucide, Heroicons).
- Icon size minimum **20px**, prefer **24px**.
- Icons inherit text color or use `--color-neutral-500`.

### Accessibility Checklist (Non-Negotiable)

- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Focus order is logical and visible
- [ ] All interactive elements reachable via keyboard
- [ ] `aria-label` or `aria-describedby` where visual context is insufficient
- [ ] Form fields have associated `<label>` elements
- [ ] Color is never the sole indicator of state or meaning
- [ ] `prefers-reduced-motion` is respected
- [ ] `prefers-color-scheme` is considered (if dark mode supported)
- [ ] Contrast ratios verified for all text
- [ ] Skip navigation link provided
- [ ] Language attribute set (`lang="ja"`)
- [ ] Page titles are descriptive

## NEVER Use

- Overly trendy patterns that sacrifice readability (glassmorphism, extreme gradients, etc.)
- Low-contrast text or subtle UI elements that disappear
- Text smaller than 14px for any purpose
- Complex or fast animations that may disorient users
- Jargon, technical language, or bureaucratic language in UI labels
- Hover-only interactions without keyboard/touch alternatives
- Icon-only navigation for primary actions
- Auto-playing media or sounds
- Infinite scroll without clear pagination alternative
- Tiny close buttons or dismiss targets

## Design Philosophy

> **美しさとは、すべての人が迷わず使えること。**
> (True beauty is when everyone can use it without hesitation.)

This is a municipal application. Citizens trust it to work simply and reliably. Visual refinement should **reinforce that trust** — a well-crafted interface signals competence and care. Restraint, clarity, and warmth are the highest form of design quality here. The cherry blossom theme is a point of civic pride, expressed through considered color choices and subtle touches, never through decoration for its own sake.
