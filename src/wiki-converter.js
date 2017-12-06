"use strict"

var Promise = require("bluebird")
  , fs = require('fs-extra')
  , path = require('path')
  , defaults = require('defaults')
  , GWCMarkdown = require('./markdown')
  , GWCHtmlWriter = require('./html-writer')
  , GWCPdfWriter = require('./pdf-writer')
  , GWCToc = require('./toc')
  , GWCFinder = require('./finder')
  , helpers = require('./helpers')
  , logger = require('./logger')

class WikiConverter {
  /**
   * GWC Constructor
   *
   * @param {string} wiki_path wiki path
   * @param {object} options options object
   * @constructor
   */
  constructor(wiki_path, options) {

    if (!wiki_path || fs.statSync(wiki_path).isDirectory() === false) {
      throw new TypeError('wiki_path is not a valid directory.')
    }

    this.wikiPath = wiki_path
    this.computePaths()
        .computeOptions(options)
        .computeCssFiles()
        .computeJsFiles()
        .checkTocLevel()
        .checkOutputFormat()
  }

  generate() {

    var self = this

    return new Promise(function(resolve, reject) {

      GWCFinder.searchMarkdownFiles(self.wikiPath).then(function (result) {
        this.mdFiles = result.files
        this.mdAliases = result.aliases

        this.markdownConverter = new GWCMarkdown(this.wikiPath, this.mdAliases)
        this.toc = new GWCToc(self)

        this.copyAssets()

        var promises = []

        if(this.getOption('format').indexOf('html') >= 0) {
          this.htmlWriter = new GWCHtmlWriter(this)
          promises.push(this.htmlWriter.write())
        }

        if(this.getOption('format').indexOf('pdf') >= 0) {
          this.pdfWriter = new GWCPdfWriter(this)
          promises.push(this.pdfWriter.write())
        }

        return Promise.all(promises).then(resolve).catch(reject)

      }.bind(this))
    }.bind(this))
  }

  /**
   * @private
   * @returns {wiki-converter}
   */
  computePages() {
    this.pages = []
    this.toc.getItems().forEach(item => {
      this.pages.push({
        title: item.title,
        file: this.mdAliases[item.pageId],
        html: this.markdownConverter.convertMarkdownFile(this.mdAliases[item.pageId])
      })
    }, this)
    return this
  }

  getPages() {
    if (!this.pages) {
      this.computePages()
    }
    return this.pages
  }

  getMarkdownConverter() {
    return this.markdownConverter
  }

  getMarkdownFiles() {
    return this.mdFiles
  }

  getToc() {
    return this.toc
  }

  /**
   * @private
   * @returns {wiki-converter}
   */
  computePaths() {
    this.assetsPath = path.resolve(path.join(__dirname, '..', 'assets'))
    this.cssPath = path.join(this.assetsPath, 'css')
    this.imagesPath = path.join(this.assetsPath, 'images')
    this.htmlPath = path.join(this.assetsPath, 'html')
    return this
  }

  /**
   * @private
   * @returns {wiki-converter}
   */
  computeCssFiles() {

    this.cssFiles = [
      path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css'),
      path.join(__dirname, '..', 'node_modules', 'highlight.js', 'styles', 'default.css'),
      path.join(__dirname, '..', 'node_modules', 'highlight.js', 'styles', this.options.highlightTheme + '.css'),
      path.join(this.cssPath, 'doc.css')
    ]

    this.options.userCssFile && this.cssFiles.push(path.resolve(this.options.userCssFile))
    return this
  }

  /**
   * @private
   * @returns {wiki-converter}
   */
  computeJsFiles() {

    this.jsFiles = [
      path.join(__dirname, '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js'),
      path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.min.js')
    ]

    this.options.userJsFile && this.jsFiles.push(path.resolve(this.options.userJsFile))
    return this
  }

  copyAssets() {
    if (!this.getOption('disableInlineAssets')) {
      return
    }
    var assetsFiles = this.getJsFiles().concat(this.getCssFiles())

    assetsFiles.forEach(function(file) {
      fs.copySync(file, path.join(this.getOption('output'), path.basename(file)))
    }, this)
  }

  computeOptions(options) {

    var def = {
      title : 'Documentation',
      logoImage: null,
      footer: null,
      pdfPageCount: null,
      format : 'html',
      filename : 'documentation',
      output : path.resolve('./'),
      tocFile : GWCFinder.searchForFile(['_Toc.html', '_Sidebar.html', '_Toc.md', '_Sidebar.md'], this.wikiPath),
      tocLevel : 3, // between 1 and 4
      highlightTheme : 'github',
      userCssFile : null
    }

    this.options = defaults(options, def)

    if (this.options.verbose) {
      logger.transports.console.level = 'debug'
    }

    logger.debug("gwc launched with options", this.options)

    return this
  }

  /**
   * Transform the format string into an array containing one to two elements
   *
   * @returns {string[]}
   */
  checkOutputFormat() {
    if (this.options.format === 'all') {
      return (this.options.format = ['html', 'pdf'])
    }
    this.options.format = [this.options.format]
    return this
  }

  checkTocLevel() {
    this.options.tocLevel = parseInt(this.options.tocLevel, 10)
    if (this.options.tocLevel < 1 || this.options.tocLevel > 4) {
      this.options.tocLevel = 3
    }
    return this
  }

  setOption(key, value) {
    this.options[key] = value
    return this
  }

  getOption(key) {
    return this.options[key]
  }

  getTocFile() {
    return this.getOption('tocFile')
  }

  addCssFile(file) {
    this.cssFiles.push(path.resolve(file))
    return this
  }

  getCssFiles() {
    return this.cssFiles
  }

  getJsFiles() {
    return this.jsFiles
  }
}

Object.defineProperty(WikiConverter, 'package', {
  value : require('../package')
})

module.exports = WikiConverter
