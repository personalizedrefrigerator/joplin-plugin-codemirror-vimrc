# joplin-plugin-custom-codemirror-vimrc

Pressing `ctrl+Shift+P` and typing `vimrc` allows editing a very-limited `.vimrc`-like configuration file for CodeMirror's ViM mode.

See the relevant post on the [Joplin forum](https://discourse.joplinapp.org/t/vim-in-multiple-keyboard-layout/27412/6?u=personalizedrefriger).

This is a sample `.vimrc`:
```vim
" A .vimrc-like file. At present, very little is supported.
" You can use the commands:
"   inoremap, vnoremap, nnoremap
"   imap, nmap, vmap
"   unmap
" Because commands are passed directly to CodeMirror's VIM API,
" insert-mode mappings seem to be unable to insert text.
"
" Examples:
" Allow copying/pasting with ctrl+c and ctrl+v when in insert mode.
unmap <C-c>
unmap <C-v>
"
" Map jk to Escape in insert mode:
imap jk <Esc>
```