const assert = require('chai').assert;
const jwt = require('../src/services/jwt');

describe('JWTService', function () {
  it('should maintain the integrity of the original data', function () {
    //Test data
    const testObj = {
      payload: {
        woo: 'hooasdcklnkl',
        user: {
          name: 'Aaron',
          age: 57,
          stuff: [{
            sdkj: 123
          }, {
            wjj: [234, 'asd', 6543],
            klwj: '234897uiwh'
          }]
        },
        randomString: 'salkjnkljaskclnaklcj'
      }
    };

    //Generate and decode token
    const token = jwt.sign(testObj);
    const decoded = jwt.verify(token);

    //Payload field required because jwt adds a few fields.
    assert.deepEqual(testObj.payload, decoded.payload);
  });
});