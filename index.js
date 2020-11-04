const env =  require('./.env')
const Telegraf = require('telegraf')
const bot = new Telegraf(env.token)
const gifSearch = require('./giphy')
const chatBotDB = require('./database')
const Axios = require('axios')
const Fs = require('fs')
const Path = require('path')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const downloadImage = require('./downloadImage')    

let contagem = 0

const botoes = Extra.markup(Markup.inlineKeyboard([
    Markup.callbackButton('+1', 'add 1'),
    Markup.callbackButton('+10', 'add 10'),
    Markup.callbackButton('+100', 'add 100'),
    Markup.callbackButton('-1', 'sub 1'),
    Markup.callbackButton('-10', 'sub 10'),
    Markup.callbackButton('-100', 'sub 100'),
    Markup.callbackButton('🔃 Zerar', 'reset'),
    Markup.callbackButton('Resultado', 'result')
], { columns: 3 }))

bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date - start
    const dataEHora = new Date().toLocaleString()
    console.log(`${dataEHora} \n Tempo de resposta: ${ms}ms`)
})


bot.command('ajuda', ctx => ctx.reply('/ajuda: vou mostrar as opções'
  + '\n/ajuda2: para testar via hears'
  + '\n/op2: Opção genérica'
  + '\n/op3: Outra opção genérica qualquer'
  + '\n/op4: Outro exemplo'))
bot.hears('/ajuda2', ctx => ctx.reply('Eu também consigo capturar comandos'
  + ', mas utilize a /ajuda mesmo'))
bot.hears(/\/op(2|3)/i, ctx => ctx.reply('Resposta padrão para comandos genéricos'))
 
bot.command('op4', ctx => ctx.replyWithHTML('<b>Negrito</b> e <i>Itálico</i>'))
bot.on('contact', ctx => {
    const contact = ctx.message.contact
    ctx.reply(`Vou guardar o contato de ${contact.first_name} e telefone ${contact.phone_number}`)
})


//Extuda do comando /start
bot.start(async ctx => {
    const from = ctx.message.from
    const nome = from.first_name + " " + from.last_name
    await ctx.reply(`Seja bem vindo ${nome}`)
    await commands['help']('', ctx)
})

const tecladoAlimentos = Markup.keyboard([
    ['🐷 Porco', '🐮 Vaca', '🐑 Carneiro'],
    ['🐔 Galinha', '🐣 Ovo'],
    ['🐟 Peixe', '🐙 Frutos do mar'],
    ['🍄 Eu sou vegetariano']
  ]).resize().oneTime().extra()

bot.hears(['Coca', 'Pepsi'], async ctx => {
    console.log(ctx.match)
await ctx.reply(`Nossa! Eu também gosto de ${ctx.match}`)
await ctx.reply('Qual a sua carne predileta?', tecladoAlimentos)
 })
 bot.hears('🐮 Vaca', ctx => ctx.reply('A minha predileta também'))
 bot.hears('🍄 Eu sou vegetariano',
   ctx => ctx.reply('Parabéns, mas eu ainda gosto de carne!'))
 


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
    "bebida": async (text, ctx) => {
        await ctx.reply(`Seja bem vindo, ${ctx.message.from.first_name}!`)
        await ctx.reply(`Qual bebida você prefere?`,
            Markup.keyboard(['Coca', 'Pepsi']).resize().oneTime().extra())
    },
    'notFound': async (texto, ctx) => {
        const array = texto.split(' ')
        var found = false
        for(let i = 0; i < array.length; i++){
            if(chatBotDB[array[i].toLowerCase()] != undefined){
                found = true
                ctx.reply(chatBotDB[array[i]])
                break;
            } else if([...texto][0] == "!"){
                found = true
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
bot.on('text', async ctx => {
    await ctx.reply(`A contagem atual está em ${contagem}`, botoes)
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
    } else if(command[0] == "/"){
        return
    } else{
        commands['notFound'](message, ctx)
    }
})

//Evento de voz
bot.on('voice', ctx => {
    const voice = ctx.message.voice
    console.log(voice)
    ctx.reply(`Áudio recebido, ele possui ${voice.duration}`)
})

//Evento de foto
bot.on('photo', async ctx => {
    const photo = ctx.message.photo
    const caption = ctx.message.caption
    for ([i, ft] of photo.entries()) {
        await ctx.reply(`Foto ${i} tem resolução de ${ft.width}x${ft.height}`)
    } 
    ctx.reply(`Quantidade de arquivos gerados: ${photo.length}`)
    ctx.reply(`Legenda: ${caption != undefined ? caption : 'Sem legenda'}`)
    const id = photo[0].file_id
    const res = await Axios.get(`${env.apiUrl}/getFile?file_id=${id}`)
    const url = `${env.apiFileUrl}/${res.data.result.file_path}`
    const file_unique_id = res.data.result.file_unique_id
    await downloadImage(url, file_unique_id)
    //ctx.replyWithPhoto({url},{caption})
    const source = Path.resolve(__dirname, 'img', `${file_unique_id}.jpg`)
    console.log(source)
    await ctx.replyWithPhoto({source: Fs.createReadStream(source)},{caption})
})  

bot.start(async ctx => {
    const nome = ctx.update.message.from.first_name
    await ctx.reply(`Seja bem vindo, ${nome}!`)
    await ctx.reply(`A contagem atual está em ${contagem}`, botoes)
})
bot.action(/add (\d+)/, ctx => {
    contagem += parseInt(ctx.match[1])
    ctx.reply(`A contagem atual está em ${contagem}`, botoes)
})
bot.action(/sub (\d+)/, ctx => {
    console.log('Adição')
    console.log(ctx.match)
    contagem -= parseInt(ctx.match[1])
    ctx.reply(`A contagem atual está em ${contagem}`, botoes)
})
bot.action('reset', ctx => {
    contagem = 0
    ctx.reply(`A contagem atual está em ${contagem}`, botoes)
})
bot.action('result', ctx => {
   //pop-up
    ctx.answerCbQuery(`A contagem atual está em ${contagem}`)
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