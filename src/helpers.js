"use strict"

const path = require('path')
const plantumlEncoder = require('plantuml-encoder')

class Helpers {

  static getPageIdFromFilenameOrLink(filename) {
    var base = path.basename(filename)
    if (base.substr(-3) === '.md') {
      base = base.substr(0, base.length - 3)
    }
    return base.replace(/([^a-z0-9\-_~.]+)/gi, '')
  }

  static getPlantEncoded(code) {
    return `http://www.plantuml.com/plantuml/svg/${plantumlEncoder.encode(code)}`
  }
}

module.exports = Helpers
