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

  $.tpl3d = {

    // PRIVATE:


    // PUBLIC:

    Marshaller: function (init) {

      init.call(this);
    },

    Unmarshaller: function (init) {

      init.call(this);
    },

    helpers: {

    }

  };

  /*
   * Marshaller
   */
  $.tpl3d.Marshaller.prototype.map = function (to, from) {

  };

  $.tpl3d.Marshaller.prototype.cmap = function (to, conversion, from) {

  };

  $.tpl3d.Marshaller.prototype.mmap = function (to, from) {

  };

  $.tpl3d.Marshaller.prototype.marshal = function (obj) {

  };

  /*
   * Unmarshaller
   */
  $.tpl3d.Unmarshaller.prototype.map = function (to, from) {

    from = from || to;
    //TODO: start here
  };

  $.tpl3d.Unmarshaller.prototype.cmap = function (to, conversion, from) {

  };

  $.tpl3d.Unmarshaller.prototype.amap = function (to, from) {

  };

  $.tpl3d.Unmarshaller.prototype.tmap = function (to, splitter) {

  };

  $.tpl3d.Unmarshaller.prototype.tcmap = function (to, conversion, splitter) {

  };

  $.tpl3d.Unmarshaller.prototype.dotsplit = function (key) {
    return key.split('.');
  };

  $.tpl3d.Unarshaller.prototype.unmarshal = function (obj) {

  };

}( jQuery ));

