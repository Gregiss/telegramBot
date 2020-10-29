const env =  require('./.env')
const Telegraf = require('telegraf')
const bot = new Telegraf(env.token)
const gifSearch = require('./giphy')
const chatBotDB = require('./database')

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
    const nome = from.first_name + " " + from.last_name
    await ctx.reply(`Seja bem vindo ${nome}`)
    await commands['help']('', ctx)
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

const commands = {
    'img': (texto, ctx) => {
        gifSearch(texto, ctx, ctx.message.from.id)
    },
    'help': async (texto, ctx) => {
        //Responde os comandos
        await ctx.reply(`
            Existe os comandos !help, !img 'Name'
        `)
        //Responde com uma imagem de Welcome
        await gifSearch('Welcome', ctx, ctx.message.from.id)
    },
    'notFound': async (texto, ctx) => {
        const array = texto.split(' ')
        var found = false
        for(let i = 0; i < array.length; i++){
            if(chatBotDB[array[i].toLowerCase()] != undefined){
                found = true
                ctx.reply(chatBotDB[array[i]])
                break;
            }
        }
        if(!found){
            await ctx.reply(`
                Desculpa não entendi 😭
            `)
        }
    }
}

//Evento do texto
bot.on('text', ctx => {
    const message = ctx.message.text
    const command = [...message]
    const auxMessage = message.split(" ")
    if(command[0] == '!'){
        const command = auxMessage[0].replace("!", "")
        if(commands[command] != undefined){
            const functionCommand = commands[command](auxMessage[1], ctx)
            typeof functionCommand == 'function' ? functionCommand() : ''
        } else{
            ctx.reply("Não encontrei esse comando! 😢")
        }
    } else{
        commands['notFound'](message, ctx)
    }
})

bot.on('contact', ctx => {
    const contact = ctx.message.contact
    ctx.reply(`Vou guardar o contato de ${contact.first_name} e telefone ${contact.phone_number}`)
})

//Evento de voz
bot.on('voice', ctx => {
    const voice = ctx.message.voice
    console.log(voice)
    ctx.reply(`Áudio recebido, ele possui ${voice.duration}`)
})

//Evento de foto
bot.on('photo', ctx => {
    const photo = ctx.message.photo
    console.log(photo)
    photo.forEach((ft, i) => {
        ctx.reply(`Foto ${i} tem resolução de ${ft.width}x${ft.height}`)
    })
})

//Evento de Figurinha (Sticker)
bot.on('sticker', ctx => {
    const figurinha = ctx.message.sticker
    ctx.reply(`Você enviou uma figurinha correspondente ${figurinha.emoji} do pacote ${figurinha.set_name}`)
})

//Evento de Gif animado
bot.on('animation', ctx => {
    const animation = ctx.message.animation
    console.log(animation)
    ctx.reply(`Esta animação dura ${animation.duration}s e o tamanho do arquivo é de ${animation.file_size} bytes`)
})

bot.launch()