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

  getPageBreaker(pageId) {
    return `<p id="${pageId}" style="page-break-before: always !important; height: 1px; font-size:1px">&nbsp;</p>`
  }

  write() {

    var html = this.buildHeader(),
        pages = this.ld.getPages(),
        filename = this.getFilename(),
        self = this

    logger.debug('Generating pdf: %d pages to generate', pages.length)

    pages.forEach(page => {
      var pageId = helpers.getPageIdFromFilename(page.file)
      var pdfPage = this.getPageBreaker(pageId) + page.html
      html += pdfPage
    }, this)

    html += this.buildFooter()

    return new Promise(function (resolve, reject) {
      wkhtmltopdf(html, {toc : false, outline: true})
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
    <title>${this.ld.getOption('title')}</title>
    ${this.getCssTags()}
    <style>${this.getExtraCss()}</style>
    ${this.getJsTags()}
  </head>
  <body id="page-top" class="pdf-doc">
    <!-- Fixed navbar -->
    <div class="navbar navbar-default navbar-fixed-top">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand doc-title">${this.ld.getOption('title')}</a>
        </div>
      </div>
    </div>
    ${this.ld.getToc().getHtml()}
`
    return htmlHeader
  }


  buildFooter() {
    var footer = `
  </body>
</html>`

    return footer
  }
}

module.exports = PdfWriter
