# product-frontend-web

Web UI for the Phase Zero SaaS platform.

## Purpose

Customer-facing application built with Next.js App Router. Provides tenant-scoped views with role-based access control.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Shadcn UI components
- Deployed on GCP Cloud Run

## Features

- **RoleGuard:** Component-level access control (Admin vs Standard)
- **Support Widget:** Pill-style chat for FAQ and Contact Us escalation
- **Multi-Tenant:** Tenant context from JWT, scoped API calls

## Structure

```
src/
├── app/           # App Router pages
├── components/    # UI components
│   ├── ui/        # Shadcn components
│   └── guards/    # RoleGuard
├── lib/           # Utilities, API client
└── hooks/         # Custom React hooks
```

## Response notes

product-frontend-web structure:
product-frontend-web/
├── src/
│   ├── app/
│   │   ├── globals.css        # Dark mode CSS variables
│   │   ├── layout.tsx         # Root layout (dark class)
│   │   ├── page.tsx           # Redirects to /dashboard
│   │   └── dashboard/
│   │       └── page.tsx       # Main dashboard
│   ├── components/
│   │   ├── ui/
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── input.tsx
│   │   └── guards/
│   │       └── role-guard.tsx # RoleGuard, AdminOnly
│   └── lib/
│       └── utils.ts           # cn() helper
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── next.config.js
├── package.json
├── .gitignore
└── README.md

Dashboard features:
- Linear-style dark theme
- Sticky header with Avatar + role Badge
- Search Record input card
- Result Card with record details
- AdminOnly wrapper hides Edit/Delete buttons + Admin Panel for standard users

Role toggle: Change mockUser.role in dashboard/page.tsx:
const mockUser = {
role: "admin" as const,  // → "standard" to test
};

Run locally:
cd product-frontend-web
npm install
npm run dev

## Widget response notes

New file: src/components/support-widget.tsx

Features:
- Fixed pill button (bottom-right)
- Smooth popover animation
- View 1 (FAQ): 3 expandable FAQ items with accordion behavior
- View 2 (Contact): Textarea + Submit button with success state
- Back navigation between views
- Auto-reset on close

Interactions:
[Pill Click] → Popover opens (FAQ view)
[FAQ Item Click] → Expands/collapses answer
[Contact Us Click] → Switches to contact form
[Send Message] → Shows success confirmation → Auto-returns to FAQ
[Close/X] → Resets widget state

Integration: Added <SupportWidget /> to dashboard/page.tsx

Production note: The handleSubmit function logs to console. In production, wire it to:
// Send to Azure Queue → Logic App → Teams/Email
await fetch('/api/support', {
method: 'POST',
body: JSON.stringify({ message, userEmail: mockUser.email })
});

## More response notes

Backend (identity-service): Running on http://localhost:8000
- Health check: curl http://localhost:8000/health → {"status":"healthy"}
- Docs: http://localhost:8000/docs
- Token endpoint ready

Frontend (product-frontend-web): Requires Node.js

To start the frontend, install Node.js:
brew install node

Then run:
cd /Users/leoceka/repos/phase-zero/product-frontend-web
npm install
npm run dev

Test the full flow:
1. Open http://localhost:3000 → Login page
2. Login with: admin@example.com / admin123
3. Redirects to dashboard with user info from JWT
4. Logout button clears token


####


| Service                         | URL                   | Status  |
  |---------------------------------|-----------------------|---------|
| Backend (identity-service)      | http://localhost:8000 | Running |
| Frontend (product-frontend-web) | http://localhost:3000 | Running |

Test the full auth flow:

1. Open http://localhost:3000 → Redirects to login page
2. Login with:
   - Email: admin@example.com
   - Password: admin123
3. On success → Redirects to dashboard with JWT-decoded user info
4. Role badge shows "admin" (green) with Admin Panel visible
5. Logout button clears token and returns to login

Alternative user:
- Email: user@example.com
- Password: user123
- Role: standard (no Admin Panel visible)

API endpoints:
- GET http://localhost:8000/health — Health check
- GET http://localhost:8000/docs — Swagger UI
- POST http://localhost:8000/token — Get JWT
- GET http://localhost:8000/.well-known/openid-configuration — OIDC discovery