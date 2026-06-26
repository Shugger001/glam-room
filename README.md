This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server (**macOS**: this **auto-opens your default browser** when the app is ready):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

1. In a **normal terminal** (outside any sandbox), from the project folder:

   ```bash
   cd "/Users/shugger_dadie/Kabuki The MakeUp Girl"
   npm run dev
   ```

2. Wait until you see **✓ Ready** (or your browser opens). The app is at **http://127.0.0.1:3100**.

3. Open that URL in **Chrome or Safari** (recommended). Try **`http://127.0.0.1:3100`** if `localhost` misbehaves.

### Can’t find the “Local:” URL?

Run `npm run dev` — a **boxed message** at the top prints the link: **`http://127.0.0.1:3100`**.

After the server is **Ready**, on macOS you can also run **`npm run open:dev`** (opens that URL in your default browser).

To see which ports Node is listening on:

```bash
lsof -nP -iTCP -sTCP:LISTEN | grep node
```

### `ERR_CONNECTION_REFUSED`

- The dev server is **not running** on that port yet, or you’re on the **wrong port** (this app uses **3100**, not 3000).
- **Cursor’s embedded / Simple Browser** sometimes cannot reach your Mac’s `localhost`. Use a **system browser** with the URL from step 2.
- Quick check in terminal: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3100/` — you want **200** while `npm run dev` is running.

If **3100** is in use, run `npm run dev -- --port 9781` and add `.env.development.local` with `NEXT_PUBLIC_APP_URL=http://localhost:9781`.

You can start editing the marketing home in `src/app/(marketing)/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) with Playfair Display and Inter.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
