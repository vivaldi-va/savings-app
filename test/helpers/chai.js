/**
 * Created by Sissy on 08/07/14.
 */
var chai = require('chai');
process.env.NODE_ENV="test";

chai.config.includeStack = true;

global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;