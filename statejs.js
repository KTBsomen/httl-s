/*!
 * HTTL-S — HyperText Templating Language (Simple)
 *
 * Copyright © 2026 Somen Das
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// ============================================================================
// LOADER MODULE
// ============================================================================

/**
 * Loading spinner utility object
 * @typedef {Object} Loader
 * @property {function(string=): void} show - Display loading spinner
 * @property {function(): void} hide - Remove loading spinner
 */

/** @type {Loader} */
const loader = {
    /**
     * Shows a loading spinner on the page
     * @param {string|null} customHtml - Optional custom HTML for the spinner
     */
    show: function (customHtml = null) {
        if (document.querySelector('.httl-loader-overlay')) return; // Already showing

        this._addStyles();
        const loaderHtml = customHtml || '<div class="httl-spinner"></div>';

        const overlay = document.createElement('div');
        overlay.className = 'httl-loader-overlay';
        overlay.innerHTML = `<div class="httl-loader-content">${loaderHtml}</div>`;
        document.body.appendChild(overlay);
    },

    /**
     * Hides and removes the loading spinner
     */
    hide: function () {
        const overlay = document.querySelector('.httl-loader-overlay');
        if (overlay) overlay.remove();
    },

    _addStyles: function () {
        if (document.getElementById('httl-loader-styles')) return;

        const style = document.createElement('style');
        style.id = 'httl-loader-styles';
        style.textContent = `
            .httl-loader-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255,255,255,0.7); backdrop-filter: blur(3px);
                z-index: 9999; display: flex; align-items: center; justify-content: center;
            }
            .httl-loader-content { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .httl-spinner {
                width: 40px; height: 40px; border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db; border-radius: 50%;
                animation: httl-spin 1s linear infinite;
            }
            @keyframes httl-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }
};

// ============================================================================
// STATE WATCHING
// ============================================================================

/** @type {WeakSet<Function>} Tracks callbacks already scheduled for this tick */
const scheduledCallbacks = new WeakSet();

/** @type {WeakMap<Object, WeakMap<Function, Proxy>>} Cache for proxies per target+callback */
const proxyCache = new WeakMap();

/** @type {Function|null} Currently executing watcher callback (for self-mutation detection) */
let activeWatcher = null;

/**
 * Schedules a callback to run once per microtask tick (batching)
 * This prevents callback storms when multiple mutations happen in sequence
 * @param {Function} cb - Callback to schedule
 */
function scheduleCallback(cb) {
    if (scheduledCallbacks.has(cb)) return; // Already scheduled for this tick
    scheduledCallbacks.add(cb);

    queueMicrotask(() => {
        scheduledCallbacks.delete(cb);
        activeWatcher = cb;
        try {
            cb();
        } finally {
            activeWatcher = null;
        }
    });
}

/** @type {Set<string>} Set of watched variable names (for duplicate protection) */
const watchedVars = new Set();

/**
 * Creates a deep proxy that watches for nested property changes
 * @param {*} target - The object/array to watch
 * @param {function} callback - Function to call on any change (MUST be stable identity with __watchedProp)
 * @returns {Proxy} Proxied version of the target
 */
function createDeepProxy(target, callback) {
    if (typeof target !== 'object' || target === null) {
        return target;
    }
    if (typeof callback !== 'function') {
        throw new TypeError(
            `HTTL-S watch(): Second parameter must be a function, got ${typeof callback}. ` +
            `Did you accidentally call the function? Use like "watch('varName', ()=>setState())" not "watch('varName', setState())"`
        );
    }

    // Check if we already have a proxy for this target+callback combo
    let callbackMap = proxyCache.get(target);
    if (callbackMap && callbackMap.has(callback)) {
        return callbackMap.get(callback);
    }

    const proxy = new Proxy(target, {
        get(obj, prop, receiver) {
            const value = Reflect.get(obj, prop, receiver);
            // Recursively proxy nested objects/arrays (with caching)
            if (typeof value === 'object' && value !== null) {
                return createDeepProxy(value, callback);
            }
            return value;
        },
        set(obj, prop, value, receiver) {
            // Detect self-mutation: watcher trying to mutate its own state
            if (activeWatcher === callback) {
                throw new Error(
                    `HTTL-S Error: Watcher for "${callback.__watchedProp}" mutated its own state.\n` +
                    `This causes infinite loops. Move mutations outside the watcher callback.`
                );
            }

            // Ignore array 'length' changes - they're noise from push/pop/etc
            if (Array.isArray(obj) && prop === 'length') {
                return Reflect.set(obj, prop, value, receiver);
            }
            const result = Reflect.set(obj, prop, value, receiver);
            scheduleCallback(callback); // Batched callback - fires ONCE per tick
            return result;
        },
        deleteProperty(obj, prop) {
            // Detect self-mutation on delete too
            if (activeWatcher === callback) {
                throw new Error(
                    `HTTL-S Error: Watcher for "${callback.__watchedProp}" mutated its own state.\n` +
                    `This causes infinite loops. Move mutations outside the watcher callback.`
                );
            }

            const result = Reflect.deleteProperty(obj, prop);
            scheduleCallback(callback); // Batched callback
            return result;
        }
    });

    // Store in cache with target -> callback -> proxy structure
    if (!callbackMap) {
        callbackMap = new WeakMap();
        proxyCache.set(target, callbackMap);
    }
    callbackMap.set(callback, proxy);
    return proxy;
}

/**
 * Creates a watched global variable that triggers a callback on value changes
 * @param {string} propName - The name of the global variable to create
 * @param {function(string, *): void} cb - Callback function(propName, newValue)
 * @param {*} [defaultValue=undefined] - Initial value for the variable
 */
function watch(propName, cb, defaultValue = undefined) {
    if (typeof cb !== 'function') {
        throw new TypeError(
            `HTTL-S watch(): Second parameter must be a function, got ${typeof cb}. ` +
            `Did you accidentally call the function? Use like "watch('varName', ()=>setState())" not "watch('varName', setState())"`
        );
    }

    if (propName in window) {
        console.warn(`HTTL-S: "${propName}" already exists on window`);
    }

    let _value;

    // ✅ STABLE callback identity - same function reference for all mutations
    const trigger = () => cb(propName, _value);
    // Tag trigger with property name for error messages
    trigger.__watchedProp = propName;

    // Wrap objects/arrays in proxy for deep watching
    if (typeof defaultValue === 'object' && defaultValue !== null) {
        _value = createDeepProxy(defaultValue, trigger);
    } else {
        _value = defaultValue;
    }

    Object.defineProperty(window, propName, {
        get() { return _value; },
        set(value) {
            // Detect self-mutation on root assignment
            if (activeWatcher === trigger) {
                throw new Error(
                    `HTTL-S Error: Watcher for "${propName}" mutated its own state.\n` +
                    `This causes infinite loops. Move mutations outside the watcher callback.`
                );
            }

            // Wrap new objects/arrays in proxy too
            if (typeof value === 'object' && value !== null) {
                _value = createDeepProxy(value, trigger);
            } else {
                _value = value;
            }
            scheduleCallback(trigger); // Use scheduled trigger, not direct call
        },
        configurable: true,
        enumerable: true
    });

    watchedVars.add(propName);
}
// ============================================================================
// EXPRESSION EVALUATION HELPERS
// ============================================================================

/**
 * Safely evaluates a JavaScript expression
 * @param {string} expression - Expression to evaluate
 * @param {Object} context - Optional context variables
 * @returns {*} Result of evaluation
 */
function unsafeEval(expression, context = {}) {
    try {
        // Create context variables in local scope
        const keys = Object.keys(context);
        const values = Object.values(context);
        // Add all global watched vars to context
        for (const varName of watchedVars) {
            if (!(varName in context) && varName in window) {
                keys.push(varName);
                values.push(window[varName]);
            }
        }
        const fn = new Function(...keys, `return (${expression})`);
        return fn(...values);
    } catch (e) {
        console.error('unsafeEval error:', expression, e);
        return undefined;
    }
}

/**
 * Parses JavaScript expressions inside {{}} in a template string
 * @param {string} template - Template string containing {{expression}} placeholders
 * @returns {string} Parsed template with expressions evaluated
 */
function parseTemplate(template) {
    return template.replace(/\{\{([\s\S]*?)\}\}/g, function (match, expression) {
        try {
            const result = unsafeEval(expression.trim());
            if (result !== undefined && result !== null) {
                return String(result);
            }
            return '';
        } catch (error) {
            console.error('Template parse error:', expression, error);
            return match;
        }
    });
}

/**
 * Creates an array of numbers from start to end with given step
 * @param {number} start - Starting number
 * @param {number} end - Ending number (inclusive)
 * @param {number} [step=1] - Step increment
 * @returns {number[]} Array of numbers
 */
function createRangeArray(start, end, step = 1) {
    const result = [];
    if (step > 0) {
        for (let i = start; i <= end; i += step) result.push(i);
    } else if (step < 0) {
        for (let i = start; i >= end; i += step) result.push(i);
    }
    return result;
}

// ============================================================================
// FOR-LOOP CUSTOM ELEMENT
// ============================================================================

/**
 * Custom element for rendering loops in HTML
 * @extends HTMLElement
 */
class CustomForLoop extends HTMLElement {
    constructor() {
        super();
        this._originalTemplate = null;
    }

    connectedCallback() {
        this.style.display = 'contents';
        this._storeTemplate();
        this.render();
    }

    _storeTemplate() {
        if (this._originalTemplate) return;
        const loopId = this.getAttribute('loopid');
        const template = this.querySelector(`template[loopid="${loopId}"]`);
        if (template) {
            this._originalTemplate = template.innerHTML;
        }
    }

    render() {
        try {
            const loopId = this.getAttribute('loopid');
            if (!loopId) throw new Error('for-loop requires "loopid" attribute');

            // Get or restore template
            this._storeTemplate();
            if (!this._originalTemplate) {
                this.innerHTML = '❌ for-loop: Missing template with matching loopid';
                return;
            }

            // Evaluate array attribute
            let array = [];
            const arrayAttr = this.getAttribute('array');
            if (arrayAttr) {
                try { array = unsafeEval(arrayAttr) || []; } catch (e) { array = []; }
            }

            const start = parseInt(this.getAttribute('start')) || 0;
            const step = parseInt(this.getAttribute('step')) || 1;
            let end = this.getAttribute('end');

            if (end !== null) {
                try { end = unsafeEval(end); } catch (e) { end = parseInt(end) || array.length; }
            } else {
                end = array.length;
            }

            const valueVar = this.getAttribute('valueVar') || 'value';
            const indexVar = this.getAttribute('indexVar') || 'index';

            // Create range if no array
            if (array.length === 0 && end > start) {
                array = createRangeArray(start, end - 1, step);
            }

            // Build output HTML
            const pattern = /\$\{([\s\S]*?)\}/g;
            let outputHtml = '';

            for (let i = start; i < Math.min(end, array.length); i += step) {
                const loopValue = array[i];
                const loopIndex = i;

                // Replace variable references in template
                let iterHtml = this._originalTemplate
                    .replace(new RegExp(`\\b${valueVar}\\b`, 'g'), '__loopValue__')
                    .replace(new RegExp(`\\b${indexVar}\\b`, 'g'), '__loopIndex__');

                // Evaluate ${} expressions
                iterHtml = iterHtml.replace(pattern, (match, expr) => {
                    try {
                        // Replace placeholders for eval
                        const evalExpr = expr
                            .replace(/__loopValue__/g, 'loopValue')
                            .replace(/__loopIndex__/g, 'loopIndex');
                        const result = unsafeEval(evalExpr, { loopValue, loopIndex });
                        return result !== undefined && result !== null ? String(result) : '';
                    } catch (e) {
                        console.error('Loop expression error:', expr, e);
                        return match;
                    }
                });

                outputHtml += iterHtml;
            }

            // Preserve template and update content
            const templateCopy = `<template loopid="${loopId}">${this._originalTemplate}</template>`;
            this.innerHTML = parseTemplate(outputHtml) + templateCopy;

        } catch (error) {
            console.error('for-loop error:', error);
            this.innerHTML = `❌ for-loop Error: ${error.message}`;
        }
    }

    rerender() { this.render(); }
}

// ============================================================================
// DATA-LOOP - For tables and special contexts
// Uses data attributes instead of child template to work in restricted contexts
// ============================================================================

/**
 * Renders a loop by targeting an external template
 * Usage: <div data-loop="myArray" data-template="#myTemplate" data-value="item" data-index="i"></div>
 */
function renderDataLoops() {
    document.querySelectorAll('[data-loop]').forEach(container => {
        try {
            const arrayName = container.dataset.loop;
            const templateSelector = container.dataset.template;
            const valueVar = container.dataset.value || 'value';
            const indexVar = container.dataset.index || 'index';

            if (!templateSelector) {
                console.error('data-loop requires data-template attribute');
                return;
            }

            const template = document.querySelector(templateSelector);
            if (!template) {
                console.error('Template not found:', templateSelector);
                return;
            }

            let array = [];
            try { array = unsafeEval(arrayName) || []; } catch (e) { return; }

            const pattern = /\$\{([\s\S]*?)\}/g;
            let outputHtml = '';

            for (let i = 0; i < array.length; i++) {
                const loopValue = array[i];
                const loopIndex = i;

                let iterHtml = template.innerHTML
                    .replace(new RegExp(`\\b${valueVar}\\b`, 'g'), 'loopValue')
                    .replace(new RegExp(`\\b${indexVar}\\b`, 'g'), 'loopIndex');

                iterHtml = iterHtml.replace(pattern, (match, expr) => {
                    try {
                        const result = unsafeEval(expr, { loopValue, loopIndex });
                        return result !== undefined && result !== null ? String(result) : '';
                    } catch (e) {
                        return match;
                    }
                });

                outputHtml += iterHtml;
            }

            container.innerHTML = parseTemplate(outputHtml);
        } catch (e) {
            console.error('data-loop error:', e);
        }
    });
}

// ============================================================================
// SET STATE - UI Update Function
// ============================================================================

/**
 * Updates UI state by re-rendering specified components
 * @param {Object} options - Update options
 * @param {string} options.loopid - ID of the for-loop to update
 * @param {string} options.ifid - ID of the if-condition to update
 * @param {boolean} options.showloader - Whether to show the loader
 * @param {boolean} options.datajs - Whether to update data-js
 * @param {boolean} options.innerhtml - Whether to update innerhtml
 * @param {boolean} options.loops - Whether to update loops
 * @param {boolean} options.dataloops - Whether to update data-loops
 * @param {boolean} options.templates - Whether to update templates
 * @param {boolean} options.conditions - Whether to update conditions
 */
function setState({
    loopid = false,
    stateId = false,
    ifid = false,
    states = false,
    showloader = true,
    datajs = true,
    innerhtml = true,
    loops = true,
    dataloops = true,
    templates = false,
    conditions = true
} = {}) {
    try {
        if (showloader) loader.show();

        // Update specific loop by ID (if provided)
        if (loopid) {
            document.querySelectorAll(`for-loop[loopid="${loopid}"]`).forEach(el => el.render && el.render());
        }

        // Update specific condition by ID (if provided)
        if (ifid) {
            document.querySelectorAll(`condition-block[ifid="${ifid}"]`).forEach(el => el.render && el.render());
        }

        // Update specific state element by ID (if provided)
        if (stateId) {
            document.querySelectorAll(`state-element[stateId="${stateId}"]`).forEach(el => el.render && el.render());
        }
        // Process data-js attributes
        if (datajs) {
            document.querySelectorAll('[data-js]').forEach(element => {
                try {
                    const code = element.dataset.js.replace(/\bthis\b/g, 'element');
                    unsafeEval(code, { element });
                } catch (e) { console.error('data-js error:', e); }
            });
        }

        // Process data-innerhtml attributes
        if (innerhtml) {
            document.querySelectorAll('[data-innerhtml]').forEach(element => {
                try {
                    let content = unsafeEval(element.dataset.innerhtml);
                    if (content !== undefined && content !== null) {
                        content = String(content).replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                        element.innerHTML = content;
                    }
                } catch (e) { console.error('data-innerhtml error:', e); }
            });
        }

        // Update all for-loops
        if (loops) {
            document.querySelectorAll('for-loop').forEach(el => el.render && el.render());
        }

        // Update data-loop elements
        if (dataloops) {
            renderDataLoops();
        }

        // Update all templates
        if (templates) {
            document.querySelectorAll('include-template').forEach(el => el.render && el.render());
        }

        // Update all conditions
        if (conditions) {
            document.querySelectorAll('condition-block').forEach(el => el.render && el.render());
        }
        // Update all states
        if (states) {
            document.querySelectorAll('state-element').forEach(el => el.render && el.render());
        }

        if (showloader) loader.hide();

    } catch (error) {
        if (showloader) loader.hide();
        console.error('setState error:', error);
    }
};

// ============================================================================
// URL UTILITIES
// ============================================================================

function convertRelativeToAbsolute(htmlString, baseUrl) {
    return htmlString.replace(/(?:src|href)=["'](\.\/?[^"']+)["']/g, function (match, url) {
        try {
            return match.replace(url, new URL(url, baseUrl).href);
        } catch (e) { return match; }
    });
}

function extractDirectory(relativeUrl) {
    const anchor = document.createElement('a');
    anchor.href = relativeUrl;
    return anchor.pathname.substring(0, anchor.pathname.lastIndexOf('/'));
}

// ============================================================================
// INCLUDE TEMPLATE CUSTOM ELEMENT
// ============================================================================

class IncludeTemplate extends HTMLElement {
    constructor() {
        super();
        this._shadowRoot = null;
    }

    connectedCallback() {
        this.style.display = 'contents';
        this.render();
    }

    async render() {
        try {
            const file = this.getAttribute('file');
            if (!file) { this.innerHTML = '❌ include-template requires "file" attribute'; return; }

            // Check if scoped mode (default: true for CSS isolation)
            const scoped = this.getAttribute('scoped') !== 'false';

            loader.show();
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to load ${file}: ${response.status}`);

            let html = await response.text();
            const dir = extractDirectory(file);
            const anchor = document.createElement('a');
            anchor.href = dir;
            html = convertRelativeToAbsolute(html, anchor.href + '/');
            html = parseTemplate(html);

            if (scoped) {
                // Use Shadow DOM for CSS isolation
                if (!this._shadowRoot) {
                    this._shadowRoot = this.attachShadow({ mode: 'open' });
                }
                this._shadowRoot.innerHTML = html;

                // Execute scripts in shadow DOM context
                this._shadowRoot.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                    } else {
                        // Wrap script content to execute in component context
                        newScript.textContent = oldScript.textContent;
                    }
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            } else {
                // No scoping - global styles (legacy behavior)
                this.innerHTML = html;

                // Execute scripts
                this.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    if (oldScript.src) newScript.src = oldScript.src;
                    else newScript.textContent = oldScript.textContent;
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            }

            loader.hide();
        } catch (error) {
            console.error('include-template error:', error);
            this.innerHTML = `❌ Error: ${error.message}`;
            loader.hide();
        }
    }

    rerender() { this.render(); }
}

// ============================================================================
// CONDITION BLOCK - RECURSIVE PROCESSING
// ============================================================================

class ConditionBlock extends HTMLElement {
    constructor() {
        super();
        this._originalTemplate = null;
    }

    connectedCallback() {
        this.style.display = 'contents';
        this._storeTemplate();
        this.render();
    }

    _storeTemplate() {
        if (this._originalTemplate) return;
        const ifid = this.getAttribute('ifid');
        const template = this.querySelector(`template[ifid="${ifid}"]`);
        if (template) {
            this._originalTemplate = template.innerHTML;
        }
    }

    render() {
        try {
            const ifid = this.getAttribute('ifid');
            if (!ifid) throw new Error('condition-block requires "ifid" attribute');

            this._storeTemplate();
            if (!this._originalTemplate) {
                this.innerHTML = '❌ condition-block requires template with matching ifid';
                return;
            }

            // Parse template with {{}} expressions first
            let html = parseTemplate(this._originalTemplate);

            // Process all conditions recursively
            html = this._processConditionsRecursive(html);

            // Preserve template
            const templateCopy = `<template ifid="${ifid}">${this._originalTemplate}</template>`;
            this.innerHTML = html + templateCopy;

        } catch (error) {
            console.error('condition-block error:', error);
            this.innerHTML = `❌ condition-block Error: ${error.message}`;
        }
    }

    /**
     * Recursively process if-condition and else-condition elements
     * @param {string} html - HTML string to process
     * @returns {string} Processed HTML
     */
    _processConditionsRecursive(html) {
        // Create a temporary container
        const container = document.createElement('div');
        container.innerHTML = html;

        // Keep processing until no more if-condition elements exist
        let maxIterations = 100; // Prevent infinite loops
        while (container.querySelector('if-condition') && maxIterations-- > 0) {
            // Get all if-conditions at current level (not nested ones that might be inside unprocessed else)
            const ifElements = container.querySelectorAll('if-condition');

            for (const ifEl of ifElements) {
                // Skip if this if-condition is inside an unprocessed else-condition sibling
                // (it will be processed when that else is resolved)
                const parentElse = ifEl.closest('else-condition');
                if (parentElse && container.contains(parentElse)) {
                    // Check if there's a corresponding if for this else that hasn't been processed
                    const elseid = parentElse.getAttribute('elseid');
                    const correspondingIf = container.querySelector(`if-condition[elseid="${elseid}"]`);
                    if (correspondingIf && correspondingIf !== ifEl && !ifEl.contains(correspondingIf)) {
                        continue; // Skip - this will be processed when the else is unwrapped
                    }
                }

                this._processSingleIfElse(container, ifEl);
            }
        }

        return container.innerHTML;
    }

    /**
     * Process a single if-condition and its corresponding else-condition
     */
    _processSingleIfElse(container, ifEl) {
        const elseid = ifEl.getAttribute('elseid') || '';
        const valueAttr = ifEl.getAttribute('value');

        if (!valueAttr) {
            console.error('if-condition requires "value" attribute');
            ifEl.remove();
            return;
        }

        // Evaluate the condition
        const conditionResult = this._evaluateCondition(ifEl);

        // Find the corresponding else-condition
        // Look in the same parent scope
        let elseEl = null;
        if (elseid) {
            const parent = ifEl.parentElement;
            if (parent) {
                // First try direct siblings
                for (const sibling of parent.children) {
                    if (sibling.tagName === 'ELSE-CONDITION' && sibling.getAttribute('elseid') === elseid) {
                        elseEl = sibling;
                        break;
                    }
                }
            }
            // If not found, search more broadly but within container
            if (!elseEl) {
                elseEl = container.querySelector(`else-condition[elseid="${elseid}"]`);
            }
        }

        if (conditionResult) {
            // Condition TRUE: keep if content, remove else
            if (elseEl) elseEl.remove();

            // Replace if-condition with its contents (unwrap)
            const fragment = document.createDocumentFragment();
            while (ifEl.firstChild) {
                fragment.appendChild(ifEl.firstChild);
            }
            ifEl.parentNode.replaceChild(fragment, ifEl);
        } else {
            // Condition FALSE: remove if, unwrap else content
            ifEl.remove();

            if (elseEl) {
                // Unwrap else-condition content
                const fragment = document.createDocumentFragment();
                while (elseEl.firstChild) {
                    fragment.appendChild(elseEl.firstChild);
                }
                elseEl.parentNode.replaceChild(fragment, elseEl);
            }
        }
    }

    /**
     * Evaluate an if-condition element's condition
     */
    _evaluateCondition(ifEl) {
        try {
            const valueAttr = ifEl.getAttribute('value');
            const eqAttr = ifEl.getAttribute('eq');
            const neqAttr = ifEl.getAttribute('neq');
            const gtAttr = ifEl.getAttribute('gt');
            const ltAttr = ifEl.getAttribute('lt');
            const gteAttr = ifEl.getAttribute('gte');
            const lteAttr = ifEl.getAttribute('lte');

            const value = unsafeEval(valueAttr);

            if (eqAttr !== null) {
                const compare = unsafeEval(eqAttr);
                return value === compare;
            }
            if (neqAttr !== null) {
                const compare = unsafeEval(neqAttr);
                return value !== compare;
            }
            if (gtAttr !== null) {
                const compare = unsafeEval(gtAttr);
                return value > compare;
            }
            if (ltAttr !== null) {
                const compare = unsafeEval(ltAttr);
                return value < compare;
            }
            if (gteAttr !== null) {
                const compare = unsafeEval(gteAttr);
                return value >= compare;
            }
            if (lteAttr !== null) {
                const compare = unsafeEval(lteAttr);
                return value <= compare;
            }

            // No comparison operator - treat as boolean
            return Boolean(value);
        } catch (error) {
            console.error('Condition evaluation error:', error);
            return false;
        }
    }

    rerender() { this.render(); }
}

// ============================================================================
// PLACEHOLDER ELEMENTS (for validation only, processed by ConditionBlock)
// ============================================================================

class IfCondition extends HTMLElement {
    connectedCallback() {
        this.style.display = 'contents';
    }
}

class ElseCondition extends HTMLElement {
    connectedCallback() {
        this.style.display = 'contents';
    }
}
// ============================================================================
// STATE ELEMENT
// ============================================================================

class StateElement extends HTMLElement {
    connectedCallback() {
        this.style.display = 'contents';
        this._storeTemplate();
        this.render();
    }
    _storeTemplate() {
        if (this._originalTemplate) return;
        const stateId = this.getAttribute('stateId');
        const template = this.querySelector(`template[stateId="${stateId}"]`);
        if (template) {
            this._originalTemplate = template.innerHTML;
        }
    }
    render() {
        const stateId = this.getAttribute('stateId');
        if (!stateId) throw new Error('state-element requires "stateId" attribute');

        // Get or restore template
        this._storeTemplate();
        if (!this._originalTemplate) {
            this.innerHTML = '❌ state-element: Missing template with matching stateId';
            return;
        }
        let html = parseTemplate(this._originalTemplate);
        let templateCopy = `<template stateId="${stateId}">${this._originalTemplate}</template>`;
        this.innerHTML = html + templateCopy;
    }
}
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getType(input) {
    if (Array.isArray(input)) return 'array';
    if (input === null) return 'null';
    return typeof input;
}

function passValue(value) {
    if (getType(value) === 'array' || getType(value) === 'object') {
        return encodeURIComponent(JSON.stringify(value));
    }
    return encodeURIComponent(String(value));
}

function parseURL(url = location.href, global = true) {
    try {
        const parsedUrl = new URL(url);
        const parsedData = {
            protocol: parsedUrl.protocol,
            hostname: parsedUrl.hostname,
            pathname: parsedUrl.pathname,
            hash: parsedUrl.hash,
            params: Object.fromEntries(parsedUrl.searchParams.entries())
        };

        for (const key in parsedData.params) {
            try { parsedData.params[key] = JSON.parse(parsedData.params[key]); } catch (e) { }
        }

        if (global) window.UrlDetails = parsedData;
        return parsedData;
    } catch (error) {
        console.error('parseURL error:', error);
        return { protocol: '', hostname: '', pathname: '', hash: '', params: {} };
    }
}

// Parse URL on load
parseURL();

// ============================================================================
// INITIALIZATION
// ============================================================================

function initState() {
    if (!customElements.get('for-loop')) customElements.define('for-loop', CustomForLoop);
    if (!customElements.get('include-template')) customElements.define('include-template', IncludeTemplate);
    if (!customElements.get('if-condition')) customElements.define('if-condition', IfCondition);
    if (!customElements.get('else-condition')) customElements.define('else-condition', ElseCondition);
    if (!customElements.get('condition-block')) customElements.define('condition-block', ConditionBlock);
    if (!customElements.get('state-element')) customElements.define('state-element', StateElement);

    // Initial render of data-loops
    renderDataLoops();
    setState()
}

// ============================================================================
// GLOBAL EXPORTS
// ============================================================================

if (typeof window !== 'undefined') {
    window.loader = loader;
    window.watch = watch;
    window.parseTemplate = parseTemplate;
    window.createRangeArray = createRangeArray;
    window.setState = setState;
    window.renderDataLoops = renderDataLoops;
    window.convertRelativeToAbsolute = convertRelativeToAbsolute;
    window.extractDirectory = extractDirectory;
    window.getType = getType;
    window.passValue = passValue;
    window.parseURL = parseURL;
    window.initState = initState;
}
