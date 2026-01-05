# CheckItOut - Bus Ticket Booking Platform

A modern, full-featured bus ticket booking application built with Next.js 15, React 19, and TypeScript. Features role-based access control, comprehensive admin management, and an intuitive booking experience.

## Quick Links

- **[Project Overview & PDR](./docs/project-overview-pdr.md)** - Product requirements and development roadmap
- **[Code Standards](./docs/code-standards.md)** - Coding conventions and best practices
- **[System Architecture](./docs/system-architecture.md)** - Technical architecture documentation
- **[Codebase Summary](./docs/codebase-summary.md)** - Comprehensive codebase analysis

## Features

### Multi-Role Support
- **Customer**: Search buses, book tickets, manage profile
- **Seller**: Manage bus listings and inventory (in development)
- **Admin**: Complete user management with CRUD operations

### Authentication System
- Email/password authentication with JWT tokens
- Email verification workflow
- Password reset functionality
- Automatic token refresh mechanism
- Secure session management

### User Management (Admin)
- View, create, update, and delete users
- Advanced filtering by role and status
- Search functionality
- User activity tracking
- Real-time data refresh

### Customer Experience
- Hero section with search
- Services overview
- Popular routes display
- Bus seat selection (seater and sleeper)
- Profile management
- Password change

## Technology Stack

### Core
- **Next.js 15.5.6** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type-safe development
- **Turbopack** - Fast bundler

### State & Data
- **Redux Toolkit 2.10.1** - State management
- **Axios 1.13.2** - HTTP client
- **Zod 4.1.12** - Schema validation

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI + Tailwind)
- **Lucide React** - Icon library
- **Framer Motion** - Animations

### Forms
- **React Hook Form 7.66.0** - Form management
- **@hookform/resolvers** - Validation integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd checkitout
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:9091
NEXT_PUBLIC_APP_NAME=CheckItOut
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
checkitout/
├── docs/                       # Documentation
│   ├── codebase-summary.md    # Codebase analysis
│   ├── code-standards.md      # Coding standards
│   ├── project-overview-pdr.md # Product requirements
│   └── system-architecture.md  # Architecture docs
├── public/                     # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth routes
│   │   ├── (customer)/       # Customer routes
│   │   ├── (admin)/          # Admin routes
│   │   └── (seller)/         # Seller routes
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── forms/           # Form components
│   │   ├── layouts/         # Layout components
│   │   └── providers/       # Context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities & configs
│   ├── services/            # API services
│   ├── store/               # Redux store
│   │   └── slices/         # Redux slices
│   ├── types/               # TypeScript types
│   └── utils/               # Helper functions
├── .env.local              # Environment variables
├── components.json         # shadcn/ui config
├── next.config.ts         # Next.js config
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Routes

### Public Routes
- `/` - Home page with hero, services, and promotions
- `/login` - User authentication
- `/register` - New user registration
- `/forgot-password` - Password recovery
- `/verify-email` - Email verification

### Customer Routes (Protected)
- `/dashboard` - Customer dashboard
- `/profile` - Profile management
- `/bus/[id]` - Bus details and seat selection

### Admin Routes (Protected)
- `/admin` - Admin dashboard
- `/admin/users` - User management interface

### Seller Routes (Protected)
- `/seller` - Seller dashboard (in development)

## API Integration

The application integrates with a backend API at `/api/v1/`:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/verify-email` - Email verification
- `POST /auth/forgot-password` - Password reset
- `GET /auth/me` - Get current user

### User Management Endpoints (Admin)
- `GET /users` - List users with pagination
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/activities` - User activity logs

## Development Guidelines

### Code Standards

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint configured
- **Formatting**: Consistent code style
- **Components**: PascalCase for components
- **Files**: camelCase for utilities, PascalCase for components
- **Imports**: Use `@/` path alias

See [Code Standards](./docs/code-standards.md) for complete guidelines.

### State Management

Using Redux Toolkit with typed hooks:

```typescript
import { useAppDispatch, useAppSelector } from "@/hooks";

const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);
```

### Form Validation

Using React Hook Form + Zod:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";

const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
});
```

### API Calls

Using centralized Axios instance with interceptors:

```typescript
import api from "@/lib/axios";

const response = await api.get("/users");
const user = await api.post("/auth/login", credentials);
```

## Authentication Flow

1. User submits credentials
2. Redux action dispatches `loginUser` thunk
3. Axios makes API call to `/auth/login`
4. Backend returns JWT tokens
5. Access token stored in localStorage
6. Refresh token stored in httpOnly cookie
7. User state updated in Redux
8. Protected routes check authentication
9. Automatic token refresh on 401 errors

## Security

- JWT tokens for authentication
- Refresh token in httpOnly cookie
- Access token in localStorage
- Automatic token refresh
- Role-based route protection
- Input validation with Zod
- CSRF protection via credentials mode

## Styling Guidelines

### Design System

- **Primary Color**: #1868db (blue)
- **Secondary Color**: #DBEAFE (light blue)
- **Deep Navy**: #000052
- **Cream**: #FAF0E6

### Important Style Notes

- **No gradient colors** - The project explicitly avoids gradients
- Use solid colors from the design system
- Tailwind CSS utility-first approach
- shadcn/ui "new-york" style
- OKLCH color space for better perceptual uniformity

### Component Styling

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-lg border bg-card p-6",
  variant === "primary" && "bg-primary text-white"
)}>
```

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables in dashboard
3. Deploy automatically on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Build Commands

```bash
npm run build    # Build production bundle
npm run start    # Start production server
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_API_URL          # Backend API URL
NEXT_PUBLIC_APP_NAME         # Application name
NEXT_PUBLIC_APP_VERSION      # Application version
NODE_ENV                     # Environment (development/production)
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Follow code standards in [docs/code-standards.md](./docs/code-standards.md)
4. Write meaningful commit messages
5. Push to your fork: `git push origin feature/new-feature`
6. Submit a Pull Request

### Commit Message Format

```
feat(admin): implement user management interface
fix(auth): resolve token refresh loop
refactor(ui): extract common button variants
docs(readme): update installation instructions
```

## Git Workflow

- `main` - Production branch
- `dev` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Hotfix branches

## Documentation

All documentation is in the `docs/` directory:

- **[Project Overview & PDR](./docs/project-overview-pdr.md)** - Product vision, requirements, roadmap
- **[Code Standards](./docs/code-standards.md)** - Coding conventions and best practices
- **[System Architecture](./docs/system-architecture.md)** - Technical architecture and design
- **[Codebase Summary](./docs/codebase-summary.md)** - Complete codebase analysis

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**
```bash
# Check TypeScript configuration
npm run build
```

## Performance

- Turbopack for fast development builds
- Route-based code splitting
- Image optimization with Next.js Image
- Font optimization with next/font
- Lazy loading for heavy components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- No IE11 support

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://zod.dev/) - Schema validation

## Support

For issues and questions:
- Check the [documentation](./docs/)
- Review [code standards](./docs/code-standards.md)
- Open an issue on GitHub

---

**Version**: 1.0.0
**Last Updated**: 2026-01-03
**Status**: Active Development
