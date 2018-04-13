const Discord = require('discord.js')
const colors = require('colors')
const fs = require('fs')
const Logger = require('./util/logger')
const { CrashCollector } = require('./util/crashCollector')
const { Settings } = require('./core/settings')


// Creating discord client instance
var client = new Discord.Client()

function reloadConfig() {
    if (fs.existsSync('config.json')) {
        var config = require('../config.json')
        Logger.info('Config reloaded')
        return true
    }
    return false
}

// Load or generate config
if (fs.existsSync('config.json')) {
    var config = require('../config.json')
    Logger.info('Config loaded')
}
else {
    var def_conf = {
        token: "",
        prefix: ".",
        files: ["mp3", "mp4", "wav", "ogg"],
        fileloc: "./sounds",
        owner: "",
        writestats: true,
        gamerota: ["zekro.de"]
    }
    fs.writeFileSync('config.json', JSON.stringify(def_conf, 0, 2))
    Logger.error('Config file created. Please enter your information into this file and restart the bot after.')
    process.exit()
}

var settings = new Settings()

// Exporting client and config for other modules
module.exports = {
    client,
    config,
    reloadConfig,
    settings
}

// Registering events
require('./core/readyEvent')
require('./core/messageEvent')
require('./core/reactionEvent')
require('./core/voiceEvent')
require('./util/gameRotator')


Logger.debug('Debug mode enabled')

// Logging into this shit
client.login(config.token)
    .catch(err => Logger.error('Failed logging in:\n' + err))


// EXIT HANDLER
function exitHandler(exit, err) {
    Logger.debug('Shutting down...')

    const { soundStats } = require('./core/player')
    settings.save()

    if (config.writestats)
        fs.writeFileSync('SOUNDSTATS.json', JSON.stringify(soundStats, 0, 2))

    if (exit)
        process.exit()
}

new CrashCollector('./crash_logs')

process.on('exit', exitHandler)
process.on('SIGINT', exitHandler.bind(null, true))