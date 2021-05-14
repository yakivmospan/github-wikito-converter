"use strict"

var marked = require('marked')
  , highlight = require('highlight.js')
  , fs = require('fs')
  , path = require('path')
  , util = require('util')
  , datauri = require('datauri').sync
  , logger = require('./logger')
  , helpers = require('./helpers')


class Markdown {

  constructor(wikiPath, aliases, options) {
    this.wikiPath = wikiPath
    this.wikiFileAliases = aliases
    this.tocItems = []
    this.firstTocLiClassProcessed = false
    this.options = options || {}
    this.currentPageId = ''
    this.setupMainRenderer()
      .setupTocRenderer()
  }

  setupMainRenderer() {

    var self = this
    this.mainRenderer = new marked.Renderer()

    this.mainRenderer.code = function(code, lang) {
      if (lang && ['plantuml', 'puml'].includes(lang)) {
        return `<img alt="plantuml-diagram" src="${helpers.getPlantEncoded(code)}"/>`;
      }
      if (lang && highlight.getLanguage(lang)) {
        code = highlight.highlight(code, {language: lang, ignoreIllegals: true});
        return `<pre class="hljs">${code.value}</pre>`
      }
      if (!self.options.disableHighlightAuto) {
        code = highlight.highlightAuto(code);
        return `<pre class="hljs">${code.value}</pre>`
      }
      return `<pre class="hljs">${code}</pre>`
    }

    this.mainRenderer.heading = function(text, level, raw) {
      // links to heading inside of the page:
      //   if current page defined then prefix heading id with file page id
      // for example:
      //   My-Page#section-1 is id of heading "Section 1" inside of MyPage.md file
      //
      // know issues of [^\w]+ pattern:
      //   no unicode, this is not how GitHub does it
      let r = (self.currentPageId ? self.currentPageId + '#' : '') + raw.toLowerCase().replace(/[^\w]+/g, '-').replace(/[^\w]*$/g, '')
      return '<h'
        + level
        + (r ? ' id="' + r + '"' : '')
        + '>'
        + text
        + '</h'
        + level
        + '>\n'
    }

    this.mainRenderer.link = function(href, title, text) {
      if ((!href.match(/^https?:\/\//i) && !href.match(/^mailto:/i)) || self.isTocLink(href)) {
        href =
          !href.startsWith('#') ? // if href starts with # then it is a ref to section inside of current page
          '#' + href :
          (self.currentPageId ? '#' + self.currentPageId : '') + href
      }
      return `<a href="${href}">${text}</a>`
    }

    this.mainRenderer.image = function(href, title, text) {
      if (!href.match(/^https?:\/\//)) {
        href = path.resolve(self.wikiPath, href)
        return util.format('<img src="%s" />', datauri(href))
      } else {
        return util.format('<img src="%s" />', href)
      }
    }
    return this
  }

  setupTocRenderer() {

    var self = this
    this.tocRenderer = new marked.Renderer()

    this.tocRenderer.list = function(body, ordered) {
      var tag = ordered ? 'ol' : 'ul'
      return `<${tag} class="nav">${body}</${tag}>`
    }

    this.tocRenderer.listitem = function(text) {
      self.tocLiCounter += 1
      var regs = text.match(/^([^<]+)/)
      if (regs) {
        text = '<span>' + text.substr(0, regs[0].length) + '</span>' + text
          .substr(regs[0].length)
      }

      if (!self.firstTocLiClassProcessed && text.substr(0, 2) === '<a') {
        self.firstTocLiClassProcessed = true
        return `<li class="active">${text}</li>`
      }

      return `<li>${text}</li>`
    }

    this.tocRenderer.link = function(href, title, text) {
      let pageId = helpers.getPageIdFromFilename(href)
      if (self.wikiFileAliases[pageId]) {
        self.tocItems.push({
          title: text,
          link: href,
          pageId: pageId
        })
        href = `#${pageId}`
      }
      return `<a href="${href}">${text}</a>`
    }

    return this
  }

  convertTocMarkdownString(markdown) {
    return {
      tocHtml: marked(this.replaceGithubWikiLinks(markdown), {renderer: this.tocRenderer}),
      tocItems: this.tocItems
    }
  }

  convertMarkdownFile(markdown_file, pageId) {
    logger.info('page:', pageId)
    //
    this.currentPageId = pageId || ''
    let md = fs.readFileSync(markdown_file, {encoding: 'utf8'})
    return marked(md, {renderer: this.mainRenderer})
  }

  /**
   * @private
   * @returns {Boolean}
   */
  isTocLink(link) {
    for (let item of this.tocItems) {
      if (item.link == link) {
        return true
      }
    }
    return false
  }

  /**
   * @private
   * @returns {String}
   */
  replaceGithubWikiLinks(markdown) {
    // github supports [[...]] declaration of links. find all of them
    return markdown.replace(/\[\[([^\]]+)\]\]/g, function(allPattern, link) {

      // inside of brekets link can be added as:
      // - page name only [[Calls]], [[Call-Log]];
      // - link title only [[Call Log]];
      // - link title and page name [[Call Log|Call-Log]], [[Log|Call Log]].

      // search for link title
      let linkTitle = link.replace(/\|([^\|]+)/, "")

      // search for page name
      let pageName = link.replace(/([^\|]+)\|/, "")

      if(!linkTitle){
        linkTitle = link
      }

      if (!pageName){
        pageName = link
      }

      // make sure page name has correct format
      pageName = pageName.replace(/ /g, "-")

      // convert [[<link title> | <page name>]] to [<link title>](<page name>)
      link = `[${linkTitle}](${pageName})`
      return link
    })
  }
}


module.exports = Markdown
