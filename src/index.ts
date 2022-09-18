import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { getVimrcContent, setVimrcContent } from './vimrc';

const dialogs = joplin.views.dialogs;
const pluginPrefix = 'io.github.personalizedrefrigerator.plugin-vimrc';

const showVimrcEditDialog = async (dialogId: string): Promise<string|null> => {
	await dialogs.setHtml(dialogId, `
		<form name='form'>
			<textarea name='result' id='content'></textarea>
		</form>
	`);
	await dialogs.addScript(dialogId, './dialog/editVimrc.js');
	await dialogs.addScript(dialogId, './dialog/editVimrc.css');
	await dialogs.setButtons(dialogId, [
		{ id: 'ok' },
		{ id: 'cancel' }
	]);
	await dialogs.setFitToContent(dialogId, false);

	await joplin.views.panels.onMessage(dialogId, async (message: VimrcDialogMessage) => {
		if (message.kind === 'get-vimrc') {
			return await getVimrcContent();
		} else {
			throw new Error('Unknown message type.');
		}
	});

	const result = await dialogs.open(dialogId);
	const resultantVimrc = result.formData?.form.result;
	if (resultantVimrc) {
		await setVimrcContent(resultantVimrc);
	}
	return resultantVimrc;
}

joplin.plugins.register({
	onStart: async () => {
		const dialog = await dialogs.create(`${pluginPrefix}jsDrawDialog`);
		const contentScriptId = `${pluginPrefix}.content-script`;
		let messageContentScriptCallback: MessageContentScriptCallback|null = null;
		await joplin.contentScripts.onMessage(contentScriptId, (message: FromContentScriptMessage) => {
			if (message.kind === 'get-vimrc') {
				return getVimrcContent();
			}

			return new Promise(resolve => {
				messageContentScriptCallback = resolve;
			});
		});
		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			contentScriptId,
			'./contentScripts/codeMirrorPlugin.js',
		);


		const editVimrcCommand = `${pluginPrefix}.command-edit-vimrc`;
		await joplin.commands.register({
			name: editVimrcCommand,
			label: 'Edit .vimrc',
			iconName: 'fas fa-file-code',
			execute: async () => {
				const newContent = await showVimrcEditDialog(dialog);
				if (newContent) {
					messageContentScriptCallback?.({
						kind: 'set-vimrc',
						content: newContent,
					});
					messageContentScriptCallback = null;
				}
			}
		});
	},
});
