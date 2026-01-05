This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Database Seeding

To populate the database with fake data for testing and development:

### Option 1: Web Interface (Recommended)
Visit `/seed` in your browser and click the "Start Seeding" button for a visual seeding experience with progress tracking.

### Option 2: Command Line
```bash
npm run seed
# or
pnpm seed
```

This will create:
- 100 additional fake patients with complete profiles
- Additional doctors if needed (maintains at least 20 total doctors)
- 200 appointments (past and future) assigned to existing doctors
- Medical records for completed appointments
- Vital signs data for patients
- Messages between patients and doctors
- System logs

**Note:** The seed function works with existing doctors - it will create appointments for doctors that are already in your database!

**Note:** Doctor registrations are now automatically approved after submission (no admin approval required).

## Features

- **Automatic Doctor Verification**: When doctors register, they are automatically verified after a 10-second countdown
- **Comprehensive Patient Complaints**: Uses a large array of realistic medical complaints instead of generic faker data
- **Interactive Data**: All data is interconnected with proper relationships between patients, doctors, appointments, and medical records

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
