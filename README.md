# tpl3d.js

Don't worry, there is nothing aboud 3D graphics with javascript here. Just
pronounce the name as "templated" (js).

Examples to explain everything:

```javascript
var flatObj = {
  simple_str: 'simple',
  stringified_array: 'simple,array',
  'a.1': 'item first',
  'a.0': 'item second'
  'obj.field': '1.0'
};

var marshaller = new Marshaller(function () {

  this.cmap('stringified_array', this.toJSON, 'unstringified');
  this.mmap('a', function (key, self) {
    var r = {}, i;
    for (i in self.aa) {
      r[key + '.' + i] = self.aa[i];
    }
    return r;
  });
  this.map('obj.field', ['obj', 'field_orig']);

});

var treeObj = // marshaller.marshal(flatObj);
{
  simple_str: 'simple', // as is
  unstringified: ['simple', 'array'],
  aa: ['item second', 'item first'], // in order of sorted keys
  ab: {
    '1': 'item first',
    '0': 'item second'
  },
  obj: {
    field_original: '1.0',
    field_scalar: 1
  }
};
var unmarshaller = new Unmarshaller(function () {

  this.map('simple_str'); // redundant, it's a default
  this.map('simple_str', 'copy_of_simple_str');

  this.cmap('stringified_array', this.fromJSON, 'unstringified');

  this.amap(/a\.\d+/, 'aa');
  this.map(/a\.\d+/, function (k) {
    return ['ab', k.split('.')[1]];
  });

  this.map('obj.field', ['obj', 'field_orig']);
  this.cmap('obj.field', this.scalar, ['obj', 'field_scalar']);

  this.tcmap(/obj\..+/, parseInt, this.dotsplit);
});

var result = // unmarshaller.unmarshal(treeObj);
{
  simple_str: 'simple',
  stringified_array: 'simple,array',
  'a.1': 'item first',
  'a.0': 'item second'
  'obj.field': '1.0'
};
```

