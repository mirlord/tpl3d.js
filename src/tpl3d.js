/*
 * tpl3d.js (javascript library, compatible with jQuery, nodejs ant others)
 * version: 0.9.0 (2013-01-31)
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

    Marshaller: function Marshaller(initFn) {

      this.mappings = [];
      this.mapDefault = false;

      initFn.call(this);
    },

    Unmarshaller: function Unmarshaller(initFn) {

      this.mappings = [];
      this.mapDefault = true;

      initFn.call(this);
    },

    MappingFrom: function MappingFrom(container, from, to, conv) {

      this.m_container = container;
      this.m_from = from;
      this.m_to = to;
      this.m_conv = conv;
    },

    MappingTo: function MappingTo(container, to, from, conv) {

      this.m_container = container;
      this.m_to = to;
      this.m_from = from;
      this.m_conv = conv;

      this.m_prefix = [];
    },

    MarshallerProxy: function MarshallerProxy(parent, subtree) {

      if (typeof subtree === 'string') {
        this.m_subtree = [subtree];
      } else { // assuming it's an array
        this.m_subtree = subtree;
      }
      this.m_parent = parent;
    },

    helpers: {

      dotsplit: function dotsplit(key) {
        return key.split('.');
      }
    }

  };

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

  $.tpl3d.MappingFrom.prototype.doConv = function doConv(val) {

    if (typeof this.m_conv === 'function') {
      return this.m_conv.call(undefined, val);
    } else if (this.m_conv !== null && this.m_conv !== undefined) {
      throw new Error('`conv` must be a function, while it is: ' + typeOf(this.m_conv));
    } else {
      return val;
    }
  };

  $.tpl3d.MappingFrom.prototype.resolveFrom = function resolveFrom(obj, available) {

    var result = [];

    if (typeof this.m_from === 'string') {

      result.push( this.doConv(obj[this.m_from]) );
      this.m_from = [this.m_from];

    } else if (typeOf(this.m_from) === 'regexp') {

      var j, prop,
          fromArray = [];
      for (j = 0; j < available.length; j++) {
        prop = available[j];
        if (this.m_from.test(prop)) {
          result.push( this.doConv(obj[prop]) );
          fromArray.push(prop);
        }
      }
      this.m_from = fromArray;
    }

    return result;
  };

  $.tpl3d.MappingFrom.prototype.resolveTo = function resolveTo(obj) {

    var result = [];
    if (typeof this.m_to === 'string') {

      result.push( [this.m_to] );

    } else if (typeOf(this.m_to) === 'array' && this.m_to.length > 0) {

      result.push(this.m_to);

    } else if (typeof this.m_to === 'function') {

      var i, r;
      for (i = 0; i < this.m_from.length; i++) {
        r = this.m_to(this.m_from[i]);
        if (typeOf(r) === 'array') {
          result.push(r);
        } else {
          result.push( [r] );
        }
      }

    } else {
      throw new Error("`to` value is incorrect: " + this.m_to + ", where `from` is: " + this.m_from);
    }
    return result;
  };

  $.tpl3d.MappingTo.prototype.from = function from(fromValue) {
    this.m_from = fromValue;
    return this;
  };

  $.tpl3d.MappingTo.prototype.conv = function conv(convFn) {
    this.m_conv = convFn;
    return this;
  };

  $.tpl3d.MappingTo.prototype.doConv = function doConv(val) {

    if (typeof this.m_conv === 'function') {
      return this.m_conv.call(undefined, val);
    }

    if (this.m_conv !== null && this.m_conv !== undefined) {
      throw new Error('`conv` must be a function, while it is: ' + typeOf(this.m_conv));
    } else {
      return val;
    }
  };

  /*
   * Unmarshaller
   */
  $.tpl3d.Unmarshaller.prototype.initConfig = function initConfig(options) {
  };

  $.tpl3d.Unmarshaller.prototype.map = function map(from) {

    var mapping = new $.tpl3d.MappingFrom(this, from, from);
    this.mappings.push(mapping);
    return mapping;
  };

  $.tpl3d.Unmarshaller.prototype.from = function from(fromValue) {

    var mapping = new $.tpl3d.MappingFrom(this, fromValue);
    this.mappings.push(mapping);
    return mapping;
  };

  $.tpl3d.Unmarshaller.prototype.unmarshal = function unmarshal(obj, to) {

    var out = initOut(),
        available = pcollect(obj);

    var i;
    for (i = 0; i < this.mappings.length; i++) {

      var m = this.mappings[i];
      var fromValues = m.resolveFrom(obj, available);
      var toValues = m.resolveTo();
      assignMultiple(out, toValues, fromValues);
    }
    return out;
  };

  /*
   * Marshaller
   */
  $.tpl3d.Marshaller.prototype.initConfig = function initConfig(options) {
  };

  $.tpl3d.Marshaller.prototype.map = function map(to) {

    var mapping = new $.tpl3d.MappingTo(this, to, to);
    this.mappings.push(mapping);
    return mapping;
  };

  $.tpl3d.Marshaller.prototype.from = function from(fromValue, fn) {

    var proxy = new $.tpl3d.MarshallerProxy(this, fromValue);
    fn.call(proxy);
  };

  $.tpl3d.Marshaller.prototype.to = function to(toValue) {

    var mapping = new $.tpl3d.MappingTo(this, toValue);
    this.mappings.push(mapping);
    return mapping;
  };

  $.tpl3d.Marshaller.prototype.marshalAll = function marshalAll(objects, toFn) {

    if (typeof toFn === 'function') {
      throw new Error("toFn argument must be a function");
    }

    var out = [],
        i;
    for (i = 0; i < objects.length; i++) {
      out.push(this.marshal(objects[i], toFn));
    }
    return out;
  };

  $.tpl3d.Marshaller.prototype.marshal = function marshal(obj, to) {

    var out = initOut();

    var i, from;
    for (i = 0; i < this.mappings.length; i++) {
      var m = this.mappings[i];
      if (typeof m.m_from === 'string') {
        m.m_from = [m.m_from];
      }

      if (typeOf(m.m_from) === 'array') {

        from = m.m_prefix.concat(m.m_from);
        out[m.m_to] = m.doConv(subobj(obj, from));

      } else if (typeof m.m_from === 'function') {

        from = m.m_from.call(undefined, subobj(obj, m.m_prefix));
        if (m.m_to === undefined) {
          var k;
          for (k in from) {
            if (from.hasOwnProperty(k)) {
              out[ k ] = from[k];
            }
          }
        } else {
          out[m.m_to] = m.doConv(from);
        }

      } else {
        throw new Error('Incorrect mapping to: ' + m.m_to);
      }
    }
    return out;
  };

  /*
   * MarshallerProxy
   */
  $.tpl3d.MarshallerProxy.prototype.map = function map(to) {
    var mapping = this.m_parent.to(to).from(to);
    mapping.m_prefix = this.m_subtree;
    return mapping;
  };

  $.tpl3d.MarshallerProxy.prototype.to = function to(toValue) {
    var mapping = this.m_parent.to(toValue);
    mapping.m_prefix = this.m_subtree;
    return mapping;
  };

  /*
   * private helpers
   */

  /**
   * Collect object properties names
   */
  function pcollect(obj) {

    var p, available = [];
    for (p in obj) {
      if (obj.hasOwnProperty(p)) {
        available.push(p);
      }
    }
    return available.sort();
  }

  function initOut(to) {

    if (typeof to === 'undefined') {
      return {};
    } if (typeof to === 'function') {
      return to();
    } else {
      return to;
    }
  }

  var class2type = {};

  /**
   * Taken from jQuery sources.
   */
  function typeOf(obj) {
    return (obj == null) // ignore warnings about non-strict comparison here
          ? String( obj )
          : class2type[ Object.prototype.toString.call( obj ) ] || "object";
  }

  function collapse(arr) {
    return (typeOf(arr) === 'array' && arr.length === 1)
         ? arr[0]
         : arr;
  }

  function assignMultiple(obj, keys, fromValues) {

    if (keys.length === 1) {
      assignNested(obj, keys[0], collapse(fromValues));
    } else if (keys.length === fromValues.length) {
      var i, seq;
      for (i = 0; i < keys.length; i++) {
        seq = keys[i];
        assignNested(obj, seq, fromValues[i]);
      }
    } else {
      throw new Error('from/to sets are in illegal state');
    }
  }

  function assignNested(obj, keySeq, val) {

    var levelObj = obj;
    var k;

    for (k = 0; k < keySeq.length - 1; k++) {
      var key = keySeq[k];
      if (levelObj[ key ] === undefined) {
        levelObj[ key ] = {};
      }
      levelObj = levelObj[ key ];
    }
    levelObj[ keySeq[ keySeq.length - 1 ] ] = val;
  }

  function subobj(obj, keyseq) {

    var levelObj = obj, j;
    for (j = 0; j < keyseq.length; j++) {
      levelObj = levelObj[ keyseq[j] ];
    }
    return levelObj;
  }

  (function initClasses(c2t) {
    var classes = ['Boolean', 'Number', 'String', 'Function', 'Array',
                   'Date', 'RegExp', 'Object', 'Error'];
    var i;
    for (i = 0; i < classes.length; i++) {
      c2t[ "[object " + classes[i] + "]" ] = classes[i].toLowerCase();
    }
  }( class2type ));

  // CommonJS module is defined
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = $.tpl3d;
  } else if (this) {
    // in a browser this should point to a window
    this['tpl3d'] = $.tpl3d;
  }

}).call( this );

