"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var path = require('path');
var plantumlEncoder = require('plantuml-encoder');

var Helpers = (function () {
  function Helpers() {
    _classCallCheck(this, Helpers);
  }

  _createClass(Helpers, null, [{
    key: 'getPageIdFromFilenameOrLink',
    value: function getPageIdFromFilenameOrLink(filename) {
      var base = path.basename(filename);
      if (base.substr(-3) === '.md') {
        base = base.substr(0, base.length - 3);
      }
      return base.replace(/([^a-z0-9\-_~.]+)/gi, '');
    }
  }, {
    key: 'getPlantEncoded',
    value: function getPlantEncoded(code) {
      return 'http://www.plantuml.com/plantuml/svg/' + plantumlEncoder.encode(code);
    }
  }]);

  return Helpers;
})();

module.exports = Helpers;
//# sourceMappingURL=helpers.js.map