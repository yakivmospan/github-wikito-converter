"use strict"

var fixtures = require('../fixtures')
  , Promise = require("bluebird")
  , should = require('should')

var path = require('path')

describe('Helpers', function() {

  describe('.getPageIdFromFilename()', function() {
    it('should not return .md suffix', function () {
      var id = fixtures.Helpers.getPageIdFromFilename('/path/to/index.md')
      id.should.equal('index')
    })
    it('should keep file name as is', function () {
      var id = fixtures.Helpers.getPageIdFromFilename('/path/to/paramètre téléversée(s).md')
      id.should.equal('paramètre téléversée(s)')
    })
  })

  describe('.getPlantUmlImage()', function() {
    it('should generate img with plantuml uri', function () {
      var id = fixtures.Helpers.getPlantEncoded('@startuml\n' +
          'Bob -> Alice : hello\n' +
          '@enduml')
      id.should.equal("http://www.plantuml.com/plantuml/svg/SoWkIImgAStDuNBAJrBGjLDmpCbCJbMmKiX8pSd9vt98pKi1IW80")
    })
  })
})
