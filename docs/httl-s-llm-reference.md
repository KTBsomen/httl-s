HTTL-S is a zero-dependency, no-build-step JavaScript framework that adds reactivity to plain HTML. It uses ES6 Proxies for state management, custom elements for loops and conditions, and a mustache-style template engine (`{{expression}}`).

## Core Architecture

1. **Global reactive variables** — Created via `watch()`. Stored on `window`. Changes detected by ES6 Proxy (deep, recursive).
2. **Manual DOM updates** — You call `setState()` to tell HTTL-S which parts of DOM to re-render.
3. **Template engine** — `parseTemplate()` replaces `{{expression}}` with evaluated JS results.
4. **Custom elements** — `<for-loop>`, `<condition-block>`, `<state-element>`, `<include-template>`.
5. **Data attributes** — `data-loop`, `data-innerhtml`, `data-js`, `no-parse`.

## Installation

Add a single `<script>` tag before your app script:

```html
<script src="https://cdn.jsdelivr.net/gh/nickmjones/httl-s@latest/statejs.js"></script>
<!-- or local: -->
<script src="statejs.js"></script>
```

---

## Functions

### watch(propName, callback, defaultValue?)

Creates a reactive global variable on `window`.

| Param | Type | Description |
|-------|------|-------------|
| `propName` | `string` | Name of global variable |
| `callback` | `function(name, value)` | Called on change. Call `setState()` here. |
| `defaultValue` | `any` | Initial value. Objects/arrays get deep proxied. |

- **Deep proxy**: `myArray.push(x)`, `myObj.a.b = 5`, `delete obj.key` all trigger callback.
- **Batched**: Multiple synchronous mutations → single callback (via microtask).
- **Self-mutation protection**: Callback modifying its own variable won't re-trigger.
- **Duplicate names**: Second `watch()` with same name is silently ignored.

```js
watch('users', (name, value) => {
  setState({ loops: true, conditions: true, showloader: false });
}, [{ name: 'Alice', role: 'admin' }]);

users.push({ name: 'Bob', role: 'user' }); // triggers callback
users[0].role = 'superadmin'; // triggers callback
```

### setState(options)

Re-renders specified parts of the DOM.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `loopid` | `string\|false` | `false` | Re-render specific `<for-loop>` by loopid |
| `stateId` | `string\|false` | `false` | Re-render specific `<state-element>` by stateId |
| `ifid` | `string\|false` | `false` | Re-render specific `<condition-block>` by ifid |
| `states` | `boolean` | `false` | Re-render ALL `<state-element>` |
| `showloader` | `boolean` | `true` | Show loading spinner (⚠️ default is true!) |
| `datajs` | `boolean` | `true` | Execute all `[data-js]` expressions |
| `innerhtml` | `boolean` | `true` | Update all `[data-innerhtml]` elements |
| `loops` | `boolean` | `true` | Re-render ALL `<for-loop>` elements |
| `dataloops` | `boolean` | `true` | Re-render ALL `[data-loop]` elements |
| `templates` | `boolean` | `false` | Re-fetch ALL `<include-template>` elements |
| `conditions` | `boolean` | `true` | Re-render ALL `<condition-block>` elements |

**Best practice**: Use targeted options:
```js
setState({ stateId: 'counter', showloader: false }); // ✅ Good
setState(); // ❌ Bad — re-renders everything with spinner
```

### initState()

Registers custom elements and triggers first render. **Call exactly once**, after all `watch()`.

```js
watch('count', cb, 0);
watch('items', cb, []);
initState(); // MUST be last
```

### parseTemplate(template)

Evaluates `{{expression}}` placeholders in a string.

```js
parseTemplate('Hello {{name}}!') // → "Hello Alice!"
parseTemplate('{{2 + 3}}')       // → "5"
parseTemplate('{{flag ? "Yes" : "No"}}') // → "Yes" or "No"
```

### unsafeEval(expression, context?)

Evaluates a JS expression string. Uses `new Function()` internally.

```js
unsafeEval('a + b', { a: 1, b: 2 }) // → 3
```

⚠️ Never pass user input to this function.

### createRangeArray(start, end, step?)

```js
createRangeArray(1, 5)      // → [1, 2, 3, 4, 5]
createRangeArray(0, 10, 2)  // → [0, 2, 4, 6, 8, 10]
```

### renderDataLoops()

Manually triggers rendering of all `[data-loop]` elements.

### parseURL(url?, global?)

Parses URL, extracts components. Default: current page URL → stored in `window.UrlDetails`.

```js
parseURL() // → { protocol, hostname, pathname, hash, params: { key: value } }
// params are auto-parsed with JSON.parse (?count=5 → params.count === 5)
```

### loader.show(html?) / loader.hide()

Full-screen loading spinner. Used automatically when `showloader: true`.

### getType(input)

Returns type string. Unlike `typeof`, correctly returns `"array"` and `"null"`.

### passValue(value)

URI-encodes value for URL params. Objects are JSON-stringified first.

---

## Custom Elements

### `<for-loop>`

Renders HTML for each item in an array.

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `array` | Yes* | — | Name of global array variable |
| `loopid` | Yes | — | Unique ID. Inner `<template>` must match. |
| `valueVar` | No | `"value"` | Current item variable name |
| `indexVar` | No | `"index"` | Current index variable name |
| `start` | No* | — | Numeric loop start (instead of array) |
| `end` | No* | — | Numeric loop end (inclusive) |
| `step` | No | `1` | Numeric loop step |

**⚠️ CRITICAL**: Inside `<template>`, use `${var}` for loop variables, NOT `{{var}}`.
**⚠️ CRITICAL**: CANNOT be used inside `<table>`. Use `data-loop` instead.

```html
<for-loop array="users" valueVar="user" indexVar="i" loopid="userList">
  <template loopid="userList">
    <div>
      <h3>${i + 1}. ${user.name}</h3>
      <p>Role: ${user.role}</p>
    </div>
  </template>
</for-loop>
```

Numeric range:
```html
<for-loop start="1" end="10" valueVar="page" loopid="pages">
  <template loopid="pages">
    <button>${page}</button>
  </template>
</for-loop>
```

### `<condition-block>` / `<if-condition>` / `<else-condition>`

Conditional rendering (if/else).

```html
<condition-block ifid="auth">
  <if-condition value="isLoggedIn" elseid="loginElse">
    <p>Welcome, {{username}}!</p>
  </if-condition>
  <else-condition elseid="loginElse">
    <p>Please log in.</p>
  </else-condition>
</condition-block>
```

**if-condition attributes**:
- `value` — JS expression to evaluate
- `eq` / `neq` — strict equality/inequality comparison
- `gt` / `lt` / `gte` / `lte` — numeric comparisons
- `elseid` — links to matching `<else-condition>`

Chained conditions require nested `<condition-block>`:
```html
<condition-block ifid="outer">
  <if-condition value="score" gte="90" elseid="notA">
    <p>Grade: A</p>
  </if-condition>
  <else-condition elseid="notA">
    <condition-block ifid="inner">
      <if-condition value="score" gte="80" elseid="notB">
        <p>Grade: B</p>
      </if-condition>
      <else-condition elseid="notB">
        <p>Grade: C or below</p>
      </else-condition>
    </condition-block>
  </else-condition>
</condition-block>
```

### `<state-element>`

Re-renderable block tied to a state ID. Re-renders its template on each `setState({ stateId })`.

```html
<state-element stateId="profile">
  <template stateId="profile">
    <h2>{{user.name}}</h2>
    <p>Email: {{user.email}}</p>
  </template>
</state-element>
```

### `<include-template>`

Loads external HTML via `fetch()`.

| Attribute | Default | Description |
|-----------|---------|-------------|
| `file` | — | Path to HTML file (required) |
| `scoped` | `"true"` | `"true"` = Shadow DOM, `"false"` = inject directly |

```html
<include-template file="components/nav.html" scoped="false"></include-template>
```

⚠️ Requires HTTP server (won't work with `file://`).

---

## Data Attributes

### `data-loop`

For rendering table rows. Use instead of `<for-loop>` inside `<table>`.

| Attribute | Description |
|-----------|-------------|
| `data-loop="arrayName"` | Global array to iterate |
| `data-template="#id"` | CSS selector for template element |
| `data-value="varName"` | Item variable (default: `"value"`) |
| `data-index="varName"` | Index variable (default: `"index"`) |

```html
<table>
  <thead><tr><th>Name</th><th>Price</th></tr></thead>
  <tbody data-loop="products" data-template="#rowTpl"
         data-value="p" data-index="i"></tbody>
</table>

<!-- MUST be OUTSIDE the table -->
<template id="rowTpl">
  <tr>
    <td>${p.name}</td>
    <td>$${p.price.toFixed(2)}</td>
  </tr>
</template>
```

### `data-innerhtml="expression"`

Sets element text content (HTML-escaped) to JS expression result. Updated on each `setState()`.

```html
<span data-innerhtml="users.length">0</span> users
```

### `data-js="code"`

Executes JS on each `setState()`. `this` = the DOM element.

```html
<div data-js="this.classList.toggle('active', isMenuOpen)">Menu</div>
<div data-js="this.style.width = progress + '%'"></div>
```

### `no-parse`

Prevents `{{}}` evaluation. Content renders as literal text.

```html
<code no-parse>Use {{myVar}} to display state</code>
```

---

## Common Pitfalls

1. **Forgetting `initState()`** → Custom elements empty, `{{}}` shows literal.
2. **`watch()` after `initState()`** → Variable not shown on first render.
3. **`<for-loop>` inside `<table>`** → HTML parser strips it. Use `data-loop`.
4. **`{{}}` for loop variables** → Use `${}` inside `<template>`. `{{}}` is for global state only.
5. **`showloader: true` (default)** → Spinner flash. Add `showloader: false`.
6. **Mismatched IDs** → `loopid`/`stateId`/`ifid` must match between element and template.
7. **`<include-template>` blank** → Must use HTTP server, not `file://`.
8. **`<template>` inside `<table>`** → Place outside the table for `data-loop`.

---

## Minimal Complete Example

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Count: <span data-innerhtml="count">0</span></h1>
  <button onclick="count++">+</button>
  <button onclick="count--">−</button>

  <for-loop array="items" valueVar="item" loopid="list">
    <template loopid="list">
      <p>${item}</p>
    </template>
  </for-loop>

  <condition-block ifid="check">
    <if-condition value="count" gt="5" elseid="notHigh">
      <p>Count is high!</p>
    </if-condition>
    <else-condition elseid="notHigh">
      <p>Count is low.</p>
    </else-condition>
  </condition-block>

  <script src="statejs.js"></script>
  <script>
    watch('count', () => {
      setState({ innerhtml: true, conditions: true, showloader: false });
    }, 0);

    watch('items', () => {
      setState({ loops: true, showloader: false });
    }, ['Apple', 'Banana', 'Cherry']);

    initState();
  </script>
</body>
</html>
```
