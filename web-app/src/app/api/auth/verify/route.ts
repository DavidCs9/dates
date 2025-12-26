import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/features/auth/services/auth-service';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    const isValid = await authService.verifySession(token);

    return NextResponse.json({ 
      authenticated: isValid,
      token: isValid ? token : undefined 
    });
  } catch (error) {
    console.error('Verify session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}