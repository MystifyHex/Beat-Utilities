const Profile = require("../models/levels");
const random = require("random");

module.exports = (client) => {
  client.on("message", async (message) => {
    if (message.author.bot) return;
    Profile.findOne(
      {
        guild: message.guild.id,
        userId: message.author.id,
      },
      async (err, data) => {
        if (!data) {
          Profile.insertMany({
            guild: message.guild.id,
            userId: message.author.id,
            level: 0,
            xp: 0,
            last_message: 5000,
          });
        } else {
          try {
            if (Date.now() - data.last_message > 5000) {
              data.xp += random.int(15, 25);
              data.last_message = Date.now();
  
              const xpToNextLevel =
                5 * Math.pow(data.level, 2) + 50 * data.level + 100;
  
              if (data.xp >= xpToNextLevel) {
                data.level++;
                data.xp = data.xp - xpToNextLevel;
                message.channel.send(
                  `GG ${message.author}, you just advanced to level ${data.level}`
                );
              }
              await data.save();
            }
          } catch (err) {
            console.log(err)
          }
        }
      }
    );
  });
};
