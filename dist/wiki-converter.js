"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Promise = require("bluebird"),
    fs = require('fs-extra'),
    path = require('path'),
    defaults = require('defaults'),
    GWCMarkdown = require('./markdown'),
    GWCHtmlWriter = require('./html-writer'),
    GWCPdfWriter = require('./pdf-writer'),
    GWCToc = require('./toc'),
    GWCFinder = require('./finder'),
    helpers = require('./helpers'),
    logger = require('./logger');

var WikiConverter = (function () {
  /**
   * GWC Constructor
   *
   * @param {string} wiki_path wiki path
   * @param {object} options options object
   * @constructor
   */

  function WikiConverter(wiki_path, options) {
    _classCallCheck(this, WikiConverter);

    if (!wiki_path || fs.statSync(wiki_path).isDirectory() === false) {
      throw new TypeError('wiki_path is not a valid directory.');
    }

    this.wikiPath = wiki_path;
    this.computePaths().computeOptions(options).computeCssFiles().computeJsFiles().checkTocLevel().checkOutputFormat();
  }

  _createClass(WikiConverter, [{
    key: "generate",
    value: function generate() {

      var self = this;

      return new Promise((function (resolve, reject) {

        GWCFinder.searchMarkdownFiles(self.wikiPath).then((function (result) {
          this.mdFiles = result.files;
          this.mdAliases = result.aliases;

          this.markdownConverter = new GWCMarkdown(this.wikiPath, this.mdAliases);
          this.toc = new GWCToc(self);

          this.copyAssets();

          var promises = [];

          if (this.getOption('format').indexOf('html') >= 0) {
            this.htmlWriter = new GWCHtmlWriter(this);
            promises.push(this.htmlWriter.write());
          }

          if (this.getOption('format').indexOf('pdf') >= 0) {
            this.pdfWriter = new GWCPdfWriter(this);
            promises.push(this.pdfWriter.write());
          }

          return Promise.all(promises).then(resolve)["catch"](reject);
        }).bind(this));
      }).bind(this));
    }

    /**
     * @private
     * @returns {wiki-converter}
     */
  }, {
    key: "computePages",
    value: function computePages() {
      var _this = this;

      this.pages = [];
      this.toc.getItems().forEach(function (item) {
        _this.pages.push({
          title: item.title,
          file: _this.mdAliases[item.pageId],
          html: _this.markdownConverter.convertMarkdownFile(_this.mdAliases[item.pageId])
        });
      }, this);
      return this;
    }
  }, {
    key: "getPages",
    value: function getPages() {
      if (!this.pages) {
        this.computePages();
      }
      return this.pages;
    }
  }, {
    key: "getMarkdownConverter",
    value: function getMarkdownConverter() {
      return this.markdownConverter;
    }
  }, {
    key: "getMarkdownFiles",
    value: function getMarkdownFiles() {
      return this.mdFiles;
    }
  }, {
    key: "getToc",
    value: function getToc() {
      return this.toc;
    }

    /**
     * @private
     * @returns {wiki-converter}
     */
  }, {
    key: "computePaths",
    value: function computePaths() {
      this.assetsPath = path.resolve(path.join(__dirname, '..', 'assets'));
      this.cssPath = path.join(this.assetsPath, 'css');
      this.imagesPath = path.join(this.assetsPath, 'images');
      this.htmlPath = path.join(this.assetsPath, 'html');
      return this;
    }

    /**
     * @private
     * @returns {wiki-converter}
     */
  }, {
    key: "computeCssFiles",
    value: function computeCssFiles() {

      this.cssFiles = [path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css'), path.join(__dirname, '..', 'node_modules', 'highlight.js', 'styles', 'default.css'), path.join(__dirname, '..', 'node_modules', 'highlight.js', 'styles', this.options.highlightTheme + '.css'), path.join(this.cssPath, 'doc.css')];

      this.options.userCssFile && this.cssFiles.push(path.resolve(this.options.userCssFile));
      return this;
    }

    /**
     * @private
     * @returns {wiki-converter}
     */
  }, {
    key: "computeJsFiles",
    value: function computeJsFiles() {

      this.jsFiles = [path.join(__dirname, '..', 'node_modules', 'jquery', 'dist', 'jquery.min.js'), path.join(__dirname, '..', 'node_modules', 'bootstrap', 'dist', 'js', 'bootstrap.min.js')];

      this.options.userJsFile && this.jsFiles.push(path.resolve(this.options.userJsFile));
      return this;
    }
  }, {
    key: "copyAssets",
    value: function copyAssets() {
      if (!this.getOption('disableInlineAssets')) {
        return;
      }
      var assetsFiles = this.getJsFiles().concat(this.getCssFiles());

      assetsFiles.forEach(function (file) {
        fs.copySync(file, path.join(this.getOption('output'), path.basename(file)));
      }, this);
    }
  }, {
    key: "computeOptions",
    value: function computeOptions(options) {

      var def = {
        title: 'Documentation',
        logoImage: null,
        footer: null,
        pdfPageCount: null,
        format: 'html',
        filename: 'documentation',
        output: path.resolve('./'),
        tocFile: GWCFinder.searchForFile(['_Toc.html', '_Sidebar.html', '_Toc.md', '_Sidebar.md'], this.wikiPath),
        tocLevel: 3, // between 1 and 4
        highlightTheme: 'github',
        userCssFile: null
      };

      this.options = defaults(options, def);

      if (this.options.verbose) {
        logger.transports.console.level = 'debug';
      }

      logger.debug("gwc launched with options", this.options);

      return this;
    }

    /**
     * Transform the format string into an array containing one to two elements
     *
     * @returns {string[]}
     */
  }, {
    key: "checkOutputFormat",
    value: function checkOutputFormat() {
      if (this.options.format === 'all') {
        return this.options.format = ['html', 'pdf'];
      }
      this.options.format = [this.options.format];
      return this;
    }
  }, {
    key: "checkTocLevel",
    value: function checkTocLevel() {
      this.options.tocLevel = parseInt(this.options.tocLevel, 10);
      if (this.options.tocLevel < 1 || this.options.tocLevel > 4) {
        this.options.tocLevel = 3;
      }
      return this;
    }
  }, {
    key: "setOption",
    value: function setOption(key, value) {
      this.options[key] = value;
      return this;
    }
  }, {
    key: "getOption",
    value: function getOption(key) {
      return this.options[key];
    }
  }, {
    key: "getTocFile",
    value: function getTocFile() {
      return this.getOption('tocFile');
    }
  }, {
    key: "addCssFile",
    value: function addCssFile(file) {
      this.cssFiles.push(path.resolve(file));
      return this;
    }
  }, {
    key: "getCssFiles",
    value: function getCssFiles() {
      return this.cssFiles;
    }
  }, {
    key: "getJsFiles",
    value: function getJsFiles() {
      return this.jsFiles;
    }
  }]);

  return WikiConverter;
})();

Object.defineProperty(WikiConverter, 'package', {
  value: require('../package')
});

module.exports = WikiConverter;
//# sourceMappingURL=wiki-converter.js.map