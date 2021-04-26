"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var dir = require('node-dir'),
    path = require('path'),
    fs = require('fs-extra'),
    util = require('util'),
    logger = require('./logger'),
    Promise = require("bluebird");

/**
 * Finder class
 */

var Finder = (function () {
  function Finder() {
    _classCallCheck(this, Finder);
  }

  _createClass(Finder, null, [{
    key: 'searchMarkdownFiles',

    /**
     * Search for md files
     *
     * @param {string} wikiPath Path to wiki directory
     * @returns {Promise}
     */
    value: function searchMarkdownFiles(wikiPath) {

      return new Promise(function (resolve, reject) {

        var mdFiles = {},
            aliases = {},
            dirOpts = { match: /.md/, exclude: /^_/ };

        dir.readFiles(wikiPath, dirOpts, function (err, content, filename, next) {
          if (!err) {
            filename = filename.toLowerCase();
            mdFiles[filename] = content;
            var base = path.basename(filename);
            aliases[base.substr(0, base.length - 3)] = filename;
          }
          next();
        }, function (err, files) {
          if (err) {
            return reject(err);
          }
          logger.debug(util.format('Found %d markdown files and %d links pointing to them in TOC', Object.keys(mdFiles).length, Object.keys(aliases).length));
          resolve({ files: mdFiles, aliases: aliases });
        });
      });
    }

    /**
     * Search for a file among multiple directories, ordered by priority
     *
     * @returns {string|null}
     */
  }, {
    key: 'searchForFile',
    value: function searchForFile(files, search_path) {
      var file = null;
      files.some(function (f) {
        var p = path.join(search_path, f);
        try {
          return fs.statSync(p).isFile() && (file = p);
        } catch (e) {
          return false;
        }
      }, this);
      return file;
    }
  }]);

  return Finder;
})();

module.exports = Finder;
//# sourceMappingURL=finder.js.map