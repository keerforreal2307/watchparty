'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { requestId } from './client-id';
import { POLL_MS, type Room, type Session } from './types';
export function useRoom(onError:(message:string)=>void) {
 const [session,setSession]=useState<Session|null>(null),[room,setRoom]=useState<Room|null>(null),[connected,setConnected]=useState(false),[rtt,setRtt]=useState(0),[offset,setOffset]=useState(0);
 const current=useRef<Room|null>(null), samples=useRef<{rtt:number;offset:number}[]>([]),sessionRef=useRef(session),errorRef=useRef(onError); errorRef.current=onError;sessionRef.current=session;
 const accept=useCallback((data:{room?:Room;serverTime:number},start:number,end:number)=>{
  if(data.room&&(!current.current||data.room.code!==current.current.code||data.room.version>=current.current.version)){current.current=data.room;setRoom(data.room);}
  const sample={rtt:end-start,offset:data.serverTime-(start+end)/2};samples.current=[...samples.current.slice(-19),sample];const best=[...samples.current].sort((a,b)=>a.rtt-b.rtt)[0];setOffset(best.offset);setRtt(Math.round(sample.rtt));setConnected(true);
 },[]);
 const enter=useCallback((data:{session:Session;room:Room;serverTime:number},start:number)=>{current.current=null;samples.current=[];setSession(data.session);sessionRef.current=data.session;sessionStorage.setItem('afterglow-session',JSON.stringify(data.session));accept(data,start,Date.now());history.replaceState(null,'',`/?room=${data.session.code}`);},[accept]);
 const reset=useCallback(()=>{setSession(null);sessionRef.current=null;setRoom(null);current.current=null;setConnected(false);sessionStorage.removeItem('afterglow-session');history.replaceState(null,'','/');},[]);
 const send=useCallback(async(action:Record<string,unknown>,quiet=false)=>{
  const s=sessionRef.current;if(!s)return false;const start=Date.now();
  try{const response=await fetch(`/api/rooms/${s.code}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${s.token}`},body:JSON.stringify({...action,requestId:requestId()}),signal:AbortSignal.timeout(8000)});const data=await response.json() as {error?:string;room?:Room;serverTime:number};if(!response.ok)throw new Error(data.error??"Room request failed."); if(sessionRef.current?.token!==s.token)return false; accept(data,start,Date.now());return true;}
  catch(e){if(!quiet)errorRef.current(e instanceof Error?e.message:'Could not send this action. Please try again.');return false;}
 },[accept]);
 useEffect(()=>{const saved=sessionStorage.getItem('afterglow-session');if(saved){try{const s=JSON.parse(saved);const requested=new URLSearchParams(location.search).get('room');if(!requested||requested.toUpperCase()===s.code)setSession(s);}catch{sessionStorage.removeItem('afterglow-session');}}},[]);
 useEffect(()=>{if(!session)return;let stopped=false,timer:ReturnType<typeof setTimeout>,failures=0;const controller=new AbortController();const poll=async()=>{const start=Date.now();try{const version=current.current?.version??0;const response=await fetch(`/api/rooms/${session.code}?version=${version}`,{headers:{Authorization:`Bearer ${session.token}`},signal:AbortSignal.any([controller.signal,AbortSignal.timeout(6000)]),cache:'no-store'});const data=await response.json() as {error?:string;room?:Room;serverTime:number};if(!response.ok){if([401,404].includes(response.status)){errorRef.current(data.error??"Room session expired.");reset();return;}throw new Error(data.error??"Room request failed.");}if(stopped)return;accept(data,start,Date.now());failures=0;}catch{if(stopped)return;failures++;setConnected(false);}if(!stopped)timer=setTimeout(poll,failures?Math.min(5000,250*2**failures):Math.max(0,POLL_MS-(Date.now()-start)));};void poll();const pulse=setInterval(()=>void send({type:'pulse'},true),5000);void send({type:'pulse'},true);const visible=()=>{if(document.visibilityState==='visible')void send({type:'pulse'},true);};document.addEventListener('visibilitychange',visible);return()=>{stopped=true;controller.abort();clearTimeout(timer);clearInterval(pulse);document.removeEventListener('visibilitychange',visible);};},[session,accept,reset,send]);
 return {session,room,connected,rtt,offset,send,enter,reset};
}
