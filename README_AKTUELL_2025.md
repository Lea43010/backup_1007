# 🏗️ Bau-Structura - Construction Project Management System

> Modern web application for construction project management with mobile-first design, AI integration, and professional workflow automation.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## 🚀 Features

### 📱 Core Project Management
- **Dashboard** - Project overview with real-time statistics
- **Project Management** - Full CRUD operations with status tracking
- **Customer & Company Management** - Comprehensive contact management
- **Document Management** - File attachments and photo documentation
- **GPS Integration** - Location tracking and mapping with Google Maps

### 🎯 Specialized Tools
- **Flood Protection Module** - Professional maintenance guides for water management
- **Camera Integration** - Photo capture with GPS tagging
- **Audio Recording** - Voice notes with transcription capabilities
- **AI Assistant** - Project analysis and risk assessment powered by OpenAI
- **Maps & Surveying** - Professional measurement tools and distance calculation

### 💼 Business Features
- **Multi-tier Licensing** - Basic (21€), Professional (39€), Enterprise pricing
- **Stripe Payment Integration** - Secure payment processing
- **Email Notifications** - BREVO integration for automated communications
- **Support Ticket System** - Built-in customer support management
- **Cloud Backup** - Azure Blob Storage integration with 30-day retention

### 🔒 Security & Compliance
- **Replit Authentication** - Secure OIDC-based user management
- **Role-based Access Control** - Admin, Manager, User roles
- **EU AI Act Compliance** - Comprehensive AI usage logging
- **Session Management** - PostgreSQL-backed secure sessions

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript and Vite
- **Tailwind CSS** with shadcn/ui components
- **TanStack Query** for server state management
- **Wouter** for lightweight routing
- **Progressive Web App** - Installable mobile experience

### Backend
- **Node.js** with Express.js and TypeScript
- **PostgreSQL** with Drizzle ORM
- **Neon Database** for serverless hosting
- **RESTful API** with comprehensive error handling

### Infrastructure
- **Replit Hosting** - Development and production environment
- **Azure Blob Storage** - Cloud backup and file storage
- **BREVO SMTP** - Transactional email delivery
- **Google Maps API** - Location services and mapping

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Required API keys (see Environment Variables)

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/bau-structura-2025.git
cd bau-structura-2025

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Authentication
SESSION_SECRET="your-session-secret"

# Email (BREVO)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SMTP_HOST="smtp-relay.brevo.com"
BREVO_SMTP_PORT=587
BREVO_SMTP_USER="your-brevo-user"
BREVO_SMTP_PASS="your-brevo-password"

# Azure Backup
AZURE_STORAGE_ACCOUNT_NAME="your-storage-account"
AZURE_STORAGE_ACCOUNT_KEY="your-storage-key"

# Payments (Stripe)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# AI Integration
OPENAI_API_KEY="your-openai-key"

# Maps
GOOGLE_MAPS_API_KEY="your-google-maps-key"
```

## 📚 API Documentation

### Authentication
```bash
GET /api/auth/user          # Get current user
POST /api/logout            # Logout user
```

### Projects
```bash
GET /api/projects           # List all projects
POST /api/projects          # Create new project
GET /api/projects/:id       # Get project details
PUT /api/projects/:id       # Update project
DELETE /api/projects/:id    # Delete project
```

### Customers
```bash
GET /api/customers          # List customers
POST /api/customers         # Create customer
PUT /api/customers/:id      # Update customer
```

### Admin
```bash
GET /api/admin/users        # List all users (admin only)
GET /api/admin/stats        # System statistics
POST /api/admin/backup      # Create database backup
```

## 🧪 Testing

### Run Test Suite
```bash
# Unit and Integration Tests
npm run test

# End-to-End Tests
npm run test:e2e

# Mobile Responsiveness Tests
npm run test:mobile

# AI Integration Tests
npm run test:ai
```

### Test Coverage
- **Backend API Tests** - 100% route coverage
- **Database Integration** - All CRUD operations
- **Authentication Flow** - Complete user journey
- **Mobile Responsiveness** - Cross-device compatibility
- **AI Features** - OpenAI integration validation

## 📱 Progressive Web App

The application can be installed as a native app on mobile devices:
- **Offline Support** - Core functionality without internet
- **Push Notifications** - Real-time project updates
- **Camera Integration** - Direct photo capture
- **GPS Tracking** - Automatic location tagging

## 🔧 Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Application pages
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and API client
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── emailService.ts    # Email integration
│   └── azureBackupService.ts # Cloud backup
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Database schema
├── e2e/                   # End-to-end tests
└── docs/                  # Documentation
```

### Available Scripts
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run test               # Run test suite
npm run db:push           # Push schema changes to database
npm run db:generate       # Generate migration files
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Configuration
- Set `NODE_ENV=production`
- Configure production database URL
- Set secure session secrets
- Enable API rate limiting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: support@bau-structura.com
- Documentation: [Wiki](https://github.com/your-username/bau-structura-2025/wiki)

## 🙏 Acknowledgments

- Built with [Replit](https://replit.com)
- UI components by [shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)
- Email service by [BREVO](https://brevo.com)
- Cloud storage by [Azure](https://azure.microsoft.com)

---

**Status: Production Ready** ✅ | **Last Updated: Januar 2025**