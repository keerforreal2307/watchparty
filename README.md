# Afterglow · Watch Party

A working, persistent, multi-user watch-party app built with React, TypeScript, Vinext, Cloudflare Workers, and D1. Includes eight playable Blender open films and a host-provided direct-video option. No API key is required.

## Run locally

Requires Node 22.13+ (tested on Node 24.20, macOS arm64).

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_third_skaar.sql
npm run dev
```

Open http://127.0.0.1:5173. Apply the migration only once per local database. This checkout's local database has already been initialized. Local data lives in ignored `.wrangler/state`; production uses a separate D1 database provisioned by Sites.

For other devices on your trusted LAN, run `npm run dev:lan` and open `http://<this-computer-LAN-IP>:5173`. Share an invite generated from that LAN URL, not a localhost link. No public Internet exposure is needed. The dev server is for trusted-network testing; use the deployed Worker for hosted use.

## What works

- Create and join rooms by eight-character code or URL; up to **20 online participants** per room.
- Shared play, pause and seek with an authoritative server timeline, playback revisions, and automatic drift correction.
- Fuzzy, typo-tolerant discovery; category and runtime filters; personal saved watchlist; recommendations ordered by saved-film tags.
- Persistent live chat, six floating emoji reactions, shared editable film queues, custom direct HTTPS videos, polls with one changeable vote per participant, ready checks, host-only playback mode, and host transfer.
- Late arrivals seek to the current timeline. Reloads resume the tab's session. Failed requests back off and reconnect. Stale simultaneous controls are rejected rather than silently overwriting newer playback.
- Host failover after a 20-second presence lease expires (checked on the next heartbeat, within another five seconds).
- Responsive layouts, keyboard-operable controls, reduced-motion support, native modal focus management, user-visible connection/media errors, and live sync diagnostics.

## Quick acceptance exercise

1. Create a room in one browser/tab and join its invite in another, using distinct names.
2. Press play. A browser may show **Enable playback** to satisfy its autoplay rules.
3. Pause or seek in either browser. Both players follow. Toggle host-only controls to restrict this.
4. Send chat/reactions, add films from discovery, reorder or select queued films as host, create a poll, and vote from both sessions.
5. Reload a guest mid-film; it resumes its membership and current playback. Disconnect/reconnect a client; controls disable while disconnected and recover from a fresh snapshot.
6. Close the host tab; the earliest remaining connected guest becomes host after roughly 20–25 seconds.

The room URL is an invitation capability: anyone who has the code and can access the website can join. A **private hosted Site still requires website access** in addition to the room invite. The initial deployment intentionally preserves Sites' owner-private audience. Website sharing must be enabled for external guests. Local LAN usage supports separate devices directly.

## Verification

```sh
npm run check
npm test
npm run test:integration
```

The integration test expects the local server on port 5173. Set `TEST_URL` to another local/LAN instance if needed. It creates disposable test rooms that expire after 24 hours and writes `docs/measurements.json`.

See [the validation report](docs/VALIDATION.md) for measured latency, exact test conditions, browser checks, failure behavior, and remaining physical-LAN acceptance work. A successful loopback measurement is not a guarantee about every LAN or the hosted Internet route.

## Architecture

`lib/room-engine.ts` owns pure room transitions. API routes call `lib/server.ts`, which stores each room as a versioned D1 row. Updates use an atomic `UPDATE ... WHERE version = ?`; competing writers reread and retry. Playback also checks its own revision so unrelated chat and heartbeat updates do not invalidate playback controls. Public snapshots never expose membership-token hashes.

Clients read snapshots every 100 ms, with no overlapping reads per client. Unchanged snapshots return only a timestamp. Heartbeats run every five seconds. There is no in-memory-only room state and no BroadcastChannel simulation: independent browsers and devices share the database. This deliberately favors bounded, predictable polling and durable state over a transport requiring unsupported hosting bindings. At 20 participants, each active room makes up to 200 snapshot reads/second; this is suitable for small rooms, not a high-volume streaming platform without further optimization.

The client estimates server clock offset using the lowest round-trip sample from its latest 20 requests. The player projects position from the server timestamp every 100 ms, seeks when drift exceeds 350 ms, and uses ±3% rate adjustment for small drift above 80 ms. Programmatic media changes never emit room commands, avoiding feedback loops. Media comes directly from its source; only room state passes through the app.

Room sessions last 24 hours. Chat is bounded to 100 entries, queue to 30 films, reactions to 30 recent entries, polls to five, and idempotency receipts to the latest 200 non-heartbeat actions. Membership tokens are scoped to one room, stored in sessionStorage, and hashed in D1. Display names are not verified identities. Rate limits on interactive actions are enforced inside the room update. React escapes user text. Requests check same-origin mutations and validate inputs.

## Source map

- `app/page.tsx`, `app/globals.css`: discovery and watch-room UI.
- `lib/catalog.ts`: curated films, typo-tolerant search, source credits.
- `lib/types.ts`: shared state, timeline projection, drift rules.
- `lib/use-room.ts`: snapshot polling, session recovery, clock estimates.
- `lib/room-engine.ts`, `lib/server.ts`: room rules, access checks, atomic persistence.
- `db/schema.ts`, `drizzle/`: database schema and migration.
- `tests/`: meaningful room-rule tests and real HTTP concurrency/latency harness.
- `docs/`: validation results and media attribution.

## Media

The catalog points to official Blender video-server MP4s, with locally bundled official project thumbnails. These are real films, not trailers or placeholders. Third-party availability and bandwidth are outside this app's control. A failed source produces a visible retry option. See [media credits](docs/MEDIA.md). Custom videos must be direct HTTPS MP4/WebM/MOV files accessible to all viewers. DRM streaming-service pages are not supported.
