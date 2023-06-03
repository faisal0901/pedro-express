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
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env["API_KEY"],
});

const generateText = async (prompt) => {
  try {
    const openai = new OpenAIApi(configuration);

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.9,
      max_tokens: 2048,
    });
    const text = response?.data?.choices?.[0]?.text ?? "tidak tahu";

    console.log(text);
    return text;
  } catch (error) {
    console.log(error.message);
    // tangani error dengan cara yang tepat
    return error.response.statusText;
  }
};
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
  function writeUsedToFile(data) {
    const jsonData = JSON.stringify(data);
    fs.writeFile("used.json", jsonData, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Data saved to file!");
      }
    });
  }
  let used = readUsedFromFile();
  function countUsedParticipant(participant) {
    // check if participant is already saved in used object
    if (!used.hasOwnProperty(participant)) {
      used[participant] = 1;
    } else {
      used[participant]++;
    }

    // write updated used object to file
    writeUsedToFile(used);
  }
  function readUsedFromFile() {
    try {
      const jsonData = fs.readFileSync("used.json", "utf-8");
      return JSON.parse(jsonData);
    } catch (err) {
      console.log(err);
      return {};
    }
  }
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
    countUsedParticipant(message.from);
  } else if (message.body.startsWith(".ai")) {
    const prompt = message.body.slice(4);
    const text = await generateText(prompt);
    await message.reply(text);
    countUsedParticipant(message.from);
  }
});

client.initialize();
