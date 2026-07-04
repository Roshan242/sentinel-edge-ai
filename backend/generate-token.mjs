import { google } from "googleapis";
import open from "open";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI);
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  "https://mail.google.com/"
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("Opening browser...");
await open(authUrl);

http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost:3000");
      const code = url.searchParams.get("code");

      if (!code) {
        res.end("No code received.");
        return;
      }

      const { tokens } = await oauth2Client.getToken(code);

      console.log("\n==============================");
      console.log("REFRESH TOKEN:");
      console.log(tokens.refresh_token);
      console.log("==============================\n");

      res.end("Success! You can close this window.");
      process.exit(0);
    } catch (err) {
      console.error(err);
      res.end("Error.");
      process.exit(1);
    }
  })
  .listen(3000, () => {
    console.log("Waiting for Google callback...");
  });