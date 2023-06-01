const app = require("express")();
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const {
  Client,
  LocalAuth,
  Buttons,
  List,
  MessageMedia,
} = require("whatsapp-web.js");

app.get("/", (req, res) => {
  res.sendFile("./views/index.html", {
    root: __dirname,
  });
});
const port = process.env.PORT || 8000;
const server = require("http").createServer(app);
server.listen(port, () => {
  console.log("Server Berjalan pada Port : " + port);
});
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "client-one" }),

  puppeteer: {
    headless: true,
    devtools: false,
    // executablePath:
    //   "/nix/store/x205pbkd5xh5g4iv0g58xjla55has3cx-chromium-108.0.5359.94/bin/chromium-browser",
    args: [
      "--aggressive-tab-discard",
      "--disable-accelerated-2d-canvas",
      "--disable-application-cache",
      "--disable-cache",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-offline-load-stale-cache",
      "--disable-setuid-sandbox",
      "--disable-setuid-sandbox",
      "--disk-cache-size=0",
      "--ignore-certificate-errors",
      "--no-first-run",
      "--no-sandbox",
      "--no-zygote",
    ],
  },
});

client.on("qr", (qr) => {
  // Generate and scan this code with your phone
  console.log("client 1");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("client ready 1 ");
});
client.on("message", async (message) => {
  const chat = await message.getChat();
  console.log(message);
  if (
    message.hasMedia &&
    message.type === "image" &&
    message.body.startsWith(".s")
  ) {
    console.log("ok");
    const media = await message.downloadMedia();
    await chat.sendMessage(media, {
      stickerName: "isal",
      sendMediaAsSticker: true,
    });
  }
});

client.initialize();
