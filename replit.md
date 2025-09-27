# AI Research Assistant - Replit Project

## Overview
This is an AI Research Assistant application that helps discover, analyze, and synthesize academic research using advanced AI. Built with React, TypeScript, and Vite, featuring a modern UI with shadcn-ui components and Tailwind CSS.

## Project Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn-ui with Radix UI primitives
- **Styling**: Tailwind CSS with dark theme support
- **Backend/Database**: Supabase integration for authentication and data storage
- **Routing**: React Router DOM
- **State Management**: TanStack React Query
- **Build Tool**: Vite with SWC for fast compilation

## Current State
- ✅ Successfully configured for Replit environment
- ✅ Vite dev server running on port 5000 with proper host configuration
- ✅ Application loads and displays correctly
- ✅ Build process working for deployment
- ✅ Supabase integration configured and ready
- ✅ Deployment configuration set up for autoscale

## Key Features
- AI-powered research paper search and analysis
- File upload support for PDFs and images
- Voice search capability
- Research synthesis and citation generation
- Dark theme UI with modern design

## Technical Configuration
### Vite Configuration
- Host: 0.0.0.0 (configured for Replit proxy)
- Port: 5000 (required for Replit frontend)
- HMR and hot reload enabled

### Deployment
- Target: autoscale (stateless frontend)
- Build: `npm run build`
- Run: `npm run preview`

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## External Dependencies
- Supabase project ID: vzdrgrvhvobujcmxtuql
- Uses Supabase for authentication and data persistence
- Configured with proper API keys and connection settings

## Recent Changes (September 27, 2025)
- Fixed Vite configuration for Replit environment (host and port)
- Set up proper workflow for frontend development
- Verified build process and deployment configuration
- Application successfully running and accessible through Replit preview