
declare const webviewApi: {
    postMessage: (message: VimrcDialogMessage)=>Promise<string|undefined>;
};

const main = async () => {
    const textarea: HTMLTextAreaElement = document.querySelector('textarea#content');
    const initialValue = await webviewApi.postMessage({
        kind: 'get-vimrc',
    });
    textarea.value = initialValue;
};

main();