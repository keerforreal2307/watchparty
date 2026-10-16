import { ONLINE_MS, positionAt, type Room, type Member, type Film } from './types';
import { films } from './catalog';
export class RoomError extends Error { constructor(message: string, public status=400) { super(message); } }
export function publicRoom(room: Room): Room { return {...room, receipts:[], members:room.members.map(({hash,lastActions,...member})=>member)}; }
export function system(room:Room,text:string,now:number) { room.messages.push({id:crypto.randomUUID(),memberId:'system',name:'Afterglow',text,at:now,system:true}); room.messages=room.messages.slice(-100); }
export function electHost(room:Room,now:number) { const online=room.members.filter(m=>now-m.lastSeen<ONLINE_MS); if(!online.some(m=>m.id===room.hostId) && online.length) { room.hostId=online.sort((a,b)=>a.joinedAt-b.joinedAt)[0].id; system(room,`${online[0].name} is now the host.`,now); } }
export function makeRoom(code:string,title:string,member:Member,film:Film,now:number):Room { return {code,title,version:1,createdAt:now,expiresAt:now+86_400_000,hostId:member.id,hostOnly:false,members:[member],playback:{film,position:0,playing:false,changedAt:now,revision:0},queue:[],messages:[],reactions:[],polls:[],receipts:[]}; }
export function addMember(room:Room,member:Member,now:number) { if(room.members.filter(m=>now-m.lastSeen<ONLINE_MS).length>=20) throw new RoomError('This room is full (20 people).',409); room.members=room.members.filter(m=>now-m.lastSeen<3_600_000); if(room.members.length>=100) throw new RoomError('This room has reached its session limit. Create a new room.',409); room.members.push(member); electHost(room,now); system(room,`${member.name} joined the party.`,now); }
export type Action = { type:string; requestId:string; [key:string]:unknown };
export function applyAction(room:Room,memberId:string,a:Action,now:number) {
 const m=room.members.find(m=>m.id===memberId); if(!m) throw new RoomError('Your session has ended. Join this room again.',401);
 const receipt=memberId+':'+a.requestId; if(room.receipts.includes(receipt)) return;
 m.lastSeen=now; electHost(room,now);
 const isHost=room.hostId===m.id;
 const requireHost=()=>{if(!isHost) throw new RoomError('Only the host can do that.',403);};
 const limits:Record<string,number>={chat:300,reaction:250,playback:80,queueAdd:300,pollCreate:1000};
 if(limits[a.type] && now-(m.lastActions?.[a.type]??0)<limits[a.type]) throw new RoomError('One moment — please try again.',429);
 if(a.type==='pulse') {}
 else if(a.type==='ready') m.ready=!!a.ready;
 else if(a.type==='leave') { room.members=room.members.filter(x=>x.id!==m.id); system(room,`${m.name} left the party.`,now); electHost(room,now); }
 else if(a.type==='playback') {
  if(room.hostOnly) requireHost();
  if(a.revision!==room.playback.revision) throw new RoomError('Playback changed while you were adjusting it. Synced to the latest state.',409);
  if(typeof a.position!=='number'||!Number.isFinite(a.position)||a.position<0||a.position>86400||typeof a.playing!=='boolean') throw new RoomError('Invalid playback command.');
  room.playback={...room.playback,position:a.position,playing:a.playing,changedAt:now,revision:room.playback.revision+1};
 } else if(a.type==='chat') {
  const text=String(a.text??'').trim(); if(!text||text.length>500) throw new RoomError('Messages must contain 1–500 characters.');
  room.messages.push({id:crypto.randomUUID(),memberId:m.id,name:m.name,text,at:now}); room.messages=room.messages.slice(-100);
 } else if(a.type==='reaction') {
  if(!['❤️','😂','😮','🔥','👏','🍿'].includes(String(a.emoji))) throw new RoomError('Unknown reaction.');
  room.reactions=[...room.reactions.filter(r=>now-r.at<10000),{id:crypto.randomUUID(),emoji:String(a.emoji),name:m.name,at:now}].slice(-30);
 } else if(a.type==='queueAdd') {
  const film=films.find(f=>f.id===a.filmId); if(!film) throw new RoomError('Film not found.');
  if(room.queue.length>=30) throw new RoomError('The queue is full (30 films).');
  if(room.queue.some(f=>f.id===film.id)) throw new RoomError('This film is already in the queue.'); room.queue.push(film);
 } else if(a.type==='customVideo') {
  requireHost(); let url:URL; try{url=new URL(String(a.url));}catch{throw new RoomError('Enter a valid HTTPS video URL.');}
  if(url.protocol!=='https:'||url.username||url.password||! /\.(mp4|webm|mov)$/i.test(url.pathname)) throw new RoomError('Use a direct HTTPS .mp4, .webm or .mov video URL.');
  if(room.queue.length>=30) throw new RoomError('The queue is full.');
  const title=String(a.title??'').trim(); if(!title||title.length>80||url.href.length>2000) throw new RoomError('Enter a title (up to 80 characters) and a shorter video URL.');
  room.queue.push({id:crypto.randomUUID(),title,src:url.href,image:'',minutes:0,year:new Date(now).getFullYear(),genre:'Your video',tags:[],description:'Added by the host.',credit:'Host-provided video',creditUrl:'',color:'#7173d4'});
 } else if(a.type==='queueRemove') { requireHost(); room.queue=room.queue.filter(f=>f.id!==a.filmId); }
 else if(a.type==='queueMove') { requireHost(); const i=room.queue.findIndex(f=>f.id===a.filmId); const j=i+(a.direction==='up'?-1:1); if(i>=0&&j>=0&&j<room.queue.length) [room.queue[i],room.queue[j]]=[room.queue[j],room.queue[i]]; }
 else if(a.type==='select') { requireHost(); const film=room.queue.find(f=>f.id===a.filmId)??films.find(f=>f.id===a.filmId); if(!film)throw new RoomError('Film not found.'); room.queue=room.queue.filter(f=>f.id!==film.id); room.playback={film,position:0,playing:false,changedAt:now,revision:room.playback.revision+1}; room.members.forEach(m=>m.ready=false); system(room,`Up next: ${film.title}.`,now); }
 else if(a.type==='hostTransfer') { requireHost(); const next=room.members.find(m=>m.id===a.memberId&&now-m.lastSeen<ONLINE_MS); if(!next) throw new RoomError('That person is offline.'); room.hostId=next.id; system(room,`${next.name} is now the host.`,now); }
 else if(a.type==='hostOnly') { requireHost(); room.hostOnly=!!a.enabled; }
 else if(a.type==='pollCreate') { const question=String(a.question??'').trim(); const options=Array.isArray(a.options)?a.options.map(x=>String(x).trim()):[]; if(!question||question.length>160||options.length<2||options.length>4||options.some(x=>!x||x.length>80)||new Set(options).size!==options.length) throw new RoomError('Add a question and 2–4 different options.'); if(room.polls.some(p=>!p.closed))throw new RoomError('Close the current poll first.'); room.polls=[...room.polls,{id:crypto.randomUUID(),question,options,votes:{},closed:false,authorId:m.id}].slice(-5); }
 else if(a.type==='vote') { const p=room.polls.find(p=>p.id===a.pollId); if(!p||p.closed)throw new RoomError('This poll has closed.'); const index=Number(a.option); if(!Number.isInteger(index)||index<0||index>=p.options.length)throw new RoomError('Invalid poll option.'); p.votes[m.id]=index; }
 else if(a.type==='pollClose') { const p=room.polls.find(p=>p.id===a.pollId); if(!p)throw new RoomError('Poll not found.'); if(!isHost&&p.authorId!==m.id)throw new RoomError('Only the host or poll creator can close it.',403); p.closed=true; }
 else throw new RoomError('Unknown room action.');
 m.lastActions={...m.lastActions,[a.type]:now};
 if(a.type!=='pulse') room.receipts=[...room.receipts,receipt].slice(-200);
}
