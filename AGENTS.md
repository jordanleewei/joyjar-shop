<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# JoyJar Vercel Configuration & Instructions

## Setting up Environment Variables on Vercel

If you ever need to update or add API keys (like HitPay, Database credentials, etc.) to the Vercel project, the fastest way to do this from the terminal is by using the Vercel CLI.

### 1. Ensure you are linked to the Vercel Project
Run the following command to link your local workspace to Vercel:
```bash
npx vercel link
```

### 2. View existing Environment Variables
To see what variables are already configured across your environments:
```bash
npx vercel env ls
```

### 3. Add a new Environment Variable
You can add environment variables via the CLI. It will prompt you for the value and which environments (Production, Preview, Development) you want to apply it to:
```bash
npx vercel env add HITPAY_API_KEY
```

To add it non-interactively (useful for scripts):
```bash
npx vercel env add HITPAY_API_KEY production --value your_api_key_here --yes
```

### 4. Pull Environment Variables Locally
If you want to pull the latest variables from Vercel into your local `.env.local` file for local development:
```bash
npx vercel env pull
```

## Pushing Code to GitHub

Whenever you complete a feature or make changes that you want to back up or deploy, you should push your code to the remote repository. Vercel automatically deploys any code pushed to the `main` branch.

Run the following commands in sequence to stage, commit, and push your changes:

```bash
# 1. Stage all changes
git add .

# 2. Commit the changes with a descriptive message
git commit -m "feat: your descriptive commit message here"

# 3. Push to the remote repository
git push
```
