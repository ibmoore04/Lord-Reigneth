# Lord Reigneth Foods — Supabase Backend

## Quick Setup

### 1. Create your Supabase project
1. Go to [supabase.com](https://supabase.com) → New project
2. Name: `lord-reigneth-foods`, region: closest to Nigeria (e.g. `eu-west-2`)

### 2. Configure environment variables
```bash
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from:
# Supabase Dashboard → Settings → API
```

### 3. Run migrations (in order)
Paste each file into **Supabase Dashboard → SQL Editor → New Query** and run:

| File | Description |
|------|-------------|
| `migrations/001_initial_schema.sql` | All tables, enums, indexes |
| `migrations/002_functions_and_triggers.sql` | Functions, triggers, order logic |
| `migrations/003_rls_policies.sql` | Row Level Security policies |
| `migrations/004_storage.sql` | Storage buckets & policies |
| `migrations/005_seed_data.sql` | Dev seed: locations, menu categories, menu items |

### 4. Verify
- Dashboard → Table Editor → check all tables exist
- Dashboard → Authentication → Settings → enable Email provider
- Dashboard → Storage → confirm 3 buckets: `food-images`, `gallery-images`, `avatars`

---

## Architecture

### Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (linked to auth.users) |
| `menu_categories` | 7 menu categories |
| `menu_items` | All food/drink items with prices |
| `locations` | Restaurant branches |
| `business_hours` | Per-location opening hours |
| `orders` | Customer orders |
| `order_items` | Line items (price snapshot) |
| `payment_transactions` | Paystack payment records |
| `catering_requests` | Event catering enquiries |
| `contact_messages` | Website contact form submissions |
| `newsletter_subscribers` | Email subscribers |
| `gallery_items` | Photo gallery |
| `testimonials` | Customer testimonials |
| `site_settings` | Configurable restaurant settings |
| `notifications` | User notifications |
| `audit_logs` | Admin action history |

### User Roles
- `customer` — default; can manage own profile, orders, catering requests
- `staff` — operational access; manage orders, menu, gallery, catering
- `admin` — full access; + settings, users, audit logs, testimonials

**Roles are assigned in the `profiles` table.**
To make someone an admin, run in SQL Editor:
```sql
update profiles set role = 'admin' where email = 'admin@example.com';
```
Users can NEVER self-assign a higher role — enforced by RLS.

### Security Model
- **RLS enabled on every table** — database enforces access, not just frontend routing
- **Order prices** calculated server-side via `create_order()` function — client prices never trusted
- **Payment status** only updated via service-role (Edge Function) after server-side Paystack verification
- **Admin route** `/admin` requires `role = 'admin'` at both frontend (ProtectedRoute) and database (RLS) level

### Key Functions
| Function | Purpose |
|----------|---------|
| `create_order(...)` | Creates order + items, fetches real prices from DB |
| `generate_order_number()` | Generates `LRF-YYYYMMDD-NNN` format |
| `is_location_open(id)` | Checks business hours for today |
| `get_user_role(id)` | Returns role safely |
| `handle_new_user()` | Auto-creates profile on signup |
| `validate_order_status_transition()` | Prevents invalid status changes |

---

## Payment Integration (Paystack)

When you're ready to add payments:

1. Add `VITE_PAYSTACK_PUBLIC_KEY` to `.env` (public key only)
2. Create a Supabase Edge Function for server-side verification:
   - `supabase/functions/verify-payment/index.ts`
   - Uses `PAYSTACK_SECRET_KEY` (server env only — never in frontend)
3. The Edge Function:
   - Receives `{reference, orderId}` from frontend
   - Calls `https://api.paystack.co/transaction/verify/{reference}`
   - Updates `payment_transactions` and `orders.payment_status` via service-role
4. Frontend **never** marks an order as paid — only the Edge Function does

---

## Frontend Service Layer

| Service | File |
|---------|------|
| Auth | `src/services/authService.ts` |
| Menu | `src/services/menuService.ts` |
| Orders | `src/services/orderService.ts` |
| Catering | `src/services/cateringService.ts` |
| Contact/Newsletter | `src/services/contactService.ts` |
| Gallery | `src/services/galleryService.ts` |
| Locations | `src/services/locationService.ts` |
| Admin/Analytics | `src/services/adminService.ts` |

## Hooks
| Hook | File |
|------|------|
| `useAuth()` | `src/hooks/useAuth.ts` |
| `useMenu()` | `src/hooks/useMenu.ts` |
| `useMyOrders()` / `useAdminOrders()` | `src/hooks/useOrders.ts` |
| `useLocations()` | `src/hooks/useLocations.ts` |
| `useCateringRequests()` | `src/hooks/useCateringRequests.ts` |

## Cart
`src/store/cartStore.ts` — Zustand + localStorage. Cart items use DB prices when added. Server always recalculates total on order creation.
