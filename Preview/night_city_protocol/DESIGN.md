```markdown
# Design System Specification: High-Tech / Low-Life Editorial

## 1. Overview & Creative North Star: "The Glitch Manifesto"
This design system rejects the "clean" and "friendly" corporate aesthetic in favor of **The Glitch Manifesto**. The Creative North Star is centered on a high-tech, industrial interface that feels like it’s being hijacked by a rogue signal. 

We move beyond standard UI by embracing **Intentional Instability**. This means breaking the traditional grid with aggressive diagonal cuts, high-contrast color blocks that "bleed" into one another, and scanline overlays that suggest a cathode-ray tube (CRT) struggling to hold a signal. The experience should feel like a premium, editorial piece of hardware that is slightly, dangerously broken.

## 2. Colors & Surface Architecture
The color palette is built on extreme contrast. We use a deep, "crushed" black for the void, punctuated by "radioactive" neons.

### Palette Utilization
- **Primary (`#f5e642`):** Used for critical data and primary actions. It is the "Warning" and "Action" color.
- **Secondary (`#00d4ff`):** Used for technical readouts, secondary navigation, and "safe" data.
- **Tertiary (`#ff2d78`):** Reserved for "Error" states, high-priority glitches, and decorative accents that break the visual flow.
- **Background (`#131318`):** A deep, ink-black base that allows neons to bloom.

### The "No-Line" Rule & Surface Hierarchy
Traditional 1px solid borders are strictly prohibited. They are too "clean" for this system. 
- **Definition through Value:** Separate sections using `surface-container-low` against `background`. 
- **The Offset Shadow:** Instead of a border, use a 2px offset "ghost" shadow in `primary` or `secondary` at 30% opacity to simulate a light-leak from behind a panel.
- **Diagonal Cuts:** Use `clip-path: polygon()` to create "sheared" corners on containers. Never use a 90-degree box if a 45-degree notch can be used instead.

### Signature Textures
- **Scanlines:** Apply a global fixed overlay of 2px horizontal lines at 3% opacity.
- **Color Blocks:** Use `primary_container` (#f5e642) for large, asymmetric blocks behind `on_primary` text to create a "printed" industrial feel.

## 3. Typography: The Industrial Monospace
Typography must feel like a military terminal meeting a high-fashion magazine.

- **Display & Headlines (Orbitron):** These are your "Architectural" elements. Use `display-lg` for hero moments with wide letter-spacing (0.1em). This font represents the "High-Tech" soul.
- **Body & Labels (Space Grotesk / Share Tech Mono):** While the tokens specify Space Grotesk, treat it with the soul of a Monospace. Use `body-md` for technical descriptions. 
- **Hierarchy through Weight:** Use all-caps for `label-sm` and `title-sm` to mimic data-entry terminals.
- **The "Glitch" Treatment:** For `headline-lg`, occasionally "double-print" the text with a 2px offset in `tertiary` (Neon Pink) at 40% opacity to simulate chromatic aberration.

## 4. Elevation & Depth: Tonal Layering
In a world of hardware and chrome, depth is physical, not digital.

- **The Layering Principle:** Treat the UI as stacked industrial plates. 
    - *Bottom:* `surface_container_lowest` (The chassis).
    - *Mid:* `surface_container` (The module).
    - *Top:* `surface_container_highest` (The interactive terminal).
- **Ambient Light (No Shadows):** Avoid traditional drop shadows. Instead, use "Glows." If an element is "elevated," give it a `box-shadow` using the `secondary` or `primary` color with a large blur (20px+) but very low opacity (10%).
- **Glassmorphism:** For floating HUD elements, use `surface` with 60% opacity and a `backdrop-filter: blur(12px)`. This creates the "frosted visor" effect.

## 5. Components

### Buttons
- **Primary:** Solid `primary_fixed` block. Rectangular with a 4px `clip-path` notch on the top-right corner. Text is `on_primary` (Black), All-Caps, Bold.
- **Secondary:** Transparent background, `outline` border (Ghost Border style), with a `secondary` glow on hover.
- **States:** On hover, the button should "flicker" (opacity shift from 100% to 80% rapidly).

### Inputs & Fields
- **Text Inputs:** No bottom border. Instead, use a "bracket" style—thin vertical lines on the left and right edges only. 
- **Error State:** The entire input container shifts to `tertiary_container` with a rapid horizontal shake animation.

### Cards & Lists
- **The No-Divider Rule:** Never use a horizontal line to separate list items. Use a `4px` vertical gap (Spacing Scale `2`) and alternate background shades between `surface_container_low` and `surface_container_lowest`.
- **Data Visualization:** Use "Industrial Progress Bars"—thick, segmented blocks instead of smooth continuous lines.

### Additional Components: "The HUD Overlay"
- **Status Pills:** Small, high-contrast tags using `secondary_container` with `on_secondary` text.
- **Glitch Dividers:** Instead of a line, use a 2px tall repeating pattern of "dots" or "slashes" using the `primary` color.

## 6. Do's and Don'ts

### Do:
- **Embrace Asymmetry:** If a layout feels too balanced, offset an image or a block of text by 1.1rem (Spacing Scale `5`).
- **Use "Data Noise":** Add small, non-functional "version numbers" or "serial codes" in `label-sm` near the corners of containers.
- **High Contrast:** Ensure text is always legible by using `on_surface` or `on_primary` exclusively.

### Don't:
- **No Rounded Corners:** `0px` is the law. Anything rounded breaks the industrial immersion.
- **No Soft Gradients:** Avoid "sunset" style gradients. If using a gradient, use a "Hard-Stop" gradient to maintain a blocky, digital look.
- **Don't Over-Glitch:** Animations should be fast and aggressive (100ms - 200ms). Slow animations feel "magical"; we want "mechanical."

---
**Director's Final Note:** This system is a tool of subversion. Every pixel should feel like it was bolted onto the screen. If it looks like a standard website, you haven't pushed the "Industrial" angle far enough. Break the grid. Let the neons bleed.```