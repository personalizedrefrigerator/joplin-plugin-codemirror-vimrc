
interface GetVimrcMessage {
	kind: 'get-vimrc';
}

interface UpdateVimrcMessage {
	kind: 'set-vimrc';
	content: string;
}

type VimrcDialogMessage = GetVimrcMessage;

interface SetContentScriptMessageCallback {
	kind: 'set-callback',
}

type ToContentScriptMessage = UpdateVimrcMessage;
type FromContentScriptMessage = GetVimrcMessage | SetContentScriptMessageCallback;
type MessageContentScriptCallback = (message: ToContentScriptMessage)=>void;