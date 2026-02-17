# SplitMint Client

This is the frontend application for SplitMint, built with React, Vite, and Tailwind CSS.

## Features

- **User Authentication**: Login and Register with JWT.
- **Guest Mode**: Try the app instantly without creating an account ("Continue as Guest").
- **Expense Groups**: Create groups and add expenses.
- **Split Logic**: Automatically calculates who owes whom.
- **Modern UI**:
  - Dark mode support (system preference).
  - Glassmorphism & Gradient backgrounds.
  - Smooth floating animations.
  - Responsive design with `shadcn/ui`.

## Prerequisites

- Node.js (v18+)

## Installation

1. Navigate to the `client` directory.
   ```bash
   cd client
   ```
2. Install dependencies.
   ```bash
   npm install
   ```

## Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file:

- `VITE_API_URL`: The URL of your backend server (e.g., `http://localhost:8080/api`).

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Tech Stack

- **Framework**: React, Vite, TypeScript
- **Styling**: Tailwind CSS (v3), shadcn/ui
- **State/Data**: TanStack Query (React Query)
- **Forms**: React Hook Form, Zod
- **Icons**: Lucide React
- **HTTP**: Axios
