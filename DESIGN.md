# GovTools Design Guide: Swiss International Style (v2.0)

> "Form follows function."  
> "The grid is the organizational tool that makes the message read."

This document is the **single source of truth** for the visual and interaction design of GovTools.
It enforces a **Strict Swiss International Style** (International Typographic Style).

## 1. Core Philosophy

The design must be **objective, mathematical, and functional**.
It eschews decoration, sentimentality, and mimetic textures.

1.  **Grid Systems**: Every element must align to a strict mathematical grid.
2.  **Asymmetry**: Achieve balance through tension and asymmetry, not static centering.
3.  **Hierarchy**: Use scale and weight to guide the eye. Do not use color for decoration.
4.  **Content First**: The data *is* the interface. Do not hide it in drawers or modals.
5.  **Sans-Serif**: Typography is the primary visual element.
6.  **American English**: Always use American English spelling conventions (e.g., "Analyzed" instead of "Analysed", "Color" instead of "Colour").

**The Eye Should Never Wander.**
Every pixel must serve the data. If an element does not inform, delete it.

## 2. Grid & Layout

**The Grid is Holy.**

*   **12-Column Grid** on Desktop (Max width 1440px or 1200px).
*   **Gutter**: 24px (Generous whitespace).
*   **Vertical Rhythm**: Base unit of **8px**. All spacing, line-heights, and container heights must be multiples of 8 (or 4 for distinct micro-spacing).

### Layout Patterns

*   **Avoid Cards**: Do not contain content in white boxes with shadows on a gray background.
    *   *Correction*: Use whitespace and 1px dividers (`#E5E5E5`) to separate content areas on a unified white canvas.
*   **Alignment**: **ALWAYS Left-Align** text. Never center text (except specific data headers if column-aligned).
*   **Asymmetric Headers**: Title on the left, controls/meta on the right.

## 3. Typography

**Typeface**: `Inter` (or `Helvetica Neue`, `Arial`).
**Weights**:
*   **Regular (400)**: Body text, data.
*   **Medium (500)**: Labels, column headers.
*   **Bold (700)**: Key metrics, page titles.
*   *Never use Light/Thin weights.*

**Type Scale (Ratio 1.25 - Major Third)**:

| Role | Size (px) | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | 32-48px | 1.1 | -0.02em | Page Titles, Big Metrics |
| **Heading** | 24px | 1.2 | -0.01em | Section Headers |
| **Subhead** | 18px | 1.3 | 0 | Subsections |
| **Body** | 14px | 1.5 | 0 | Standard Text |
| **Small** | 13px | 1.5 | 0 | Dense Tables |
| **Meta** | 11px | 1.4 | 0.02em | Captions, Timestamps |

**Character**:
*   Headings are **Sentence case**.
*   Labels/Meta can be **UPPERCASE** (tracked out +0.05em) for contrast.

## 4. Color Palette

**The canvas is White.** Color is for proper names and status only.

**Neutrals**:
*   `#FFFFFF` (White): Page background.
*   `#F9F9F9` (Off-White): Table headers, subtle banding.
*   `#E5E5E5` (Light Gray): Dividers, borders.
*   `#737373` (Mid Gray): Meta text, secondary labels.
*   `#171717` (Almost Black): Primary text. **Avoid pure change #000000.**

**Functional Colors** (Use sparingly):
*   **International Blue** (`#0050FF` or `#2563EB`): Interactive elements, links, active states.
*   **Swiss Red** (`#DC2626` or `#D32F2F`): Errors, "Meaningful Changes", critical alerts.
*   **Forest Green** (`#16A34A` or `#15803D`): Success, "Stable", "Verified".
*   **Architecture Orange** (`#EA580C`): Attention, warnings.

**Rules**:
*   No gradients.
*   No shadows (except strictly necessary for floating overlays).
*   No opacity fades. Use solid colors.

## 5. Components

### A. Data Tables
The core component of GovTools.
*   **No Vertical borders** (usually). Use horizontal rules (`border-bottom: 1px solid #E5E5E5`).
*   **Compact**: Use 13px text. Reduce padding (e.g., `py-2 px-3`).
*   **Headers**: Uppercase, small, gray (`#737373`), medium weight.
*   **Numbers**: Use tabular nums (`font-feature-settings: 'tnum'`). Right-align numeric columns.

### B. "Cards" / Items
*   **No Backgrounds**: Items sit on the white page.
*   **Separation**: Separated by a single crisp line.
*   **Interaction**: Entire row/area is clickable (hover: subtle gray `#F5F5F5`).

### C. Buttons
*   **Primary**: Solid Black or Blue rectangle. No rounded corners (or max 2px). White text.
*   **Secondary**: 1px Border (Black/Gray). Transparent BG.
*   **Tertiary/Link**: Underlined text. No container.
*   **Size**: strictly defined height (32px, 40px).

### D. Navigation
*   Simple top bar.
*   Logo left.
*   Links right.
*   Active state: Bold or Underlined. No background blobs.

## 7. Data Visualization & Responsive Compression

To maintain legibility on all screens, use **aggressive label compression**:

1.  **Redundant Data**: Remove years from repeating date axes (e.g., `02/19` instead of `2026-02-19`). State the year once in the view header or subtitle.
2.  **Tick Density**: On mobile/narrow screens, drop every other tick label. Use tick marks without labels to maintain scale while reducing visual noise.
3.  **Horizontal Space**: Always prefer `tabular-nums` for alignment in axes and legends.
4.  **Charts**: Maintain a minimum height (e.g., `min-h-[400px]`) for charts on mobile to prevent "flattening" when vertical scrolling is available.

## 8. Implementation Guidelines (CSS/Tailwind)

*   **Borders**: `border-gray-200`
*   **Text**: `text-neutral-900`, `text-neutral-500`
*   **Backgrounds**: `bg-white`, `bg-neutral-50`
*   **Radius**: `rounded-none` or `rounded-sm` (2px). **Avoid `rounded-lg` or `rounded-xl`**.
*   **Shadows**: `shadow-none` (preferred) or `shadow-sm`.

## 8. "Eye Wandering" Check
Before finalizing a design, ask:
1.  **Is the hierarchy clear?** (Can I spot the status immediately?)
2.  **Is there visual noise?** (Remove extra borders, background fills, icons).
3.  **Is the grid visible?** (Align everything left).
4.  **Is it honest?** (Don't hide complexity, organize it).

**Mantra**: Strong Structure. Neutral Surface. Meaningful Data.
