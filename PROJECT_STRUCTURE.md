# Project structure

```
src/
├── app/                    # Next.js App Router (routes and root layout)
│   ├── layout.tsx          # Root layout: Navbar, main, Footer
│   ├── page.tsx            # Homepage
│   ├── globals.css
│   └── whiteboard/
│       └── page.tsx
├── components/             # Reusable UI components
│   ├── layout/             # Layout shell
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── Whiteboard.tsx      # Feature component
└── sections/               # Page sections (compose into app pages)
    └── Hero.tsx
```

- **app/** — Route segments and root layout. Add new routes as `app/route-name/page.tsx`.
- **components/** — Shared components. `layout/` for Navbar and Footer.
- **sections/** — Full-width sections (e.g. Hero) used by page routes.
