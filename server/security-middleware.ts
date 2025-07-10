/**
 * Comprehensive User Isolation Security System
 * Implements mandatory user_id filtering and access validation
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export interface SecurityRequest extends Request {
  user: {
    id: string;
    role: 'admin' | 'manager' | 'user';
    email?: string;
  };
  securityContext?: {
    userId: string;
    role: string;
    isAdmin: boolean;
    requestId: string;
  };
}

/**
 * CORE SECURITY RULE: Every request must have validated user context
 * This middleware ensures no data access without proper user identification
 */
export function enforceUserIsolation() {
  return async (req: SecurityRequest, res: Response, next: NextFunction) => {
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        console.log(`🚫 SECURITY: Unauthenticated request blocked - RequestID: ${requestId}`);
        return res.status(404).json({ message: "Resource not found" }); // Generic message
      }

      // Validate user exists in database
      const user = await storage.getUser(req.user.id);
      if (!user) {
        console.log(`🚫 SECURITY: Invalid user ID blocked - RequestID: ${requestId}, UserID: ${req.user.id}`);
        return res.status(404).json({ message: "Resource not found" }); // Generic message
      }

      // Set security context for all subsequent operations
      req.securityContext = {
        userId: user.id,
        role: user.role,
        isAdmin: user.role === 'admin',
        requestId
      };

      console.log(`✅ SECURITY: Request authorized - RequestID: ${requestId}, UserID: ${user.id}, Role: ${user.role}`);
      next();
    } catch (error) {
      console.error(`🚫 SECURITY: Authorization error - RequestID: ${requestId}`, error);
      return res.status(404).json({ message: "Resource not found" }); // Generic message
    }
  };
}

/**
 * Resource ownership validation decorator
 * Ensures users can only access their own resources
 */
export function validateResourceOwnership(resourceType: 'project' | 'customer' | 'company' | 'person') {
  return async (req: SecurityRequest, res: Response, next: NextFunction) => {
    const { requestId, userId, isAdmin } = req.securityContext || {};
    const resourceId = parseInt(req.params.id);

    try {
      // Admins can access everything
      if (isAdmin) {
        console.log(`👑 ADMIN: Full access granted - RequestID: ${requestId}, Resource: ${resourceType}/${resourceId}`);
        return next();
      }

      // Validate resource ownership
      let hasAccess = false;
      
      switch (resourceType) {
        case 'project':
          const project = await storage.getProject(resourceId);
          hasAccess = project && (project.userId === userId || project.managerId === userId);
          break;
        case 'customer':
          const customer = await storage.getCustomer(resourceId);
          hasAccess = customer && customer.userId === userId;
          break;
        case 'company':
          const company = await storage.getCompany(resourceId);
          hasAccess = company && company.userId === userId;
          break;
        case 'person':
          const person = await storage.getPerson(resourceId);
          hasAccess = person && person.userId === userId;
          break;
      }

      if (!hasAccess) {
        console.log(`🚫 SECURITY: Resource access denied - RequestID: ${requestId}, UserID: ${userId}, Resource: ${resourceType}/${resourceId}`);
        return res.status(404).json({ message: "Resource not found" }); // Generic message - never reveal existence
      }

      console.log(`✅ SECURITY: Resource access granted - RequestID: ${requestId}, UserID: ${userId}, Resource: ${resourceType}/${resourceId}`);
      next();
    } catch (error) {
      console.error(`🚫 SECURITY: Resource validation error - RequestID: ${requestId}`, error);
      return res.status(404).json({ message: "Resource not found" }); // Generic message
    }
  };
}

/**
 * Admin-only access control
 * For system administration endpoints
 */
export function requireAdmin() {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    const { requestId, isAdmin, userId } = req.securityContext || {};

    if (!isAdmin) {
      console.log(`🚫 SECURITY: Admin access denied - RequestID: ${requestId}, UserID: ${userId}`);
      return res.status(404).json({ message: "Resource not found" }); // Generic message
    }

    console.log(`👑 ADMIN: Admin access granted - RequestID: ${requestId}, UserID: ${userId}`);
    next();
  };
}

/**
 * Manager or Admin access control
 * For management endpoints
 */
export function requireManagerOrAdmin() {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    const { requestId, role, userId } = req.securityContext || {};

    if (role !== 'admin' && role !== 'manager') {
      console.log(`🚫 SECURITY: Manager access denied - RequestID: ${requestId}, UserID: ${userId}, Role: ${role}`);
      return res.status(404).json({ message: "Resource not found" }); // Generic message
    }

    console.log(`👥 MANAGER: Manager access granted - RequestID: ${requestId}, UserID: ${userId}, Role: ${role}`);
    next();
  };
}

/**
 * Security audit logging
 * Logs all security-relevant events
 */
export function logSecurityEvent(event: string, details: any) {
  const timestamp = new Date().toISOString();
  console.log(`🔒 SECURITY AUDIT [${timestamp}]: ${event}`, JSON.stringify(details, null, 2));
  
  // In production, this would write to a secure audit log
  // For now, we use console logging with structured format
}

/**
 * Suspicious activity detection
 * Monitors for potential security violations
 */
export function detectSuspiciousActivity() {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    const { requestId, userId } = req.securityContext || {};
    const userAgent = req.get('User-Agent') || 'unknown';
    const ip = req.ip || 'unknown';

    // Monitor for rapid successive requests (potential bot)
    // Monitor for unusual access patterns
    // Monitor for failed authorization attempts
    
    // Log suspicious patterns
    if (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'] !== ip) {
      logSecurityEvent('SUSPICIOUS_PROXY_ACTIVITY', {
        requestId,
        userId,
        ip,
        forwardedFor: req.headers['x-forwarded-for'],
        userAgent,
        endpoint: req.path
      });
    }

    next();
  };
}

/**
 * Data sanitization middleware
 * Prevents data leakage in responses
 */
export function sanitizeResponse() {
  return (req: SecurityRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(data: any) {
      const { isAdmin } = req.securityContext || {};
      
      // Remove sensitive fields for non-admin users
      if (!isAdmin && data) {
        // Remove password fields, internal IDs, etc.
        if (Array.isArray(data)) {
          data = data.map(item => sanitizeItem(item));
        } else {
          data = sanitizeItem(data);
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

function sanitizeItem(item: any): any {
  if (!item || typeof item !== 'object') return item;
  
  const sanitized = { ...item };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.sftpPassword;
  delete sanitized.stripeCustomerId;
  delete sanitized.stripeSubscriptionId;
  
  return sanitized;
}

/**
 * Complete security middleware chain
 * Apply all security measures
 */
export function createSecurityChain() {
  return [
    enforceUserIsolation(),
    detectSuspiciousActivity(),
    sanitizeResponse()
  ];
}