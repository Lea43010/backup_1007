# Bau-Structura Release Notes - July 10, 2025

## Version 3.2.0 - "Authentication & SFTP Integration"

### 🚀 Major Updates

#### Authentication System Overhaul
- **Standalone Authentication**: Complete removal of Replit dependency
- **Local Auth System**: Username/Password authentication with Passport.js
- **Secure Password Handling**: Bcrypt encryption for all user passwords
- **Session Management**: PostgreSQL-backed sessions with 7-day expiration
- **Cross-Domain Support**: Ready for deployment on any custom domain

#### SFTP Integration & Multi-Tenant Architecture
- **Hetzner Cloud Integration**: Server 128.140.82.20 with ProFTPD + PostgreSQL
- **Automatic SFTP Setup**: Accounts created automatically after license purchase
- **Multi-Tenant Security**: User isolation with individual directories
- **Quota Management**: 1GB storage per user with expansion options
- **Email Notifications**: Automatic welcome emails with SFTP credentials

#### Enhanced User Management
- **Trial System Overhaul**: Extended from 14 to 30 days
- **Smart Reminders**: Email notifications after 14 days (not before expiration)
- **Profile Enhancement**: Display name, position, phone, location, timezone, language
- **Password Reset**: BREVO-powered email system with secure tokens
- **Admin Controls**: User management, password resets, SFTP provisioning

### 🔧 Technical Improvements

#### Security & Performance
- **Rate Limiting**: Tiered limits (Auth: 5/15min, Admin: 50/5min, Standard: 100/15min)
- **CORS Configuration**: Production-ready for .de and .com domains
- **Helmet Integration**: Security headers with Vite compatibility
- **Input Validation**: Comprehensive Zod schemas throughout
- **Session Security**: HttpOnly cookies with secure flags

#### Error Management & Learning System
- **Intelligent Error Learning**: Machine learning-based error prevention
- **Pattern Recognition**: Automatic detection of recurring issues
- **Pre-Execution Scans**: Proactive error prevention
- **Admin Dashboard**: Error statistics and resolution tracking
- **Auto-Corrections**: Known fixes applied automatically

#### Email System Enhancement
- **BREVO Integration**: Complete migration from SendGrid
- **Template System**: Professional HTML/text email templates
- **Multi-Purpose Support**: Welcome, password reset, SFTP setup, trial reminders
- **Support Tickets**: Role-based email notifications
- **Contact Forms**: Direct integration with admin dashboard

### 🐛 Critical Fixes

#### Logout Functionality
- **Route Configuration**: Added GET `/api/logout` alongside POST `/api/auth/logout`
- **Session Cleanup**: Explicit session destruction after logout
- **Redirect Logic**: Intelligent routing based on request type (GET/POST)
- **Error Handling**: Graceful fallbacks for failed logout attempts

#### Mobile Compatibility
- **Auth Loop Prevention**: Fixed endless 401 loops on mobile devices
- **Rate Limiting Adjustment**: Mobile-optimized request limits
- **Domain Support**: bau-structura.com works flawlessly on mobile
- **PWA Integration**: Enhanced app installation experience

### 📊 Database Schema Updates

#### New Tables & Fields
```sql
-- Enhanced user profiles
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN position VARCHAR(255);
ALTER TABLE users ADD COLUMN phone VARCHAR(50);
ALTER TABLE users ADD COLUMN location VARCHAR(255);
ALTER TABLE users ADD COLUMN timezone VARCHAR(100);
ALTER TABLE users ADD COLUMN language VARCHAR(10);

-- SFTP integration
ALTER TABLE users ADD COLUMN sftp_host VARCHAR(255);
ALTER TABLE users ADD COLUMN sftp_port INTEGER DEFAULT 22;
ALTER TABLE users ADD COLUMN sftp_username VARCHAR(255);
ALTER TABLE users ADD COLUMN sftp_password VARCHAR(255);
ALTER TABLE users ADD COLUMN sftp_path VARCHAR(500);
ALTER TABLE users ADD COLUMN sftp_access_level INTEGER DEFAULT 0;

-- Trial management
ALTER TABLE users ADD COLUMN trial_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN trial_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN trial_reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN payment_status VARCHAR(50) DEFAULT 'trial';

-- Project roles for fine-grained permissions
CREATE TABLE project_roles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  role VARCHAR(50) NOT NULL,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by VARCHAR(255)
);
```

### 🛠 Installation & Deployment

#### Environment Variables Required
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secure-session-secret
SMTP_HOST=smtp-relay.brevo.com
SMTP_USER=your-brevo-user@smtp-brevo.com
SMTP_PASS=your-brevo-api-key
STRIPE_SECRET_KEY=sk_...
```

#### Production Deployment
1. **Domain Configuration**: Update DNS A-Records to point to deployment server
2. **SSL Certificates**: Automatic HTTPS with Replit Deployments
3. **Database Migration**: Run `npm run db:push` for schema updates
4. **SFTP Server Setup**: Configure Hetzner Cloud ProFTPD with PostgreSQL auth

### 📝 Documentation Updates

#### New Guides Created
- `docs/setup/SFTP-MULTI-TENANT-SETUP.md` - Complete Hetzner Cloud configuration
- `docs/security/AUTHENTICATION-GUIDE.md` - Standalone auth implementation
- `docs/deployment/PRODUCTION-DEPLOYMENT.md` - Domain and SSL setup
- `docs/development/ERROR-LEARNING-SYSTEM.md` - AI error prevention details

#### API Documentation
- Enhanced `/api/admin/*` endpoints for user management
- New `/api/auth/*` routes for standalone authentication
- SFTP management endpoints with admin controls
- Trial management and reminder system APIs

### 🔮 Future Roadmap

#### Planned Features
- **Microsoft 365 Integration**: Email inbox management for support
- **Advanced Analytics**: User behavior and system performance metrics
- **Mobile App**: Native iOS/Android applications
- **API Expansion**: Third-party integration capabilities
- **Multi-Language Support**: Complete internationalization

#### Performance Optimizations
- **Database Indexing**: Query optimization for large datasets
- **Caching Layer**: Redis integration for improved response times
- **CDN Integration**: Static asset delivery optimization
- **Background Jobs**: Async processing for heavy operations

### 💬 Support & Contact

- **Primary Domain**: bau-structura.com (mobile-optimized)
- **Backup Domain**: bau-structura.de (DNS configuration pending)
- **Development URL**: baustructura.replit.app
- **Support Email**: support@bau-structura.de
- **Admin Contact**: aeisenmann@lohr.de

### 🏆 Acknowledgments

Special thanks to user feedback that helped identify and resolve:
- Mobile authentication loops
- Logout redirect issues  
- SFTP integration requirements
- Trial period optimization needs

---

**Release Date**: July 10, 2025  
**Build Number**: 3.2.0-20250710  
**Compatibility**: Node.js 18+, PostgreSQL 12+, Modern browsers  
**License**: Proprietary - Bau-Structura Project Management System