"use strict"

var BaseWriter = require("./base-writer")
  , helpers = require('./helpers')
  , logger = require('./logger')

class HtmlWriter extends BaseWriter {

  getExtension() {
    return 'html'
  }

  write () {
    var html = this.buildHeader(),
        pages = this.converter.getPages()

    logger.debug('Generating html: %d pages to generate', pages.length)

    this.converter.getPages().forEach(page => {
      var pageId = helpers.getPageIdFromFilenameOrLink(page.file)
      html += `<p class="page" id="${pageId}"></p><h1>${page.title}</h1>\n` + page.html
    }, this)

    html += this.buildFooter()
    return super.write(this.getFilename(), html)
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
  <body id="page-top" class="html-doc">
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
          <a class="navbar-brand doc-title" href="#page-top">${this.converter.getOption('title')}</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
          <ul class="nav navbar-nav">
          ${this.getLogoImage()}
        </div><!--/.nav-collapse -->
      </div>
    </div>
    <div id="documentation-container" class="container">
      <div class="row">
        <div class="col-md-3">
          <div class="nav-container">
            <div class="nav-inner" id="scroll-spy">
              <span class="toc"></span>
              ${this.converter.getToc().getHtml()}
              ${this.getFooter()}
            </div>
          </div>
        </div>


        <div class="col-md-9">
`
    return htmlHeader
  }

  buildFooter() {
    var footer = `
        </div> <!-- /div.col-md-9 -->
      </div> <!-- /div.row -->
    </div> <!-- /div.container -->
  </body>
  <script>
    $('body').scrollspy({ target: '#scroll-spy', offset: 40 })
  </script>
</html>`
    return footer
  }

  createImageLogoTag(path) {
        return `
              </ul>
                <ul class="nav navbar-nav navbar-right gwc-navbar-right">
                <li><img class="logo-img" src="${path}"></li>
              </ul>`
  }

  getFooter() {
    let footerOption = this.converter.getOption('footer')
    return footerOption ? `<div class="footer">${footerOption}</div>` : ''
  }

}

module.exports = HtmlWriter
