"use strict"

var dir = require('node-dir')
  , path = require('path')
  , fs = require('fs-extra')
  , util = require('util')
  , logger = require('./logger')
  , Promise = require("bluebird")

/**
 * Finder class
 */
class Finder {

  /**
   * Search for md files
   *
   * @param {string} wikiPath Path to wiki directory
   * @returns {Promise}
   */
  static searchMarkdownFiles(wikiPath) {

    return new Promise(function(resolve, reject) {

      var mdFiles = {},
          aliases = {},
          dirOpts = { match: /.md/, exclude: /^_/ }

      dir.readFiles(wikiPath, dirOpts, function (err, content, filename, next) {
          if (!err) {
            mdFiles[filename] = content
            var base = path.basename(filename)
            aliases[base.substr(0, base.length - 3)] = filename
          }
          next()
        },
        function (err, files) {
          if (err) {
            return reject(err)
          }
          logger.debug(
            util.format(
              'Found %d markdown files and %d links pointing to them in TOC',
              Object.keys(mdFiles).length,
              Object.keys(aliases).length
            )
          )
          resolve({files: mdFiles, aliases: aliases})
        })
    })
  }

  /**
   * Search for a file among multiple directories, ordered by priority
   *
   * @returns {string|null}
   */
  static searchForFile(files, search_path) {
    var file = null
    files.some(f => {
      var p = path.join(search_path, f)
      try {
        return (fs.statSync(p).isFile() && (file = p))
      } catch(e) {
        return false
      }
    }, this)
    return file
  }
}

module.exports = Finder
