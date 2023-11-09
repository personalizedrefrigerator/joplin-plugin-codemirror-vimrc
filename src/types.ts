
interface GetVimrcMessage {
	kind: 'get-vimrc';
}

interface UpdateVimrcMessage {
	kind: 'set-vimrc';
	content: string;
}

interface LogErrorMessage {
	kind: 'log-error';
	errorMessage: string;
}

type VimrcDialogMessage = GetVimrcMessage;

interface SetContentScriptMessageCallback {
	kind: 'set-callback',
}

type ToContentScriptMessage = UpdateVimrcMessage;
type FromContentScriptMessage = GetVimrcMessage | SetContentScriptMessageCallback | LogErrorMessage;
type MessageContentScriptCallback = (message: ToContentScriptMessage)=>void;