#!/usr/bin/env python3
import base64
import collections
import os.path
import re
import urllib.request

import rcssmin
import rjsmin


NEWLINE = '\n'


combined_script = '''
// MIT License, threejs.org, html2canvas.hertzen.com, github.com/stefanpenner/es6-promise, codepen.io/team/nclud/pen/MwaGGE, codepen.io/lbebber/pen/XJRdrV
// SIL OPEN FONT LICENSE, terminus
// EULA, norfok.com
'''.strip().splitlines()
combined_style = []

with open(os.path.join(os.path.dirname(__file__), 'pwned.js'), 'r') as f:
    pwned = collections.deque(f)

pwn = []

while pwned:
    line = pwned.popleft()

    if line.strip() == '//! BEGIN LOADER':
        break

    pwn.append(line)

scripts = []
style_lines = []

entrypoint = None

while pwned:
    line = pwned.popleft()

    if line.strip() == 'loadScripts([':
        while pwned and not line.strip().startswith(']'):
            line = pwned.popleft()
            if not line.strip():
                continue

            match = re.fullmatch(r'^[\'"]([^\'"]*)[\'"],?$', line.strip())
            if not match:
                break

            scripts.append(match[1])
    elif line.strip() == 'insertStyle([':
        while pwned and not line.strip().startswith(']'):
            line = pwned.popleft()
            if not line.strip():
                continue

            match = re.fullmatch(r'^\'([^\']*)\',?$', line.strip())
            if not match:
                break

            style_lines.append(match[1])
    else:
        match = re.fullmatch(r'^(\w+\(.*\));?$', line.strip())
        if match and match[1] != 'load()':
            entrypoint = match[1]

# combine styles
for idx, line in enumerate(style_lines[:]):
    match = re.search(r'url\("([^"]*)"\)', line)
    if match:
        with urllib.request.urlopen(match[1]) as conn:
            content_type = conn.getheader('content-type')
            if not content_type:
                content_type = 'font/woff2'
            content = conn.read()
            style_lines[idx] = re.sub(r'url\("[^"]*"\)', f'url(data:{content_type};base64,{base64.b64encode(content).decode()})', line)

combined_style.extend(rcssmin.cssmin(NEWLINE.join(style_lines)).split(NEWLINE))

# combine scripts
for url in scripts:
    with urllib.request.urlopen(url) as conn:
        combined_script.extend(rjsmin.jsmin(conn.read().decode()).split(NEWLINE))

combined_script.extend(rjsmin.jsmin(NEWLINE.join(pwn)).split(NEWLINE))

combined_script.extend(rjsmin.jsmin(f'''
var pwnstyle = document.createElement("style");
pwnstyle.innerHTML = {repr(NEWLINE.join(combined_style))};
document.head.append(pwnstyle);
''').split(NEWLINE))

combined_script.append(f'{entrypoint}')

# output combined script
with open(os.path.join(os.path.dirname(__file__), 'pwned.combined.js'), 'w') as f:
    for line in combined_script:
        f.write(line)
        f.write(NEWLINE)
