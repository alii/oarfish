import {oarfish, command} from './src';

oarfish({
	name: 'oarfish',
	commands: [
		command({
			name: 'help',
			args: [],
			usage: 'Get help about a command',
			flags: {},
			async run(options) {
				console.log(options);
			},
		}),

		command({
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
				console.log(options.flags.name);
			},
			subcommands: [
				command({
					name: 'bruh',
					usage: 'bruh --name <your name>',
					args: [
						{
							name: 'bruh',
							type: 'number',
						},
					],
					flags: {
						name: {
							required: true,
							type: 'string',
						},
					},
					async run(options) {
						console.log(options);
					},
				}),
			],
		}),
	],
}).run();
