"use strict"

var path = require('path')
  , fs = require('fs-extra')
  , util = require('util')
  , marked = require('marked')

class Toc {

  /**
   *
   * @param {GWC} gwc
   */
  constructor(ld) {
    this.ld = ld
    this.computeTocParts()
  }

  getMarkdown() {
    return this.tocMd
  }

  getHtml() {
    return this.tocHtml
  }

  getLinks() {
    return this.tocLinks
  }


  /**
   * @private
   */
  computeTocParts() {
    this.tocMd = this.getTocFileContents()
    this.tocHtml = this.ld.getMarkdownConverter().convertTocMarkdownString(this.tocMd)
    this.tocLinks = this.extractLinks()
  }

  /**
   * @private
   * @returns {String}
   */
  getTocFileContents() {
    var tocFile = this.ld.getTocFile()
    if (tocFile) {
      return fs.readFileSync(tocFile, {encoding: 'utf8'})
    }
    // if no toc file, generate contents from files
    return this.genTocFileContents()
  }

  /**
   * @private
   * @returns {string}
   */
  genTocFileContents() {
    return Object.keys(this.ld.getMarkdownFiles()).map(filename => {
      var basename = path.basename(filename)
      return util.format('- [%s](%s)', basename, basename)
    }).join('\n')
  }

  /**
   * @private
   * @returns {Array}
   */
  extractLinks() {
    var html = marked.parser(marked.lexer(this.tocMd))
    var links = []

    html.replace(/<a href="([^"]+)"/g, function(all_pattern, link) {
      if (link.substr(link.length - 3) === '.md') {
        link = link.substr(0, link.length - 3)
      }
      links.push(link)
    })
    return links
  }

}

module.exports = Toc
