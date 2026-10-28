import { NextResponse } from 'next/server';
import { Judge0Provider } from '@/lib/compiler/judge0-provider';
import { executeSchema } from '@/lib/compiler/validation';

export async function POST(request: Request) {
  try {
    const payload = executeSchema.safeParse(await request.json());
    if (!payload.success) {
      return NextResponse.json({ error: payload.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }
    const result = await new Judge0Provider().execute(payload.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Execution provider unavailable';
    console.error('Execution request failed:', message);
    return NextResponse.json({ error: 'The execution service is currently unavailable.' }, { status: 503 });
  }
}