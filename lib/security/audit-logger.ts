// 📊 Security Audit Logging for SlugSpace
// Comprehensive logging system for security events and compliance

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🎯 Audit Event Types
export enum AuditEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  
  // Authorization Events
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  ROLE_CHANGE = 'ROLE_CHANGE',
  
  // API Events
  API_REQUEST = 'API_REQUEST',
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Data Events
  DATA_CREATE = 'DATA_CREATE',
  DATA_UPDATE = 'DATA_UPDATE',
  DATA_DELETE = 'DATA_DELETE',
  DATA_ACCESS = 'DATA_ACCESS',
  
  // Security Events
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  CSRF_ATTEMPT = 'CSRF_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  
  // System Events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',
}

// 📝 Audit Log Entry Interface
export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  requestBody?: any;
  responseBody?: any;
  errorMessage?: string;
  metadata?: any;
  timestamp?: Date;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// 🚨 Security Event Severity Mapping
const SECURITY_SEVERITY_MAP: { [key in AuditEventType]: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' } = {
  [AuditEventType.LOGIN_SUCCESS]: 'LOW',
  [AuditEventType.LOGIN_FAILED]: 'MEDIUM',
  [AuditEventType.LOGOUT]: 'LOW',
  [AuditEventType.PASSWORD_CHANGE]: 'HIGH',
  [AuditEventType.ACCESS_DENIED]: 'MEDIUM',
  [AuditEventType.PERMISSION_DENIED]: 'MEDIUM',
  [AuditEventType.ROLE_CHANGE]: 'HIGH',
  [AuditEventType.API_REQUEST]: 'LOW',
  [AuditEventType.API_ERROR]: 'MEDIUM',
  [AuditEventType.RATE_LIMIT_EXCEEDED]: 'MEDIUM',
  [AuditEventType.DATA_CREATE]: 'LOW',
  [AuditEventType.DATA_UPDATE]: 'LOW',
  [AuditEventType.DATA_DELETE]: 'HIGH',
  [AuditEventType.DATA_ACCESS]: 'LOW',
  [AuditEventType.SUSPICIOUS_ACTIVITY]: 'HIGH',
  [AuditEventType.CSRF_ATTEMPT]: 'HIGH',
  [AuditEventType.XSS_ATTEMPT]: 'HIGH',
  [AuditEventType.SQL_INJECTION_ATTEMPT]: 'CRITICAL',
  [AuditEventType.SYSTEM_ERROR]: 'MEDIUM',
  [AuditEventType.CONFIGURATION_CHANGE]: 'HIGH',
  [AuditEventType.BACKUP_CREATED]: 'LOW',
  [AuditEventType.BACKUP_RESTORED]: 'HIGH',
};

// 📊 Audit Logger Class
class AuditLogger {
  private logQueue: AuditLogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    // Start periodic flush
    this.startPeriodicFlush();
  }

  // 📝 Log an audit event
  async log(eventType: AuditEventType, data: Partial<AuditLogEntry> = {}): Promise<void> {
    const entry: AuditLogEntry = {
      eventType,
      timestamp: new Date(),
      severity: SECURITY_SEVERITY_MAP[eventType],
      ...data,
    };

    // Add to queue
    this.logQueue.push(entry);

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Audit Log [${entry.severity}]: ${eventType}`, {
        userId: entry.userId,
        ip: entry.ipAddress,
        endpoint: entry.endpoint,
        timestamp: entry.timestamp,
      });
    }

    // Flush if queue is full
    if (this.logQueue.length >= this.batchSize) {
      await this.flush();
    }

    // Alert on critical events
    if (entry.severity === 'CRITICAL') {
      await this.alertCriticalEvent(entry);
    }
  }

  // 🚀 Flush logs to database
  private async flush(): Promise<void> {
    if (this.logQueue.length === 0) {
      return;
    }

    const logsToFlush = [...this.logQueue];
    this.logQueue = [];

    try {
      // Log to console for now (database storage can be added later if needed)
      if (logsToFlush.length > 0) {
        console.log(`📊 Flushing ${logsToFlush.length} audit logs`);
        // Log critical events to console for monitoring
        logsToFlush
          .filter(log => log.severity === 'CRITICAL' || log.severity === 'HIGH')
          .forEach(log => {
            console.error('🚨 Security Event:', {
              type: log.eventType,
              severity: log.severity,
              userId: log.userId,
              ip: log.ipAddress,
              endpoint: log.endpoint,
            });
          });
      }

    } catch (error) {
      console.error('❌ Failed to flush audit logs:', error);
      // Re-add logs to queue for retry
      this.logQueue.unshift(...logsToFlush);
    }
  }

  // 🚨 Alert on critical security events
  private async alertCriticalEvent(entry: AuditLogEntry): Promise<void> {
    console.error(`🚨 CRITICAL SECURITY EVENT: ${entry.eventType}`, {
      userId: entry.userId,
      ip: entry.ipAddress,
      endpoint: entry.endpoint,
      timestamp: entry.timestamp,
      metadata: entry.metadata,
    });

    // In production, you would:
    // 1. Send email alerts to security team
    // 2. Create incident tickets
    // 3. Trigger automated responses
    // 4. Log to external security monitoring system
  }

  // ⏰ Start periodic flush
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  // 🛑 Stop periodic flush
  public stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    // Flush remaining logs
    this.flush();
  }

  // 📊 Get audit statistics
  public async getStats(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<{
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
    mediumEvents: number;
    lowEvents: number;
    topEventTypes: Array<{ eventType: string; count: number }>;
    topIPs: Array<{ ip: string; count: number }>;
  }> {
    // This would query the database in a real implementation
    return {
      totalEvents: 0,
      criticalEvents: 0,
      highEvents: 0,
      mediumEvents: 0,
      lowEvents: 0,
      topEventTypes: [],
      topIPs: [],
    };
  }
}

// Export singleton instance
export const auditLog = new AuditLogger();

// Convenience functions for common audit events
export const auditLogger = {
  // Authentication events
  loginSuccess: (userId: string, ip: string, userAgent?: string) =>
    auditLog.log(AuditEventType.LOGIN_SUCCESS, { userId, ipAddress: ip, userAgent }),
  
  loginFailed: (email: string, ip: string, userAgent?: string, reason?: string) =>
    auditLog.log(AuditEventType.LOGIN_FAILED, { 
      ipAddress: ip, 
      userAgent, 
      errorMessage: reason,
      metadata: { email }
    }),
  
  logout: (userId: string, ip: string) =>
    auditLog.log(AuditEventType.LOGOUT, { userId, ipAddress: ip }),

  // Authorization events
  accessDenied: (userId: string, endpoint: string, ip: string, reason?: string) =>
    auditLog.log(AuditEventType.ACCESS_DENIED, { 
      userId, 
      endpoint, 
      ipAddress: ip, 
      errorMessage: reason 
    }),

  // API events
  apiRequest: (endpoint: string, method: string, userId?: string, ip?: string, statusCode?: number) =>
    auditLog.log(AuditEventType.API_REQUEST, { 
      endpoint, 
      method, 
      userId, 
      ipAddress: ip, 
      statusCode 
    }),

  apiError: (endpoint: string, method: string, error: string, userId?: string, ip?: string) =>
    auditLog.log(AuditEventType.API_ERROR, { 
      endpoint, 
      method, 
      errorMessage: error, 
      userId, 
      ipAddress: ip 
    }),

  // Security events
  suspiciousActivity: (description: string, ip: string, userId?: string, metadata?: any) =>
    auditLog.log(AuditEventType.SUSPICIOUS_ACTIVITY, { 
      ipAddress: ip, 
      userId, 
      errorMessage: description, 
      metadata 
    }),

  xssAttempt: (input: string, ip: string, userId?: string) =>
    auditLog.log(AuditEventType.XSS_ATTEMPT, { 
      ipAddress: ip, 
      userId, 
      metadata: { maliciousInput: input } 
    }),

  sqlInjectionAttempt: (query: string, ip: string, userId?: string) =>
    auditLog.log(AuditEventType.SQL_INJECTION_ATTEMPT, { 
      ipAddress: ip, 
      userId, 
      metadata: { maliciousQuery: query } 
    }),

  // Data events
  dataAccess: (resource: string, action: string, userId: string, ip?: string) =>
    auditLog.log(AuditEventType.DATA_ACCESS, { 
      userId, 
      ipAddress: ip, 
      metadata: { resource, action } 
    }),

  dataModification: (resource: string, action: 'CREATE' | 'UPDATE' | 'DELETE', userId: string, ip?: string) =>
    auditLog.log(
      action === 'CREATE' ? AuditEventType.DATA_CREATE :
      action === 'UPDATE' ? AuditEventType.DATA_UPDATE :
      AuditEventType.DATA_DELETE,
      { userId, ipAddress: ip, metadata: { resource, action } }
    ),
};

export default auditLog;
