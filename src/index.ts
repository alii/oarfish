import {hideBin} from 'yargs/helpers';

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

export interface Command<F extends Record<string, Flag>, A extends Arg[]> {
	name: string;
	usage: string;
	flags: F;
	args: A;
	subcommands?: AnyCommand[];
	run(options: RunOptions<F, A>): Promise<void>;
}

export type AnyCommand = Command<Record<string, Flag>, Arg[]>;

export interface OarfishOptions {
	showHelpMenu?: boolean;
	commands: AnyCommand[];
}

export function oarfish({commands, showHelpMenu = true}: OarfishOptions) {
	const tree = commands;

	return {
		run(_argv = process.argv) {
			const argv = hideBin(_argv);

			const mapped = argv.map(arg => {
				if (arg.length === 2 && arg.startsWith('-')) {
					return {
						type: 'FLAG' as const,
						data: arg[1],
					};
				}

				if (arg.startsWith('--')) {
					return {
						type: 'FLAG' as const,
						data: arg.slice(2),
					};
				}

				return {
					type: 'ARG' as const,
					data: arg,
				};
			});

			const args = mapped
				.filter(arg => arg.type === 'ARG')
				.map(arg => arg.data);

			console.log({
				mapped,
				args,
			});
		},
	};
}

export function command<F extends Record<string, Flag>, A extends Arg[]>(
	c: Narrow<Command<F, A>>,
) {
	return c;
}
