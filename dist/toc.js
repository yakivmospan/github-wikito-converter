"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var path = require('path'),
    fs = require('fs-extra'),
    util = require('util'),
    marked = require('marked');

var Toc = (function () {

  /**
   *
   * @param {GWC} gwc
   */

  function Toc(converter) {
    _classCallCheck(this, Toc);

    this.converter = converter;
    this.computeTocParts();
  }

  _createClass(Toc, [{
    key: 'getMarkdown',
    value: function getMarkdown() {
      return this.toc.tocMd;
    }
  }, {
    key: 'getHtml',
    value: function getHtml() {
      return this.toc.tocHtml;
    }
  }, {
    key: 'getItems',
    value: function getItems() {
      return this.toc.tocItems;
    }

    /**
     * @private
     */
  }, {
    key: 'computeTocParts',
    value: function computeTocParts() {
      this.toc = {};
      this.toc.tocMd = this.getTocFileContents();

      var convertedToc = this.converter.getMarkdownConverter().convertTocMarkdownString(this.toc.tocMd);
      this.toc.tocHtml = convertedToc.tocHtml;
      this.toc.tocItems = convertedToc.tocItems;
    }

    /**
     * @private
     * @returns {String}
     */
  }, {
    key: 'getTocFileContents',
    value: function getTocFileContents() {
      var tocFile = this.converter.getTocFile();
      if (tocFile) {
        return fs.readFileSync(tocFile, { encoding: 'utf8' });
      }
      // if no toc file, generate contents from files
      return this.genTocFileContents();
    }

    /**
     * @private
     * @returns {string}
     */
  }, {
    key: 'genTocFileContents',
    value: function genTocFileContents() {
      return Object.keys(this.converter.getMarkdownFiles()).map(function (filename) {
        var basename = path.basename(filename);
        return util.format('- [%s](%s)', basename, basename);
      }).join('\n');
    }
  }]);

  return Toc;
})();

module.exports = Toc;
//# sourceMappingURL=toc.js.map