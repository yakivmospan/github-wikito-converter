"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var fs = require('fs-extra'),
    path = require('path'),
    util = require('util'),
    logger = require('./logger'),
    Promise = require("bluebird"),
    datauri = require('datauri').sync;

var BaseWriter = (function () {

  /**
   *
   * @param {GWC} GWC instance
   */

  function BaseWriter(ld) {
    _classCallCheck(this, BaseWriter);

    this.ld = ld;
  }

  _createClass(BaseWriter, [{
    key: 'write',
    value: function write(filename, html) {
      var self = this;
      return new Promise(function (resolve, reject) {
        fs.writeFile(filename, html, function (err) {
          if (err) {
            return reject(err);
          }
          logger.info(self.getExtension() + ' file written: %s', filename);
          resolve(filename);
        });
      });
    }
  }, {
    key: 'getExtension',
    value: function getExtension() {
      throw new Error('You must define an getExtension() in your writer');
    }
  }, {
    key: 'getFilename',
    value: function getFilename() {
      return path.join(this.ld.getOption('output'), this.ld.getOption('filename') + '.' + this.getExtension());
    }
  }, {
    key: 'getCssTags',
    value: function getCssTags() {
      return this.getAssetsTags(this.ld.getCssFiles(), 'css').join('\n');
    }
  }, {
    key: 'getJsTags',
    value: function getJsTags() {
      return this.getAssetsTags(this.ld.getJsFiles(), 'js').join('\n');
    }
  }, {
    key: 'getLimedocsGeneratedImgData',
    value: function getLimedocsGeneratedImgData() {
      return datauri(path.resolve(__dirname, '../assets/images/Limedocs-generated.png'));
    }
  }, {
    key: 'getExtraCss',
    value: function getExtraCss() {
      var tocLevel = this.ld.getOption('tocLevel'),
          tocLevelBaseCss = '> .gwc-nav > li ';
      return '.gwc-nav > li ' + tocLevelBaseCss.repeat(tocLevel) + '{display: none;}';
    }
  }, {
    key: 'getAssetsTags',
    value: function getAssetsTags(files, type) {
      return files.map(function (file) {
        return this.getAssetSingleTag(file, type);
      }, this);
    }
  }, {
    key: 'getAssetSingleTag',
    value: function getAssetSingleTag(file, type) {
      var tplIn, tplOut;

      if (type === 'js') {
        tplIn = '<script>%s</script>';
        tplOut = '<script src="%s" type="javascript"></script>';
      } else {
        tplIn = '<style>%s</style>';
        tplOut = '<link href="%s" rel="stylesheet" />';
      }

      return this.ld.getOption('disableInlineAssets') ? util.format(tplOut, path.basename(file)) : util.format(tplIn, fs.readFileSync(file, { encoding: 'utf8' }));
    }
  }]);

  return BaseWriter;
})();

module.exports = BaseWriter;
//# sourceMappingURL=base-writer.js.map