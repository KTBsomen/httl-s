# HTTL-S - HyperText Templating Language (Simple)

A lightweight client-side templating framework for building dynamic HTML pages.

## Features

- ✅ **For Loops** - Iterate over arrays directly in HTML
- ✅ **Nested If-Else** - Full support for deeply nested conditional rendering
- ✅ **Template Includes** - Import HTML as reusable components
- ✅ **State Watching** - Auto-update UI when variables change
- ✅ **Table Support** - Special `data-loop` approach for proper table rendering
- ✅ **TypeScript Support** - IntelliSense via included `.d.ts` file

## Installation

Include the script in your HTML file (after body content):

```html
<script src="https://cdn.jsdelivr.net/gh/KTBsomen/httl-s@main/statejs.js"></script>
```

Then initialize:

```html
<script>
  initState();
</script>
```

---

## Quick Start

### 1. State Watching & Auto-Update

```javascript
// Watch a variable - UI auto-updates when it changes
watch('counter', (name, value) => {
  setState(); // Re-render components
}, 0);

counter = 5; // Triggers update!
```

### 2. Template Expressions `{{}}`

```html
<p>Hello, {{ userName }}!</p>
<p>Total: {{ items.length * price }}</p>
```

### 3. For Loop

```html
<for-loop array="fruits" valueVar="fruit" indexVar="i" loopid="fruitList">
  <template loopid="fruitList">
    <p>${i + 1}. ${fruit}</p>
  </template>
</for-loop>
```

**Note:** Use `${expression}` syntax inside the template. The variables are accessed via the names you specify in `valueVar` and `indexVar`.

### 4. Conditional Rendering

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

---

## Table Rows (data-loop)

Custom elements can't be placed inside `<tbody>` due to HTML parser rules. Use `data-loop` instead:

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
- `data-loop` - Name of the array variable
- `data-template` - CSS selector for the template
- `data-value` - Variable name for current item
- `data-index` - Variable name for current index

Update with: `setState({ dataloops: true })`

---

## Nested Conditions

Fully supports if-else chains inside else blocks:

```html
<condition-block ifid="contactCheck">
  <template ifid="contactCheck">
    <!-- Check for both -->
    <if-condition value="hasEmail && hasPhone" eq="true" elseid="emailOnly">
      <p>We have both your email and phone</p>
    </if-condition>
    
    <else-condition elseid="emailOnly">
      <!-- Check for email only -->
      <if-condition value="hasEmail" eq="true" elseid="phoneOnly">
        <p>We have your email</p>
      </if-condition>
      
      <else-condition elseid="phoneOnly">
        <!-- Check for phone only -->
        <if-condition value="hasPhone" eq="true" elseid="neither">
          <p>We have your phone</p>
        </if-condition>
        
        <else-condition elseid="neither">
          <p>No contact info</p>
        </else-condition>
      </else-condition>
    </else-condition>
  </template>
</condition-block>
```

**Comparison Operators:**
- `eq` - Equal (===)
- `neq` - Not equal (!==)
- `gt` - Greater than
- `lt` - Less than
- `gte` - Greater than or equal
- `lte` - Less than or equal
- (none) - Truthy check

---

## Include Templates

```html
<include-template file="components/header.html"></include-template>
```

---

## API Reference

### loader

```javascript
loader.show();              // Show spinner
loader.show('<div>...</div>');  // Custom HTML
loader.hide();              // Hide spinner
```

### watch(name, callback, defaultValue)

```javascript
watch('myVar', (propName, value) => {
  console.log('Changed:', value);
  setState();
}, initialValue);
```

### setState(options)

```javascript
setState();                          // Update everything
setState({ loopid: 'myloop' });      // Specific loop
setState({ ifid: 'myCondition' });   // Specific condition
setState({ dataloops: true });       // Only data-loop elements
setState({ showloader: false });     // No loader
```

### parseTemplate(string)

```javascript
const html = parseTemplate('<p>Hello {{ name }}</p>');
```

### createRangeArray(start, end, step)

```javascript
createRangeArray(1, 5);      // [1, 2, 3, 4, 5]
createRangeArray(0, 10, 2);  // [0, 2, 4, 6, 8, 10]
```

### parseURL(url?, global?)

```javascript
parseURL(); // Parses window.location.href
console.log(UrlDetails.params.id); // Access query params
```

---

## TypeScript Support

Reference the type definitions in your JS file:

```javascript
/// <reference path="path/to/statejs.d.ts" />
```

---

## Browser Support

Modern browsers with:
- Custom Elements (Web Components)
- ES6+ (template literals, arrow functions)

---

## Examples

See the `example/` folder:
- `index.html` - Inventory management app
- `test-nested-conditions.html` - Nested if-else demos
- `test-table-rendering.html` - Table with data-loop

---

## Contributing

Contributions welcome! Submit issues or pull requests.
