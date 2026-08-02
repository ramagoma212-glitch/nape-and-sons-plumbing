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
  components/        Reusable UI (Header, Footer, ContactForm, ProjectCard, etc.)
  components/admin/  Admin-only components (ProjectForm)
  data/               Business info, services list, fallback project data
  hooks/              useAuth (Supabase auth context), useScrollToHash
  layouts/            MainLayout (public site chrome), AdminLayout
  lib/                supabaseClient, projects.js, enquiries.js, icons.jsx
  pages/              Route-level page components
  pages/admin/        AdminLogin, AdminDashboard
  sections/           Homepage section components
  styles/             Tailwind entry (index.css)
supabase/
  schema.sql          Full database + storage + RLS setup script
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

### 5.4 Create an admin account
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
- **Site URL for SEO/canonical tags:** set `VITE_SITE_URL` in `.env` (defaults to a placeholder) and update `public/sitemap.xml` and `public/robots.txt` to match your real domain once known.

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
- Real domain name — update `VITE_SITE_URL` env var, `public/sitemap.xml`, and `public/robots.txt`.
- Google Maps: the Contact page links out to a Google Maps **search** for the address (no fixed coordinates were available). If you obtain exact coordinates or a Place ID later, this can be upgraded to an embedded map.
- Compliance/certification wording on the Services page is intentionally generic until the business confirms exact accreditation details.
- Customer reviews: the homepage currently shows a "What You Can Expect From Us" section instead of testimonials, since no verified reviews were supplied. Swap in real Google/customer reviews when available.

---

## 10. Notes on Content Accuracy

Per the brief, this site avoids fabricating anything not supplied: no invented years of experience, staff counts, review counts, certifications, or company history. Where such information will eventually be available (compliance certificates, reviews), the relevant sections are built so real content can be dropped in without restructuring the page.
