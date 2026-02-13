---
title: Text Input
impact: HIGH
impactDescription: Poor text input patterns cause form errors and accessibility failures
tags: component, text-input, form, input
---

# Text Input

Variants: default, password (show/hide toggle), textarea. Sizes: sm(32px), md(40px), lg(48px). Always show visible label. Support error/warning validation states.

## Incorrect

```tsx
<form>
  <input type="text" placeholder="Your name" />
  <input type="email" placeholder="Email" />
  <textarea placeholder="Message" />
  <input type="password" placeholder="Password" />
</form>
```
**Why it's wrong**: No visible labels (placeholder is not a label). No error states. No character count.

## Correct

```tsx
import { TextInput, TextArea } from '@carbon/react';

<TextInput id="name" labelText="Full name" placeholder="e.g., Jane Doe"
  required invalidText="Name is required" invalid={errors.name} />

<TextInput id="email" type="email" labelText="Email address"
  helperText="We'll never share your email" invalidText="Invalid email" invalid={errors.email} />

<TextArea id="message" labelText="Your message" maxCount={500} enableCounter rows={4} />

<TextInput.PasswordInput id="password" labelText="Password"
  helperText="At least 8 characters" invalidText="Too short" invalid={errors.password} />
```
**Why it's correct**: Visible labels. Helper text. Error states. Character counter. Password toggle.
