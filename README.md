# Nape and Sons Plumbing & Projects — Website

A premium marketing website and lightweight project-portfolio admin for **Nape and Sons Plumbing & Projects**, a plumbing and projects business serving Limpopo, Pretoria and Johannesburg.

The public site works fully out of the box using the company's real project photographs as fallback content — no backend configuration is required to preview or present the demo. Connecting Supabase unlocks the admin dashboard (project management) and enquiry storage.

---

## 1. Tech Stack

- **Frontend:** React 18 + Vite 5
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Icons:** lucide-react
- **SEO/Meta:** react-helmet-async
- **Backend:** Supabase (Auth, Postgres, Storage)

---

## 2. Requirements

- Node.js 18+ and npm
- (Optional, for admin features) A free [Supabase](https://supabase.com) project

---

## 3. Local Setup

```bash
npm install
npm run dev       # start local dev server (usually http://localhost:5173)
npm run build     # production build to /dist
npm run preview   # preview the production build locally
```

The public site (Home, About, Services, Projects, Contact) works immediately after `npm install`, using the local project photos in `src/assets/projects` and `src/data/projects.js` as fallback content — even before Supabase is configured.

---

## 4. Project Structure

```
src/
  assets/projects/   Real project photographs
  components/        Reusable UI (Header, Footer, ContactForm, ProjectCard, MediaGallery, etc.)
  components/admin/  Admin-only components (ProjectForm, MediaManager)
  data/               Business info, services list, fallback project data
  hooks/              useAuth (Supabase auth context), useScrollToHash
  layouts/            MainLayout (public site chrome), AdminLayout
  lib/                supabaseClient, projects.js, media.js, enquiries.js, icons.jsx
  pages/              Route-level page components
  pages/admin/        AdminLogin, AdminDashboard
  sections/           Homepage section components
  styles/             Tailwind entry (index.css)
supabase/
  schema.sql               Base database + storage + RLS setup script
  migrations/002_project_media.sql   Adds multi-image/video gallery support (run after schema.sql)
public/               Static assets: robots.txt, sitemap.xml, favicon, 404.html
```

---

## 5. Supabase Setup

The site works without Supabase (public pages use local fallback data). To enable the admin dashboard and enquiry storage:

### 5.1 Create a project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once provisioned, go to **Settings → API** and copy the **Project URL** and **anon public key**.

### 5.2 Environment variables
Copy `.env.example` to `.env` and fill in the values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart `npm run dev` after adding/changing environment variables.

### 5.3 Database, storage and security policies
Open **Supabase → SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This single script creates:

- `public.projects` table (with `slug`, `category`, `image_url`, `featured`, `display_order`, etc.)
- `public.enquiries` table (contact/quote form submissions)
- Row Level Security enabled on both tables, with policies so that:
  - **Anyone** can read published projects (`select`)
  - **Anyone** can submit an enquiry (`insert` only — no read access)
  - Only **authenticated** users (admins) can create/update/delete projects, and can read/update/delete enquiries
- The `project-images` storage bucket (public read, 5MB limit, JPEG/PNG/WebP only), with matching storage policies

You do not need to guess at table fields — running this script is the complete setup.

### 5.4 Project media (multiple photos + videos per project)
After `schema.sql`, also run [`supabase/migrations/002_project_media.sql`](supabase/migrations/002_project_media.sql) in the SQL Editor. This is a purely additive migration — it does not touch `projects.image_url`/`image_path` — and adds:

- `public.project_media` table (multiple images/videos per project, with `caption` and `display_order`), with the same RLS pattern: public read, authenticated-only write.
- The `project-videos` storage bucket (public read, 50MB limit, MP4/WebM only), with matching storage policies. The limit is 50MB, not higher, because Supabase's Free plan enforces a 50MB per-file upload ceiling at the platform level regardless of bucket configuration — raise this only alongside a paid plan that supports larger uploads.

The app works fine before this migration is run (every project simply falls back to its single legacy cover image); the admin dashboard's "Project Photos & Videos" section becomes usable once it's applied. If you're setting this up fresh, `002_project_media.sql` already creates the bucket at the correct 50MB limit; if you applied it before this note was added, also run `supabase/migrations/004_reduce_video_size_limit.sql`.

### 5.5 Create an admin account
Supabase Auth is used for the admin login (no self-registration is built into the site, by design).

1. Go to **Supabase → Authentication → Users → Add user**.
2. Create a user with the business owner's email and a password.
3. That's it — this account can now log in at `/admin`.

(Optional) To require email confirmation or add password reset flows, configure this under **Authentication → Providers/Settings** in Supabase — the site's `useAuth` hook already supports standard Supabase email/password sessions.

---

## 6. Using the Admin Dashboard

1. Go to `/admin` and sign in with the account created in step 5.4.
2. You'll land on `/admin/dashboard`, showing a table of all projects.
3. **Add a project:** click "New Project" → fill in title (slug auto-generates), category, description, upload an image, optionally mark "Feature on homepage", set a display order → "Create Project".
4. **Edit a project:** click the pencil icon on any row, change fields (optionally replace the image), → "Save Changes".
5. **Delete a project:** click the trash icon and confirm. This also removes the image from Storage.
6. **Log out** via the button in the admin header.

Until Supabase is configured, `/admin` shows a clear message instead of a broken login form.

---

## 7. Updating Content

- **Contact details / phone / WhatsApp / address:** edit `src/data/business.js`.
- **Services list (Home + Services page):** edit `src/data/services.js`.
- **Fallback/demo projects:** edit `src/data/projects.js` (used whenever Supabase has no rows, or isn't configured). Once you add real projects via the admin dashboard, those take priority automatically.
- **Replacing/adding photos:** drop new images into `src/assets/projects/` with a descriptive filename, then reference them in `src/data/projects.js` — or upload directly via the admin dashboard once Supabase is connected. The original, unedited photos supplied for this project are archived in `original-photos/` (not used by the build).
- **Site URL for SEO/canonical tags:** the production domain is `https://napeandsonsplumbing.co.za` — this is already the code fallback (`src/components/Seo.jsx`, `src/components/LocalBusinessSchema.jsx`) and is baked into `public/robots.txt` and the sitemap generator. Setting `VITE_SITE_URL` in your hosting provider's environment variables overrides it per-environment if ever needed (e.g. a staging domain) but isn't required for production.

---

## 8. Deployment

This is a static single-page app after `npm run build` (output in `dist/`). Supabase remains the backend regardless of where the frontend is hosted.

### Recommended: Netlify or Vercel
Both handle SPA client-side routing natively.
- **Netlify:** `netlify.toml` is already included (`npm run build`, publish `dist`, SPA rewrite to `index.html`).
- **Vercel:** `vercel.json` is already included with a catch-all rewrite to `index.html`.

Set the `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (and optionally `VITE_SITE_URL`) environment variables in your hosting provider's dashboard — never commit real secrets to the repo.

### Alternative: GitHub Pages
GitHub Pages has no server-side rewrite support, so direct URLs and refreshes on routes like `/services` would 404 by default. This is already handled:
- `public/404.html` redirects unknown paths back to `index.html` with the original path encoded in a query string.
- A small inline script in `index.html` restores that path via `history.replaceState` before React Router mounts.

If you deploy to a project page (`https://username.github.io/repo-name/`), set Vite's `base` in `vite.config.js`:

```js
export default defineConfig({
  base: '/repo-name/',
  // ...
})
```

then:

```bash
npm run build
# push the contents of dist/ to the gh-pages branch, or use a GitHub Action
```

### General steps for GitHub (any host)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

---

## 9. What's Left To Configure Manually

- Supabase project + environment variables (site works without this, admin does not).
- A real admin user (Section 5.4).
- ~~Real domain name~~ — done: `napeandsonsplumbing.co.za` is registered and is the SEO code fallback, `robots.txt`, and sitemap generator's default. Still pending: connecting it in Netlify/DNS, and adding it to Supabase's Authentication redirect URL allow list once DNS is verified.
- Google Maps: the Contact page links out to a Google Maps **search** for the address (no fixed coordinates were available). If you obtain exact coordinates or a Place ID later, this can be upgraded to an embedded map.
- Compliance/certification wording on the Services page is intentionally generic until the business confirms exact accreditation details.
- Customer reviews: the homepage currently shows a "What You Can Expect From Us" section instead of testimonials, since no verified reviews were supplied. Swap in real Google/customer reviews when available.
- Email notifications (Section 11) and Turnstile anti-spam (Section 12) are both fully prepared but intentionally inactive — see those sections for the exact activation steps.

---

## 10. Security Headers

`netlify.toml` sets these production headers on every route: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` disabling camera/microphone/geolocation/payment (none of which this site uses). These are safe and non-breaking.

**Content-Security-Policy is intentionally not applied yet.** A CSP strict enough to be worth adding would need, at minimum:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://*.supabase.co;
  media-src 'self' https://*.supabase.co;
  connect-src 'self' https://*.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

The two `'unsafe-inline'` entries are needed by two small existing things, not by the CSP itself: the GitHub Pages 404-redirect-restore `<script>` inline in `index.html` (`script-src`), and one inline `style={{ animationDelay }}` on the Projects page's filter animation (`style-src`). Both could be removed with a small refactor (moving the script to an external file, moving the animation delay to a CSS custom property) to tighten the policy further, but that wasn't done as part of a "just add headers" pass. Test this CSP against the real production domain (report-only mode first, via `Content-Security-Policy-Report-Only`) before enforcing it, since Supabase's storage/API domain needs to match exactly.

**Strict-Transport-Security (HSTS) is also intentionally not set yet** — add it only once `https://napeandsonsplumbing.co.za` is confirmed serving valid HTTPS, since HSTS is difficult to safely undo if applied too early.

---

## 11. Email Notification System (Prepared, Not Active)

When a customer submits a Contact, Quote, or Booking form, the enquiry is saved to Supabase — that already works today. This section covers the **email side**: notifying the business at `napeandsons@gmail.com`, and confirming to the customer if they gave an email address. **This is built but intentionally not switched on yet.**

### 11.1 Architecture

```
Customer submits form
      ↓
Supabase (public.enquiries INSERT)   ← already live; this is the source of truth
      ↓
Database Webhook (to be configured)
      ↓
Edge Function: send-enquiry-email    ← supabase/functions/send-enquiry-email/
      ↓
Resend (transactional email provider)
      ↓
napeandsons@gmail.com  +  the customer (if they gave an email)
```

The browser never talks to the email provider directly, and never sees its API key. The database insert is always the real "success" — email is a secondary, best-effort step that happens after the fact, server-side.

### 11.2 Files

- `supabase/functions/send-enquiry-email/index.ts` — the handler: validates the webhook payload, sends the business + customer emails, marks the row as notified.
- `supabase/functions/send-enquiry-email/templates.ts` — pure HTML/plain-text template builders (business notification + 3 customer confirmation variants). No network code.
- `supabase/functions/send-enquiry-email/email-provider.ts` — the only file that talks to Resend. Isolated so a different provider could be swapped in later without touching the templates or handler.
- `supabase/migrations/007_enquiry_notification_tracking.sql` — optional additive migration (see 11.4).

### 11.3 What the emails say

**Business notification** (to `napeandsons@gmail.com`, Reply-To set to the customer's own email when given, so replying goes straight to them):
- Subject: `New Contact Enquiry | Nape and Sons Plumbing` / `New Quote Request | ...` / `New Booking Request | ...`
- Shows: Enquiry Type, Customer Name, Phone, Email, Service, Location, Message, and for bookings also Preferred Date/Time. Empty fields (e.g. no email given) are simply omitted, not shown blank.

**Customer confirmation** (only sent if an email address was provided; Reply-To set to `napeandsons@gmail.com`):
- Contact: "We have received your enquiry and will contact you regarding the details provided."
- Quote: explicitly states **no price has been automatically approved**.
- Booking: explicitly states **the date/time is not yet confirmed** — never claims a booking is confirmed.

All three end with the phone/WhatsApp numbers for urgent matters, and are simple table-based HTML (for email client compatibility) with a plain-text fallback, in navy/white/gold matching the site.

### 11.4 Duplicate-email protection

`supabase/migrations/007_enquiry_notification_tracking.sql` adds a nullable `notification_sent_at` column. The Edge Function checks it before sending and sets it after a successful send, so a retried webhook delivery for the same row doesn't send the emails twice. **This migration is optional and not required to exist for anything else to work** — run it whenever you're ready to activate the webhook (step 8 below), not before.

Tradeoff, by design rather than oversight: if the business email succeeds but the customer email then fails (or vice versa), the row isn't marked notified, and a webhook retry could resend the one that already succeeded once more. A fully duplicate-proof version would track business/customer status as two separate columns — not built now, to avoid overengineering a system that isn't active yet. Revisit only if duplicate emails turn out to be a real problem in practice.

### 11.5 Failure and retry behaviour

The enquiry is already durably saved before this function ever runs (the webhook fires after the insert commits) — so a failed or misconfigured email step **never loses a customer enquiry**. If the email provider isn't configured (no `RESEND_API_KEY` secret set) or a send fails, the function logs the real error server-side only (never to the customer) and returns a non-2xx status so Supabase's own built-in webhook retry (a limited number of automatic attempts with backoff) can retry transient failures — no custom retry queue was built, deliberately, to keep this simple.

### 11.6 Activate once `napeandsonsplumbing.co.za` is live over HTTPS

1. Create a transactional email provider account (Resend is the current recommendation; no account was created as part of this work).
2. Add `napeandsonsplumbing.co.za` as a sending domain in that provider.
3. Obtain the DNS verification records the provider gives you (these come from the real provider — nothing has been invented here).
4. Add those DNS records at your domain registrar.
5. Wait for the provider to verify the domain.
6. Confirm the "From" address (`website@napeandsonsplumbing.co.za` or an equivalent professional sender) is usable once verified.
7. Add the provider's API key as a Supabase secret — **never** in this repo, `.env.local`, or Netlify: `supabase secrets set RESEND_API_KEY=<real-key>`.
8. Run migration `007_enquiry_notification_tracking.sql` (Section 11.4).
9. Deploy the Edge Function: `supabase functions deploy send-enquiry-email`.
10. Configure a Supabase **Database Webhook**: Table `public.enquiries`, event `INSERT`, target the deployed function's URL. (Database Webhooks are configured in the Supabase Dashboard under Database → Webhooks — no SQL required for this part.)
11. Send controlled test enquiries through the real site and confirm both emails arrive correctly before considering this "live."

### 11.7 Required secret

| Name | Where it lives | Where it must NOT live |
|---|---|---|
| `RESEND_API_KEY` | Supabase Edge Function secret (`supabase secrets set`) | This repo, `.env.local`, Netlify environment variables, GitHub |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available inside every Supabase Edge Function already — nothing to configure for those.

### 11.8 Spam consideration

The public forms already have a honeypot (Milestone 3A). Once real emails are flowing, automated form spam becomes email spam too, landing in your inbox and potentially the customer confirmation going to spammer-supplied addresses. Complete or strengthen anti-spam (e.g. Cloudflare Turnstile, deliberately not implemented yet) before or alongside activating this system — not required to prepare it, but recommended before switching it on for real.

---

## 12. Turnstile Anti-Spam (Prepared, Not Active)

Contact, Quote and Booking currently save straight to `public.enquiries` from the browser, with a honeypot as the only anti-spam layer. This section adds real server-side verification — **built but intentionally not switched on yet**, exactly like the email system in Section 11.

### 12.1 Architecture

```
Customer submits form
      ↓
Honeypot check (client-side, unchanged)
      ↓
Cloudflare Turnstile token (client-side widget)
      ↓
Supabase Edge Function: submit-enquiry
      ↓
Server-side Cloudflare Siteverify
      ↓
Supabase enquiries INSERT (using the service-role key, inside the function)
      ↓
Database success response
```

The browser never talks to Cloudflare's verification endpoint directly, and never sees `TURNSTILE_SECRET_KEY`. `submit-enquiry` inserts into the exact same `public.enquiries` table the prepared (still inactive) `send-enquiry-email` webhook watches, so that system remains fully compatible once both are switched on — `submit-enquiry` never calls Resend itself.

### 12.2 Files

- `supabase/functions/submit-enquiry/index.ts` — the handler: honeypot short-circuit, validation, Turnstile verification, insert.
- `supabase/functions/submit-enquiry/validation.ts` — request shape/type/length validation, mirroring the constraints already in `006_enquiry_types_and_booking.sql`.
- `supabase/functions/submit-enquiry/turnstile.ts` — the Cloudflare Siteverify call, plus hostname/action checks.
- `supabase/functions/submit-enquiry/cors.ts` — a small explicit origin allowlist (production domain + local dev ports), not a wildcard.
- `supabase/migrations/008_secure_enquiry_submission.sql` — removes the anonymous direct-INSERT policy on `enquiries`. **Not run yet — see 12.6.**
- `src/components/TurnstileWidget.jsx` — thin wrapper that loads Cloudflare's script once and renders the widget in explicit mode, exposing `reset()` via ref (a token is single-use and must never be resent).
- `src/lib/enquiries.js` — `submitEnquiry` now branches on `isTurnstileConfigured`.
- `src/components/ContactForm.jsx` — renders the widget and handles verified/expired/error states when Turnstile is configured; unchanged otherwise.

### 12.3 The activation switch: `VITE_TURNSTILE_SITE_KEY`

Rather than requiring a second, carefully-timed frontend deploy to "switch over," the frontend behaviour is driven entirely by whether `VITE_TURNSTILE_SITE_KEY` is set at build time:

- **Not set (current production state):** no widget renders, `submitEnquiry` inserts directly into `enquiries` exactly as it does today. Merging and deploying this milestone's code changes nothing about how the live site behaves.
- **Set:** the widget renders, a token is required before submit, and `submitEnquiry` calls `submit-enquiry` instead of inserting directly.

This means the only action that flips the frontend over is adding the environment variable in Netlify and letting it redeploy — no follow-up code change needed, and no risk of forgetting to "deploy the new frontend" as a separate step.

### 12.4 Required secrets/variables

| Name | Where it lives | Where it must NOT live |
|---|---|---|
| `VITE_TURNSTILE_SITE_KEY` | Public. Netlify environment variables (and `.env.local` for local testing) | N/A — this one is meant to be public and ships in the browser bundle |
| `TURNSTILE_SECRET_KEY` | Supabase Edge Function secret (`supabase secrets set`) | This repo, `.env.local`, Netlify, GitHub, `.env.example` (as a real value), the React bundle |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available inside every Supabase Edge Function already — nothing to configure for those.

### 12.5 Cloudflare manual setup (you do this — nothing here does it automatically)

1. Create or sign in to a Cloudflare account.
2. Open **Turnstile** in the dashboard.
3. **Add a widget.**
4. Widget name: `Nape and Sons Website`.
5. Hostname: `napeandsonsplumbing.co.za`.
6. Widget mode: **Managed**.
7. Obtain the **Site Key** and **Secret Key**.
8. Site Key → Netlify → Site settings → Environment variables → `VITE_TURNSTILE_SITE_KEY`.
9. Secret Key → Supabase → `supabase secrets set TURNSTILE_SECRET_KEY=<real-secret>` (or Dashboard → Edge Functions → Secrets). Never paste it anywhere else.

### 12.6 Activation sequence (zero-downtime)

The recommended order, and why:

1. Create the Cloudflare widget (12.5).
2. Set `TURNSTILE_SECRET_KEY` as a Supabase Edge Function secret.
3. Deploy the function: `supabase functions deploy submit-enquiry`.
4. Test the deployed function directly (e.g. `curl`/Postman) using Cloudflare's dummy testing sitekey/secret pair (12.7) before touching Netlify at all — this confirms validation, Turnstile verification and the insert all work while production traffic is completely unaffected (the frontend is still doing direct inserts at this point).
5. Add `VITE_TURNSTILE_SITE_KEY` (the **real** one from 12.5) to Netlify and let it redeploy. The frontend now renders the widget and calls `submit-enquiry` — safe, because step 3 already confirmed the function exists and works.
6. Submit real test enquiries through the live site (all three forms) and confirm they land in `public.enquiries` with `status = 'new'`.
7. Only now run `supabase/migrations/008_secure_enquiry_submission.sql` in the SQL editor, removing the anonymous direct-INSERT policy.
8. Re-test all three forms once more after the migration, confirming they still succeed (they should — they no longer depend on that policy at all, since `submit-enquiry` writes with the service-role key).

The reason this is safe: steps 1-4 touch nothing production-facing (no Netlify change, no migration). Step 5 is the only moment the live frontend changes behaviour, and by then the function has already been deployed and tested in isolation. Step 7 (the only irreversible-ish step, since it removes a policy) happens last, after real submissions through the real UI are already confirmed working — at that point removing the anonymous policy changes nothing observable, it just closes the bypass.

### 12.7 Testing without production credentials

Cloudflare publishes fixed dummy sitekey/secret pairs for exactly this purpose — safe to use in `.env.local` and for the `curl` test in step 4 above, never in production:

| Purpose | Sitekey | Secret |
|---|---|---|
| Always passes (visible widget) | `1x00000000000000000000AA` | `1x0000000000000000000000000000000AA` |
| Always blocks | `2x00000000000000000000AB` | `2x0000000000000000000000000000000AA` |
| Always passes (invisible) | `1x00000000000000000000BB` | (use the "always passes" secret above) |
| Forces an interactive challenge | `3x00000000000000000000FF` | `3x0000000000000000000000000000000AA` (reports "already spent" on reuse — useful for testing replay rejection) |

### 12.8 Rate limiting — assessed, not built

Turnstile + honeypot are the primary anti-spam layer here. A per-IP or per-token rate limiter inside `submit-enquiry` was deliberately **not built**: Supabase Edge Functions are stateless and can run across multiple regions/instances, so an in-memory counter would be trivially inconsistent and give a false sense of protection. A real rate limit needs shared state — e.g. a small Postgres table tracking submission counts per IP/time window (queried from inside the function), or Cloudflare's own rate-limiting rules if the domain is ever proxied through Cloudflare's edge network. Either is a reasonable follow-up but is additional infrastructure, not something to fake here.

### 12.9 CORS

`submit-enquiry` responds with `Access-Control-Allow-Origin` only for an explicit allowlist (`https://napeandsonsplumbing.co.za`, plus local dev ports `5173`/`4173`) rather than a wildcard — a small, known set of legitimate callers, so there's no reason to widen it. Even if it were wildcarded, Turnstile verification and server-side validation remain the actual security boundary; CORS only affects which *browsers* will let a page call this endpoint, not what the endpoint itself accepts.

### 12.10 Privacy

`submit-enquiry` never logs `full_name`, `phone`, `email`, `message`, or the Turnstile token in normal operation. Server-side logs are limited to generic reason codes (e.g. `invalid_email`, `preferred_date_in_past`) and Cloudflare's own Siteverify error codes — enough to diagnose a misconfiguration without exposing a single customer's data.

---

## 13. Notes on Content Accuracy

Per the brief, this site avoids fabricating anything not supplied: no invented years of experience, staff counts, review counts, certifications, or company history. Where such information will eventually be available (compliance certificates, reviews), the relevant sections are built so real content can be dropped in without restructuring the page.
