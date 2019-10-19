let SessionLoad = 1
let s:so_save = &so | let s:siso_save = &siso | set so=0 siso=0
let v:this_session=expand("<sfile>:p")
silent only
cd ~/srcnode/opcua/myserver
if expand('%') == '' && !&modified && line('$') <= 1 && getline(1) == ''
  let s:wipebuf = bufnr('%')
endif
set shortmess=aoO
badd +1 simple_client_es8.js
badd +27 term://.//10976:/usr/bin/zsh
badd +1 sample_server.js
argglobal
%argdel
edit sample_server.js
set splitbelow splitright
wincmd _ | wincmd |
vsplit
1wincmd h
wincmd w
wincmd _ | wincmd |
split
1wincmd k
wincmd w
set nosplitbelow
set nosplitright
wincmd t
set winminheight=0
set winheight=1
set winminwidth=0
set winwidth=1
exe 'vert 1resize ' . ((&columns * 106 + 102) / 204)
exe '2resize ' . ((&lines * 33 + 27) / 55)
exe 'vert 2resize ' . ((&columns * 97 + 102) / 204)
exe '3resize ' . ((&lines * 18 + 27) / 55)
exe 'vert 3resize ' . ((&columns * 97 + 102) / 204)
argglobal
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let s:l = 1 - ((0 * winheight(0) + 26) / 52)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
1
normal! 0
lcd ~/srcnode/opcua/myserver
wincmd w
argglobal
if bufexists("term://.//10976:/usr/bin/zsh") | buffer term://.//10976:/usr/bin/zsh | else | edit term://.//10976:/usr/bin/zsh | endif
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
let s:l = 33 - ((32 * winheight(0) + 16) / 33)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
33
normal! 0
lcd ~/srcnode/opcua/myserver
wincmd w
argglobal
if bufexists("~/srcnode/opcua/myserver/simple_client_es8.js") | buffer ~/srcnode/opcua/myserver/simple_client_es8.js | else | edit ~/srcnode/opcua/myserver/simple_client_es8.js | endif
setlocal fdm=manual
setlocal fde=0
setlocal fmr={{{,}}}
setlocal fdi=#
setlocal fdl=0
setlocal fml=1
setlocal fdn=20
setlocal fen
silent! normal! zE
let s:l = 1 - ((0 * winheight(0) + 9) / 18)
if s:l < 1 | let s:l = 1 | endif
exe s:l
normal! zt
1
normal! 0
lcd ~/srcnode/opcua/myserver
wincmd w
exe 'vert 1resize ' . ((&columns * 106 + 102) / 204)
exe '2resize ' . ((&lines * 33 + 27) / 55)
exe 'vert 2resize ' . ((&columns * 97 + 102) / 204)
exe '3resize ' . ((&lines * 18 + 27) / 55)
exe 'vert 3resize ' . ((&columns * 97 + 102) / 204)
tabnext 1
if exists('s:wipebuf') && getbufvar(s:wipebuf, '&buftype') isnot# 'terminal'
  silent exe 'bwipe ' . s:wipebuf
endif
unlet! s:wipebuf
set winheight=4 winwidth=25 winminheight=4 winminwidth=25 shortmess=filnxtToOF
let s:sx = expand("<sfile>:p:r")."x.vim"
if file_readable(s:sx)
  exe "source " . fnameescape(s:sx)
endif
let &so = s:so_save | let &siso = s:siso_save
doautoall SessionLoadPost
unlet SessionLoad
" vim: set ft=vim :
