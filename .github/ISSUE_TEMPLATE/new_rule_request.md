---
name: New rule request
about: Suggest a new rule.
title: ''
labels: enhancement, new rule
assignees: ''

---

**Motivation**
<!-- A clear and concise description of the problem the new rule is supposed to solve. -->

**Description**
<!-- A clear and concise description of the new rule. -->

**Examples**

<!-- Add a few examples of regexes that the rule does and does not report. -->

```jsx
/* ✓ GOOD */
var foo = <div
  style={
    {
      color: 'red'
    }
  } >
  </div>

/* ✗ BAD */
var foo = <div
  style={
    {
      color: 'red'
    }
  } >
  </div>
```
