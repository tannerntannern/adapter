type Record = {[key: string]: any};

type Resolve<T> = (value?: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;
type Output<T> = (data: T) => void;
type Input<T> = <K extends keyof T>(key: K) => Promise<T[K]>;

type Attachments<R, O, I> = {
	then?: Resolve<R>,
	catch?: Reject,
	output?: Output<O>,
	input?: Input<I>
};

/**
 * The type of the "executor" argument passed to PromiseConstructor.
 */
type PromiseExecutor<T> = (resolve: Resolve<T>, reject?: Reject) => void | Promise<void>;

/**
 * Identical to the executor that's passed to PromiseConstructor, with the addition of output and input functions.
 */
export type AdapterExecutor<R, O, I extends Record> = (resolve: Resolve<R>, reject?: Reject, output?: Output<O>, input?: Input<I>) => void;

/**
 * Functionally similar to Promise<T>.
 * @see makeAdapter()
 */
export type Adapter<R, O, I> = {
	exec: () => Promise<R>,
	promise: () => Promise<R>,
	output: (onOutput?: Output<O>) => Adapter<R, O, I>,
	input: (onInput?: Input<I>) => Adapter<R, O, I>,
	then: (resolve: Resolve<R>) => Adapter<R, O, I>,
	catch: (resolve: Reject) => Adapter<R, O, I>,
	attach: (attachments: Attachments<R, O, I>) => Adapter<R, O, I>
};

/**
 * Takes an executor function and wraps it in an Adapter.
 */
export const makeAdapter = <R = any, O = any, I = Record>(executor: AdapterExecutor<R, O, I>): Adapter<R, O, I> => {
	// Default then, catch, output, and input attachments
	const attachments: {then: Resolve<R>, cach: Reject, output: Output<O>, input: Input<I>} = {
		then: (result) => result,
		cach: (err) => {throw err;},
		output: () => {},
		input: async (key) => {
			throw new Error(`Input "${key}" must be supplied`);
		}
	};

	// Builds a PromiseExecutor from the given AdapterExecutor.  Since our executor may or may not be async, we need
	// to wrap it in this manner to avoid uncaught errors.
	const makePromiseExecutor = (): PromiseExecutor<R> =>
		async (resolve: Resolve<R>, reject: Reject) => {
			try {
				await executor(resolve, reject, attachments.output, attachments.input);
			} catch (e) {
				reject(e);
			}
		};

	// Makes a standard Promise from our current then, catch, output, and input functions
	const makePromise = (): Promise<R> =>
		new Promise<R>(makePromiseExecutor())
			.then(attachments.then)
			.catch(attachments.cach) as unknown as Promise<R>;

	return {
		exec: makePromise,
		promise: makePromise,
		then: function(onThen) { attachments.then = onThen; return this; },
		catch: function(onCatch) { attachments.cach = onCatch; return this; },
		output: function(onStatus) { attachments.output = onStatus; return this; },
		input: function(onInput) { attachments.input = onInput; return this; },
		attach: function(adapters) { Object.assign(attachments, adapters); return this; }
	};
};
