type InputTypes = {
	[type: string]: any
};

type InputOptions<T extends InputTypes> = {
	[type in keyof T]?: { [option: string]: any }
};

type InputKeys<T extends InputTypes> = {
	[key: string]: keyof T
};

type InputFormat<T extends InputTypes = InputTypes> = {
	types: T,
	options?: InputOptions<T>,
	keys: InputKeys<T>,
};

type GetInputOptions<IF extends InputFormat, T extends keyof IF['types']> =
	'options' extends keyof IF
		? (T extends keyof IF['options'] ? IF['options'][T] : never)
		: never;

type InputReturn<IF extends InputFormat, K extends keyof IF['keys']> = IF['types'][IF['keys'][K]];

type InputBatchReturn<IF extends InputFormat, Ks extends keyof IF['keys']> = {
	[K in Ks]: InputReturn<IF, K>
};

type Resolve<T> = (value?: T | PromiseLike<T>) => void;

type Reject = (reason?: any) => void;

type Output<T> = (data: T) => void;

type InputSingle<IF extends InputFormat> = <K extends keyof IF['keys'], T extends IF['keys'][K]>(
	key: K,
	type: T,
	options?: GetInputOptions<IF, T>
) => Promise<InputReturn<IF, K>>;

type InputBatchValueDescriptor<IF extends InputFormat, K extends keyof IF['keys']> =
	IF['keys'][K]
	| { type: IF['keys'][K], options?: GetInputOptions<IF, IF['keys'][K]> };

type InputBatch<IF extends InputFormat> = <Ks extends keyof IF['keys'], Ts extends IF['keys'][Ks]>(
	values: { [K in Ks]: InputBatchValueDescriptor<IF, K> },
	meta?: any
) => Promise<InputBatchReturn<IF, Ks>>;

type HeadlessInput<IF extends InputFormat> = {
	[K in keyof IF['keys']]: InputReturn<IF, K>
};

type Input<IF extends InputFormat> = InputSingle<IF> & { batch?: InputBatch<IF> };

type Attachments<R, I extends InputFormat, O> = {
	then?: Resolve<R>,
	catch?: Reject,
	output?: Output<O>,
	input?: InputSingle<I>,
	inputBatch?: InputBatch<I>,
};

/**
 * Defines the format of an AdapterExecutor.
 */
export type AdapterExecutor<R, I extends InputFormat, O> = (input?: Input<I>, output?: Output<O>) => Promise<R>;

/**
 * Contains metadata about the Adapter.
 */
export type AdapterMeta<R, I extends InputFormat, O> = {
	description?: string,
	inputs?: {[K in keyof I['keys']]: string},
};

/**
 * Functionally similar to Promise<T>.
 * @see makeAdapter()
 */
export type Adapter<R, I extends InputFormat, O> = {
	exec: () => Promise<R>,
	promise: () => Promise<R>,
	output: (onOutput: Output<O>) => Adapter<R, I, O>,
	input: (onInput: InputSingle<I> | HeadlessInput<I>) => Adapter<R, I, O>,
	inputBatch: (onBatchInput: InputBatch<I>) => Adapter<R, I, O>,
	then: (resolve: Resolve<R>) => Adapter<R, I, O>,
	catch: (resolve: Reject) => Adapter<R, I, O>,
	attach: (attachments: Attachments<R, I, O>) => Adapter<R, I, O>,
	meta: AdapterMeta<R, I, O>,
};

/**
 * Takes an executor function and wraps it in an Adapter.
 */
export const makeAdapter = <R = any, I extends InputFormat = InputFormat, O = any>(
	executor: AdapterExecutor<R, I, O>,
	meta: AdapterMeta<R, I, O> = null,
): Adapter<R, I, O> => {
	// Default then, catch, output, and input attachments
	const attachments: Attachments<R, I, O> = {};
	attachments.then = result => result;
	attachments.catch = err => {throw err;};
	attachments.input = key => Promise.reject(new Error(`Input "${key}" must be supplied`));
	attachments.output = () => {};

	// Default inputBatch attachment that simply runs home to attachments.input
	attachments.inputBatch = async (values, meta) => {
		const result: any = {};
		for (let key in values) {
			const descriptor = values[key] as InputBatchValueDescriptor<I, typeof key>;
			const type = typeof descriptor === 'object' ? descriptor.type : descriptor;
			const options = typeof descriptor === 'object' ? descriptor.options : undefined;

			result[key] = await attachments.input(key, type, options);
		}

		return result;
	};

	// Makes an input function to pass to the executor with the inputBatch attachment included
	const makeInput = () => {
		const input: Input<I> = attachments.input;
		input.batch = attachments.inputBatch;

		return input;
	};

	// Makes a standard Promise from our current then, catch, output, and input functions
	const makePromise = () =>
		executor(makeInput(), attachments.output)
			.then(attachments.then)
			.catch(attachments.catch) as unknown as Promise<R>;

	return {
		exec: makePromise,
		promise: makePromise,
		then: function(onThen) { attachments.then = onThen; return this; },
		catch: function(onCatch) { attachments.catch = onCatch; return this; },
		output: function(onStatus) { attachments.output = onStatus; return this; },
		input: function(onInput) {
			// transform object-based headless input into functional input
			if (typeof onInput !== 'function') {
				const data = onInput;
				onInput = key => Promise.resolve((data)[key]);
			}

			attachments.input = onInput;

			return this;
		},
		inputBatch: function(onBatchInput) { attachments.inputBatch = onBatchInput; return this; },
		attach: function(adapters) { Object.assign(attachments, adapters); return this; },
		meta: meta,
	};
};
