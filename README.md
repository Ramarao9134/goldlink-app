# GoldLink - Gold Management Platform

A comprehensive platform connecting customers with jewelers (owners) for gold asset management, including applications, settlements, and monthly interest payments.

## Features

- **Live Gold Rates**: Real-time 22K and 24K gold prices per gram
- **3D Login/Register**: Beautiful Three.js-powered authentication screens
- **Customer Features**:
  - Apply to owners with gold item details (weight, karat, photos, notes)
  - Track application status
  - View settlements and payment history
  - Pay monthly interest via Razorpay
- **Owner Features**:
  - Review incoming applications
  - Approve/reject applications
  - Set principal amount and interest rates
  - Track active settlements and payments
- **Security**: Role-based access control, secure authentication, payment verification

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Three.js
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js (email/password)
- **Payments**: Razorpay
- **File Storage**: UploadThing
- **Validation**: Zod

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Razorpay account (for payments)
- UploadThing account (for file uploads)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd goldlink
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/goldlink?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32

# Razorpay
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-razorpay-webhook-secret"

# UploadThing
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Cron (optional, for gold rates updates)
CRON_SECRET="your-cron-secret"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
goldlink/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── applications/ # Application management
│   │   ├── settlements/  # Settlement management
│   │   ├── payments/     # Payment processing
│   │   ├── gold-rates/   # Gold rates API
│   │   └── uploadthing/  # File upload
│   ├── auth/             # Login/Register pages
│   ├── dashboard/        # Dashboard pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── 3d-scene.tsx      # Three.js scene
│   ├── customer-dashboard.tsx
│   ├── owner-dashboard.tsx
│   └── gold-rates-display.tsx
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── gold-rates-fetcher.ts
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── types/
    └── next-auth.d.ts    # TypeScript definitions
```

## API Endpoints

### Public
- `GET /api/gold-rates` - Get latest gold rates
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Protected (Customer)
- `GET /api/applications` - Get customer's applications
- `POST /api/applications` - Create new application
- `GET /api/settlements` - Get customer's settlements
- `POST /api/settlements/:id/pay` - Initiate payment

### Protected (Owner)
- `GET /api/applications` - Get owner's assigned applications
- `POST /api/applications/:id/approve` - Approve application
- `POST /api/applications/:id/reject` - Reject application
- `GET /api/settlements` - Get owner's settlements

### Webhooks
- `POST /api/payments/webhook` - Razorpay payment webhook

## Gold Rates

The application fetches gold rates periodically. You can:

1. **Manual Update**: Call `GET /api/cron/gold-rates` with proper authentication
2. **Scheduled Cron**: Set up a cron job to call the endpoint every few minutes
3. **Replace API**: Update `lib/gold-rates-fetcher.ts` to use your preferred gold rates API

Currently uses mock data. Replace with actual API integration.

## Payment Flow

1. Customer initiates payment from settlement
2. System creates Razorpay order
3. Customer completes payment on Razorpay checkout
4. Razorpay sends webhook to `/api/payments/webhook`
5. System verifies signature and updates payment status
6. Settlement next due date is updated

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure:
- PostgreSQL database is accessible
- Environment variables are set
- Webhook URL is configured in Razorpay dashboard
- UploadThing is configured

## Development

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
```

## Security Notes

- All API routes are protected with NextAuth
- Role-based access control enforced
- Payment webhooks verify Razorpay signatures
- Passwords are hashed with bcrypt
- CSRF protection via NextAuth
- Secure cookies enabled

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

