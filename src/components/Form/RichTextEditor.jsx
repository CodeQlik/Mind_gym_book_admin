import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
}) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "link",
    "image",
    "video",
  ];

  return (
    <div className="flex flex-col gap-1.5 w-full rich-text-editor">
      {label && (
        <label className="text-sm font-bold text-text-primary ml-0.5 uppercase tracking-wider opacity-70">
          {label}
          {required && (
            <span className="text-primary/70 ml-1 font-bold text-xs">*</span>
          )}
        </label>
      )}

      <div
        className={`overflow-hidden rounded-md border ${error ? "border-error" : "border-border"} bg-surface transition-all focus-within:border-primary shadow-sm`}
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder || "Enter description..."}
          className="bg-surface text-text-primary"
        />
      </div>

      {error && (
        <span className="text-[12px] font-bold text-error ml-0.5 uppercase tracking-tight">
          {error}
        </span>
      )}

      <style>{`
        .rich-text-editor .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid var(--border);
          background: var(--background);
          padding: 8px;
        }
        .rich-text-editor .ql-container.ql-snow {
          border: none;
          min-height: 200px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
          line-height: 1.6;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: rgba(71, 85, 105, 0.4);
          font-style: normal;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: var(--text-secondary);
        }
        .rich-text-editor .ql-snow .ql-fill {
          fill: var(--text-secondary);
        }
        .rich-text-editor .ql-snow .ql-picker {
          color: var(--text-secondary);
        }
        .dark .rich-text-editor .ql-toolbar.ql-snow {
          background: rgba(15, 23, 42, 0.5);
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
