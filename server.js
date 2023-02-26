import { google } from "googleapis";
import dotenv from "dotenv";
const { OAuth2 } = google.auth;

dotenv.config();

const client_Id = process.env.YOUR_CLIENT_ID;
const client_secret = process.env.YOUR_CLIENT_SECRET;
const refresh_token = process.env.YOUR_REFRESH_TOKEN;
const access_token = process.env.YOUR_ACCESS_TOKEN;

const CLIENT_ID = client_Id;
const CLIENT_SECRET = client_secret;
const REDIRECT_URI = "";

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

oauth2Client.setCredentials({
  refresh_token: refresh_token,
  access_token: access_token,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

gmail.users.messages.list({ userId: "me", q: "is:unread" }, (err, res) => {
  if (err) return console.log(`The API returned an error: ${err}`);

  const messages = res.data.messages;

  if (messages.length) {
    messages.forEach((message) => {
      gmail.users.messages.get({ userId: "me", id: message.id }, (err, res) => {
        if (err) return console.log(`The API returned an error: ${err}`);

        const headers = res.data.payload.headers;
        const from = headers.find((header) => header.name === "From").value;
        const subject = headers.find(
          (header) => header.name === "Subject"
        ).value;

        console.log(`From: ${from}`);
        console.log(`Subject: ${subject}`);

        // Send automated response
        const messageBody = `Hello,\n\n Thank you for your email. I'm currently out of office and won't be able to respond untit 2023/03/01.\n\nBest regards,\n Saikiran`;

        const message = {
          to: from,
          subject: "Automated Out of Office Response",
          text: messageBody,
        };

        const encodedMessage = Buffer.from(JSON.stringify(message)).toString(
          "base64"
        );
        const formattedMessage = gmail.users.messages.send({
          userId: "me",
          requestBody: {
            raw: encodedMessage,
          },
        });

        console.log(`Response sent to ${from}.`);
      });
    });
  } else {
    console.log("No unread messages found.");
  }
});
