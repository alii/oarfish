type Narrow<T> =
	| (T extends [] ? [] : never)
	| (T extends string | number | bigint | boolean ? T : never)
	| {
			[K in keyof T]: T[K] extends (...args: any[]) => unknown
				? T[K]
				: Narrow<T[K]>;
	  };

export type TypeResolvable = {
	string: string;
	number: number;
	boolean: boolean;
};

export interface Flag {
	readonly type: keyof TypeResolvable;
	readonly required: boolean;
	readonly alias?: string;
}

export type ResolveArgs<A extends Arg[]> = {
	[K in keyof A as Extract<A[K], Arg>['name']]: TypeResolvable[Extract<
		A[K],
		Arg
	>['type']];
};

export type RunOptions<
	F extends Record<string, Flag> = {},
	A extends Arg[] = [],
> = {
	flags: {
		[K in keyof F]: F[K] extends {required: false}
			? TypeResolvable[F[K]['type']] | undefined
			: TypeResolvable[F[K]['type']];
	};

	args: ResolveArgs<A>;
};

export interface Arg {
	type: keyof TypeResolvable;
	name: string;
}

export interface Command<
	F extends Record<string, Flag> = {},
	A extends Arg[] = [],
> {
	name: string;
	usage: string;
	flags?: F;
	args?: A;

	run(options: RunOptions<F, A>): Promise<void>;
}

export function oarfish() {
	const commands: Command[] = [];

	return {
		//
	};
}

export function command<
	F extends Record<string, Flag> = {},
	A extends Arg[] = [],
>(c: Narrow<Command<F, A>>) {
	return c;
}

const helloWorld = command({
	name: 'hello',

	usage: '--name <your name>',

	args: [
		{
			name: 'bruh',
			type: 'number',
		},
	],

	flags: {
		name: {
			alias: 'n',
			type: 'string',
			required: true,
		},
	},

	async run(options) {
		options.args.bruh;

		console.log(options.flags.name);
	},
});
