import joplin from "api";
import path = require('path');

import type FsExtra = require('fs-extra');
const fs = joplin.require('fs-extra') as typeof FsExtra;

const getVimrcPath = async () => {
    const dataDir = await joplin.plugins.dataDir();
    return path.join(dataDir, '.vimrc');
};

const defaultVimrcContent = `
" A .vimrc-like file. At present, very little is supported.
" You can use the commands:
"   inoremap
"   vnoremap
"   nnoremap
"   imap
"   nmap
"   vmap
"   unmap
" Because commands are passed directly to CodeMirror's ViM API,
" insert-mode mappings seem to be unable to insert text.
`;

export const getVimrcContent = async (): Promise<string> => {
    const vimrcPath = await getVimrcPath();
    if (!(await fs.pathExists(vimrcPath))) {
        return defaultVimrcContent;
    }

    return await fs.readFile(vimrcPath, 'utf-8');
};

export const setVimrcContent = async (content: string) => {
    const vimrcPath = await getVimrcPath();
    await fs.writeFile(vimrcPath, content);
};
