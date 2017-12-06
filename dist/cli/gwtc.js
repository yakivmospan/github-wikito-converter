#!/usr/bin/env node


"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var program = require('commander'),
    WikiConverter = require('../wiki-converter');

var Cli = (function () {
  function Cli() {
    _classCallCheck(this, Cli);

    this.program = program.version(WikiConverter['package'].version).usage('[options] <wiki-dir>').description('Convert a wiki').option("-f, --format <format>", "Format to convert to. Either html, pdf, or all [default: html]", 'html').option("-o, --output <output-dir>", "Output dir [default: './']", './').option("-n, --file-name <file-name>", "Output file name [default: 'documentation']", 'documentation').option("-t, --title <title>", "Wiki title [default: Documentation]", 'Documentation ').option("-d, --disable-inline-assets", "Disable inlining of css & js in html document").option("--logo-img <logo-file>", "Logo image file").option("--footer <footer>", "Wiki footer").option("--pdf-page-count", "Enable PDF page count").option("--toc <toc-file>", "Wiki TOC file").option("--toc-level <level>", "Table of contents deep level [default: 3]", 3).option("--highlight-theme <theme>", "Highlighter theme [default: github]", 'github').option("--css <css-file>", "Additional CSS file").option("-v --verbose", "Verbose mode");
  }

  _createClass(Cli, [{
    key: 'run',
    value: function run() {
      this.program.parse(process.argv);
      if (!this.program.args.length) {
        this.program.help();
      }

      var options = {
        format: this.program.format,
        output: this.program.output,
        filename: this.program.fileName,
        title: this.program.title,
        logoImage: this.program.logoImg,
        footer: this.program.footer,
        pdfPageCount: this.program.pdfPageCount,
        tocFile: this.program.toc,
        tocLevel: this.program.tocLevel,
        highlightTheme: this.program.highlightTheme,
        userCssFile: this.program.css,
        verbose: this.program.verbose || false,
        disableInlineAssets: this.program.disableInlineAssets || false
      };

      var ld = new WikiConverter(this.program.args[0], options);
      ld.generate().then(function (result) {
        console.log(result.join('\n'));
        process.exit(0);
      })['catch'](function (err) {
        process.exit(1);
      });
    }
  }]);

  return Cli;
})();

if (require.main === module) {
  new Cli().run();
}

module.exports = Cli;
//# sourceMappingURL=gwtc.js.map