# HeroUI v3 Reference

## All Components

**Category**: react
**URL**: https://www.heroui.com/docs/react/components
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/react/components/index.mdx
> Explore the full list of components available in the library. More are on the way.

### Component Categories

- **Buttons** — Primary interactive elements
- **Collections** — List and group components
- **Colors** — Color utilities and pickers
- **Controls** — Checkboxes, radios, switches, toggles
- **Data Display** — Tables, badges, chips, avatars
- **Date and Time** — Calendars, date pickers, time inputs
- **Feedback** — Alerts, progress bars, tooltips, spinners
- **Forms** — Input fields, text areas, select, combobox
- **Layout** — Cards, containers, sections, dividers
- **Media** — Images, videos, galleries
- **Navigation** — Breadcrumbs, links, tabs, pagination
- **Overlays** — Modals, popovers, dropdowns, drawers
- **Pickers** — Color pickers, range calendars
- **Typography** — Headings, text, code, kbd
- **Utilities** — Scroll shadows, separators, surfaces

---

## Introduction

**Category**: react
**URL**: https://www.heroui.com/docs/react/getting-started
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/react/getting-started/index.mdx
> An open-source UI component library for building beautiful and accessible user interfaces.

### What is HeroUI?

HeroUI is a React component library built on [Tailwind CSS v4](https://tailwindcss.com/) and [React Aria Components](https://react-spectrum.adobe.com/react-aria/index.html). Every component comes with smooth animations, polished details, and built-in accessibility—ready to use, fully customizable.

### Why HeroUI?

- **Beautiful by default** — Professional look out of the box, no extra styling needed.
- **Accessible** — Built on React Aria Components with focus management, keyboard navigation, and screen reader support.
- **Flexible** — Each component is made of customizable parts. Change what you need, leave the rest.
- **Developer-friendly** — Fully typed APIs, predictable patterns, and excellent autocompletion.
- **Maintained** — Automatic updates, bug fixes, and new features. Just update the package.
- **Lightweight** — Tree-shaken. Only what you use goes into your app.
- **Future-proof** — Built for React 19 and Tailwind v4, designed for AI-assisted development.

### Living Library, Not Copy-Paste

HeroUI v3 is a living library that grows with you:
- Automatic updates and fixes
- New features without extra work
- Components stay current with React, Tailwind, and browsers
- Deep customization, not shallow theme tweaks
- AI-friendly APIs for code generation

### HeroUI Ecosystem

- **🌐 HeroUI v3** (web) — React components with Tailwind CSS v4
- **📱 HeroUI Native** (mobile) — Beautiful components for React Native
- **🤖 HeroUI Chat** (text-to-app) — Create apps with natural language
- **🧠 UI for LLMs** — New platform & MCPs coming soon

### Key Facts

- **Free and open source** — Apache License 2.0
- **Production-ready** — Stable and battle-tested
- **Fully customizable** — Tailwind utilities, CSS variables, BEM modifiers
- **TypeScript** — Fully typed with excellent IDE support
- **Accessibility** — WCAG compliant, keyboard navigation, screen reader support
- **CSS-only option** — Use styles without React
- **Design System** — Figma Kit V3 available

### Get Involved

- [GitHub Discussions](https://github.com/heroui-inc/heroui/discussions)
- [Discord](https://discord.gg/9b6yyZKmH4)
- [X/Twitter](https://x.com/hero_ui)
- [Contributing Guidelines](https://github.com/heroui-inc/heroui/blob/main/CONTRIBUTING.md)

---

## Key Conventions for POA/PAI System

When using HeroUI in this project:

1. **Component imports** — Import directly from `@heroui/react`
2. **No custom UI system** — Use HeroUI components exclusively, do not build parallel component libraries
3. **Tailwind v4 only** — HeroUI v3 requires Tailwind CSS v4
4. **Composition pattern** — Use compound components (e.g., `Card.Header`, `Card.Content`)
5. **Accessibility first** — Leverage built-in ARIA compliance
6. **Customization** — Use Tailwind utilities and CSS variables for theming, not inline styles
