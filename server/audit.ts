import { Request } from 'express';

export interface AuditLog {
  id: number;
  userId?: number;
  action: string;
  resource: string;
  resourceId?: number;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogInsert {
  userId?: number;
  action: string;
  resource: string;
  resourceId?: number;
  details: any;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

class AuditService {
  private logs: Map<number, AuditLog> = new Map();
  private currentId = 1;

  async logAction(req: Request, action: string, resource: string, resourceId?: number, details?: any, success: boolean = true, errorMessage?: string) {
    const auditLog: AuditLog = {
      id: this.currentId++,
      userId: req.user?.id,
      action,
      resource,
      resourceId,
      details: details || {},
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      timestamp: new Date(),
      success,
      errorMessage
    };

    this.logs.set(auditLog.id, auditLog);
    
    // In production, this would be saved to a dedicated audit database
    console.log(`[AUDIT] ${action} on ${resource}${resourceId ? ` (ID: ${resourceId})` : ''} by user ${req.user?.id || 'anonymous'} - ${success ? 'SUCCESS' : 'FAILED'}`);
    
    return auditLog;
  }

  async getAuditLogs(filters?: {
    userId?: number;
    resource?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    success?: boolean;
  }): Promise<AuditLog[]> {
    let logs = Array.from(this.logs.values());

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.resource) {
        logs = logs.filter(log => log.resource === filters.resource);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.success !== undefined) {
        logs = logs.filter(log => log.success === filters.success);
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getSecurityEvents(): Promise<AuditLog[]> {
    const securityActions = ['login', 'logout', 'failed_login', 'password_change', 'account_locked', 'privilege_escalation'];
    return this.getAuditLogs().then(logs => 
      logs.filter(log => securityActions.includes(log.action))
    );
  }

  async getComplianceReport(startDate: Date, endDate: Date): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    userActivity: { [userId: number]: number };
    resourceAccess: { [resource: string]: number };
    securityEvents: number;
    riskScore: number;
  }> {
    const logs = await this.getAuditLogs({ startDate, endDate });
    
    const successfulActions = logs.filter(log => log.success).length;
    const failedActions = logs.filter(log => !log.success).length;
    
    const userActivity: { [userId: number]: number } = {};
    const resourceAccess: { [resource: string]: number } = {};
    
    logs.forEach(log => {
      if (log.userId) {
        userActivity[log.userId] = (userActivity[log.userId] || 0) + 1;
      }
      resourceAccess[log.resource] = (resourceAccess[log.resource] || 0) + 1;
    });

    const securityEvents = (await this.getSecurityEvents()).filter(
      event => event.timestamp >= startDate && event.timestamp <= endDate
    ).length;

    // Calculate risk score based on failed actions and security events
    const riskScore = Math.min(100, (failedActions * 2) + (securityEvents * 5));

    return {
      totalActions: logs.length,
      successfulActions,
      failedActions,
      userActivity,
      resourceAccess,
      securityEvents,
      riskScore
    };
  }
}

export const auditService = new AuditService();

// Middleware for automatic audit logging
export function auditMiddleware(action: string, resource: string) {
  return (req: Request, res: any, next: any) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      const resourceId = req.params.id ? parseInt(req.params.id) : undefined;
      
      auditService.logAction(
        req,
        action,
        resource,
        resourceId,
        {
          method: req.method,
          path: req.path,
          body: req.method !== 'GET' ? req.body : undefined,
          statusCode: res.statusCode
        },
        success,
        success ? undefined : data
      );
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}