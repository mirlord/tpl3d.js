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

(function (undefined) {
  'use strict';

  var $;

  // to make easy to use it with jQuery & jQuery-csv
  if (typeof jQuery !== 'undefined' && jQuery) {
    $ = jQuery;
  } else {
    $ = {};
  }

  $.tpl3d = {

    // PRIVATE:

    class2type: {},

    /**
     * Taken from jQuery sources.
     */
    typeOf: function typeOf(obj) {
      return (obj == null) // ignore warnings about non-strict comparison here
            ? String( obj )
            : $.tpl3d.class2type[ Object.prototype.toString.call( obj ) ] || "object";
    },

    // PUBLIC:

    Marshaller: function Marshaller(options) {

      this.mappings = [];
      this.taken = [];
      this.mapDefault = options.mapDefault || false;

      options.init.call(this);
    },

    Unmarshaller: function Unmarshaller(options) {

      this.mappings = [];
      this.taken = [];
      this.available = [];
      this.mapDefault = options.mapDefault || true;

      options.init.call(this);
    },

    MappingFrom: function MappingFrom(from, conv, to) {
      this.m_from = from;
      this.m_conv = conv;
      this.m_to = to;
    },

    MappingTo: function MappingFrom(to, conv, from) {
      this.m_to = to;
      this.m_conv = conv;
      this.m_from = from;
    },

    helpers: {

    }

  };

  (function initClasses(c2t) {
    var classes = ['Boolean', 'Number', 'String', 'Function', 'Array',
                   'Date', 'RegExp', 'Object', 'Error'];
    var i;
    for (i = 0; i < classes.length; i++) {
      c2t[ "[object " + classes[i] + "]" ] = classes[i].toLowerCase();
    }
  }( $.tpl3d.class2type ));

  /*
   * Mappings
   */
  $.tpl3d.MappingFrom.prototype.to = function to(toValue) {
    this.m_to = toValue;
    return this;
  };

  $.tpl3d.MappingFrom.prototype.conv = function conv(convFn) {
    this.m_conv = convFn;
    return this;
  };

  $.tpl3d.MappingTo.prototype.from = function from(fromValue) {
    this.m_from = fromValue;
    return this;
  };

  $.tpl3d.MappingTo.prototype.conv = function conv(convFn) {
    this.m_conv = convFn;
    return this;
  };

  /*
   * Unmarshaller
   */
  $.tpl3d.Unmarshaller.prototype.map = function map(from) {

    var mapping = new $.tpl3d.MappingFrom(from, null, from);
    this.mappings.push(mapping);
    return mapping;
  };

  $.tpl3d.Unmarshaller.prototype.unmarshal = function unmarshal(obj) {

    var out = {};

    // collect obj properties names
    var p;
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        this.available.push(p);
      }
    }

    var i;
    for (i = 0; i < this.mappings.length; i++) {
      var m = this.mappings[i];

      if (typeof m.m_from === 'string') {

        m.m_from = [ m.m_from ];
        this.taken.push(m.m_from);

      } else if ($.tpl3d.typeOf(m.m_from) === 'regexp') {

        var j, fromArray = [];
        for (j = 0; j < this.available.length; j++) {
          if (m.m_from.test( this.available[j] )) {
            fromArray.push( this.available[j] );
            this.taken.push( this.available[j] );
          }
        }
        m.m_from = fromArray;
      }

      if (typeof m.m_to === 'string') {

        out[m.m_to] = obj[ m.m_from[0] ];

      } else if (typeof m.m_to === 'function') {

        var h;
        for (h = 0; h < m.m_from.length; h++) {
          var keySeq = m.m_to(m.m_from[h]);
          var levelObj = out;
          var k;

          for (k = 0; k < keySeq.length - 1; k++) {
            var key = keySeq[k];
            if (levelObj[ key ] === undefined) {
              levelObj[ key ] = {};
            }
            levelObj = levelObj[ key ];
          }
          levelObj[ keySeq[ keySeq.length - 1 ] ] = obj[ m.m_from[h] ];
        }
      }
    }
    return out;
  };

  /*
   * Marshaller
   */
  $.tpl3d.Marshaller.prototype.map = function map(to) {

    var mapping = new $.tpl3d.MappingTo(to, null, to);
    this.mappings.push(mapping);
    return mapping;
  };

  $.tpl3d.Marshaller.prototype.marshalAll = function marshalAll(objArray) {

    var out = [],
        i;
    for (i = 0; i < objArray.length; i++) {
      out.push(this.marshal(objArray[i]));
    }
    return out;
  };

  $.tpl3d.Marshaller.prototype.marshal = function marshal(obj) {

    var out = {};

    var i;
    for (i = 0; i < this.mappings.length; i++) {
      var m = this.mappings[i];
      if (typeof m.m_from === 'string') {
        out[m.m_to] = obj[m.m_from];
        if (m.m_conv) {
          out[m.m_to] = m.m_conv.call(undefined, out[m.m_to]);
        }
      } else if (typeof m.m_from === 'array') {
        throw new Error('Not implemented yet');
      } else if (typeof m.m_from === 'function') {
        out[m.m_to] = m.m_from.call(undefined, obj);
      } else {
        throw new Error('Incorrect mapping');
      }
    }

    return out;
  };

  // CommonJS module is defined
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = $.tpl3d;
  } else if (this) {
    // in a browser this should point to a window
    this['tpl3d'] = $.tpl3d;
  }

}).call( this );

