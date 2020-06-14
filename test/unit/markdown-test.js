"use strict"

var fixtures = require('../fixtures')
  , Promise = require("bluebird")
  , should = require('should')

var path = require('path')

describe('Markdown', function() {

  var m = new fixtures.Markdown(fixtures.samples[0])

  describe('.convertMarkdownString', function() {
    it('should return html', function () {
      var html = m.convertMarkdownString('# Foo\n[foo](bar)')
      html.trim().should.equal('<h1 id="foo">Foo</h1>\n<p><a href="#bar">foo</a></p>')
    })
  })

  describe('.convertMarkdownFile', function() {
    it('should return html', function () {
      var html = m.convertMarkdownFile(fixtures.samples[0] + '/test.md')
      html.trim().should.equal('<h1 id="my-file">My file</h1>')
    })
  })

  describe('.convertMarkdownFileWithPlantuml', function() {
    it('should return html', function () {
      var html = m.convertMarkdownFile(fixtures.samples[3] + '/Foo.md')
      html.trim().should.equal('<h1 id="plantuml">Plantuml</h1>\n<img alt="plantuml-diagram" src="http://www.plantuml.com/plantuml/svg/SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9vt98pKi1IW80"/><img alt="plantuml-diagram" src="http://www.plantuml.com/plantuml/svg/SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9LqXCJypCut98pKi1AW40"/>')
    })
  })

})
