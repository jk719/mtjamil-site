# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAT Math tutoring website (mtjamil.com) built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

## Architecture

**Next.js App Router** with the following structure:

- `src/app/` - Route segments. Each route is `app/route-name/page.tsx`
- `src/components/` - Reusable components. `layout/` contains Navbar and Footer
- `src/sections/` - Full-width page sections (e.g., Hero) composed into pages

**Root Layout** (`src/app/layout.tsx`) wraps all pages with Navbar and Footer.

**Path alias**: `@/*` maps to `./src/*`

## Key Feature: Whiteboard

The interactive whiteboard (`src/components/Whiteboard.tsx`) is a client component using HTML Canvas with:
- Pointer events for drawing (pen/eraser tools)
- Stroke history with undo support
- Device pixel ratio handling for crisp rendering
- Custom floating cursor that follows the pointer
