import { read, action, error } from '@/lib/server';
type Context={params:Promise<{code:string}>};
export async function GET(req:Request,context:Context){try{return await read(req,(await context.params).code.toUpperCase());}catch(e){return error(e);}}
export async function POST(req:Request,context:Context){try{return await action(req,(await context.params).code.toUpperCase());}catch(e){return error(e);}}
