# ChromaCraft // Client

The frontend application for ChromaCraft, a brutalist-inspired color palette system. 

## Tech Stack
- **Framework:** React 19, Vite, TypeScript
- **Routing:** React Router DOM
- **UI:** Lucide Icons, Brutalist CSS
- **Authentication:** Clerk (`@clerk/clerk-react`)
- **Color Math:** `chroma-js`

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root of the `client` directory:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   # Backend API URL (leave blank for local dev, set to your backend URL in production)
   VITE_API_URL=http://localhost:3000
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:5173`.

## Deployment
This frontend is optimized to be deployed as a static site on platforms like **Vercel**. Ensure you set the `VITE_API_URL` environment variable during deployment to connect to your backend API.
