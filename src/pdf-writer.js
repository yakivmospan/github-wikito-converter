"use strict"

var wkhtmltopdf = require('wkhtmltopdf')
  , Promise = require("bluebird")
  , helpers = require('./helpers')
  , fs = require('fs-extra')
  , logger = require('./logger')
  , BaseWriter = require('./base-writer')

class PdfWriter extends BaseWriter {

  getExtension() {
    return 'pdf'
  }

  getPageBreaker(pageTitle, pageId) {
    return `<h1 id="${pageId}" style="page-break-before: always !important;">${pageTitle}</h1>`
  }

  write() {

    var html = this.buildHeader(),
        pages = this.converter.getPages(),
        filename = this.getFilename(),
        footer = this.converter.getOption('footer'),
        pdfPageCount = this.converter.getOption('pdfPageCount'),
        self = this

    logger.debug('Generating pdf: %d pages to generate', pages.length)

    pages.forEach(page => {
      var pageId = helpers.getPageIdFromFilenameOrLink(page.file)
      var pdfPage = this.getPageBreaker(page.title, pageId) + page.html
      html += pdfPage
    }, this)

    html += this.buildFooter()

    return new Promise(function (resolve, reject) {
      let options = {
        toc : false, outline: true,
        marginLeft: 10, marginRight: 10,
        footerLine: false, footerSpacing: 2.5,
        footerFontSize: 10, pageOffset: 0
      }

      if(footer){
        options.footerLeft = footer
      }

      if(pdfPageCount){
        options.footerRight = "[page]/[toPage]"
      }

      wkhtmltopdf(html, options)
        .on('end', function() {
          logger.info(self.getExtension() + ' file written: %s', filename)
          resolve(filename)
        })
        .on('error', reject)
        .pipe(fs.createWriteStream(filename))
    }.bind(this))
  }

  buildHeader() {

    var htmlHeader = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${this.converter.getOption('title')}</title>
    ${this.getCssTags()}
    <style>${this.getExtraCss()}</style>
    ${this.getJsTags()}
  </head>
  <body id="page-top" class="pdf-doc">

    <!-- Cover page -->

    ${this.getLogoImage()}

    <div class='covertitle'>
      <b>${this.converter.getOption('title')}</b>
    </div>

    <!-- Cover page -->
    <div class='nav-container'>
      <h1 class='toc'></h1>
    ${this.converter.getToc().getHtml()}
    </div>
`
    return htmlHeader
  }


  buildFooter() {
    var footer = `
  </body>
</html>`

    return footer
  }
  createImageLogoTag(path) {
        return `<img class="coverimg" src="${path}"/>`
  }
}

module.exports = PdfWriter
