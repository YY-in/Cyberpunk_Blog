```markdown
# Design System Documentation

## 1. Overview & Creative North Star: The Kinetic Anarchist
This design system is a rebellion against the sterile, centered, and predictable "modern" web. Our Creative North Star is **"The Kinetic Anarchist."** We are not building a static interface; we are building a performance. 

The design breaks the "template" look through intentional asymmetry, extreme high-contrast palettes, and a rigid refusal of curves. By utilizing a constant -12-degree skew and overlapping "shards" of content, we create a sense of urgent motion. This is an editorial experience that feels like a high-fashion zine colliding with a digital terminal. Every element should feel like it was slapped onto the screen with purpose and energy, rather than placed by a grid-obsessed algorithm.

---

## 2. Colors & Surface Philosophy
The palette is built on a foundation of absolute high-contrast. We use depth not through soft shadows, but through aggressive tonal shifts.

*   **Primary (`#ffb4aa` / `primary_container: #e61919`):** Our "Aggressor Red." Use this to demand attention. It is the color of action and critical information.
*   **Tertiary (`#e5c53d` / `tertiary: #e8c840`):** Our "Prestige Gold." Used for high-value data, rewards, or secondary highlights that need to feel "premium."
*   **Neutral Foundation:** The background is a deep, near-void black (`surface: #131313`). Text is primarily a bone-white (`on_surface: #e5e2e1`).

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. They are the hallmark of generic design. Boundaries must be defined through:
1.  **Background Color Shifts:** Use `surface_container_low` against `surface` to define regions.
2.  **The "Heavy Frame":** If a boundary is needed, it must be a heavy, purposeful stroke (4px+) or an offset skewed block.
3.  **Negative Space:** Use the Spacing Scale to let white space (or black space) act as the divider.

### Surface Hierarchy & Nesting
Treat the UI as a series of "Cut Paper" layers. 
*   **Base:** `surface_container_lowest` for the deepest background elements.
*   **Content Blocks:** `surface_container` or `surface_container_high`.
*   **Floating Shards:** Use `surface_bright` with a **Glassmorphism** effect (20px backdrop-blur) to create a "frosted glass" look that allows the vibrant red and gold highlights to bleed through from beneath.

---

## 3. Typography: The Editorial Voice
Our typography hierarchy is designed to feel like a movie poster—loud, condensed, and authoritative.

*   **Display & Headlines (epilogue):** Used for titles. These should always be uppercase and, where possible, skewed to match the -12deg layout. These are the "screaming" headers of the system.
*   **Titles & Body (publicSans):** Provides the legibility required for long-form content. Use `body-lg` for primary reading to maintain a premium, editorial feel.
*   **Data & Labels (spaceGrotesk):** This is our "Terminal" font. Use it for metadata, timestamps, or technical readouts to give the system a "hacker-terminal" edge.

**Note:** Always lean into tight letter-spacing for headers to amplify the condensed, high-pressure aesthetic.

---

## 4. Elevation & Depth: Tonal Layering
We reject the standard Material Design drop shadow. Depth in this design system is achieved through **Tonal Layering** and **Skewed Offsets**.

*   **The Layering Principle:** Stack `surface-container` tiers. Place a `surface_container_highest` skewed block over a `surface_container_low` base. The "lift" comes from the contrast in value, not a shadow.
*   **Ambient Shadows:** If a floating element (like a modal) requires a shadow, it must be massive and faint. Use a blur of 40px-60px with a 4% opacity, tinted with the `primary` color to create a "glow" rather than a shadow.
*   **The "Ghost Border" Fallback:** For subtle interactive states, use the `outline_variant` token at 15% opacity. Never use a 100% opaque thin border.
*   **Visual Soul:** Apply a "Paper-like" noise texture (alpha 3%) over the entire UI to kill the "digital flatness" and provide a tactile, high-end feel.

---

## 5. Components

### Buttons
*   **Primary:** Sharp corners (0px). Skewed -12deg. Background: `primary_container`. Text: `on_primary_container`. 
*   **Hover State:** An "Instant Flip." On hover, the background immediately swaps to `on_surface` and text to `surface`. No transition time—it should feel electric.
*   **Padding:** Use `4` (0.9rem) on Y-axis and `8` (1.75rem) on X-axis.

### Cards & Containers
*   **Rule:** Forbid divider lines. Use vertical spacing (Scale `12` or `16`) to separate thoughts.
*   **Style:** Skewed blocks with a "Heavy Border" (offset frame). A `primary_container` block should sit 4px behind the main `surface_container` block, creating a "shadow" that is actually a solid shape.

### Input Fields
*   **Style:** No box. Only a heavy bottom-border (3px) using `outline`.
*   **Focus State:** The bottom border flips to `tertiary` (Gold) and the label skews aggressively.

### The "Action Shard" (Custom Component)
A signature element for this system. A long, thin, skewed rectangle that houses a single CTA or "Data Point." It should overlap the edge of its parent container, breaking the "box" and creating visual tension.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Asymmetry:** If a layout feels too balanced, skew an element or offset a column.
*   **Use High Contrast:** Ensure `on_surface` text always sits on a sufficiently dark `surface_container`.
*   **Animate with Intent:** Use the `cubic-bezier(0.2, 0, 0, 1)` for all slide-ins. It should start fast and "snap" into place.

### Don't:
*   **No Rounded Corners:** `0px` is the absolute rule. Even a 1px radius destroys the "Kinetic Anarchist" aesthetic.
*   **No Center Alignment for Everything:** Editorial design lives in the margins. Use left-heavy layouts with "floating" elements on the right.
*   **No Transitions on Hover:** Use "Instant Flips" for colors. The system should feel reactive and "twitchy" in a high-performance way.

### Accessibility Note:
While we use high-contrast shapes, always ensure that text scales appropriately. Use `outline` tokens for high-contrast focus states to ensure keyboard navigability remains clear against the aggressive background shifts.```