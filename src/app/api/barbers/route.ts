import { NextResponse } from 'next/server';
import { getActiveBarbers } from '@/lib/data';

export async function GET() {
  const barbers = await getActiveBarbers();
  return NextResponse.json({ barbers });
}
