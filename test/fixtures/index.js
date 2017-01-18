var fixtures = require('require-dir')('../../dist/', {recursive : true})
exports.BaseWriter = fixtures['base-writer']
exports.Finder = fixtures.finder
exports.Helpers = fixtures.helpers
exports.Converter = fixtures['wiki-converter']
exports.PdfWriter = fixtures['pdf-writer']
exports.HtmlWriter = fixtures['html-writer']
exports.Markdown = fixtures.markdown
exports.Toc = fixtures.toc

var path = require('path')

exports.samples = [
  path.join(__dirname, 'samples', '0'),
  path.join(__dirname, 'samples', '1'),
  path.join(__dirname, 'samples', '2')
]
