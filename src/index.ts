type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type InputFormat = {
	[type: string]: {key: string, return: any} & {[option: string]: any}
};

type Resolve<T> = (value?: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;
type Output<T> = (data: T) => void;
type Input<F extends InputFormat> = <T extends keyof F>(type: T, key: F[T]['key'], options?: Omit<F[T], 'key' | 'return'>) => Promise<F[T]['return']>;

type Attachments<R, I extends InputFormat, O> = {
	then?: Resolve<R>,
	catch?: Reject,
	output?: Output<O>,
	input?: Input<I>
};

/**
 * Defines the format of an AdapterExecutor.
 */
export type AdapterExecutor<R, I extends InputFormat, O> = (input?: Input<I>, output?: Output<O>) => Promise<R>;

/**
 * Functionally similar to Promise<T>.
 * @see makeAdapter()
 */
export type Adapter<R, I extends InputFormat, O> = {
	exec: () => Promise<R>,
	promise: () => Promise<R>,
	output: (onOutput?: Output<O>) => Adapter<R, I, O>,
	input: (onInput?: Input<I>) => Adapter<R, I, O>,
	then: (resolve: Resolve<R>) => Adapter<R, I, O>,
	catch: (resolve: Reject) => Adapter<R, I, O>,
	attach: (attachments: Attachments<R, I, O>) => Adapter<R, I, O>
};

/**
 * Takes an executor function and wraps it in an Adapter.
 */
export const makeAdapter = <R = any, I extends InputFormat = InputFormat, O = any>(executor: AdapterExecutor<R, I, O>): Adapter<R, I, O> => {
	// Default then, catch, output, and input attachments
	const attachments: Attachments<R, I, O> = {
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
