// server.js
import express from "express";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import compression from "compression";
import dotenv from "dotenv"; // Import dotenv

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// eslint-disable-next-line no-undef
const PORT = process.env.VITE_PORT || 7054;

// Enable gzip compression for better performance
app.use(compression());

// Serve static files from the dist directory
app.use(express.static(resolve(__dirname, "dist")));

// For SPA: redirect all requests to index.html
app.get("*", (req, res) => {
  res.sendFile(resolve(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
