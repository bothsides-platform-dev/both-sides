---
title: File Uploader
impact: HIGH
impactDescription: Poor upload UX causes user frustration and data loss
tags: component, file-uploader, upload, form
---

# File Uploader

Button click or drag-and-drop upload. Show accepted types, size limits, upload progress, and allow removal.

## Incorrect

```tsx
function Upload() {
  return <input type="file" onChange={handleFile} />;
}
```
**Why it's wrong**: No file type indication. No size limit. No progress. No error handling. Unstyled.

## Correct

```tsx
import { FileUploaderDropContainer, FileUploaderItem } from '@carbon/react';

function Upload({ onUpload }) {
  const [files, setFiles] = useState([]);
  return (
    <div>
      <p className="cds--label-description">Max 500KB. Supported: .jpg, .png</p>
      <FileUploaderDropContainer
        accept={['.jpg', '.png']}
        labelText="Drag and drop files here or click to upload"
        onAddFiles={(evt, { addedFiles }) => {
          setFiles(prev => [...prev, ...addedFiles.map(f => ({ ...f, status: 'uploading' }))]);
          onUpload(addedFiles);
        }}
      />
      {files.map((file, i) => (
        <FileUploaderItem key={i} name={file.name} status={file.status}
          onDelete={() => setFiles(prev => prev.filter((_, j) => j !== i))} />
      ))}
    </div>
  );
}
```
**Why it's correct**: Clear constraints. Drag-and-drop. Progress per file. Remove button. Accessible labels.
