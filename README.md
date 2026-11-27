# Genie Portal

The application source is separated into frontend and backend folders. The root
package manifest manages the shared Node.js dependencies and project commands.

## Project layout

- `frontend/` contains the React/Vite application, styles, HTML entry point, and
  public assets.
- `backend/` contains the Express API server and Gemini integrations.
- `.env` stays at the repository root for local server configuration.

## Run locally

From the repository root, install dependencies once:

```sh
npm install
```

Start the full app on port 5173:

```sh
npm run dev
```

The Express server serves both the API and the Vite frontend through the same
port. In VS Code, **Ctrl+Shift+B** runs the same command. Do not use Live Server
to start the app; it serves static files and cannot run the API.

## Build

Build the frontend into `frontend/dist`:

```sh
npm run build
```

Set `GEMINI_API_KEY` in the root `.env` file to enable AI-backed features. Do not
commit `.env`.
