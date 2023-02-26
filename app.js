import { google } from "googleapis";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

// credentails for authenication to login
const client_Id = process.env.YOUR_CLIENT_ID;
const client_secret = process.env.YOUR_CLIENT_SECRET;
const refresh_token = process.env.YOUR_REFRESH_TOKEN;
const access_token = process.env.YOUR_ACCESS_TOKEN;

const outh2 = new OAuth2Client(client_Id, client_secret, "");
const credentials = {
  refresh_token: refresh_token,
  access_token: access_token,
};

outh2.credentials = credentials;
const oauth_client = outh2;

// pass the auth credentials
const gmail = google.gmail({
  version: "v1",
  auth: {
    oauth_client,
  },
});

// total number of message without duplicate
const listMessages = async () => {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "is: unread",
  });
  return res.data.messages || [];
};

// send message function
const sendMessages = async (to, subject, message) => {
  const raw = Buffer.from(
    `To: ${to}\r\n` +
      `Subject: ${subject}\r\n` +
      `Content-Type: texthtml; charset=utf-8\r\n` +
      `\r\n` +
      `${message}`
  ).toString("base64");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });
};

// automatic message send with automatic message
const sendAutomaticMessages = async () => {
  const messages = await listMessages();

  for (const message of messages) {
    const email = await gmail.users.messages.get({
      userId: "me",
      id: "message.id",
    });

    const from = email.data.payload.headers.find(
      (h) => h.name === "From"
    ).value;
    const subject = email.data.payload.headers.find(
      (h) => h.name === "Subject"
    ).value;

    const automaticResponse = `Hello,\n\n Thank you for your email. I'm currently out of office and won't be able to respond untit 2023/03/01.\n\nBest regards,\n Saikiran`;
    await sendMessages(from, `Re:${subject}`, automaticResponse);
  }
};

// send message at regular interval at 1.4 sec
setInterval(sendAutomaticMessages, 100000);
