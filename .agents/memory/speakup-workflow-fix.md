---
name: SpeakUp frontend workflow fix
description: The artifacts/speakup react-vite workflow has a persistent DIDNT_OPEN_A_PORT probe failure. Fix and prevention strategy.
---

## The Problem

The artifact-managed workflow `artifacts/speakup: web` (kind="web", react-vite) consistently fails with `DIDNT_OPEN_A_PORT` even though Vite starts correctly and serves 200 on the configured port. This happens with ANY port number (tried 23998, 5000, 8082). `restartWorkflow` and `restart_workflow` both fail. It appears to be a Replit river-service probe bug specific to this artifact registration (id="artifacts/speakup" — path-based instead of UUID).

**Why:** The Replit workflow port-probe mechanism does not detect the open port for this specific artifact. Root cause is unknown but likely a corrupt artifact registration (path-based id instead of UUID) combined with kind="web" probe behavior.

**How to apply:** Whenever the frontend needs to be started, use a separate console workflow with no `waitForPort`:

```javascript
await configureWorkflow({
    name: "SpeakUp",
    command: "PORT=8082 BASE_PATH=/ pnpm --filter @workspace/speakup run dev",
    outputType: "console",
    autoStart: true
    // NO waitForPort — this is the key
});
```

The proxy routes "/" to localPort=8082 (artifact.toml), so the app is accessible. The `artifacts/speakup: web` artifact workflow has PORT=8083 in [services.env] so it doesn't conflict with port 8082 on workspace restart.

Do NOT call `restart_workflow "artifacts/speakup: web"` — it will always fail and kill the running Vite process.
