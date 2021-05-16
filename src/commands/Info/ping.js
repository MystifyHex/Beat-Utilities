module.exports = {
    category: "Fun",
    slash: "both",
    description: 'A ping pong command',
    callback: ({ message }) => {
        if (message) {
            message.reply("pong")
            return
        }

        return 'pong'
    }
}