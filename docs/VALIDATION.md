# Validation report

Test date: 16 October 2026 (Asia/Kolkata).

## Measured results

| Constraint | Evidence | Result / scope |
|---|---|---|
| At least 10 concurrent users per room | 10 independent authenticated HTTP clients; concurrent joins, chat, votes, and playback | Pass; app permits 20 online members |
| Playback control propagation p95 ≤250 ms on a local network | 40 playback commands × 10 clients = 400 deliveries; 100 ms polling; D1 local emulator | **114 ms p95**, 60 ms p50, 200 ms max; **same-machine loopback**, physical LAN not yet measured |
| Playback drift ≤500 ms after correction | Deterministic correction test with clock skew from −120 s to +360 s, repeated 2 s disturbances, 35 ms offset error | **35 ms maximum** in simulation; not a browser-decoder benchmark |
| Actual browser playback | Two independent in-app browser tabs, official 720p Sintel stream, same local server | Both playing: timestamp-adjusted difference **13.8 ms** in one snapshot; shared pause: **40.0 ms** difference in one snapshot |
| Failure handling documented | Automated core/integration checks and manual browser exercise | Covered below |

The physical-LAN requirement remains an acceptance test to run on the intended network. This report does **not** claim that a loopback benchmark or a two-browser spot check proves ten physical players satisfy the targets. Hosted WAN latency has not been characterized.

Raw HTTP measurements, exact environment, sample counts, and test definitions are in `measurements.json`.

## Test conditions

- macOS arm64; Node 24.20.0; Vinext development server, port 5173; local Cloudflare D1 emulator.
- Ten independent membership tokens in one room, asynchronous HTTP polling at one request per 100 ms per client, with staggered polling phases.
- One room control at a time for the latency series; separate concurrent-writer tests for chat, joins, votes and stale playback commands.
- Latency starts before sending the playback command and ends when each polling client receives the updated playback revision. It includes command transport, server update and subsequent snapshot read. It excludes HTML media application/rendering.
- 400 measured deliveries; zero request errors and no lost commands.
- Browser spot check: two independent sessions, actual external media decoding, shared play/pause, late join, chat propagation, and poll voting. The two video timestamps were sampled 2 ms apart while playing: 94.042178 s at `1792170486319` and 94.030372 s at `1792170486321`. Normalized difference: 13.806 ms. After shared pause: 94.086085 s and 94.126055 s (39.970 ms).
- Small-width layout inspected at 355 px; tablet-width room layout inspected at 766 px. No horizontal page overflow in those checks. Full desktop behavior has responsive CSS but is not separately certified by this restricted preview pane.

## Automated checks

`npm test`: 12 tests pass. Coverage includes 20-person capacity, late join and resume timeline math, stale concurrent controls, idempotency, host permissions and transfer, expired-host election, queue reordering/removal/selection, poll uniqueness and closure, bounded inputs/chat, safe custom URLs, hidden credential hashes, fuzzy search, and drift correction.

`npm run test:integration`: passed against the actual API and D1 emulator. Verifies ten concurrent users, atomic competing updates, persistent chat/queue/polls, stale-control conflict response, repeated-operation deduplication, missing credentials, cross-origin rejection, late joining, session resume, and manual host transfer.

`npm run check`: TypeScript verification. `npm run build`: production Worker/client build. Film media URLs: all eight returned HTTP 200 on the test date.

## Failure and concurrency behavior

| Condition | App behavior |
|---|---|
| Late join / reload | Restore membership where available, fetch current snapshot, project playback from server timestamp, then correct the actual player. |
| Interrupted connection | Pause that device locally; disable shared controls; retry reads with exponential backoff capped at 5 seconds; recover from durable server state. No stale command is queued offline. |
| Simultaneous play/pause/seek | First committed matching playback revision wins. Stale commands return 409, show a message, and the next snapshot synchronizes the client. |
| Simultaneous chat/queue/vote updates | Atomic room-row version check with up to 12 bounded conflict retries; unrelated updates are preserved. |
| Repeated request ID | Latest 200 non-heartbeat operation IDs are deduplicated per room/member. The UI never automatically resends an uncertain mutation. |
| Host disconnect | A five-second heartbeat checks the 20-second presence lease; earliest online member takes over. A returning old host does not take the crown back. |
| Browser autoplay blocked | Explicit Enable playback overlay. User gesture unlocks that device. |
| Slow video / buffering | Browser buffers; periodic correction catches up to the shared clock. A participant may briefly fall behind; diagnostics show actual sampled drift. |
| Source unavailable / unsupported codec | Visible media error and retry. Host may select another movie or direct source. |
| Background tabs | Browsers may throttle timers or media. On visibility return, heartbeat and fresh snapshots restore state; 100 ms timing is not guaranteed while backgrounded. |
| Expired/unknown room | Explicit 404 with a useful message; session clears and user can create or join a room. |
| Invalid credentials | 401; no room state is returned. |
| Room full / action too fast | Explicit bounded-capacity or rate-limit message. |
| Storage unavailable | 503; clients reconnect without replacing authoritative state with local guesses. |

## Reproduce on a physical LAN

1. Run the app on a machine connected to the test LAN using `npm run dev:lan`.
2. Run `TEST_URL=http://<server-ip>:5173 npm run test:integration` from a second machine. Record the Wi-Fi/Ethernet setup, topology, hardware, browser versions, CPU load, media bandwidth, and any induced packet loss.
3. Open one invite on at least 10 actual browser sessions/devices. Enable playback on each, keep all players foregrounded, and use local/sufficiently cached media to avoid source bandwidth dominating the test.
4. Repeatedly play, pause, and seek. Record both state-receipt latency and media application latency. Use the diagnostics and timestamped video readings to measure post-correction drift across all viewers.
5. Repeat with a late arrival, host loss, network interruption, reconnection, and competing controls. Save samples and compute p95, not just a mean.

This physical test and a broader sustained multi-browser drift series are outstanding deployment-environment validation, not missing application features.
