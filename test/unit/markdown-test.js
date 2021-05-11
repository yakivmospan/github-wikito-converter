"use strict"

var fixtures = require('../fixtures')
  , Promise = require("bluebird")
  , should = require('should')

var path = require('path')

describe('Markdown', function() {

  var m = new fixtures.Markdown(fixtures.samples[0])

  describe('.convertMarkdownFile', function() {
    it('should return html', function () {
      var html = m.convertMarkdownFile(fixtures.samples[0] + '/Last.md', 'Last')
      html.trim().should.equal('<h1 id="Last#last">Last</h1>\n<h2 id="Last#last-h2-header">Last h2 header</h2>\n<h2 id="Last#last-h3-header">Last h3 header</h2>')
    })
  })

  describe('.convertMarkdownFileWithPlantuml', function() {
    it('should return html', function () {
      var html = m.convertMarkdownFile(fixtures.samples[3] + '/Foo.md')
      html.trim().should.equal('<h1 id="plantuml">Plantuml</h1>\n<img alt="plantuml-diagram" src="http://www.plantuml.com/plantuml/svg/SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9vt98pKi1IW80"/><img alt="plantuml-diagram" src="http://www.plantuml.com/plantuml/svg/SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9LqXCJypCut98pKi1AW40"/>')
    })
  })

})
