"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var wkhtmltopdf = require('wkhtmltopdf'),
    Promise = require("bluebird"),
    helpers = require('./helpers'),
    fs = require('fs-extra'),
    logger = require('./logger'),
    BaseWriter = require('./base-writer');

var PdfWriter = (function (_BaseWriter) {
  _inherits(PdfWriter, _BaseWriter);

  function PdfWriter() {
    _classCallCheck(this, PdfWriter);

    _get(Object.getPrototypeOf(PdfWriter.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(PdfWriter, [{
    key: "getExtension",
    value: function getExtension() {
      return 'pdf';
    }
  }, {
    key: "getPageBreaker",
    value: function getPageBreaker(pageTitle, pageId) {
      return "<h1 id=\"" + pageId + "\" style=\"page-break-before: always !important;\">" + pageTitle + "</h1>";
    }
  }, {
    key: "write",
    value: function write() {
      var _this = this;

      var html = this.buildHeader(),
          pages = this.converter.getPages(),
          filename = this.getFilename(),
          footer = this.converter.getOption('footer'),
          pdfPageCount = this.converter.getOption('pdfPageCount'),
          self = this;

      logger.debug('Generating pdf: %d pages to generate', pages.length);

      pages.forEach(function (page) {
        var pageId = helpers.getPageIdFromFilenameOrLink(page.file);
        var pdfPage = _this.getPageBreaker(page.title, pageId) + page.html;
        html += pdfPage;
      }, this);

      html += this.buildFooter();

      return new Promise((function (resolve, reject) {
        var options = {
          toc: false, outline: true,
          marginLeft: 10, marginRight: 10,
          footerLine: false, footerSpacing: 2.5,
          footerFontSize: 10, pageOffset: 0
        };

        if (footer) {
          options.footerLeft = footer;
        }

        if (pdfPageCount) {
          options.footerRight = "[page]/[toPage]";
        }

        wkhtmltopdf(html, options).on('end', function () {
          logger.info(self.getExtension() + ' file written: %s', filename);
          resolve(filename);
        }).on('error', reject).pipe(fs.createWriteStream(filename));
      }).bind(this));
    }
  }, {
    key: "buildHeader",
    value: function buildHeader() {

      var htmlHeader = "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>" + this.converter.getOption('title') + "</title>\n    " + this.getCssTags() + "\n    <style>" + this.getExtraCss() + "</style>\n    " + this.getJsTags() + "\n  </head>\n  <body id=\"page-top\" class=\"pdf-doc\">\n\n    <!-- Cover page -->\n\n    " + this.getLogoImage() + "\n\n    <div class='covertitle'>\n      <b>" + this.converter.getOption('title') + "</b>\n    </div>\n\n    <!-- Cover page -->\n    <div class='nav-container'>\n      <h1 class='toc'></h1>\n    " + this.converter.getToc().getHtml() + "\n    </div>\n";
      return htmlHeader;
    }
  }, {
    key: "buildFooter",
    value: function buildFooter() {
      var footer = "\n  </body>\n</html>";

      return footer;
    }
  }, {
    key: "createImageLogoTag",
    value: function createImageLogoTag(path) {
      return "<img class=\"coverimg\" src=\"" + path + "\"/>";
    }
  }]);

  return PdfWriter;
})(BaseWriter);

module.exports = PdfWriter;
//# sourceMappingURL=pdf-writer.js.map