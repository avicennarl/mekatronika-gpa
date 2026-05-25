import { NextResponse } from 'next/server';
import { COURSES } from '@/lib/courses-data';

export async function GET() {
  return NextResponse.json(COURSES);
}
