module.exports = (client) => {
  client.on("guildMemberAdd", async (member) => {
    const ran = random(6).toLowerCase();
    const channel = await member.createDM();
    await captcha(member, ran, channel, true);
  });

  async function captcha(member, ran, channel, isFirst) {
    const { CaptchaGenerator } = require("captcha-canvas");
    const captcha = new CaptchaGenerator()
      .setDimension(150, 450)
      .setCaptcha({ text: ran, size: 60, color: "deeppink" })
      .setDecoy({ opacity: 0.5 })
      .setTrace({ color: "deeppink" });
    const buffer = captcha.generateSync();
    if (isFirst == true) {
      channel.send(new Discord.MessageAttachment(buffer, "Captcha.png"));
    } else if (isFirst == false) {
      channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("Try again")
          .setDescription("Please try again, you typed the wrong captcha!")
      );
      channel.send(new Discord.MessageAttachment(buffer, "Captcha.png"));
    }
    await seperate(ran, channel, member);
  }

  async function seperate(ran, channel, member) {
    const collect = await channel.awaitMessages(
      (r) => r.author.id == member.id,
      { max: 1 }
    );
    if (collect.first().content.toLowerCase() === ran) {
      member.roles.add("807416755521585163");
      channel.send(
        new Discord.MessageEmbed()
          .setColor("Blue")
          .setTitle("Verified")
          .setDescription("You have successfully been verified!")
      );
    } else {
      await captcha(member, ran, channel, false);
    }
  }

  function random(len) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < len; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
};
