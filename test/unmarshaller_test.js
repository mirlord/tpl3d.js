var tpl3d = require('../src/tpl3d.js');
var test = require('tap').test;

/*
 * input
 */
var flatObj = {
  simple_str: 'simple',
  stringified_array: 'simple,array',
  'a.1': 'item first',
  'a.0': 'item second',
  'obj.field': '1.0'
};

/*
 * expected result
 */
var treeObj = {
  simple_str: 'simple',
  copy_of_simple_str: 'simple',
  unstringified: ['simple', 'array'],
  aa: ['item second', 'item first'],
  ab: {
    '1': 'item first',
    '0': 'item second'
  },
  obj: {
    field_orig: '1.0',
    field_scalar: 1,
    field: '1.0'
  }
};

test('unmarshal(flatObj) deepEqual treeObj', function (t) {

  var unmarshaller = new tpl3d.Unmarshaller(function () {

    this.initConfig({});

    this.map('simple_str');

    this.map('simple_str').to('copy_of_simple_str');

    this.map('stringified_array').to('unstringified').conv(function (val) {
      return val.split(',');
    });

    this.map(/a\.\d+/).to('aa');
    this.map(/a\.\d+/).to(function (key) {
      return ['ab', key.split('.')[1]];
    });

    this.map('obj.field').to(['obj', 'field_orig']);
    this.map('obj.field').to(['obj', 'field_scalar']).conv(function (val) {
      return parseFloat(val);
    });

    this.from('obj.field').to(tpl3d.helpers.dotsplit);
  });

  var result = unmarshaller.unmarshal(flatObj);
  // console.dir(result);
  t.deepEqual(result, treeObj);
  t.end();
});

