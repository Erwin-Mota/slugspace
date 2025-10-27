// 🔒 Comprehensive Security Check
// All-in-one security validation

import { detectXSS } from './xss-checker';
import { detectSQLInjection } from './sql-injection-checker';
import { detectThreats } from './sanitizer';

export interface SecurityCheckResult {
  safe: boolean;
  threats: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
}

// Comprehensive security check on user input
export function comprehensiveSecurityCheck(input: any): SecurityCheckResult {
  const threats: string[] = [];
  const recommendations: string[] = [];
  
  // Convert to string if not already
  const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
  
  // Check XSS
  const xssCheck = detectXSS(inputStr);
  if (xssCheck.isThreat) {
    threats.push(...xssCheck.threats);
    recommendations.push('Sanitize HTML content with DOMPurify');
  }
  
  // Check SQL Injection
  const sqlCheck = detectSQLInjection(inputStr);
  if (sqlCheck.isThreat) {
    threats.push(...sqlCheck.threats);
    recommendations.push('Use parameterized queries with Prisma');
  }
  
  // Check general threats
  const generalCheck = detectThreats(inputStr);
  if (generalCheck.isThreat) {
    threats.push(...generalCheck.threats);
  }
  
  // Determine severity
  const criticalThreats = threats.filter(t => 
    t.includes('INJECTION') || 
    t.includes('SQL') || 
    t.includes('SCRIPT') ||
    t.includes('COMMAND')
  );
  
  const highThreats = threats.filter(t => 
    t.includes('XSS') || 
    t.includes('JAVASCRIPT') ||
    t.includes('CSRF')
  );
  
  let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  
  if (criticalThreats.length > 0) {
    severity = 'CRITICAL';
    recommendations.push('⚠️ CRITICAL: Block this request immediately');
  } else if (highThreats.length > 0) {
    severity = 'HIGH';
    recommendations.push('⚠️ HIGH: Reject this input and log the attempt');
  } else if (threats.length > 0) {
    severity = 'MEDIUM';
    recommendations.push('⚠️ MEDIUM: Sanitize input before processing');
  }
  
  return {
    safe: threats.length === 0,
    threats: [...new Set(threats)],
    severity,
    recommendations: [...new Set(recommendations)]
  };
}

// Log security event
export async function logSecurityEvent(check: SecurityCheckResult, context: {
  userId?: string;
  ip?: string;
  endpoint?: string;
  userAgent?: string;
}): Promise<void> {
  if (!check.safe) {
    console.error('🚨 Security threat detected:', {
      threats: check.threats,
      severity: check.severity,
      context
    });
    
    // In production, send to audit log
    // await auditLogger.suspiciousActivity(
    //   `Security threat: ${check.threats.join(', ')}`,
    //   context.ip || 'unknown',
    //   context.userId,
    //   { threats: check.threats, severity: check.severity }
    // );
  }
}

