# HTTL-S  
### HyperText Templating Language (Simple)

A lightweight client-side templating framework for building dynamic HTML pages without build tools or Node.js.

## Features

- **For Loops** - Iterate over arrays directly in HTML
- **Data Loops** - Special loop for table rows (works in `<tbody>`)
- **Nested If-Else** - Full support for deeply nested conditionals
- **State Elements** - Simple reactive value display
- **Template Includes** - Import HTML as reusable components with CSS isolation
- **State Watching** - Auto-update UI when variables change
- **TypeScript Support** - IntelliSense via `.d.ts` file
- **VS Code Support** - Snippets and HTML custom data

---
![License](https://img.shields.io/badge/license-Apache--2.0-blue)
![CDN](https://img.shields.io/badge/CDN-jsDelivr-orange)

## Installation

### Step 1: Include the script
```html
<script src="https://cdn.jsdelivr.net/gh/KTBsomen/httl-s@main/statejs.js"></script>
```

### Step 2: Set up watched variables
```javascript
// Create reactive variables that trigger UI updates
watch('myVar', (propName, value) => {
  setState({ /* options */ });
}, initialValue);
```

### Step 3: Initialize (LAST!)
```javascript
// Call this AFTER all watch() calls and DOM setup
initState();
```

> ⚠️ **Important:** `initState()` must be called last, after all variables are set up.

---

## Quick Reference

| Syntax | Purpose | Example |
|--------|---------|---------|
| `{{expression}}` | Evaluate JS expression | `{{userName}}` |
| `${expression}` | Loop variable access | `${item.name}` |
| `watch(name, cb, init)` | Create reactive variable | `watch('count', cb, 0)` |
| `setState(options)` | Update UI components | `setState({ loops: true })` |
| `initState()` | Initialize framework | `initState()` |

---

## Custom Elements

### 1. For Loop (`<for-loop>`)

Iterate over an array and render content for each item.

```html
<for-loop array="fruits" valueVar="fruit" indexVar="i" loopid="fruitList">
  <template loopid="fruitList">
    <p>${i + 1}. ${fruit}</p>
  </template>
</for-loop>
```

**Attributes:**
| Attribute | Required | Description |
|-----------|----------|-------------|
| `array` | Yes | Array variable name |
| `loopid` | Yes | Unique ID (must match template) |
| `valueVar` | No | Variable name for item (default: `value`) |
| `indexVar` | No | Variable name for index (default: `index`) |
| `start` | No | Start index (default: 0) |
| `end` | No | End index (default: array.length) |
| `step` | No | Step increment (default: 1) |

---

### 2. Data Loop (`data-loop` attribute)

Use for table rows - custom elements can't be placed inside `<tbody>`.

```html
<table>
  <thead>
    <tr><th>Name</th><th>Price</th></tr>
  </thead>
  <tbody data-loop="products" data-template="#rowTemplate" data-value="item" data-index="i">
  </tbody>
</table>

<!-- Template MUST be outside the table -->
<template id="rowTemplate">
  <tr>
    <td>${item.name}</td>
    <td>$${item.price}</td>
  </tr>
</template>
```

**Attributes:**
| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-loop` | Yes | Array variable name |
| `data-template` | Yes | CSS selector for template |
| `data-value` | No | Variable name for item |
| `data-index` | No | Variable name for index |

---

### 3. Condition Block (`<condition-block>`)

Container for if-else conditional rendering.

```html
<condition-block ifid="loginCheck">
  <template ifid="loginCheck">
    <if-condition value="isLoggedIn" eq="true" elseid="notLoggedIn">
      <p>Welcome back!</p>
    </if-condition>
    <else-condition elseid="notLoggedIn">
      <p>Please log in</p>
    </else-condition>
  </template>
</condition-block>
```

**Comparison Operators:**
| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals (===) | `eq="true"` |
| `neq` | Not equals (!==) | `neq="'error'"` |
| `gt` | Greater than | `gt="10"` |
| `lt` | Less than | `lt="0"` |
| `gte` | Greater or equal | `gte="18"` |
| `lte` | Less or equal | `lte="100"` |
| (none) | Truthy check | `value="hasItems"` |

---

### 4. Nested Conditions

Fully supports if-else chains inside else blocks:

```html
<condition-block ifid="check">
  <template ifid="check">
    <if-condition value="a && b" eq="true" elseid="onlyA">
      <p>Both A and B</p>
    </if-condition>
    <else-condition elseid="onlyA">
      <if-condition value="a" eq="true" elseid="onlyB">
        <p>Only A</p>
      </if-condition>
      <else-condition elseid="onlyB">
        <if-condition value="b" eq="true" elseid="neither">
          <p>Only B</p>
        </if-condition>
        <else-condition elseid="neither">
          <p>Neither</p>
        </else-condition>
      </else-condition>
    </else-condition>
  </template>
</condition-block>
```

---

### 5. State Element (`<state-element>`)

Simple reactive display for state values.

```html
<state-element stateId="counter">
  <template stateId="counter">
    <span>Count: {{count}}</span>
  </template>
</state-element>
```

---

### 6. Include Template (`<include-template>`)

Import external HTML files as reusable components.

```html
<!-- CSS is scoped by default (Shadow DOM) -->
<include-template file="components/header.html"></include-template>

<!-- Use global styles (no isolation) -->
<include-template file="components/footer.html" scoped="false"></include-template>
```

**Attributes:**
| Attribute | Default | Description |
|-----------|---------|-------------|
| `file` | Required | Path to HTML file |
| `scoped` | `true` | `true`: CSS isolated, `false`: global |

---

## JavaScript API

### `watch(name, callback, defaultValue)`

Creates a reactive global variable.

```javascript
watch('inventory', (name, value) => {
  setState({ dataloops: true, conditions: true });
}, []);

// Now you can use: inventory = [...inventory, newItem];
```

---

### `setState(options)`

Updates UI by re-rendering components.

```javascript
// Update everything
setState();

// Update specific component by ID
setState({ loopid: 'myLoop' });
setState({ ifid: 'myCondition' });
setState({ stateId: 'myState' });

// Control what updates
setState({
  showloader: false,    // Don't show loading spinner
  loops: true,          // Update for-loop elements
  dataloops: true,      // Update data-loop elements
  conditions: true,     // Update condition-block elements
  states: true,         // Update state-element elements
  templates: false,     // Update include-template elements
  innerhtml: true,      // Update data-innerhtml elements
  datajs: true          // Execute data-js attributes
});
```

---

### `safeEval(expression, context)`

Safely evaluate a JavaScript expression.

```javascript
const result = safeEval('a + b', { a: 1, b: 2 }); // 3
```

---

### `parseTemplate(string)`

Parse `{{}}` expressions in a string.

```javascript
const html = parseTemplate('<p>Hello {{name}}</p>');
```

---

### `createRangeArray(start, end, step)`

Create an array of numbers.

```javascript
createRangeArray(1, 5);       // [1, 2, 3, 4, 5]
createRangeArray(0, 10, 2);   // [0, 2, 4, 6, 8, 10]
```

---

### `renderDataLoops()`

Manually render all `data-loop` elements.

```javascript
renderDataLoops();
```

---

### `parseURL(url?, global?)`

Parse URL and extract components.

```javascript
parseURL(); // Parses current URL
console.log(UrlDetails.params.id); // Access query params
```

---

### `loader`

Loading spinner utility.

```javascript
loader.show();                    // Show default spinner
loader.show('<div>Loading...</div>'); // Custom HTML
loader.hide();                    // Hide spinner
```

---

## Data Attributes

| Attribute | Description |
|-----------|-------------|
| `data-innerhtml="expr"` | Set element's innerHTML to expression result |
| `data-js="code"` | Execute JavaScript on setState |

```html
<span data-innerhtml="items.length"></span>
<div data-js="this.style.color = count > 10 ? 'red' : 'green'"></div>
```

---

## TypeScript / IntelliSense

### For JS files
Download [statejs.d.ts](https://cdn.jsdelivr.net/gh/KTBsomen/httl-s@main/statejs.d.ts) and reference locally:

```javascript
/// <reference path="./statejs.d.ts" />
```

### For HTML files (VS Code)
Copy `.vscode/httls.html-data.json` to your project and add to `.vscode/settings.json`:

```json
{
  "html.customData": ["./.vscode/httls.html-data.json"]
}
```

---

## Examples

See the `example/` folder:
- `index.html` - Inventory management app
- `test-nested-conditions.html` - Nested if-else demos
- `test-table-rendering.html` - Table with data-loop

---

## Browser Support

Modern browsers with:
- Custom Elements (Web Components)
- ES6+ (template literals, arrow functions)

---
# Security, CSP & Usage Guidelines

HTTL-S (HyperText Templating Language – Simple) is a **lightweight client-side templating framework** that evaluates JavaScript expressions directly in HTML templates.  
This design choice enables flexibility and a small footprint, but it also comes with **important security and CSP implications**.

---

## Security Notice (Read Carefully)

HTTL-S **evaluates JavaScript expressions at runtime** using `new Function()`.

This means:

- HTTL-S **MUST NOT** be used on **unsanitized or user-generated HTML**
- HTTL-S **MUST NOT** process HTML coming from users, databases, CMS, or third-party sources without proper sanitization
- HTTL-S is **NOT safe** against XSS when used on untrusted content

If your application renders user-submitted HTML, **do not mount HTTL-S on those DOM regions**.

> HTTL-S is designed for **developer-controlled templates only**.

---
## Content Security Policy (CSP)

HTTL-S uses `new Function()` for expression evaluation.

Because of this:

- HTTL-S **requires `unsafe-eval`** in CSP
- HTTL-S **does NOT work with strict CSP policies**
- There is **no CSP-safe build** at the moment

Example CSP required:
```http
Content-Security-Policy:
  script-src 'self' 'unsafe-eval';
```

## Recommended For
- Internal tools, dashboards, prototypes
- Static or developer-authored templates
- Projects without strict CSP requirements

## Not Recommended For
- Unsanitized user-generated content
- Public apps with untrusted HTML
- Security-critical or strict CSP environments

## Future Improvements
- Explicit mount targets
- Safer expression evaluation mode
- Deprecate `data-js`
- Optional HTML sanitization
- CSP-friendly build


## License

Licensed under the Apache License, Version 2.0.  
See the LICENSE file for details.
> This library is safe to use via CDN and npm under Apache-2.0.

## Copyright

Copyright © 2026 Somen Das



