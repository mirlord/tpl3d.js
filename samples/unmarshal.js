var tpl3d = require('tpl3d');

var flatObj = {
  simple_str: 'simple',
  stringified_array: 'simple,array',
  'a.1': 'item first',
  'a.0': 'item second',
  'obj.field': '1.0'
};

var unmarshaller = new tpl3d.Unmarshaller(function () {

  this.initConfig({
    // forget it, I hope, you will be happy with defaults :)
  });

  this.map('simple_str');

  this.map('simple_str').to('copy_of_simple_str');

  this.map('stringified_array').to('unstringified').conv(function (val) {
    return val.split(',');
  });

  /*
   * Use array in `from` to create a tree object structure.
   */
  this.map('obj.field').to(['obj', 'field_orig']);

  /*
   * When mapping muany-to-one - targeted property value
   * will be an array of source values
   */
  this.map(/a\.\d+/).to('aa');

  /*
   * Otherwise, to map muany-to-many - pass a function, which will be called
   * once for each source key. It can return a string or an array of strings.
   */
  this.map(/a\.\d+/).to(function (key) {
    return ['ab', key.split('.')[1]];
  });

  /*
   * If required, any conversion can be done on mapping.
   */
  this.map('obj.field').to(['obj', 'field_scalar']).conv(function (val) {
    return parseFloat(val);
  });

  /*
   * And the last thing. You can use more "obvious" variant `from`
   * instead of `map`. It does pretty the same, but with one limitation:
   * using `from` you HAVE to explicitly use `to` or `eachTo` too:
   */
  this.from('obj.field').to(tpl3d.helpers.dotsplit);
});

/*
 * That's what you'll get as a result:
 */
var treeObj = // unmarshaller.unmarshal(flatObj);
{
  simple_str: 'simple', // as is
  copy_of_simple_str: 'simple',
  unstringified: ['simple', 'array'],
  aa: ['item second', 'item first'], // in order of sorted keys
  ab: {
    '1': 'item first',
    '0': 'item second'
  },
  obj: { // a simple tree
    field_orig: '1.0',
    field_scalar: 1, // converted value
    field: '1.0'
  }
};

