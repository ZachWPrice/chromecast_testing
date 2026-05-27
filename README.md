# Cast Hello World MVP

This repo contains:

- `sender/`: Vite web app that starts a Cast session.
- `receiver/`: Custom Web Receiver page that displays `Hello World`.

## 1) Host the receiver over HTTPS

The receiver page must be publicly reachable over HTTPS.

Easy options:

- GitHub Pages
- Netlify
- Vercel

Deploy the contents of `receiver/` and copy the final URL, for example:

`https://your-domain-or-host/receiver/index.html`

## 2) Register your Custom Receiver App

In the Cast Developer Console:

1. Create a **Custom Receiver** application.
2. Set the receiver URL to your hosted `receiver/index.html`.
3. Save and copy the generated **App ID**.

## 3) Configure sender app ID

In `sender/`, create `.env.local`:

```bash
VITE_CAST_APP_ID=YOUR_CUSTOM_APP_ID
```

If this variable is missing, the app falls back to `CC1AD845` (default media receiver), which is useful only for smoke-testing Cast availability.

## 4) Run sender locally

```bash
cd sender
npm install
npm run dev
```

Open the printed local URL in Chrome.

## 5) Test casting

1. Ensure laptop/phone and Chromecast are on the same network.
2. Open sender page in Chrome.
3. Click the Cast button and choose your device.
4. The TV should launch your custom receiver and display `Hello World`.

## Notes

- Custom on-screen UI requires a **Custom Web Receiver** app.
- The receiver URL must stay HTTPS and publicly accessible.
- Cast app publication/allowlisting depends on your developer account state and test devices.
