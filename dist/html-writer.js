"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseWriter = require("./base-writer"),
    helpers = require('./helpers'),
    logger = require('./logger');

var HtmlWriter = (function (_BaseWriter) {
  _inherits(HtmlWriter, _BaseWriter);

  function HtmlWriter() {
    _classCallCheck(this, HtmlWriter);

    _get(Object.getPrototypeOf(HtmlWriter.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(HtmlWriter, [{
    key: "getExtension",
    value: function getExtension() {
      return 'html';
    }
  }, {
    key: "write",
    value: function write() {
      var html = this.buildHeader(),
          pages = this.converter.getPages();

      logger.debug('Generating html: %d pages to generate', pages.length);

      this.converter.getPages().forEach(function (page) {
        var pageId = helpers.getPageIdFromFilenameOrLink(page.file);
        html += "<p class=\"page\" id=\"" + pageId + "\"></p><h1>" + page.title + "</h1>\n" + page.html;
      }, this);

      html += this.buildFooter();
      return _get(Object.getPrototypeOf(HtmlWriter.prototype), "write", this).call(this, this.getFilename(), html);
    }
  }, {
    key: "buildHeader",
    value: function buildHeader() {

      var htmlHeader = "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n    <title>" + this.converter.getOption('title') + "</title>\n    " + this.getCssTags() + "\n    <style>" + this.getExtraCss() + "</style>\n    " + this.getJsTags() + "\n  </head>\n  <body id=\"page-top\" class=\"html-doc\">\n    <!-- Fixed navbar -->\n    <div class=\"navbar navbar-default navbar-fixed-top\">\n      <div class=\"container\">\n        <div class=\"navbar-header\">\n          <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n            <span class=\"sr-only\">Toggle navigation</span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n            <span class=\"icon-bar\"></span>\n          </button>\n          <a class=\"navbar-brand doc-title\" href=\"#page-top\">" + this.converter.getOption('title') + "</a>\n        </div>\n        <div id=\"navbar\" class=\"navbar-collapse collapse\">\n          <ul class=\"nav navbar-nav\">\n          " + this.getLogoImage() + "\n        </div><!--/.nav-collapse -->\n      </div>\n    </div>\n    <div id=\"documentation-container\" class=\"container\">\n      <div class=\"row\">\n        <div class=\"col-md-3\">\n          <div class=\"nav-container\">\n            <div class=\"nav-inner\" id=\"scroll-spy\">\n              <span class=\"toc\"></span>\n              " + this.converter.getToc().getHtml() + "\n              " + this.getFooter() + "\n            </div>\n          </div>\n        </div>\n\n\n        <div class=\"col-md-9\">\n";
      return htmlHeader;
    }
  }, {
    key: "buildFooter",
    value: function buildFooter() {
      var footer = "\n        </div> <!-- /div.col-md-9 -->\n      </div> <!-- /div.row -->\n    </div> <!-- /div.container -->\n  </body>\n  <script>\n    $('body').scrollspy({ target: '#scroll-spy', offset: 40 })\n  </script>\n</html>";
      return footer;
    }
  }, {
    key: "createImageLogoTag",
    value: function createImageLogoTag(path) {
      return "\n              </ul>\n                <ul class=\"nav navbar-nav navbar-right gwc-navbar-right\">\n                <li><img class=\"logo-img\" src=\"" + path + "\"></li>\n              </ul>";
    }
  }, {
    key: "getFooter",
    value: function getFooter() {
      var footerOption = this.converter.getOption('footer');
      return footerOption ? "<div class=\"footer\">" + footerOption + "</div>" : '';
    }
  }]);

  return HtmlWriter;
})(BaseWriter);

module.exports = HtmlWriter;
//# sourceMappingURL=html-writer.js.map