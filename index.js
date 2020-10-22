const env =  require('./.env')
const Telegraf = require('telegraf')
const bot = new Telegraf(env.token)

bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date - start
    const dataEHora = new Date().toLocaleString()
    console.log(`${dataEHora} \n Tempo de resposta: ${ms}ms`)
})

//Extuda do comando /start
bot.start(async ctx => {
    const from = ctx.message.from
    if(from.username == 'kaue404'){
        await ctx.reply(`
        Olá ${from.first_name} ${from.last_name} (${from.username})\nNo que posso lhe ajudar?
    `)
    } else{
        await ctx.reply(`Não posso falar com estranhos 😅`)
    }
})


//Evento de Localização
bot.on('location', async ctx => {
    const location = ctx.message.location
    const lat = location.latitude
    const lon = location.longitude
    await ctx.replyWithLocation(lat, lon)
    await ctx.reply(`
    https://www.google.com/com/maps/@${lat},${lon},17z
    `)
    await ctx.reply(`
    Você está em: \nLatitude ${lat}, Longitude ${lon} 🧙‍♀️
    `)
})

//Evento do texto
bot.on('text', ctx => {
    ctx.reply('Alo Ha')
})

bot.launch()