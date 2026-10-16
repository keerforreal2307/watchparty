import { create, error } from '@/lib/server';
export async function POST(req:Request) { try{return await create(req);}catch(e){return error(e);} }
