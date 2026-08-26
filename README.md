## IndaSocial

IndaSocial is a Web3 marketplace that connects brands and content creators to discover opportunities, collaborate on campaigns, and build long-term relationships. The platform combines social tools, campaign management, educational content, and rewards powered by IndaToken.

This repository contains the functional prototype presented for a hackathon.

## Value proposition

- **For creators:** find collaborations, showcase their profile, communicate with brands, and track their earnings and reach.
- **For brands:** discover creators, publish and manage campaigns, receive proposals, and monitor the performance of their actions.
- **For the community:** connect through matching, chat, events, posts, and Learn & Earn content.
- **For the Web3 ecosystem:** use a Phantom wallet and SPL tokens on Solana Devnet to represent rewards and payments within the product.

## Core features

### Access and profiles

1. The user signs in with Google via Supabase Auth.
2. During onboarding, they select the **Creator** or **Brand** role.
3. The profile is saved in Supabase and the user accesses a dashboard tailored to their role.
4. From Settings, they can update their information, avatar, wallet, and preferences.

### Marketplace and collaboration

- Dashboard with active campaigns, proposals, and metrics.
- Campaign creation, review, and tracking flow.
- Swipe-style matching between brands and creators.
- Private chat for conversations after a match.
- Proposal statuses such as accepted, completed, and paid.

### Community and learning

- Public and internal blog.
- Posts with free and premium content.
- Content unlocking via a Supabase RPC function.
- Events and attendee registration.
- Notifications and a feedback widget.

### Web3 integration

- Phantom wallet connection.
- SOL balance lookup on **Solana Devnet**.
- IndaToken lookup and transfer as an SPL token.
- Wallet address recorded on the user's profile.
- Anchor IDL and helper prepared for escrow campaign operations.

> The visible wallet and transfer flow is connected to Devnet. The escrow helper (`utils/solanaEscrow.js`) and its IDL (`src/idl/inda_campaigns.json`) are included as an integration foundation; this should not be interpreted as the Anchor program being deployed or connected to every screen of the prototype.

## Tech stack

### Frontend and application

- [Next.js](https://nextjs.org/) `16.2.10` with App Router.
- [React](https://react.dev/) `19.2.4`.
- TypeScript for configuration and the root layout; views and components mainly in JSX.
- Tailwind CSS `4` via PostCSS.
- Lucide React for icons.

### Backend and authentication

- [Supabase](https://supabase.com/) for authentication, database, Storage, and RPC functions.
- Supabase SSR for browser and server clients.
- Google OAuth as the sign-in method.

### Blockchain

- Solana Devnet.
- `@solana/web3.js` and `@solana/spl-token` for wallet and token operations.
- Anchor for preparing the escrow flow.
- Phantom as the compatible wallet in the prototype.

### Quality and tooling

- ESLint `9` with `eslint-config-next`.
- Node.js and npm.
- `package-lock.json` for reproducible installs.

## Project architecture

```text
app/
	(public)/              Public routes: landing, blog, and login
	(auth)/onboarding/     Initial role setup
	(dashboard)/           Layout and protected app routes
	auth/callback/         Supabase OAuth callback
src/
	components/            Reusable UI components and flows
	context/               Global auth and profile state
	data/                  Blog data and prototype mock data
	idl/                   Anchor program IDL
	views/                 Main views for each module
utils/supabase/          Supabase clients for browser and server
utils/solanaEscrow.js    Escrow operations helper with Anchor
public/                  Images, logos, and media assets
```

Pages in `app/` act as entry points and render views from `src/views`. The dashboard layout controls the session and routes the user to login or onboarding as needed.

## Main routes

| Route | Description |
| --- | --- |
| `/` | Landing page and IndaSocial pitch |
| `/blog` | Public blog |
| `/login` | Google sign-in |
| `/onboarding` | Role selection and terms acceptance |
| `/dashboard` | Personalized main panel |
| `/sales` | Campaigns and commercial activity |
| `/connect` | Profile discovery and connection |
| `/chat` | Conversations between matches |
| `/community` | Community social space |
| `/events` | Events and registrations |
| `/internal-blog` | Content for authenticated users |
| `/learnearn` | Educational content and rewards |
| `/notifications` | Notifications |
| `/settings` | Profile, preferences, and wallet |

## Requirements

- Node.js 20 or higher recommended.
- npm.
- A Supabase project.
- Google OAuth configured in Supabase Auth.
- Phantom installed to test the Web3 features.
- Test SOL and IndaToken on Solana Devnet to perform transfers.

## Installation and setup

```bash
npm install
```

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start the development environment:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev      # Local development server
npm run lint     # Static analysis with ESLint
npm run build    # Production build
npm start        # Server running the generated build
```

## Prototype status and next steps

### Implemented in the repository

- Public navigation and dashboard with separate routes.
- Google authentication and profile persistence in Supabase.
- Role-based onboarding.
- Campaigns, proposals, matching, chat, blog, events, and Learn & Earn.
- Phantom connection and test operations on Solana Devnet.
- Anchor integration foundation for escrow campaigns.

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
