// ==============================================================================
// FILE: src/config/loadEnv.js
// Centralized Environment Loader for Development & Production
// ==============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

let isLoaded = false;

export const loadEnvironment = () => {
  if (isLoaded) return process.env.NODE_ENV || "development";

  // 1. Determine environment mode:
  // CLI arguments take top precedence (--production / --prod / --development / --dev / --mode=X / --env=X)
  let mode = process.env.NODE_ENV?.trim();

  const argMode = process.argv.find(
    (arg) => arg.startsWith("--mode=") || arg.startsWith("--env=")
  );
  if (argMode) {
    mode = argMode.split("=")[1]?.trim();
  } else if (
    process.argv.includes("--production") ||
    process.argv.includes("--prod")
  ) {
    mode = "production";
  } else if (
    process.argv.includes("--development") ||
    process.argv.includes("--dev")
  ) {
    mode = "development";
  } else if (!mode) {
    // Cloud hosting auto-detection (Render, Vercel, Railway, AWS, Heroku)
    if (process.env.RENDER === "true" || process.env.VERCEL) {
      mode = "production";
    } else {
      mode = "development";
    }
  }

  process.env.NODE_ENV = mode;

  // 2. Resolve server root directory reliably (handles running from repo root or server/)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const serverDir = path.resolve(__dirname, "../../");

  // 3. File loading priority order (same as Vite / Next.js):
  //    1. .env.{mode}.local
  //    2. .env.{mode}          (e.g., .env.development or .env.production)
  //    3. .env.local
  //    4. .env                (base fallback)
  const envCandidates = [
    `.env.${mode}.local`,
    `.env.${mode}`,
    `.env.local`,
    `.env`,
  ];

  const loadedFiles = [];

  for (const file of envCandidates) {
    const fullPath = path.join(serverDir, file);
    if (fs.existsSync(fullPath)) {
      dotenv.config({ path: fullPath });
      loadedFiles.push(file);
    }
  }

  // 4. Fallback check for current working directory if different
  if (loadedFiles.length === 0 && process.cwd() !== serverDir) {
    for (const file of envCandidates) {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        dotenv.config({ path: fullPath });
        loadedFiles.push(file);
      }
    }
  }

  const loadedStr =
    loadedFiles.length > 0 ? loadedFiles.join(", ") : "system environment only";
  console.log(
    `🌱 [SERVER ENV] Active Mode: [${mode.toUpperCase()}] | Loaded: ${loadedStr}`
  );

  isLoaded = true;
  return mode;
};

// Auto-run on initial module import
loadEnvironment();

export default loadEnvironment;
