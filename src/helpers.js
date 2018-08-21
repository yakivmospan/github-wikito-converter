"use strict"

const path = require('path')

class Helpers {

  static getPageIdFromFilenameOrLink(filename) {
    var base = path.basename(filename)
    if (base.substr(-3) === '.md') {
      base = base.substr(0, base.length - 3)
    }
    return base.replace(/([^a-z0-9\-_~.]+)/gi, '')
  }

}

module.exports = Helpers
