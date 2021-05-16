require("dotenv").config();
const Discord = require("discord.js");
const OrangedAPI = require("oranged-api");
const Parser = require("rss-parser");
const parser = new Parser();
const cron = require("node-cron");
const dayjs = require("dayjs");
const client = new Discord.Client();

const youtube = require("./src/models/youtube");

client.on("ready", async () => {
  console.log("Beat Utilities is online!");
  console.log(`Running in ${client.guilds.cache.size} servers!`);
  new OrangedAPI(client, {
    commandsDir: "src/commands",
    featureDir: "src/features",
    showWarns: false,
  })
    .setMongoPath(process.env.MONGO_URL)
    .setCategorySettings([
      {
        name: "Fun",
        emoji: "🎮",
      },
    ]);

  const youtubeData = await youtube.find();
  youtubeData.forEach((mongooseData) => {
    const guild = client.guilds.cache.get(mongooseData.guildId);
    setTimeout(() => {
      Object.entries(mongooseData.channels).forEach(async (element) => {
        parser
          .parseURL(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${element[0]}`
          )
          .then(async (ytData) => {
            if (!ytData.items[0]) return;
            const data = await youtube.findOne({
              guildId: guild.id,
            });
            if (data.postedVideos.includes(ytData.items[0].id)) return;

            const ytTime = dayjs(ytData.items[0].isoDate);
            const currTime = dayjs();
            if (currTime.diff(ytTime, "days") > 1) return;

            element[1].forEach((channelId) => {
              const channel = guild.channels.cache.get(channelId);
              channel.send(
                `Hey @everyone, ${ytData.title} just posted a new video, go check it out! ${ytData.items[0].link}`
              );
            });

            data.postedVideos.push(ytData.items[0].id);
            data.markModified("postedVideos");
            await data.save();
          })
          .catch((error) => {
            console.log(`Error auto-posting youtube video: ${error}`);
          });
      });
    }, 5000);
  });
});

client.login(process.env.TOKEN);
