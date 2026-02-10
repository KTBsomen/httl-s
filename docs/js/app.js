/// <reference path="../../statejs.d.ts" />

// ============================================================================
// DATA — All the content arrays rendered by HTTL-S
// ============================================================================

// ── Features (rendered by <for-loop> in #features) ──────────────────────────
watch('features', (n, v) => {
    setState({ loopid: 'featureCards', showloader: false });
}, [
    {
        icon: 'fa-solid fa-repeat',
        colorClass: 'fi-blue',
        title: 'For Loops',
        desc: 'Iterate over arrays directly in HTML with <code>&lt;for-loop&gt;</code>. Supports start, end, step, and custom variable names.'
    },
    {
        icon: 'fa-solid fa-code-branch',
        colorClass: 'fi-green',
        title: 'Conditions',
        desc: 'Full if-else chains with <code>&lt;condition-block&gt;</code>. Supports nested conditions, comparison operators, and truthy checks.'
    },
    {
        icon: 'fa-solid fa-bolt',
        colorClass: 'fi-purple',
        title: 'Reactive State',
        desc: 'Watch variables with <code>watch()</code> and trigger explicit updates with <code>setState()</code>. No hidden magic — you control when the DOM updates.'
    },
    {
        icon: 'fa-solid fa-puzzle-piece',
        colorClass: 'fi-orange',
        title: 'Template Includes',
        desc: 'Import external HTML files as reusable components with <code>&lt;include-template&gt;</code>. Optional Shadow DOM for CSS isolation.'
    },
    {
        icon: 'fa-solid fa-table',
        colorClass: 'fi-cyan',
        title: 'Data Loops',
        desc: 'Render table rows with <code>data-loop</code> attribute — works inside <code>&lt;tbody&gt;</code> where custom elements cannot go.'
    },
    {
        icon: 'fa-solid fa-feather',
        colorClass: 'fi-red',
        title: 'No Build Step',
        desc: 'Include via CDN and start building. No npm install, no webpack, no bundler config. Just HTML and a <code>&lt;script&gt;</code> tag.'
    }
]);

// ── Positioning (rendered by <for-loop>) ────────────────────────────────────
watch('isItems', (n, v) => {
    setState({ loopid: 'isList', showloader: false });
}, [
    'Declarative HTML templating engine',
    'Client-side rendering helper',
    'CDN-first, zero-config library',
    'Explicit reactivity with setState()',
    'Works with any backend or static host'
]);

watch('isNotItems', (n, v) => {
    setState({ loopid: 'isNotList', showloader: false });
}, [
    'A framework replacement (React, Vue, etc.)',
    'Virtual DOM implementation',
    'Build tool or compiler',
    'Signal-based automatic reactivity',
    'Safe for untrusted user-generated HTML'
]);

// ── Good For / Not For (rendered by <for-loop>) ─────────────────────────────
watch('goodFor', (n, v) => {
    setState({ loopid: 'goodForList', showloader: false });
}, [
    'Prototypes and quick demos',
    'Internal tools and dashboards',
    'Static sites needing dynamic UI',
    'Vanilla JavaScript projects',
    'Learning templating concepts',
    'Server-rendered pages with client interactivity'
]);

watch('notFor', (n, v) => {
    setState({ loopid: 'notForList', showloader: false });
}, [
    'Strict CSP environments',
    'Heavy single-page applications',
    'Untrusted user-generated HTML',
    'Applications requiring virtual DOM diffing'
]);

// ── API Reference (rendered by data-loop table) ─────────────────────────────
watch('apiMethods', (n, v) => {
    setState({ dataloops: true, showloader: false, loops: false, conditions: false });
}, [
    { name: 'watch(name, cb, init)', desc: 'Create a reactive global variable', example: "watch('count', cb, 0)" },
    { name: 'setState(options)', desc: 'Trigger UI re-render for components', example: "setState({ loops: true })" },
    { name: 'initState()', desc: 'Initialize all custom elements', example: 'initState()' },
    { name: 'unsafeEval(expr, ctx)', desc: 'Evaluate a JS expression with context', example: "unsafeEval('a+b', {a:1,b:2})" },
    { name: 'parseTemplate(str)', desc: 'Parse {{expression}} placeholders', example: "parseTemplate('Hi {{name}}')" },
    { name: 'createRangeArray(s, e, n)', desc: 'Create an array of numbers', example: 'createRangeArray(1, 5)' },
    { name: 'renderDataLoops()', desc: 'Manually render all data-loop elements', example: 'renderDataLoops()' },
    { name: 'parseURL(url?, global?)', desc: 'Parse URL and extract query params', example: 'parseURL()' },
    { name: 'loader.show() / .hide()', desc: 'Show or hide loading spinner', example: 'loader.show()' }
]);

// ── HTML Elements table (rendered by data-loop) ─────────────────────────────
watch('htmlElements', (n, v) => {
    setState({ dataloops: true, showloader: false, loops: false, conditions: false });
}, [
    { tag: '<code>&lt;for-loop&gt;</code>', purpose: 'Iterate over an array and render HTML for each item', attr: 'array, loopid' },
    { tag: '<code>&lt;condition-block&gt;</code>', purpose: 'Container for if-else conditional rendering', attr: 'ifid' },
    { tag: '<code>&lt;if-condition&gt;</code>', purpose: 'Evaluates a condition (used inside condition-block)', attr: 'value, eq/neq/gt/lt' },
    { tag: '<code>&lt;else-condition&gt;</code>', purpose: 'Fallback content when if-condition is false', attr: 'elseid' },
    { tag: '<code>&lt;state-element&gt;</code>', purpose: 'Simple reactive display that re-renders on setState', attr: 'stateId' },
    { tag: '<code>&lt;include-template&gt;</code>', purpose: 'Import external HTML file as a reusable component', attr: 'file, scoped' },
    { tag: '<code>[data-loop]</code>', purpose: 'Attribute-based loop for table rows and restricted contexts', attr: 'data-loop, data-template' },
    { tag: '<code>[data-innerhtml]</code>', purpose: 'Set element innerHTML to an evaluated expression', attr: 'data-innerhtml' },
    { tag: '<code>[data-js]</code>', purpose: 'Execute JavaScript on each setState call', attr: 'data-js' }
]);

// ── Comparison table (rendered by data-loop) ────────────────────────────────
const yes = '<i class="fa-solid fa-check cmp-yes"></i>';
const no = '<i class="fa-solid fa-xmark cmp-no"></i>';
const partial = '<i class="fa-solid fa-minus cmp-partial"></i>';

watch('comparisonData', (n, v) => {
    setState({ dataloops: true, showloader: false, loops: false, conditions: false });
}, [
    { feature: 'No build step', httls: yes, alpine: yes, vue: partial, react: no },
    { feature: 'CDN-first', httls: yes, alpine: yes, vue: partial, react: no },
    { feature: 'Declarative loops', httls: yes, alpine: yes, vue: yes, react: yes },
    { feature: 'Table row loops', httls: yes, alpine: no, vue: yes, react: yes },
    { feature: 'Nested conditions', httls: yes, alpine: yes, vue: yes, react: yes },
    { feature: 'Component system', httls: yes, alpine: no, vue: yes, react: yes },
    { feature: 'Shadow DOM scoping', httls: yes, alpine: no, vue: partial, react: no },
    { feature: 'Strict CSP support', httls: no, alpine: yes, vue: yes, react: yes },
    { feature: 'Virtual DOM', httls: no, alpine: no, vue: yes, react: yes },
    // { feature: 'Bundle size', httls: '~38 KB', alpine: '~15 KB', vue: '~33 KB', react: '~42 KB' }
]);

// ── Hero counter (rendered by <state-element>) ──────────────────────────────
watch('clickCount', (n, v) => {
    setState({ stateId: 'heroCounter', showloader: false });
}, 0);
initState();
// ============================================================================
// UTILITIES
// ============================================================================

// Copy text content from a code block
function copyCode(btn, preId) {
    const pre = document.getElementById(preId);
    if (!pre) return;
    const text = pre.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        btn.style.color = 'var(--green)';
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.color = '';
        }, 1500);
    });
}

// ── Playground ──────────────────────────────────────────────────────────────
function runPlayground() {
    const input = document.getElementById('playgroundInput').value;
    const output = document.getElementById('playgroundOutput');

    // Create a sandboxed iframe to run HTTL-S code
    output.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:none;background:#0f1117;';
    iframe.sandbox = 'allow-scripts allow-same-origin';
    output.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #e8eaf0;
          background: #0f1117;
          padding: 1rem;
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
        }
        p { margin: .25rem 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: .5rem; border: 1px solid #252836; text-align: left; }
        th { background: #161922; color: #9298a8; }
      </style>
      <script src="https://cdn.jsdelivr.net/gh/KTBsomen/httl-s@main/statejs.js"><\/script>
    </head>
    <body>
      ${input}
    </body>
    </html>
  `);
    doc.close();
}

function clearPlayground() {
    const output = document.getElementById('playgroundOutput');
    output.innerHTML = '<p style="color:var(--text-muted);">Click <strong>Run</strong> to see output.</p>';
}

// ── Regex-based syntax highlighting (single-pass tokenizer) ─────────────────
function highlightHTML(code) {
    // Escape for safe HTML insertion
    function esc(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // JS-specific highlighting — single-pass tokenizer (avoids span self-corruption)
    function highlightJS(js) {
        const jsTokenRe = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\$\{[^}]*\})|(\{\{[^}]*\}\})|(\b(?:const|let|var|function|return|if|else|for|while|true|false|null|undefined|new|this|class|import|export|from|of|in|async|await)\b)|(=>)|(\b(?:watch|setState|initState|unsafeEval|parseTemplate|renderDataLoops|createRangeArray|parseURL|push)\b)|(\b\d+\b)/g;
        let out = '';
        let li = 0;
        let m;
        while ((m = jsTokenRe.exec(js)) !== null) {
            if (m.index > li) out += esc(js.slice(li, m.index));
            if (m[1]) out += '<span class="hl-str">' + esc(m[1]) + '</span>';
            else if (m[2]) out += '<span class="hl-expr">' + esc(m[2]) + '</span>';
            else if (m[3]) out += '<span class="hl-expr">' + esc(m[3]) + '</span>';
            else if (m[4]) out += '<span class="hl-kw">' + esc(m[4]) + '</span>';
            else if (m[5]) out += '<span class="hl-kw">' + esc(m[5]) + '</span>';
            else if (m[6]) out += '<span class="hl-fn">' + esc(m[6]) + '</span>';
            else if (m[7]) out += '<span class="hl-num">' + esc(m[7]) + '</span>';
            li = jsTokenRe.lastIndex;
        }
        if (li < js.length) out += esc(js.slice(li));
        return out;
    }

    // Single-pass: split the code into HTML regions and <script> regions
    // Process <script> blocks separately with JS highlighting
    const scriptRe = /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi;
    let result = '';
    let lastIdx = 0;
    let sm;

    while ((sm = scriptRe.exec(code)) !== null) {
        // Highlight the HTML part before this script block
        result += highlightHTMLOnly(code.slice(lastIdx, sm.index));
        // Highlight the script open tag, JS content, and close tag
        result += '<span class="hl-tag">' + esc(sm[1]) + '</span>';
        result += highlightJS(sm[2]);
        result += '<span class="hl-tag">' + esc(sm[3]) + '</span>';
        lastIdx = scriptRe.lastIndex;
    }
    // Highlight remaining HTML after last script block
    result += highlightHTMLOnly(code.slice(lastIdx));

    return result;

    // Highlights pure HTML (no script blocks)
    function highlightHTMLOnly(html) {
        // Regex for HTML tokens: comment, tag, close bracket, attr=, string, ${}, {{}}
        const re = /(<!--[\s\S]*?-->)|(<\/?[\w-]+)|(\/?[>\/>])|([\w-]+)(=)|("[^"]*"|'[^']*')|(\$\{[^}]*\})|(\{\{[^}]*\}\})/g;
        let out = '';
        let li = 0;
        let m;
        while ((m = re.exec(html)) !== null) {
            // Plain text gap
            if (m.index > li) out += esc(html.slice(li, m.index));

            if (m[1]) out += '<span class="hl-cmt">' + esc(m[1]) + '</span>';
            else if (m[2]) out += '<span class="hl-tag">' + esc(m[2]) + '</span>';
            else if (m[3]) out += '<span class="hl-tag">' + esc(m[3]) + '</span>';
            else if (m[4] && m[5]) out += '<span class="hl-attr">' + esc(m[4]) + '</span>' + esc(m[5]);
            else if (m[6]) out += '<span class="hl-str">' + esc(m[6]) + '</span>';
            else if (m[7]) out += '<span class="hl-expr">' + esc(m[7]) + '</span>';
            else if (m[8]) out += '<span class="hl-expr">' + esc(m[8]) + '</span>';

            li = re.lastIndex;
        }
        if (li < html.length) out += esc(html.slice(li));
        return out;
    }
}

function updateHighlight() {
    const textarea = document.getElementById('playgroundInput');
    const highlight = document.getElementById('editorHighlight');
    if (!textarea || !highlight) return;
    highlight.innerHTML = highlightHTML(textarea.value) + '\n';
}

function syncScroll() {
    const textarea = document.getElementById('playgroundInput');
    const highlight = document.querySelector('.editor-highlight');
    if (!textarea || !highlight) return;
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
}



// ============================================================================
// INITIALIZE HTTL-S — must be after all watchers are registered
// ============================================================================

updateHighlight();
