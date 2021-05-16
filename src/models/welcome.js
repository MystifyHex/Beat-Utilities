const { Schema, model } = require("mongoose");

module.exports = model(
  "welcome-channels",
  new Schema({
    Guild: String,
    Channel: String,
  })
);
