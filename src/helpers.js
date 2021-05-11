"use strict"

const path = require('path')
const plantumlEncoder = require('plantuml-encoder')

class Helpers {

  static getPageIdFromFilename(filename) {
    var base = path.basename(filename)
    if (base.substr(-3) === '.md') {
      base = base.substr(0, base.length - 3)
    }
    return base
  }

  static getPlantEncoded(code) {
    return `http://www.plantuml.com/plantuml/svg/${plantumlEncoder.encode(code)}`
  }
}

module.exports = Helpers
