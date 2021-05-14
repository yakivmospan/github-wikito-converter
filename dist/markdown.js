"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var marked = require('marked'),
    highlight = require('highlight.js'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    datauri = require('datauri').sync,
    logger = require('./logger'),
    helpers = require('./helpers');

var Markdown = (function () {
  function Markdown(wikiPath, aliases, options) {
    _classCallCheck(this, Markdown);

    this.wikiPath = wikiPath;
    this.wikiFileAliases = aliases;
    this.tocItems = [];
    this.firstTocLiClassProcessed = false;
    this.options = options || {};
    this.currentPageId = '';
    this.setupMainRenderer().setupTocRenderer();
  }

  _createClass(Markdown, [{
    key: 'setupMainRenderer',
    value: function setupMainRenderer() {

      var self = this;
      this.mainRenderer = new marked.Renderer();

      this.mainRenderer.code = function (code, lang) {
        if (lang && ['plantuml', 'puml'].includes(lang)) {
          return '<img alt="plantuml-diagram" src="' + helpers.getPlantEncoded(code) + '"/>';
        }
        if (lang && highlight.getLanguage(lang)) {
          code = highlight.highlight(code, { language: lang, ignoreIllegals: true });
          return '<pre class="hljs">' + code.value + '</pre>';
        }
        if (!self.options.disableHighlightAuto) {
          code = highlight.highlightAuto(code);
          return '<pre class="hljs">' + code.value + '</pre>';
        }
        return '<pre class="hljs">' + code + '</pre>';
      };

      this.mainRenderer.heading = function (text, level, raw) {
        // links to heading inside of the page:
        //   if current page defined then prefix heading id with file page id
        // for example:
        //   My-Page#section-1 is id of heading "Section 1" inside of MyPage.md file
        //
        // know issues of [^\w]+ pattern:
        //   no unicode, this is not how GitHub does it
        var r = (self.currentPageId ? self.currentPageId + '#' : '') + raw.toLowerCase().replace(/[^\w]+/g, '-').replace(/[^\w]*$/g, '');
        return '<h' + level + (r ? ' id="' + r + '"' : '') + '>' + text + '</h' + level + '>\n';
      };

      this.mainRenderer.link = function (href, title, text) {
        if (!href.match(/^https?:\/\//i) && !href.match(/^mailto:/i) || self.isTocLink(href)) {
          href = !href.startsWith('#') ? // if href starts with # then it is a ref to section inside of current page
          '#' + href : (self.currentPageId ? '#' + self.currentPageId : '') + href;
        }
        return '<a href="' + href + '">' + text + '</a>';
      };

      this.mainRenderer.image = function (href, title, text) {
        if (!href.match(/^https?:\/\//)) {
          href = path.resolve(self.wikiPath, href);
          return util.format('<img src="%s" />', datauri(href));
        } else {
          return util.format('<img src="%s" />', href);
        }
      };
      return this;
    }
  }, {
    key: 'setupTocRenderer',
    value: function setupTocRenderer() {

      var self = this;
      this.tocRenderer = new marked.Renderer();

      this.tocRenderer.list = function (body, ordered) {
        var tag = ordered ? 'ol' : 'ul';
        return '<' + tag + ' class="nav">' + body + '</' + tag + '>';
      };

      this.tocRenderer.listitem = function (text) {
        self.tocLiCounter += 1;
        var regs = text.match(/^([^<]+)/);
        if (regs) {
          text = '<span>' + text.substr(0, regs[0].length) + '</span>' + text.substr(regs[0].length);
        }

        if (!self.firstTocLiClassProcessed && text.substr(0, 2) === '<a') {
          self.firstTocLiClassProcessed = true;
          return '<li class="active">' + text + '</li>';
        }

        return '<li>' + text + '</li>';
      };

      this.tocRenderer.link = function (href, title, text) {
        var pageId = helpers.getPageIdFromFilename(href);
        if (self.wikiFileAliases[pageId]) {
          self.tocItems.push({
            title: text,
            link: href,
            pageId: pageId
          });
          href = '#' + pageId;
        }
        return '<a href="' + href + '">' + text + '</a>';
      };

      return this;
    }
  }, {
    key: 'convertTocMarkdownString',
    value: function convertTocMarkdownString(markdown) {
      return {
        tocHtml: marked(this.replaceGithubWikiLinks(markdown), { renderer: this.tocRenderer }),
        tocItems: this.tocItems
      };
    }
  }, {
    key: 'convertMarkdownFile',
    value: function convertMarkdownFile(markdown_file, pageId) {
      logger.info('page:', pageId);
      //
      this.currentPageId = pageId || '';
      var md = fs.readFileSync(markdown_file, { encoding: 'utf8' });
      return marked(md, { renderer: this.mainRenderer });
    }

    /**
     * @private
     * @returns {Boolean}
     */
  }, {
    key: 'isTocLink',
    value: function isTocLink(link) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.tocItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          if (item.link == link) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return false;
    }

    /**
     * @private
     * @returns {String}
     */
  }, {
    key: 'replaceGithubWikiLinks',
    value: function replaceGithubWikiLinks(markdown) {
      // github supports [[...]] declaration of links. find all of them
      return markdown.replace(/\[\[([^\]]+)\]\]/g, function (allPattern, link) {

        // inside of brekets link can be added as:
        // - page name only [[Calls]], [[Call-Log]];
        // - link title only [[Call Log]];
        // - link title and page name [[Call Log|Call-Log]], [[Log|Call Log]].

        // search for link title
        var linkTitle = link.replace(/\|([^\|]+)/, "");

        // search for page name
        var pageName = link.replace(/([^\|]+)\|/, "");

        if (!linkTitle) {
          linkTitle = link;
        }

        if (!pageName) {
          pageName = link;
        }

        // make sure page name has correct format
        pageName = pageName.replace(/ /g, "-");

        // convert [[<link title> | <page name>]] to [<link title>](<page name>)
        link = '[' + linkTitle + '](' + pageName + ')';
        return link;
      });
    }
  }]);

  return Markdown;
})();

module.exports = Markdown;
//# sourceMappingURL=markdown.js.map