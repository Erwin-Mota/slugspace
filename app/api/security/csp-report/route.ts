// 📊 Content Security Policy Violation Reporting
// This endpoint receives CSP violation reports from browsers

import { NextRequest, NextResponse } from 'next/server';
import { auditLogger } from '@/lib/security/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const report = await request.json();
    
    // Log the CSP violation
    console.error('🚨 CSP Violation Report:', report);
    
    // Extract IP address
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Log to audit system
    await auditLogger.suspiciousActivity(
      'CSP violation detected',
      ip,
      undefined,
      report
    );
    
    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return NextResponse.json({ success: true }, { status: 204 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'CSP Report endpoint' });
}

