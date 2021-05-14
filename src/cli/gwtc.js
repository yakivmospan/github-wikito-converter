#!/usr/bin/env node

"use strict"

var program = require('commander')
  , WikiConverter = require('../wiki-converter')

class Cli {

  constructor () {

    this.program = program.version(WikiConverter.package.version)

      .usage('[options] <wiki-dir>')
      .description('Convert a wiki')

      .option("-f, --format <format>", "Format to convert to. Either html, pdf, or all [default: html]", 'html')
      .option("-o, --output <output-dir>", "Output dir [default: './']", './')
      .option("-n, --file-name <file-name>", "Output file name [default: 'documentation']", 'documentation')

      .option("-t, --title <title>", "Wiki title [default: Documentation]", 'Documentation ')
      .option("-d, --disable-inline-assets", "Disable inlining of css & js in html document")

      .option("--logo-img <logo-file>", "Logo image file")
      .option("--footer <footer>" , "Wiki footer")

      .option("--pdf-page-count", "Enable PDF page count")

      .option("--toc <toc-file>", "Wiki TOC file")
      .option("--toctitle <toc title>", "Title of the toc [default: Table of contents]", "Table of contents")
      .option("--toc-level <level>", "Table of contents deep level [default: 3]", 3)

      .option("--highlight-theme <theme>", "Highlighter theme [default: github]", 'github')
      .option("--disable-highlight-auto", "Disable 'highlightAuto' (make it identical to GitHub and GitLab)")

      .option("--css <css-file>", "Additional CSS file")
      .option("-v --verbose", "Verbose mode")
  }

  run() {
    this.program.parse(process.argv)
    if (!this.program.args.length) {
      this.program.help()
    }

    var options = {
      format: this.program.format,
      output: this.program.output,
      filename: this.program.fileName,
      title: this.program.title,
      logoImage: this.program.logoImg,
      footer: this.program.footer,
      pdfPageCount: this.program.pdfPageCount,
      tocTitle: this.program.toctitle,
      tocFile: this.program.toc,
      tocLevel: this.program.tocLevel,
      highlightTheme: this.program.highlightTheme,
      userCssFile: this.program.css,
      verbose: this.program.verbose || false,
      disableInlineAssets: this.program.disableInlineAssets || false,
      disableHighlightAuto: this.program.disableHighlightAuto || false
    }

    var ld = new WikiConverter(this.program.args[0], options)
    ld.generate().then(function(result) {
      console.log(result.join('\n'))
      process.exit(0)
    }).catch(function(err) {
      process.exit(1)
    })
  }

}

if (require.main === module) {
  new Cli().run()
}

module.exports = Cli
