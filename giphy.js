const gifSearch = require('gifs-search');
gifSearch.apiKey("91zTOLnMK6Wa0FSaZzHY0oJEefLljD9Q")

const axios = require('axios')

module.exports = (texto, bot, id) => {
    const url = "https://api.giphy.com/v1/gifs/search?q=" + texto + "&api_key=91zTOLnMK6Wa0FSaZzHY0oJEefLljD9Q"
    var config = { proxy: { host: '10.1.21.254', port: '3128' } }

    axios.get(url, config)
    .then(result => {
        const random = Math.floor(Math.random() * result.data.data.length);
        const gif = result.data.data[random].images.original.url
        bot.replyWithPhoto(gif)
    })
    .catch(error => {console.log(error)})
}