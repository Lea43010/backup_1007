import { Request, Response, NextFunction } from 'express';
import { Express } from 'express';

// CORS Configuration
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Production domains
    const allowedOrigins = [
      'https://www.bau-structura.de',
      'https://bau-structura.de',
      'https://www.bau-structura.com',
      'https://bau-structura.com',
      'https://baustructura.replit.app',
      'https://baustructura-final.replit.app'
    ];
    
    // Development domains
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push(
        'http://localhost:5000',
        'http://localhost:3000',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:3000'
      );
    }
    
    // Replit domains (dynamic)
    if (origin.includes('.replit.app') || origin.includes('.replit.dev')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cookie',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// CSP removed as requested

// Security Headers Middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // HSTS (HTTP Strict Transport Security)
  if (req.secure || req.get('x-forwarded-proto') === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', [
    'geolocation=(self)',
    'microphone=(self)',
    'camera=(self)',
    'payment=(self)',
    'usb=()',
    'bluetooth=()',
    'magnetometer=()',
    'gyroscope=()',
    'speaker=(self)',
    'vibrate=()',
    'fullscreen=(self)',
    'sync-xhr=()'
  ].join(', '));
  
  // X-Permitted-Cross-Domain-Policies
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  // X-Download-Options
  res.setHeader('X-Download-Options', 'noopen');
  
  next();
};

// Rate Limiting Configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Much higher limit for mobile devices
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Trust proxy headers
  // Skip rate limiting for auth and static routes
  skip: (req: Request) => {
    return req.path.startsWith('/api/auth/user') || 
           req.path.startsWith('/health') ||
           req.path.startsWith('/auth') ||
           req.path.startsWith('/login') ||
           req.method === 'GET';
  }
};

// Relaxed Rate Limiting for Auth Routes - mobile friendly
export const authRateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // More attempts for mobile devices
  message: {
    error: 'Too many login attempts, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
  skipSuccessfulRequests: true
};

// Admin Route Rate Limiting
export const adminRateLimitConfig = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 admin requests per windowMs
  message: {
    error: 'Too many admin requests, please try again later.',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true
};

// Input Validation Middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove null bytes
  const sanitizeString = (str: string) => str.replace(/\0/g, '');
  
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[sanitizeString(key)] = sanitizeObject(value);
        }
        return sanitized;
      }
      return obj;
    };
    
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        req.query[key] = sanitizeString(value);
      }
    }
  }
  
  next();
};

// Session Security Configuration
export const sessionSecurityConfig = {
  name: 'bau-structura-session',
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax' as const
  },
  rolling: true // Reset expiry on each request
};

// Setup all security middleware
export const setupSecurity = (app: Express) => {
  // Apply security headers
  app.use(securityHeaders);
  
  // Apply input validation
  app.use(validateInput);
  
  console.log('🔒 Security middleware initialized');
  console.log('   - Security headers configured');
  console.log('   - Input validation active');
  console.log('   - CORS configured for production domains');
};