"use strict"

var fixtures = require('../fixtures')
var path = require('path')

require('should')

describe('WikiConverter', function() {

  var ld

  describe('new Ld()', function() {
    it('should throw a TypeError when passing no argument', function () {
      (function() {
        new fixtures.Converter()
      }).should.throw()
    })
  })

  describe('new Ld("/this/does/not/exists")', function() {
    it('should throw a TypeError when passing an invalid directory path', function () {
      (function() {
        new fixtures.Converter()('/this/does/not/exists')
      }).should.throw()
    })
  })

  describe('new Ld("<valid-path>")', function() {
    it('should return a WikiConverter instance', function () {
      ld = new fixtures.Converter(fixtures.samples[0])
      ld.should.be.instanceOf(fixtures.Converter)
    })
  })

  describe('ld.computePages()', function() {
    it('should compute pages', function () {
      //ld.computePages().should.be.instanceOf(fixtures.Converter)
    })
  })

})
