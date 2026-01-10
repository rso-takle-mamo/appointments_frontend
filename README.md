# Appointments Frontend

A modern appointment booking application built with Next.js 16, React 19, and shadcn/ui components.

## Features

- User authentication (login/signup)
- Calendar view for managing appointments
- Booking management interface
- Dark mode support
- Responsive design
- Form validation with React Hook Form & Zod
- State management with TanStack Query

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query
- **Calendar**: react-big-calendar, react-day-picker
- **Icons**: Huge Icons
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm, yarn, pnpm, or bun

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Start Production

```bash
npm run start
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=your_api_url_here
```

## Project Structure

```
appointments-frontend/
├── app/              # Next.js app router pages
├── components/       # Reusable UI components
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── providers/        # React providers
├── utils/            # Helper utilities
└── public/           # Static assets
```

## Deployment on Vercel

This project is optimized for Vercel deployment.

### Quick Deploy

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/new)
3. Import your repository
4. Add environment variables
5. Click "Deploy"

### Build Settings

Vercel auto-detects most settings:

| Setting | Value |
|---------|-------|
| Root Directory | `./` |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

## License

MIT
