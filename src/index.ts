import yargsParser from 'yargs-parser';
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
	name: string;
	commands: AnyCommand[];
}

/**
 * Finds a command from the arguments array.
 *
 * @param commands An array of commands
 * @param args Arguments passed to the program
 */
export function findCommand(
	commands: AnyCommand[],
	args: (string | number)[],
): AnyCommand | null {
	if (!commands.length) {
		return null;
	}

	return (
		flattenCommands(commands).find(command => {
			const slicedName = args.slice(0, -command.args.length);

			if (command.name !== slicedName.join(' ')) {
				return false;
			}

			// Command was found, but we expected more arguments!
			// TODO: Handle this error better reporting
			if (args.length - slicedName.length !== command.args.length) {
				return false;
			}

			return true;
		}) ?? null
	);
}

/**
 * Flattens an array of commands into a single array
 *
 * @param commands An array of commands
 * @returns Those commands with subcommands flattened and prefixed
 */
export function flattenCommands(commands: AnyCommand[]): AnyCommand[] {
	if (!commands.length) {
		return [];
	}

	const allCommands: AnyCommand[] = [];

	for (const command of commands) {
		allCommands.push({
			...command,
			subcommands: [],
		});

		if (command.subcommands) {
			const mapped = flattenCommands(command.subcommands).map(subCommand => ({
				...subCommand,
				name: `${command.name} ${subCommand.name}`,
				subcommands: [],
			}));

			allCommands.push(...mapped);
		}
	}

	return allCommands;
}

export function oarfish({commands, name, showHelpMenu = true}: OarfishOptions) {
	return {
		async run(argv = process.argv) {
			process.title = name;

			const {_: args, ...flags} = yargsParser(hideBin(argv));

			if (args.length === 0 || flags.help === true) {
				console.log(
					`Welcome to ${name} v${require('../package.json').version}`,
				);

				return;
			}

			const command = findCommand(commands, args);

			if (!command) {
				console.error('Command not found');
				return;
			}

			console.log(command);
		},
	};
}

export function command<F extends Record<string, Flag>, A extends Arg[]>(
	c: Narrow<Command<F, A>>,
) {
	return c;
}
