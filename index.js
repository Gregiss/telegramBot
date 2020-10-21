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
    await ctx.reply(`
        Olá ${from.first_name} ${from.last_name} (${from.username})\nNo que posso lhe ajudar?
    `)
})

//Evento do texto
bot.on('text', ctx => {
    ctx.reply('Alo Ha')
})

bot.launch()