import {oarfish, command} from './src';

oarfish({
	commands: [
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
				console.log(options);
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
