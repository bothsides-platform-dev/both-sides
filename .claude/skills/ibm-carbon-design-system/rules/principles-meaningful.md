---
title: Meaningful Outcomes
impact: MEDIUM
impactDescription: Interfaces without clear meaning fail to engage users and reduce retention
tags: principles, design, meaning, engagement
---

# Meaningful Outcomes

Carbon designs should deliver outcomes that reach both head and heart. Content and interactions should be relevant, timely, and crafted to create genuine value for the user.

## Key Guidelines
- Use clear, human language instead of technical jargon
- Provide context that helps users understand why actions matter
- Design feedback that confirms progress and builds confidence
- Content should be relevant to the user's current context and goals

## Incorrect

```tsx
// Technical, impersonal, no context
function UploadComplete() {
  return (
    <div>
      <span>Status: 200 OK</span>
      <span>Operation completed successfully.</span>
      <span>Bytes transferred: 1048576</span>
    </div>
  );
}
```
**Why it's wrong**: Technical jargon (HTTP status, byte count) is meaningless to most users. No emotional connection or clear next step.

## Correct

```tsx
// Human language, meaningful feedback, clear next steps
function UploadComplete() {
  return (
    <InlineNotification
      kind="success"
      title="File uploaded"
      subtitle="Your report is ready to share with your team."
      actions={
        <NotificationActionButton>
          Share now
        </NotificationActionButton>
      }
    />
  );
}
```
**Why it's correct**: Uses human-readable language. Confirms what happened. Suggests a meaningful next step. Engages the user emotionally with success feedback.
