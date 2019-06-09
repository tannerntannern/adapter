import 'mocha';
import {use, expect} from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
use(sinonChai);

import {makeAdapter} from '../../src';

describe('makeAdapter(...)', () => {
	describe('basic usage', () => {
		describe('as "normal" promise', () => {
			const simplePromiseLikeFunction = (succeed: boolean) => makeAdapter<string>(async () => {
				if (succeed) return 'result';
				else throw 'somethin aint right';
			});

			it('should resolve properly', async () => {
				const then = sinon.fake();

				await (simplePromiseLikeFunction(true).promise().then(then));

				expect(then).calledOnceWithExactly('result');
			});

			it('should reject properly', async () => {
				const catcher = sinon.fake();

				await (simplePromiseLikeFunction(false).promise().catch(catcher));

				expect(catcher).calledOnceWithExactly('somethin aint right');
			});
		});

		describe('with .output()', () => {
			const buildArray = () => makeAdapter<number[]>(async (input, output) => {
				let array = [];
				for (let i = 0; i < 3; i ++) {
					output({msg: 'Pushing data', value: i});
					array.push(i);
				}
				return array;
			});

			it('should resolve properly', async () => {
				const then = sinon.fake();

				await (buildArray().promise().then(then));

				expect(then).calledOnceWithExactly([0, 1, 2]);
			});

			it('should properly report output', async () => {
				const onOutput = sinon.fake();

				await (buildArray().output(onOutput).promise());

				expect(onOutput.callCount).to.equal(3);
				expect(onOutput).calledWith({msg: 'Pushing data', value: 0});
				expect(onOutput).calledWith({msg: 'Pushing data', value: 1});
				expect(onOutput).calledWith({msg: 'Pushing data', value: 2});
			});
		});

		describe('with .input()', () => {
			type Format = {
				types: { password: string },
				keys: { password: 'password' },
			};

			const postInputSpy = sinon.fake();
			const getPassword = () => makeAdapter<number, Format, string>(async (input, output) => {
				output('asking for password');
				const password = await input('password', 'password');
				postInputSpy();
				output('got password');
				return password.length;
			});

			it('should throw an error if no .input() is used', () => {
				getPassword().promise().catch(error => {
					expect(postInputSpy.callCount).to.equal(0);
					expect(error.message).to.equal('Input "password" must be supplied');
				});
			});

			it('should receive the input properly', async () => {
				const inputReceiver = sinon.fake.resolves('pa$$word');
				const outputReceiver = sinon.fake();

				const passwordLength = await (getPassword().input(inputReceiver).output(outputReceiver).promise());

				expect(passwordLength).to.equal(8);
				expect(inputReceiver).calledOnceWithExactly('password');
				expect(inputReceiver).calledAfter(outputReceiver);
				expect(inputReceiver).calledBefore(outputReceiver);
				expect(outputReceiver.callCount).to.equal(2);
				expect(outputReceiver).calledWithExactly('asking for password');
				expect(outputReceiver).calledWithExactly('got password');
			});

			it('should receive headless input properly', async () => {
				const passwordLength = await (getPassword().input({ password: 'pa$$word' }).exec());

				expect(passwordLength).to.equal(8);
			});
		});

		describe('with .then()', () => {
			const simpleResolver = () => makeAdapter(async () => 3);

			it('should work using .then() before .promise()', async () => {
				const then = sinon.spy(x => x);

				let result = await simpleResolver().then(then).promise();

				expect(result).to.equal(3);
				expect(then).called;
			});
		});

		describe('with .catch()', () => {
			const err = new Error('ERROR');
			const thrower = () => makeAdapter(async () => {
				throw err;
			});

			it('should work using .catch() before .promise()', async () => {
				const cach = sinon.fake();

				await thrower().catch(cach).promise();
				expect(cach).calledOnceWithExactly(err);
			});
		});

		describe('using .attach()', () => {
			type Format = {
				types: { input: string },
				keys: { value: 'input' }
			};
			const funky = (succeed: boolean) => makeAdapter<string, Format, string>(async (input, output) => {
				if (!succeed) throw new Error();

				let val = await input('value', 'input');
				output(val);

				return val;
			});

			it('should work with all attachments at once', async () => {
				const then = sinon.spy(x => x);
				const output = sinon.fake();
				const input = sinon.fake.resolves('blah');

				const result = await funky(true).attach({then, output, input}).exec();

				expect(result).to.equal('blah');
				expect(then).calledOnceWithExactly('blah');
				expect(input).calledOnceWithExactly('value');
				expect(output).calledOnceWithExactly('blah');
			});
		});
	});

	describe('special cases', () => {
		describe('overriding existing handlers', () => {
			// TODO: ...
		});

		describe('terminating the executor early', () => {
			it('should resolve with the return value if return is used within the executor', () => {
				// TODO: ...
			});

			it('should call the registered catch attachment when an error is thrown within the executor', () => {
				// TODO: ...
			});
		});

		// TODO: ...
	});
});
