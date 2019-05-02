import 'mocha';
import {use, expect} from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
use(sinonChai);

import {makeAdapter} from '../../src';

describe('makeAdapter(...)', () => {
	describe('basic usage', () => {
		describe('as "normal" promise', () => {
			const simplePromiseLikeFunction = (succeed: boolean) => makeAdapter<string>((resolve, reject) => {
				if (succeed) resolve('result');
				else reject('somethin aint right');
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
			const buildArray = () => makeAdapter<number[]>(async (resolve, reject, output) => {
				let array = [];
				for (let i = 0; i < 3; i ++) {
					output({msg: 'Pushing data', value: i});
					array.push(i);
				}
				resolve(array);
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
			const postInputSpy = sinon.fake();
			const getPassword = () => makeAdapter<number, string, {password: string}>(async (resolve, reject, output, input) => {
				output('asking for password');
				const password = await input('password');
				postInputSpy();
				output('got password');
				const passwordLength = password.length;
				resolve(passwordLength);
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
		});

		describe('with .then()', () => {
			const simpleResolver = () => makeAdapter(resolve => resolve(3));

			it('should work using .then() before .promise()', async () => {
				const then = sinon.spy(x => x);

				let result = await simpleResolver().then(then).promise();

				expect(result).to.equal(3);
				expect(then).called;
			});
		});

		describe('with .catch()', () => {
			const thrower = () => makeAdapter((resolve, reject) => reject('ERROR'));

			it('should work using .catch() before .promise()', async () => {
				const cach = sinon.fake();

				await thrower().catch(cach).promise();
				expect(cach).calledOnceWithExactly('ERROR');
			});
		});

		describe('using .attach()', () => {
			const funky = (succeed: boolean) => makeAdapter<string, string>(async (resolve, reject, output, input) => {
				if (!succeed) return reject();

				let val = await input('value');
				output(val);

				resolve(val);
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
