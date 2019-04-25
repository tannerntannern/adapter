import 'mocha';
import {expect} from 'chai';

import {foo} from '../../src';

describe('foo()', () => {
	it('should work', () => {
		expect(foo()).to.equal('bar');
	});
});
