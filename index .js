require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Handle video messages
bot.on("video", async (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.video.file_id;

    bot.sendMessage(chatId, "📤 Generating video link...");

    try {
        // Get direct Telegram file link
        const file = await bot.getFile(fileId);
        const filePath = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        // Streaming page link
        const streamUrl = `${process.env.RENDER_APP_URL}/video?url=${encodeURIComponent(filePath)}`;

        bot.sendMessage(chatId, `✅ Video Ready!\n🎥 **Watch Online**: ${streamUrl}\n📥 **Direct Download**: ${filePath}`);
    } catch (error) {
        console.error("Error generating link:", error);
        bot.sendMessage(chatId, "❌ Error getting video link.");
    }
});

// Webpage for video streaming
app.get("/video", (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send("Missing video URL");

    res.send(`
        <html>
        <head><title>Video Stream</title></head>
        <body>
            <video width="100%" controls>
                <source src="${videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <br>
            <a href="${videoUrl}" download>📥 Download Video</a>
        </body>
        </html>
    `);
});

// Start the Express server
app.listen(process.env.PORT || 10000, () => {
    console.log("🚀 Bot running on Render...");
});