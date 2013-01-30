# tpl3d.js

Don't worry, there is nothing aboud 3D graphics with javascript here. Just
pronounce the name as "templated" (js).

It was designed to be used in conjunction with a state of the art library for
writing and reading data to/from a csv format:
[jquery-csv](http://code.google.com/p/jquery-csv/).

So, tpl3d does two simple things: it can convert your flat structure object
(taken from a csv data) to an object, structured as you wish to. And it convert
any object to a flat structure. And that's all.

## Mmm... I still can't figure out why do I need it?

Imagine that you already have an object, used all over your application. You
can't modify it's structure. And now you have to support reading this object
from csv. You just define an unmarshalling rules set and your object will be
filled the way you defined. With any data conversion you need.

And the same in an another direction.

## Examples to explain everything

Unmarshalling from flat structure to a tree-object:

```javascript
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
```

Marshalling from tree-object to a flat structure:

```javascript
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
```

## Too more hacky examples

The following are two ways to copy a flat object. Both do the same. They are
not practically useful, but anyway:

```javascript
var testobj = {
  foo: 'bar',
  'xxx': '1.001'
};

var unmarshaller = new tpl3d.Unmarshaller(function () {

  this.map(/.*/).to(function (key) {
    return key;
  });
});

var marshaller = new tpl3d.Marshaller(function () {

  this.map().from(function (self) {
    return self;
  });
});

var thesame = marshaller.marshal(unmarshaller.unmarshal(testobj));
```

## Tests

To run tests:

```bash
$ git clone git@github:mirlord/tpl3d.js
$ npm install
$ make tap
```

## TODO

* Samples are good. API-docs are better.
* Better check what user does and be informative on his failures.

## LICENSE

[The MIT License](http://www.opensource.org/licenses/mit-license.php)

Copyright (c) 2012 Vladimir Chizhov <master@mirlord.com>

