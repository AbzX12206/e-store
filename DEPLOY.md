# Deploy to GitHub Pages

## Automatic Deployment (GitHub Actions)

This project is configured to automatically deploy to GitHub Pages when you push to the `main` or `master` branch.

### Setup Instructions:

1. **Enable GitHub Pages in your repository:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**

2. **Push your code to GitHub:**
   ```bash
   git push origin main
   ```

3. **Wait for deployment:**
   - Go to **Actions** tab in your repository
   - Watch the workflow run
   - Once complete, your site will be live at:
     `https://<your-username>.github.io/e-store/`

## Manual Deployment (Alternative)

If you prefer to deploy manually:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

   This will:
   - Build the project
   - Deploy the `dist` folder to the `gh-pages` branch
   - Make your site available at `https://<your-username>.github.io/e-store/`

## Important Notes

- The site uses **HashRouter** (URLs will have `#/`) for GitHub Pages compatibility
- Base path is set to `/e-store/` in `vite.config.ts`
- If you rename your repository, update the `base` path in `vite.config.ts` to match
