var tpl3d = require('../src/tpl3d.js');
var test = require('tap').test;

var treeObj = {
  simple_str: 'simple',
  unstringified: ['simple', 'array'],
  aa: ['item second', 'item first'],
  obj: {
    field_orig: '1.0',
    field_scalar: 1
  },
  deep: {
    sub: {
      tree: {
        value: 'x',
        another: 'y'
      }
    }
  }
};

// expected result
var flatObj = {
  simple_str: 'simple',
  stringified_array: 'simple,array',
  'a.1': 'item first',
  'a.0': 'item second',
  value: 'x',
  another_value: 'y',
  both_values: 'xy',
  'obj.field': '1.0'
};

test('marshal(treeObj) deepEqual flatObj', function (t) {

  var marshaller = new tpl3d.Marshaller(function () {

    this.initConfig({});

    this.map('simple_str');

    this.map('stringified_array').from('unstringified').conv(function (val) {
      return val.join();
    });

    this.map().from(function (self) {
      var r = {}, i;
      for (i = 0; i < self.aa.length; i++) {
        r['a.' + i] = self.aa[i];
      }
      return r;
    });

    this.from('deep.sub.tree'.split('.'), function () {
      this.map('value');
      this.to('another_value').from('another');
      this.to('both_values').from(function (self) {
        return self.value + self.another;
      });
    });

    this.to('obj.field').from(['obj', 'field_orig']);
  });

  var result = marshaller.marshal(treeObj);
  // console.dir(result);
  t.deepEqual(result, flatObj);
  t.end();
});

