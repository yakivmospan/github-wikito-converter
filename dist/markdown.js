"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var marked = require('marked'),
    highlight = require('highlight.js'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    datauri = require('datauri').sync,
    helpers = require('./helpers');

var Markdown = (function () {
  function Markdown(wikiPath) {
    _classCallCheck(this, Markdown);

    this.wikiPath = wikiPath;
    this.tocLinks = [];
    this.firstTocLiClassProcessed = false;
    this.setupMainRenderer().setupTocRenderer();
  }

  _createClass(Markdown, [{
    key: 'setupMainRenderer',
    value: function setupMainRenderer() {

      var self = this;
      this.mainRenderer = new marked.Renderer();

      this.mainRenderer.code = function (code, lang) {
        code = lang === undefined ? highlight.highlightAuto(code) : highlight.highlight(lang, code);
        return '<pre class="hljs">' + code.value + '</pre>';
      };

      this.mainRenderer.link = function (href, title, text) {
        if (!href.match(/^https?:\/\//)) {
          href = '#' + helpers.getPageIdFromFilename(href);
        } else if (self.tocLinks && self.tocLinks.indexOf(href) != -1) {
          var hrefSplits = href.split(new RegExp('[\\|/]'));
          if (hrefSplits.length > 0) {
            href = '#' + helpers.getPageIdFromFilename(hrefSplits[hrefSplits.length - 1]);
          }
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
        return '<' + tag + ' class="nav gwc-nav">' + body + '</' + tag + '>';
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
        self.tocLinks.push(href);
        href = helpers.getPageIdFromFilename(href);
        return '<a href="#' + href + '">' + text + '</a>';
      };

      return this;
    }
  }, {
    key: 'convertTocMarkdownString',
    value: function convertTocMarkdownString(markdown) {
      return this.convertMarkdownString(markdown, this.tocRenderer);
    }
  }, {
    key: 'convertMarkdownString',
    value: function convertMarkdownString(markdown, renderer) {
      renderer = renderer || this.mainRenderer;
      return marked(markdown, { renderer: renderer });
    }
  }, {
    key: 'convertMarkdownFile',
    value: function convertMarkdownFile(markdown_file) {
      return this.convertMarkdownString(fs.readFileSync(markdown_file, { encoding: 'utf8' }));
    }
  }]);

  return Markdown;
})();

module.exports = Markdown;
//# sourceMappingURL=markdown.js.map