# API Monitoring Platform

A lightweight API monitoring and testing platform built with Next.js, designed for development teams who need real-time monitoring without the complexity and cost of enterprise solutions.

## Overview

This application provides a comprehensive dashboard for monitoring API performance, tracking uptime, response times, and error rates. It features a clean, responsive interface with real-time charts and collaborative workspace capabilities.

## Requirements

### System Requirements

-   **Node.js**: Version 18.x or higher
-   **npm**: Version 8.x or higher (or yarn equivalent)
-   **Operating System**: macOS, Linux, or Windows
-   **Browser**: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Development Environment

-   **TypeScript**: Version 5.x
-   **React**: Version 19.x
-   **Next.js**: Version 14.2.x
-   **Tailwind CSS**: Version 4.x for styling

### Dependencies

The application uses the following key dependencies:

#### UI Framework & Components

-   **@radix-ui/react-\***: Complete set of unstyled, accessible UI components
-   **lucide-react**: Icon library for consistent iconography
-   **tailwindcss**: Utility-first CSS framework
-   **tailwindcss-animate**: Animation utilities
-   **class-variance-authority**: For component variants
-   **clsx** & **tailwind-merge**: Utility functions for styling

#### Charts & Data Visualization

-   **recharts**: Responsive chart library for React
-   **date-fns**: Date utility library

#### Forms & Validation

-   **react-hook-form**: Performant forms library
-   **@hookform/resolvers**: Resolvers for validation libraries
-   **zod**: TypeScript-first schema validation

#### Additional Features

-   **next-themes**: Theme switching capabilities
-   **sonner**: Toast notifications
-   **cmdk**: Command palette component
-   **vaul**: Drawer component for mobile

## Features

### Core Functionality

-   **Real-time API Monitoring**: Track API uptime, response times, and error rates
-   **Interactive Dashboard**: Visual analytics with charts and statistics
-   **Team Collaboration**: Shared workspaces and API collections
-   **Responsive Design**: Works seamlessly across desktop and mobile devices

### Application Structure

The application consists of:

1. **Landing Page** (`/`): Marketing site with hero, features, pricing, and testimonials
2. **Dashboard** (`/app`): Main monitoring interface with:
    - Overview dashboard with key metrics
    - API collections management
    - Real-time monitoring views
    - Analytics and reporting
    - Alert configuration
    - Team management

### Technical Features

-   **TypeScript**: Full type safety throughout the application
-   **Server-Side Rendering**: Optimized performance with Next.js
-   **Component Library**: Reusable UI components built with Radix UI
-   **Theme Support**: Light/dark mode switching
-   **Responsive Layout**: Mobile-first design approach
-   **Analytics Integration**: Vercel Analytics support

## Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd api-monitoring

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── app/               # Dashboard application pages
│   │   ├── page.tsx       # Main dashboard
│   │   ├── collections/   # API collections
│   │   ├── monitoring/    # Real-time monitoring
│   │   ├── analytics/     # Analytics & reporting
│   │   ├── alerts/        # Alert configuration
│   │   ├── team/          # Team management
│   │   ├── login/         # Authentication
│   │   └── signup/        # User registration
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── header.tsx        # Site header
│   ├── hero.tsx          # Landing page hero
│   ├── features.tsx      # Features section
│   ├── pricing.tsx       # Pricing section
│   ├── testimonials.tsx  # Customer testimonials
│   ├── footer.tsx        # Site footer
│   ├── app-sidebar.tsx   # Dashboard sidebar
│   └── *-chart.tsx       # Chart components
├── lib/                  # Utility functions
│   └── utils.ts          # Shared utilities
└── hooks/                # Custom React hooks
    └── use-mobile.ts     # Mobile detection hook
```

## Browser Support

-   Chrome 90+
-   Firefox 88+
-   Safari 14+
-   Edge 90+

## Performance Requirements

-   **First Contentful Paint**: < 1.5s
-   **Largest Contentful Paint**: < 2.5s
-   **Time to Interactive**: < 3.5s
-   **Cumulative Layout Shift**: < 0.1

## Security Requirements

-   All data transmission over HTTPS
-   Input validation and sanitization
-   XSS protection through React's built-in safety
-   CSRF protection for state-changing operations

critical for MVP

1. Save requests to database - requests aren't persisted (only in localStorage)
2. Basic monitoring - scheduled checks for saved endpoints
3. Response status tracking - success/failure history
4. Simple uptime dashboard - show which APIs are up/down
5. Basic alerts - email/webhook when endpoint fails

Important but Can Wait

6. Multi-environment support (dev/staging/prod)
7. Response time charts (trending over time)
8. Error rate analytics
9. Team collaboration (sharing collections)

Advanced (Post-MVP)

-   AI anomaly detection
-   CI/CD integration
-   GraphQL/gRPC support
-   Advanced analytics/forecasting
-   Cost optimization insights
-   Slack/Teams integrations

🎯 Recommended Next Steps for MVP

1. Connect Analytics to Real Data (High Priority - differentiator)
2. Team Management (High Priority - enables Team tier pricing)
3. Export Functionality (Medium Priority - common feature request)
4. Environment Tags (Medium Priority - professional feature)
5. Templates (Low Priority - nice to have)
