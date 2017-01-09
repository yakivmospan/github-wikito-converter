'use strict'

var winston = require('winston')

// Configure CLI on an instance of winston.Logger
var logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({ level: 'warn' })
  ]
})

logger.cli()

module.exports = logger
