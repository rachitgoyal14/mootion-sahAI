- The browser's Web Speech API is aborted, possibly due to missing permissions or a broken connection.

4. **Gemini voice‑to‑voice API not responding**
- After the user speaks and pauses, the AI does not respond.
- Likely because the Gemini API key is missing or misconfigured, or the endpoint is wrong.

## Suspected Root Causes

- **Media asset**: The asset might not have been generated correctly (e.g., the backend didn't create a media file for this Explain It task).
- **WebSocket URL**: The frontend hardcodes `mootion.app`; it should use the current host (`window.location.host`) or an environment variable.
- **Speech recognition**: Aborted because the WebSocket connection fails, which might be needed for streaming.
- **Gemini API**: The backend may not have `GEMINI_API_KEY` set, or the frontend might be using it directly with an invalid key.

## Action Items for the Agent

### 1. Fix the WebSocket URL
- Search for `wss://mootion.app` or `mootion.app` in the frontend code.
- Replace it with a dynamic URL based on `window.location.host` (or `VITE_WS_URL` env var).
- Ensure the WebSocket path is correct (e.g., `/live`).

### 2. Investigate the media asset 404
- Check if the asset ID exists in the database (via backend logs).
- Verify that the asset is generated when an Explain It task is created.
- If not, ensure the backend creates the media asset with the correct ID.

### 3. Check Gemini API configuration
- Look for `GEMINI_API_KEY` in environment variables (frontend or backend).
- If the frontend uses it, make sure it's set in `frontend/.env` and rebuilt.
- If the backend uses it, ensure `GEMINI_API_KEY` is in `backend/.env` and the backend is restarted.

### 4. Fix speech recognition abort
- Ensure the browser has microphone permissions.
- If the WebSocket connection fails, the speech recognition might be aborted. Fix WebSocket first.

### 5. Test the full Explain It flow
- After fixes, create a new Explain It assignment and test voice interaction.
- Check if the AI responds after a pause.

## Files to Check

- Frontend:
- `src/pages/StudentTaskActivityPage.tsx` – contains WebSocket and speech logic.
- `src/components/LiveVoiceActivity.tsx` – if separate.
- `src/lib/api.ts` – API calls for media assets.
- `.env` – environment variables (VITE_GEMINI_API_KEY, VITE_WS_URL).
- Backend:
- `app/api/media.py` – media asset endpoint.
- `app/core/config.py` – Gemini API key loading.
- `app/services/media_service.py` – asset resolution.

## Expected Outcome

After fixes:
- The media asset loads (200 OK).
- WebSocket connects successfully.
- Speech recognition works without abortion.
- Gemini responds after a pause in voice input.

---

**Agent**: Provide a summary of changes made and any remaining issues.

