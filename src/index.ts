type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type InputFormat = {key: string, return: any} & {[key: string]: any};

type Resolve<T> = (value?: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;
type Output<T> = (data: T) => void;
type Input<T extends InputFormat> = (key: T['key'], options?: Omit<T, 'key' | 'return'>) => Promise<T['return']>;

type Attachments<R, O, I extends InputFormat> = {
	then?: Resolve<R>,
	catch?: Reject,
	output?: Output<O>,
	input?: Input<I>
};

/**
 * Defines the format of an AdapterExecutor.
 */
export type AdapterExecutor<R, O, I extends InputFormat> = (input?: Input<I>, output?: Output<O>) => Promise<R>;

/**
 * Functionally similar to Promise<T>.
 * @see makeAdapter()
 */
export type Adapter<R, O, I extends InputFormat> = {
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
export const makeAdapter = <R = any, O = any, I extends InputFormat = InputFormat>(executor: AdapterExecutor<R, O, I>): Adapter<R, O, I> => {
	// Default then, catch, output, and input attachments
	const attachments: Attachments<R, O, I> = {
		then: (result) => result,
		catch: (err) => {throw err;},
		input: async (key) => {
			throw new Error(`Input "${key}" must be supplied`);
		},
		output: () => {}
	};

	// Makes a standard Promise from our current then, catch, output, and input functions
	const makePromise = (): Promise<R> =>
		executor(attachments.input, attachments.output)
			.then(attachments.then)
			.catch(attachments.catch) as unknown as Promise<R>;

	return {
		exec: makePromise,
		promise: makePromise,
		then: function(onThen) { attachments.then = onThen; return this; },
		catch: function(onCatch) { attachments.catch = onCatch; return this; },
		output: function(onStatus) { attachments.output = onStatus; return this; },
		input: function(onInput) { attachments.input = onInput; return this; },
		attach: function(adapters) { Object.assign(attachments, adapters); return this; }
	};
};
