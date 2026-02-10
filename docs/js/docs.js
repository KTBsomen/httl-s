/* ═══════════════════════════════════════════════════════════
   HTTL-S DOCS — Interactive Functionality
   ═══════════════════════════════════════════════════════════ */

// ── Sidebar Toggle (mobile) ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.docs-sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggle && sidebar && overlay) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
        });
    }

    // Close sidebar on link click (mobile)
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
        a.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                sidebar.classList.remove('open');
                overlay.classList.remove('open');
            }
        });
    });
});

// ── Active Section Tracking ─────────────────────────────────
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            document.querySelectorAll('.sidebar-nav a').forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === '#' + id);
            });
        }
    });
}, { rootMargin: '-10% 0px -85% 0px' });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.doc-section[id]').forEach(s => sectionObserver.observe(s));
});

// ── Search ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('docsSearch');
    if (!input) return;

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        const sections = document.querySelectorAll('.doc-section');

        if (!q) {
            sections.forEach(s => s.classList.remove('search-hidden'));
            return;
        }

        sections.forEach(s => {
            const text = s.textContent.toLowerCase();
            s.classList.toggle('search-hidden', !text.includes(q));
        });
    });
});

// ── Back to Top ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ── Copy Code Button ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.code-block .copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pre = btn.closest('.code-block').querySelector('pre');
            if (!pre) return;
            const text = pre.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const orig = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = orig, 1500);
            });
        });
    });
});

// ── Syntax Highlighting (reused from main site) ─────────────
function hlEsc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightCode(code, lang) {
    if (lang === 'js' || lang === 'javascript') return highlightJSCode(code);
    if (lang === 'html') return highlightHTMLCode(code);
    return hlEsc(code);
}

function highlightJSCode(js) {
    const re = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\$\{[^}]*\})|(\{\{[^}]*\}\})|(\b(?:const|let|var|function|return|if|else|for|while|true|false|null|undefined|new|this|class|import|export|from|of|in|async|await|try|catch|throw)\b)|(=>)|(\b(?:watch|setState|initState|unsafeEval|parseTemplate|renderDataLoops|createRangeArray|parseURL|loader|getType|passValue|document|window|console)\b)|(\b\d+\.?\d*\b)|(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
    let out = '', li = 0, m;
    while ((m = re.exec(js)) !== null) {
        if (m.index > li) out += hlEsc(js.slice(li, m.index));
        if (m[1]) out += '<span class="hl-str">' + hlEsc(m[1]) + '</span>';
        else if (m[2]) out += '<span class="hl-expr">' + hlEsc(m[2]) + '</span>';
        else if (m[3]) out += '<span class="hl-expr">' + hlEsc(m[3]) + '</span>';
        else if (m[4]) out += '<span class="hl-kw">' + hlEsc(m[4]) + '</span>';
        else if (m[5]) out += '<span class="hl-kw">' + hlEsc(m[5]) + '</span>';
        else if (m[6]) out += '<span class="hl-fn">' + hlEsc(m[6]) + '</span>';
        else if (m[7]) out += '<span class="hl-num">' + hlEsc(m[7]) + '</span>';
        else if (m[8]) out += '<span class="hl-cmt">' + hlEsc(m[8]) + '</span>';
        li = re.lastIndex;
    }
    if (li < js.length) out += hlEsc(js.slice(li));
    return out;
}

function highlightHTMLCode(code) {
    const scriptRe = /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi;
    let result = '', lastIdx = 0, sm;
    while ((sm = scriptRe.exec(code)) !== null) {
        result += highlightHTMLOnly(code.slice(lastIdx, sm.index));
        result += '<span class="hl-tag">' + hlEsc(sm[1]) + '</span>';
        result += highlightJSCode(sm[2]);
        result += '<span class="hl-tag">' + hlEsc(sm[3]) + '</span>';
        lastIdx = scriptRe.lastIndex;
    }
    result += highlightHTMLOnly(code.slice(lastIdx));
    return result;

    function highlightHTMLOnly(html) {
        const re = /(<!--[\s\S]*?-->)|(<\/?[\w-]+)|(\/?[>])|(\{\{[^}]*\}\})|(\$\{[^}]*\})|([\w-]+)(=)|("[^"]*"|'[^']*')/g;
        let out = '', li = 0, m;
        while ((m = re.exec(html)) !== null) {
            if (m.index > li) out += hlEsc(html.slice(li, m.index));
            if (m[1]) out += '<span class="hl-cmt">' + hlEsc(m[1]) + '</span>';
            else if (m[2]) out += '<span class="hl-tag">' + hlEsc(m[2]) + '</span>';
            else if (m[3]) out += '<span class="hl-tag">' + hlEsc(m[3]) + '</span>';
            else if (m[4]) out += '<span class="hl-expr">' + hlEsc(m[4]) + '</span>';
            else if (m[5]) out += '<span class="hl-expr">' + hlEsc(m[5]) + '</span>';
            else if (m[6] && m[7]) out += '<span class="hl-attr">' + hlEsc(m[6]) + '</span>' + hlEsc(m[7]);
            else if (m[8]) out += '<span class="hl-str">' + hlEsc(m[8]) + '</span>';
            li = re.lastIndex;
        }
        if (li < html.length) out += hlEsc(html.slice(li));
        return out;
    }
}

// Auto-highlight all code blocks on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.code-block pre code').forEach(block => {
        const lang = block.dataset.lang || 'html';
        block.innerHTML = highlightCode(block.textContent, lang);
    });
});
