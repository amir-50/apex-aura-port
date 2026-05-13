# Amir Nazir — Full Upgrade Plan

## 1. Rebrand
- Replace every "LUXE" / "LUXE Studio" string with **Amir Nazir** in `src/config/site.ts`, header, footer, SEO meta, login page, admin.
- Default tagline + page titles updated; admin can still edit live.

## 2. Real Auth (no more "claim admin")
- Remove the claim-admin button + RPC entirely.
- New rule: the email **you give me** is hard-seeded as admin in DB on migration. First time that email signs up (email+password OR Google), they're auto-promoted via DB trigger. No buttons, no race.
- Anyone else signing up = normal user role, lands on `/account` (not `/admin`).
- New **Account / Profile page** for normal users: change name, change password, sign out.
- Admin can:
  - Change their own email + password from the dashboard.
  - Promote/demote other users to admin.
  - Send a password-reset email to any user.
- Login page kept simple: email+password + Google. Cleaner copy, no "claim".

## 3. New Admin Dashboard (separate, multi-page, not a drawer)
Replaces the simple floating editor. Sidebar layout at `/admin/*`:

```
/admin
 ├── overview         stats: visitors-N/A, messages, bookings, pending payments, users
 ├── site-editor      live edit header, footer, hero, sections (show/hide, reorder)
 │   ├── branding     logo upload, favicon, site name, tagline
 │   ├── theme        colors, typography, radius, reduced-motion
 │   ├── sections     each section's content + image uploads
 │   └── seo          per-page meta + OG image
 ├── pricing          create/edit/delete subscription packages
 ├── orders           pending / approved / rejected payment submissions
 ├── messages         contact form inbox
 ├── bookings         booking inbox
 ├── users            list users, change role, send password-reset, view subscription
 ├── emails           SMTP settings + test-send + email log
 └── settings         admin email/password, payment-instructions toggle (bank/wallet)
```

Floating "Open Editor" pill on the public site (admins only) → jumps to `/admin/site-editor`.

## 4. Subscription / Pricing flow
- New `/pricing` page composed from `packages` table (admin-managed: name, price, currency, features[], interval).
- User clicks **Subscribe** → if not logged in, sent to `/login?next=/pricing/checkout/<id>`.
- Checkout page shows **payment instructions** (bank details + wallet number — admin toggles which appear in `/admin/settings`).
- User uploads payment **screenshot** + types **transaction ID** + optional note → creates a `subscriptions` row with status `pending`.
- User immediately sees "Payment received, awaiting approval" + email confirmation.
- Admin sees it under `/admin/orders` → **Approve** / **Reject** with note.
  - Approve → status `active`, sets `current_period_end`, sends "Payment approved" email.
  - Reject → status `rejected`, sends "Payment needs attention" email with reason.
- User's `/account` page shows current package + status + history.

## 5. SMTP + Emails
- New `email_settings` table (singleton): host, port, user, pass (encrypted-at-rest via service-role-only access), from_name, from_email, secure (bool). Editable in `/admin/emails`.
- Server function `sendMail()` uses these. "Send test email" button.
- Triggers wired:
  - Welcome on signup
  - Password-reset (admin-initiated + self-serve)
  - Contact form notification → admin
  - Booking notification → admin + ack to user
  - Payment received → admin + user
  - Payment approved/rejected → user
- Email log table (`email_log`) so you can see what was sent. Visible in `/admin/emails`.
- Lovable's domain-based emails kept as **fallback** if SMTP isn't configured yet.

## 6. Better UI / "premium" pass
- Heavier hero treatment: name + cinematic headline, animated gradient noise background, real Three.js scene (subtle floating shards / metaball) gated by reduced-motion.
- Refined typography pairing (Fraunces display + Inter body) + tighter spacing scale.
- Magnetic buttons, scroll-reveal, custom cursor pass already partially present — finished + de-glitched.
- Glassmorphism polished (less plastic, more depth), darker charcoal base, soft silver accents.

## 7. Security / DB (single migration)
- New tables: `packages`, `subscriptions`, `payment_proofs`, `email_settings`, `email_log`, `payment_methods`.
- Storage bucket `payment-proofs` (private, signed URLs only, owner + admin read).
- RLS:
  - Users read/insert their own subscriptions + proofs.
  - Admins read/update everything.
  - `email_settings` admin-only.
- Trigger on `auth.users` insert: if email = seeded admin email → insert `admin` role; else `user`.

## 8. What I need from you in your next message
1. **Admin email** (e.g. `you@gmail.com`) — that's the one I'll seed.
2. (Optional now, can fill later in admin) bank/IBAN details + wallet number for the pricing flow. Placeholders are fine for now.

Once you send the email, I'll execute everything above in one go: migration → auth rewrite → admin shell → pricing/subscriptions → SMTP → rebrand → design polish.
