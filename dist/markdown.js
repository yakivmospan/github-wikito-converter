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
    this.tocItems = [];
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
        if (!href.match(/^https?:\/\//) || self.isTocLink(href)) {
          href = '#' + helpers.getPageIdFromFilenameOrLink(href);
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
        self.tocItems.push({
          title: text,
          link: href
        });
        href = helpers.getPageIdFromFilenameOrLink(href);
        return '<a href="#' + href + '">' + text + '</a>';
      };

      return this;
    }
  }, {
    key: 'convertTocMarkdownString',
    value: function convertTocMarkdownString(markdown) {
      return {
        tocHtml: this.convertMarkdownString(markdown, this.tocRenderer),
        tocItems: this.tocItems
      };
    }
  }, {
    key: 'convertMarkdownString',
    value: function convertMarkdownString(markdown, renderer) {
      renderer = renderer || this.mainRenderer;
      return marked(markdown, {
        renderer: renderer
      });
    }
  }, {
    key: 'convertMarkdownFile',
    value: function convertMarkdownFile(markdown_file) {
      return this.convertMarkdownString(fs.readFileSync(markdown_file, {
        encoding: 'utf8'
      }));
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
  }]);

  return Markdown;
})();

module.exports = Markdown;
//# sourceMappingURL=markdown.js.map