# VoiceGuard Crowdsource Recorder

A lightweight browser app for collecting real-voice recordings and submitting them to:

`POST http://45.55.247.199/api/crowdsource/submit`

## What It Sends

The app now sends a single multipart field only:

- `file`: audio file (`.wav`)

The browser records PCM audio, encodes it to WAV in-app, and uploads it directly. No proxy metadata or server-side conversion is used.

## API Response Expected

The app expects a JSON response shaped like:

- `status`: `"ok"`
- `filename`
- `features_extracted` (expected: `1092`)
- `total_rows_in_csv`
- `csv_path`

## Local Run

1. Install dependencies:
   - `npm install`
2. Start app:
   - `npm run start`
3. Open:
   - `http://localhost:3000`

## Notes

- The app now exports WAV in the browser before upload so the payload matches APIs that require WAV or MP3.
- I did not add a backend conversion service; the recording is converted client-side only.
