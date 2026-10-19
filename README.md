# Frontend Agency Web App

Web application for Agency/Supervisor/Master Agent to manage downline users, view statistics, commissions, and perform user management operations.

## Tech Stack

- **React 18+** với Vite
- **TypeScript**
- **TailwindCSS**
- **Shadcn/ui** components
- **Zustand** cho state management
- **React Query** cho data fetching
- **React Router v6** cho routing
- **React Hook Form + Zod** cho form validation
- **Axios** cho HTTP client

## Features

- ✅ Login với role-based authentication (supervisor/agency/master_agent)
- ✅ Dashboard với statistics và overview
- ✅ Users management: View, search, filter downline users
- ✅ User detail: View user info, balance, stats, bets history
- ✅ Balance adjustment: Deposit/Withdraw for users
- ✅ Lock/Unlock users
- ✅ Deposits management: Approve pending deposits
- ✅ Withdrawals management: Approve pending withdrawals
- ✅ Commissions: View commission history (agency/master_agent only)
- ✅ Transactions: View transaction history với filters

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_KEY=your_api_key_here
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_NAME=Agency Management
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── api/              # API client và endpoints
├── components/       # React components
│   ├── ui/          # Shadcn/ui components
│   ├── layout/     # Layout components
│   └── users/      # User-related components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── store/           # Zustand stores
├── lib/             # Utilities và helpers
└── types/           # TypeScript types
```

## API Integration

All API calls are handled through:
- `src/api/client.ts` - Axios instance với interceptors
- `src/api/auth.ts` - Authentication endpoints
- `src/api/manager.ts` - Manager/Downline endpoints

API endpoints use the `/api/manager/*` routes from the backend.

## Authentication

- Login với username/password và API Key
- JWT token được lưu trong localStorage
- Protected routes tự động redirect nếu chưa authenticated
- Role-based access control cho commissions page

## Usage

1. **Login**: Enter API Key, username, và password
2. **Dashboard**: View overview statistics và recent activity
3. **Users**: Browse và manage downline users
4. **User Detail**: Click on user để xem chi tiết, bets, transactions
5. **Balance Adjustment**: Click dollar icon để deposit/withdraw
6. **Deposits/Withdrawals**: Approve pending requests
7. **Commissions**: View commission history (agency/master_agent only)

## Development Notes

- Uses React Query cho data fetching và caching
- Zustand cho global state management
- Shadcn/ui components cho consistent UI
- TailwindCSS cho styling
- TypeScript cho type safety
