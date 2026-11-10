## Fun Hut architecture
- All game data lives on-device (src/lib/store.ts, localStorage); no remote database or accounts — the product spec requires offline, no-registration play.
- Mini-games are data-driven: generators in src/games/registry.ts feed shared engines (choice, drag, memory, draw); add new games there.
- Layouts switch on orientation (`landscape:`/`portrait:`) and size with vmin units, with safe-area utilities (pt-safe etc.) — tablets in landscape are the primary target.
