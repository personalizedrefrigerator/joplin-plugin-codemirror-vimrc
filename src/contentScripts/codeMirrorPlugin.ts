
import * as CodeMirror from 'codemirror';

type PostMessageCallback = (message: FromContentScriptMessage)=>Promise<string|ToContentScriptMessage>;
type OnMessageCallback = (message: ToContentScriptMessage)=>void;

type VimMode = 'insert'|'visual'|'normal';
interface VimControl {
	// Remove all user-defined mappings
	mapclear(ctx: VimMode): void;

	map(lhs: string, rhs: string, mode?: VimMode): void;
	unmap(lhs: string, mode: VimMode): void;
	noremap(lhs: string, rhs: string, modes: VimMode|VimMode[]): void;
}

const updateVimrc = (vimrc: string, vimControl: VimControl) => {
	console.log('Updating .vimrc to', vimrc);

	const allModes: VimMode[] = ['insert', 'visual', 'normal'];
	for (const mode of allModes) {
		// Reset all settings
		vimControl.mapclear(mode);
	}

	const lines = vimrc.split('\n');
	let lineNo = 0;
	for (const origLine of lines) {
		lineNo ++;
		let line = origLine;

		line = line.replace(/^\s+/, '');
		line = line.replace(/\s*["][^"]*$/, '');

		if (line === '') {
			continue;
		}

		const commandMatch = /^(i|n|v|)(map|unmap|noremap)\s+(\S+)\s+(\S+)$/.exec(line);
		if (!commandMatch) {
			console.error('line: ', line);
			throw new Error(`Unknown command on line ${lineNo}: ${origLine}`);
		}

		const mode = commandMatch[1];
		const command = commandMatch[2];
		const mapFrom = commandMatch[3];
		const mapTo = commandMatch[4];
		const commandModes: VimMode[] = [];

		if (mode === '') {
			commandModes.push(
				'insert', 'normal', 'visual'
			);
		} else if (mode === 'i') {
			commandModes.push('insert');
		} else if (mode === 'v') {
			commandModes.push('visual');
		} else if (mode === 'n') {
			commandModes.push('normal');
		} else {
			throw new Error(`Invalid mode on line ${lineNo}: ${mode}`);
		}

		for (const mode of commandModes) {
			switch (command) {
				case 'map':
					vimControl.map(mapFrom, mapTo, mode);
					break;
				case 'unmap':
					vimControl.unmap(mapFrom, mode);
					break;
				case 'noremap':
					vimControl.noremap(mapFrom, mapTo, mode);
					break;
			}
			console.log('Processing: cmd(%s), from(%s), to(%s), mode(%s). %s: %s', command, mapFrom, mapTo, mode, 'from line', line);
		}
	}
};

const setupOnMessageCallback = async (onMessage: OnMessageCallback, postMessage: PostMessageCallback) => {
	for (;;) {
		const callbackResult = await postMessage({
			kind: 'set-callback',
		});

		if (typeof callbackResult === 'string') {
			throw new Error(`Invalid callback result: ${callbackResult}`);
		}

		onMessage(callbackResult);
	}
};

export default (context: { contentScriptId: string, postMessage: PostMessageCallback }) => {
	return {
		plugin: (cm: CodeMirror.Editor) => {
			(async () => {
				const vimrc = await context.postMessage({
					kind: 'get-vimrc',
				}) as string;

				try {
					updateVimrc(vimrc, (cm as any).Vim);
				} catch(e) {
					console.error(e);
					alert(e);
				}
			})();

			setupOnMessageCallback(message => {
				if (message.kind !== 'set-vimrc') {
					throw new Error('Invalid message!');
				}

				updateVimrc(message.content, (cm as any).Vim);
			}, context.postMessage);
		}
	};
};