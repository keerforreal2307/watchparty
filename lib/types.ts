export type Film = { id: string; title: string; year: number; minutes: number; genre: string; tags: string[]; description: string; image: string; src: string; credit: string; creditUrl: string; color: string };
export type Member = { id: string; name: string; joinedAt: number; lastSeen: number; ready: boolean; hash?: string; lastActions?: Record<string,number> };
export type Playback = { film: Film; position: number; playing: boolean; changedAt: number; revision: number };
export type Message = { id: string; memberId: string; name: string; text: string; at: number; system?: boolean };
export type Poll = { id: string; question: string; options: string[]; votes: Record<string,number>; closed: boolean; authorId: string };
export type Room = { code: string; title: string; version: number; createdAt: number; expiresAt: number; hostId: string; hostOnly: boolean; members: Member[]; playback: Playback; queue: Film[]; messages: Message[]; reactions: {id:string; emoji:string; name:string; at:number}[]; polls: Poll[]; receipts: string[] };
export type Session = { code: string; memberId: string; token: string };
export type Snapshot = { room: Room; serverTime: number };
export const ONLINE_MS = 20_000;
export const POLL_MS = 100;
export function positionAt(playback: Playback, serverNow: number) { return Math.max(0, playback.position + (playback.playing ? Math.max(0,serverNow-playback.changedAt)/1000 : 0)); }
export function driftCorrection(actual: number, target: number) { const drift=target-actual; return Math.abs(drift) > .35 ? {seek:target, rate:1} : {seek:null,rate: Math.abs(drift)<.08 ? 1 : drift>0 ? 1.03 : .97}; }
