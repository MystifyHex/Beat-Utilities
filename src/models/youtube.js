const { Schema, model } = require("mongoose");

const youtubeSchema = new Schema({
  guildId: String,
  postedVideos: Array,
  channels: Object,
  channelId: String,
});

module.exports = model("Youtube", youtubeSchema);
