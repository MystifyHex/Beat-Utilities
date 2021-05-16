const Parser = require("rss-parser");
const parser = new Parser();
const dayjs = require("dayjs");
const youtube = require("../../models/youtube");

module.exports = {
  category: "Fun",
  requiredPermissions: ["ADMINISTRATOR"],
  callback: async ({ client, message, args }) => {
    switch (args[0]) {
      case "add":
        if (!args[1] || !args[2])
          return message.channel.send(
            "Incorrect usage! | `youtube <discord channel> <youtube channel id>`"
          );

        const channel = message.mentions.channels.first();
        if (!channel)
          return message.channel.send("You must **mention** a channel!");

        parser
          .parseURL(
            `https://www.youtube.com/feeds/videos.xml?channel_id=${args[2]}`
          )
          .then(async (ytData) => {
            const data = await youtube.findOne({
              guildId: message.guild.id,
            });
            if (!data) {
              const newData = new youtube({
                guildId: message.guild.id,
                postedVideos: [],
                channels: { [args[2]]: [channel.id] },
                channelId: channel.id,
              });
              await newData.save();
            } else {
              if (Object.keys(data.channels).includes(args[2]))
                return message.channel.send("Channel is already subscribed!");
              data.channels[args[2]]
                ? data.channels[args[2]].push(channel.id)
                : (data.channels[args[2]] = [channel.id]);
              data.markModified("channels");
              await data.save();
            }

            setTimeout(() => {
              parser
                .parseURL(
                  `https://www.youtube.com/feeds/videos.xml?channel_id=${args[2]}`
                )
                .then(async (ytData) => {
                  const data = await youtube.findOne({
                    guildId: message.guild.id,
                  });
                  if (data.postedVideos.includes(ytData.items[0].id)) return;

                  const ytTime = dayjs(ytData.items[0].isoDate);
                  const currTime = dayjs();
                  if (currTime.diff(ytTime, "days") > 1) return;

                  const channel = message.guild.channels.cache.get(
                    data.channelId
                  );
                  channel.send(
                    `Hey everyone, ${ytData.title} just posted a new video, go check it out! ${ytData.items[0].link}`
                  );

                  data.postedVideos.push(ytData.items[0].id);
                  data.markModified("postedVideos");
                  await data.save();
                })
                .catch((error) => {
                  console.log(`Error auto-posting youtube video: ${error}`);
                });
            }, 5000);

            return message.channel.send(
              `Successfully subscribed channel \`${args[2]}\` to ${args[1]}!`
            );
          })
          .catch((err) => {
            console.log(
              `Youtube command error (if it says 404 you can ignore it): ${err}`
            );
            return message.channel.send("Channel not found!");
          });
        break;

      case "remove":
        if (!args[1])
          return message.channel.send(
            "Incorrect usage! | `youtube remove <channel id>`"
          );
        const data1 = await youtube.findOne({
          guildId: message.guild.id,
        });
        if (!data1 || !data1.channels[args[1]]) {
          return message.channel.send("You aren't subscribed to that channel!");
        } else {
          delete data1.channels[args[1]];
          data1.markModified("channels");
          await data1.save();
          return message.channel.send("Successfully unsubscribed");
        }

      default:
        return message.channel.send(
          "Invalid subcommand! Valid ones are `add` or `remove`"
        );
    }
  },
};
