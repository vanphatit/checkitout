# CheckItOut - Modern Next.js Application

A full-featured web application built with Next.js 15, React 19, TypeScript, and modern development tools following best practices.

## 🚀 Features

- **Modern Stack**: Next.js 15 with App Router, React 19, TypeScript
- **UI Components**: Tailwind CSS with shadcn/ui component library
- **State Management**: Redux Toolkit for efficient state management
- **Authentication**: Complete auth system with JWT tokens
- **API Integration**: Axios for HTTP requests with interceptors
- **Form Handling**: React Hook Form with Zod validation
- **Project Structure**: Well-organized following Next.js best practices

## 📁 Project Structure

```
src/
├── app/                    # App Router pages and layouts
│   ├── (auth)/            # Authentication routes (grouped)
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/       # Dashboard routes (grouped)
│   │   └── dashboard/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── forms/            # Form components
│   ├── providers/        # Context providers
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── store/                # Redux store and slices
│   └── slices/          # Redux slices
├── types/                # TypeScript type definitions
└── utils/                # Helper utilities
```

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

## 🚀 Getting Started

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
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Update the environment variables in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=CheckItOut
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Authentication

The application includes a complete authentication system:

- **Login**: `/login` - User authentication
- **Register**: `/register` - New user registration
- **Forgot Password**: `/forgot-password` - Password recovery

### Dashboard

Protected dashboard area at `/dashboard` with user information and quick actions.

### API Integration

The app is configured to work with a backend API at `/api/v1/` endpoints:

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/forgot-password` - Password reset
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Get current user

## 🔧 Development

### Adding New Components

1. Create components in `src/components/`
2. Use shadcn/ui for consistent styling:

```bash
npx shadcn@latest add [component-name]
```

### State Management

Use Redux Toolkit slices in `src/store/slices/`:

```typescript
// Using the custom hooks
import { useAppDispatch, useAppSelector } from "@/hooks";

const dispatch = useAppDispatch();
const state = useAppSelector((state) => state.auth);
```

### Form Validation

Forms use React Hook Form with Zod validation:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";

const form = useForm({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: "", password: "" },
});
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

This application can be deployed on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS**
- **Docker**

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://zod.dev/) - Schema validation
