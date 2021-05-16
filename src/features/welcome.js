const Schema = require("../models/welcome");
const canvas = require("discord-canvas");
const { MessageAttachment } = require("discord.js");

module.exports = (client) => {
  client.on("guildMemberAdd", async (member) => {
    Schema.findOne({ Guild: member.guild.id }, async (e, data) => {
      if (!data) return;
      const user = member.user;
      const image = await new canvas.Welcome()
        .setUsername(user.username)
        .setDiscriminator(user.discriminator)
        .setMemberCount(member.guild.memberCount)
        .setGuildName(member.guild.name)
        .setAvatar(user.displayAvatarURL({ format: "png" }))
        .setColor("border", "#8015EA")
        .setColor("username-box", "#8015EA")
        .setColor("discriminator-box", "#8015EA")
        .setColor("message-box", "#8015EA")
        .setColor("title", "#8015EA")
        .setColor("avatar", "#8015EA")
        .setBackground(
          "https://raw.githubusercontent.com/AlexzanderFlores/Worn-Off-Keys-Discord-Js/master/74-Canvas-Welcome/background.png"
        )
        .toAttachment();

      const attachment = new MessageAttachment(image.toBuffer(), "welcome.png");

      const channel = client.channels.cache.get(data.Channel);
      channel.send(attachment);
    });
  });
};
