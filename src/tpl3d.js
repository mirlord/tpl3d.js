/*
 * tpl3d.js (javascript library, compatible with jQuery, nodejs ant others)
 * version: 0.1.0 (2012-12-12)
 *
 * This work is licensed under the termis of the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright (c) 2012 Vladimir Chizhov <master@mirlord.com>
 *
 */

(function ($) {
  'use strict';

  $.tpl3d = {

    // PRIVATE:

    class2type: {},

    /**
     * Taken from jQuery sources.
     */
    typeOf: function (obj) {
      return (obj == null)
            ? String( obj )
            : $.tpl3d.class2type[ Object.prototype.toString.call( obj ) ] || "object";
    },

    // PUBLIC:

    Marshaller: function (options) {

      this.mappings = [];
      this.taken = [];
      this.mapDefault = options.mapDefault || false;

      options.init.call(this);
    },

    Unmarshaller: function (options) {

      this.mappings = [];
      this.taken = [];
      this.available = [];
      this.mapDefault = options.mapDefault || true;

      options.init.call(this);
    },

    MappingFrom: function(from, conv, to) {
      this.from = from;
      this.conv = conv;
      this.to = to;
    },

    helpers: {

    }

  };

  (function initClasses(c2t) {
    var classes = ['Boolean', 'Number', 'String', 'Function', 'Array',
                   'Date', 'RegExp', 'Object', 'Error'];
    var i;
    for (i in classes) {
      c2t[ "[object " + classes[i] + "]" ] = classes[i].toLowerCase();
    }
  }( $.tpl3d.class2type ));

  /*
   * Unmarshaller
   */
  $.tpl3d.Unmarshaller.prototype.map = function (from, to) {

    to = to || from;
    this.mappings.push(new $.tpl3d.MappingFrom(from, null, to));
  };

  $.tpl3d.Unmarshaller.prototype.unmarshal = function (obj) {

    var out = {};

    // collect obj properties names
    var p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        this.available.push(p);
      }
    }

    var i;
    for (i in this.mappings) {
      var m = this.mappings[i];

      if (typeof m.from === 'string') {

        m.from = [ m.from ];
        this.taken.push(m.from);

      } else if ($.tpl3d.typeOf(m.from) === 'regexp') {

        var j, fromArray = [];
        for (j in this.available) {
          if (m.from.test( this.available[j] )) {
            fromArray.push( this.available[j] );
            this.taken.push( this.available[j] );
          }
        }
        m.from = fromArray;
      }

      if (typeof m.to === 'string') {

        out[m.to] = obj[ m.from[0] ];

      } else if (typeof m.to === 'function') {

        for (i in m.from) {
          var keySeq = m.to(m.from[i]);
          var levelObj = out;
          var k;

          for (k = 0; k < keySeq.length - 1; k++) {
            var key = keySeq[k];
            if (levelObj[ key ] === undefined) {
              levelObj[ key ] = {};
            }
            levelObj = levelObj[ key ];
          }
          levelObj[ keySeq[ keySeq.length - 1 ] ] = obj[ m.from[i] ];
        }
      }
    }
    return out;
  };

  /*
   * Marshaller
   */
  $.tpl3d.Marshaller.prototype.map = function (to, from) {

    from = from || to;
    //TODO: start here
  };

  $.tpl3d.Marshaller.prototype.marshal = function (obj) {

  };

}( jQuery ));

