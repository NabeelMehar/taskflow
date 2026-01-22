# TaskFlow - Modern Task Management System

A full-featured task management application built with Next.js 14, Supabase, and Tailwind CSS. Similar to Jira, but simpler and faster.

![TaskFlow Preview](https://via.placeholder.com/800x400?text=TaskFlow+Preview)

## Features

- 🔐 **Authentication** - Email/password and OAuth (GitHub, Google)
- 📋 **Kanban Board** - Drag & drop task management
- 📁 **Projects** - Organize tasks by project with unique keys
- 👥 **Workspaces** - Multi-tenant support for teams
- 🏷️ **Labels & Priorities** - Categorize and prioritize tasks
- 💬 **Comments** - Collaborate on tasks
- 🔍 **Search & Filter** - Find tasks quickly
- 📱 **Responsive** - Works on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Drag & Drop**: dnd-kit
- **Deployment**: Vercel

---

## 🚀 Quick Start (Deploy in 10 Minutes)

### Step 1: Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"**
3. Fill in:
   - Project name: `taskflow`
   - Database password: (save this somewhere safe!)
   - Region: Choose closest to you
4. Click **"Create new project"** and wait ~2 minutes

### Step 2: Create Database Tables

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Paste it into the SQL editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success" messages

### Step 3: Get Your API Keys

1. In Supabase, go to **Settings** → **API**
2. Copy these values (you'll need them soon):
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 4: Enable OAuth (Optional)

To allow GitHub/Google login:

1. Go to **Authentication** → **Providers**
2. For **GitHub**:
   - Go to GitHub → Settings → Developer Settings → OAuth Apps → New
   - Callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret back to Supabase
3. For **Google**:
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Create OAuth Client ID
   - Callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Secret back to Supabase

### Step 5: Deploy to Vercel (Free)

**Option A: One-Click Deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/taskflow)

**Option B: Manual Deploy**

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign up with GitHub
3. Click **"New Project"**
4. Import your TaskFlow repository
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   ```
6. Click **"Deploy"**
7. Wait ~2 minutes for deployment

### Step 6: Update Supabase Auth Settings

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: 
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

**🎉 Done! Your TaskFlow app is live!**

---

## 💻 Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
taskflow/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   └── auth/callback/     # OAuth callback handler
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   ├── tasks/             # Task-related components
│   │   └── auth/              # Auth components
│   ├── lib/
│   │   ├── supabase/          # Supabase client setup
│   │   ├── store.ts           # Zustand global state
│   │   ├── utils.ts           # Utility functions
│   │   └── constants.ts       # App constants
│   └── types/                 # TypeScript types
├── supabase/
│   └── schema.sql             # Database schema
├── public/                    # Static assets
└── package.json
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for admin ops) | No |
| `NEXT_PUBLIC_APP_URL` | Your app URL | No |

---

## 🎨 Customization

### Changing Colors

Edit `tailwind.config.ts` to modify the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        // Add more shades
      },
    },
  },
},
```

### Adding New Task Statuses

Edit `src/lib/constants.ts`:

```typescript
export const TASK_STATUSES = [
  { value: 'backlog', label: 'Backlog', color: '#6b7280' },
  // Add new statuses here
]
```

---

## 📝 API Routes

The app uses Supabase directly from the client. Key tables:

- `users` - User profiles
- `workspaces` - Team workspaces
- `projects` - Projects within workspaces
- `tasks` - Individual tasks
- `comments` - Task comments
- `labels` - Task labels

---

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access data in their workspaces
- Auth tokens are handled securely by Supabase

---

## 🐛 Troubleshooting

### "Invalid API key"
- Check your `.env.local` file
- Ensure no extra spaces in the keys
- Restart the dev server after changing env vars

### "Permission denied" errors
- Run the schema.sql again to ensure RLS policies are set
- Check that the user is authenticated

### OAuth not working
- Verify callback URLs match exactly
- Check that providers are enabled in Supabase

---

## 📈 Roadmap

- [ ] File attachments
- [ ] Due date reminders
- [ ] Email notifications
- [ ] Time tracking
- [ ] Sprint planning
- [ ] Mobile app (React Native)
- [ ] AI task suggestions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

---

## 💬 Support

- Open an issue for bugs
- Star ⭐ the repo if you find it useful!

---

Built with ❤️ using Next.js and Supabase
