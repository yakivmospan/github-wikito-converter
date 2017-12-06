"use strict"

var fs = require('fs-extra')
  , path = require('path')
  , util = require('util')
  , logger = require('./logger')
  , Promise = require("bluebird")
  , datauri = require('datauri').sync

class BaseWriter {

  /**
   *
   * @param {GWC} GWC instance
   */
  constructor(converter) {
    this.converter = converter
  }

  write(filename, html) {
    var self = this
    return new Promise(function(resolve, reject) {
      fs.writeFile(filename, html, function(err) {
        if (err) {
          return reject(err)
        }
        logger.info(self.getExtension() + ' file written: %s', filename)
        resolve(filename)
      })
    })
  }

  getExtension() {
    throw new Error('You must define an getExtension() in your writer')
  }

  getFilename() {
    return path.join(this.converter.getOption('output'), this.converter.getOption('filename') + '.' + this.getExtension())
  }

  getCssTags() {
    return this.getAssetsTags(this.converter.getCssFiles(), 'css').join('\n')
  }

  getJsTags() {
    return this.getAssetsTags(this.converter.getJsFiles(), 'js').join('\n')
  }

  getExtraCss() {
    var tocLevel = this.converter.getOption('tocLevel'),
      tocLevelBaseCss = '> .nav > li '
    return '.nav > li ' + tocLevelBaseCss.repeat(tocLevel) + '{display: none;}'
  }

  getAssetsTags(files, type) {
    return files.map(function(file) {
      return this.getAssetSingleTag(file, type)
    }, this)
  }

  getAssetSingleTag(file, type) {
    var tplIn, tplOut

    if (type === 'js') {
      tplIn = '<script>%s</script>'
      tplOut = '<script src="%s" type="javascript"></script>'
    } else {
      tplIn = '<style>%s</style>'
      tplOut = '<link href="%s" rel="stylesheet" />'
    }

    return this.converter.getOption('disableInlineAssets') ?
      util.format(tplOut, path.basename(file)):
      util.format(tplIn, fs.readFileSync(file, {encoding : 'utf8'}))
  }

  createImageLogoTag(path) {
    throw new Error('You must define an createImageLogoTag(path) in your writer')
  }

  getLogoImage(){
    let logoPath = this.getLogoImgPath();
    return logoPath ? this.createImageLogoTag(logoPath) : ''
  }

  getLogoImgPath() {
    let logoOption = this.converter.getOption('logoImage')
    return logoOption ? datauri(path.resolve(logoOption)) : logoOption
  }

}

module.exports = BaseWriter
