const Schema = require("../../models/welcome");
const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
  expectedArgs: "<channel tag>",
  requiredPermissions: ["ADMINISTRATOR"],
  /**
   * @param {Client} client
   * @param {Message} message
   * @param {String[]} args
   */
  callback: async ({ client, message, args }) => {
    const channel = message.mentions.channels.first();

    Schema.findOne({ Guild: message.guild.id }, async (err, data) => {
      if (data) {
        data.Channel = channel.id;
        data.save();
      } else {
        new Schema({
          Guild: message.guild.id,
          Channel: channel.id,
        }).save();
      }
      message.channel.send(`${channel} has been set to the welcome channel!`)
    });
  },
};
