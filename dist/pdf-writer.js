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
    value: function getPageBreaker(pageId) {
      return "<p id=\"" + pageId + "\" style=\"page-break-before: always !important; height: 1px; font-size:1px\">&nbsp;</p>";
    }
  }, {
    key: "write",
    value: function write() {
      var _this = this;

      var html = this.buildHeader(),
          pages = this.ld.getPages(),
          filename = this.getFilename(),
          self = this;

      logger.debug('Generating pdf: %d pages to generate', pages.length);

      pages.forEach(function (page) {
        var pageId = helpers.getPageIdFromFilename(page.file);
        var pdfPage = _this.getPageBreaker(pageId) + page.html;
        html += pdfPage;
      }, this);

      html += this.buildFooter();

      return new Promise((function (resolve, reject) {
        wkhtmltopdf(html, { toc: false, outline: true }).on('end', function () {
          logger.info(self.getExtension() + ' file written: %s', filename);
          resolve(filename);
        }).on('error', reject).pipe(fs.createWriteStream(filename));
      }).bind(this));
    }
  }, {
    key: "buildHeader",
    value: function buildHeader() {

      var htmlHeader = "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>" + this.ld.getOption('title') + "</title>\n    " + this.getCssTags() + "\n    <style>" + this.getExtraCss() + "</style>\n    " + this.getJsTags() + "\n  </head>\n  <body id=\"page-top\" class=\"pdf-doc\">\n    <!-- Fixed navbar -->\n    <div class=\"navbar navbar-default navbar-fixed-top\">\n      <div class=\"container\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a class=\"navbar-brand doc-title\">" + this.ld.getOption('title') + "</a>\n        </div>\n      </div>\n    </div>\n    " + this.ld.getToc().getHtml() + "\n";
      return htmlHeader;
    }
  }, {
    key: "buildFooter",
    value: function buildFooter() {
      var footer = "\n  </body>\n</html>";

      return footer;
    }
  }]);

  return PdfWriter;
})(BaseWriter);

module.exports = PdfWriter;
//# sourceMappingURL=pdf-writer.js.map