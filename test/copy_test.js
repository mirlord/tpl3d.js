var tpl3d = require('../src/tpl3d.js');
var test = require('tap').test;

var testobj = {
  foo: 'bar',
  'xxx': '1.001'
};

test('marshal(unmarshal(testobj)) deepEqual testobj', function (t) {

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

  var result = marshaller.marshal(unmarshaller.unmarshal(testobj));

  t.deepEqual(result, testobj);
  t.end();
});

