# Fun Hut

A tablet-first, child-friendly offline learning app built with React, TypeScript, TanStack Start, and Vite. It includes six learning worlds, 30 playable mini-games, avatar customisation, and rewards.

Player profiles and progress are saved locally in the browser. There are no accounts, remote database, Next.js, or Phaser dependencies. The production app can be installed as a PWA and caches its game assets for offline play.

## Design goals

Fun Hut is designed primarily as a mobile-friendly children's game, with iPad and tablet devices as the primary target.

### Device compatibility

- Apple iPad and iPad Mini
- Android tablets
- Android smartphones
- iPhones
- Desktop and laptop computers

### Requirements

- Use landscape orientation as the preferred gameplay layout on tablets
- Support portrait orientation on mobile phones
- Make buttons, cards, and interactive objects large enough for children aged 4–8
- Prioritise touch interactions rather than mouse interactions
- Support dragging, dropping, tapping, selecting, and swiping
- Use full-screen gameplay wherever possible
- Keep navigation simple and consistent
- Adapt collection maps, dashboards, and mini-games to different screen sizes
- Prevent important controls from being hidden behind device edges, notches, or system interface elements
- Maintain smooth animations and good performance on ordinary tablets and smartphones

### iPad-specific requirements

- Optimise the layout for landscape iPad screens
- Support different iPad screen sizes
- Respect iPad safe areas
- Make touch targets comfortable for young children
- Ensure game elements remain properly positioned when the screen rotates
- Test offline gameplay using the installed PWA

The experience should feel like a dedicated children's adventure game, not a website squeezed onto a tablet.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Install for offline play

Build and serve the production app over HTTPS (or localhost). Open Fun Hut online once, then choose **Settings → Install for offline play**. Supported browsers open their install prompt; otherwise, Settings shows the browser's install/add-to-home-screen steps. The first online load caches all game assets for offline play. Player profiles and progress stay on this device.
