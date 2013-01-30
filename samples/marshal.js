var tpl3d = require('tpl3d');

var treeObj =
{
  simple_str: 'simple', // as is
  unstringified: ['simple', 'array'],
  aa: ['item second', 'item first'], // in order of sorted keys
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

var marshaller = new tpl3d.Marshaller(function () {

  this.initConfig({
    // forget it, I hope, you will be happy with defaults :)
  });

  // the simplest case
  this.map('simple_str');

  // the most simple array serialization
  this.map('stringified_array').from('unstringified').conv(function (val) {
    return val.join();
  });

  /*
   * To map any subset of your properties in a very specific way, you are able
   * to omit `to` and provide a function to `from`, which must return an object
   * of a key-value form.
   */
  this.map().from(function (self) {
    // self here will be a treeObj
    var r = {}, i;
    for (i = 0; i < self.aa.length; i++) {
      r['a.' + i] = self.aa[i];
    }
    return r;
  });

  /*
   * To make your marshaller code neat, we provide you a simple helper.
   * Everything inside this function will operate on `<treeObj>.deep.sub.tree`
   * object.
   */
  this.from('deep.sub.tree'.split('.'), function () {
    this.map('value');
    this.to('another_value').from('another');
    this.to('both_values').from(function (self) {
      return self.value + self.another;
    });
  });

  /*
   * And you can use more "obvious" variant `to`
   * instead of `map`. It does pretty the same, but with one limitation:
   * using `to` you HAVE to explicitly use `from` too:
   */
  this.to('obj.field').from(['obj', 'field_orig']);
});

var result = // marshaller.marshal(treeObj);
{
  simple_str: 'simple',
  stringified_array: 'simple,array',
  'a.1': 'item first',
  'a.0': 'item second',
  value: 'x',
  another_value: 'y',
  both_values: 'xy',
  'obj.field': '1.0'
};

