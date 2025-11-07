# GoldLink - Gold Lending Platform

A secure gold lending platform connecting customers and jewelers, built with Next.js, TypeScript, Prisma, and Razorpay.

## Features

- **Live Gold Rates**: Real-time display of 22K and 24K gold prices
- **3D Login/Register**: Beautiful Three.js-powered authentication pages
- **Customer Dashboard**: Apply to owners, track applications, and manage settlements
- **Owner Dashboard**: Review applications, approve/reject, and track active settlements
- **Payment Integration**: Razorpay integration for monthly interest payments
- **File Upload**: Upload item photos using UploadThing
- **Audit Logging**: Complete audit trail of all actions

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Three.js
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Payments**: Razorpay
- **File Storage**: UploadThing
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Razorpay account (for payments)
- UploadThing account (for file uploads)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd goldlink
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/goldlink?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Razorpay
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# UploadThing
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Cron Job (optional)
CRON_SECRET="your-cron-secret"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── ...              # Other components
├── lib/                 # Utility functions
├── prisma/              # Prisma schema
└── types/               # TypeScript types
```

## Key Features Implementation

### Gold Rates Fetching

Set up a cron job to call `/api/cron/gold-rates` periodically (e.g., every 5 minutes) to fetch and update gold rates. You can use:
- Vercel Cron Jobs
- cron-job.org
- GitHub Actions

### Payment Flow

1. Customer clicks "Pay Now" on a settlement
2. System creates a Razorpay order
3. Customer completes payment via Razorpay checkout
4. Webhook verifies and updates payment status
5. Settlement next due date is updated

### File Upload

Item photos are uploaded using UploadThing. Configure your UploadThing account and add the credentials to `.env`.

## Database Schema

- **User**: Customers and owners
- **GoldRate**: Cached gold prices
- **Application**: Customer applications to owners
- **Settlement**: Active loans after approval
- **Payment**: Monthly interest payments
- **AuditLog**: Complete audit trail

## Security

- Role-based access control (CUSTOMER/OWNER)
- Server-side validation with Zod
- Secure password hashing with bcrypt
- CSRF protection via NextAuth
- Webhook signature verification for Razorpay

## Deployment

1. Deploy to Vercel or your preferred platform
2. Set up PostgreSQL database (e.g., Supabase, Neon)
3. Configure environment variables
4. Set up cron job for gold rates fetching
5. Configure Razorpay webhook URL

## License

MIT

