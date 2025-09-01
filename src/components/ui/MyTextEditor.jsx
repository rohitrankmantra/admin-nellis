import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS

function MyTextEditor() {
  // State to hold the editor's content (HTML string)
  const [editorHtml, setEditorHtml] = useState('');

  // Define the toolbar options
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Headers
      ['bold', 'italic', 'underline', 'strike'], // Bold, Italic, Underline, Strikethrough
      [{ 'list': 'ordered' }, { 'list': 'bullet' }], // Ordered and unordered lists
      [{ 'script': 'sub' }, { 'script': 'super' }], // Superscript/subscript
      [{ 'indent': '-1' }, { 'indent': '+1' }], // Outdent/indent
      [{ 'direction': 'rtl' }], // Text direction

      [{ 'size': ['small', false, 'large', 'huge'] }], // Font size
      [{ 'color': [] }, { 'background': [] }], // Font color and background
      [{ 'font': [] }], // Font family
      [{ 'align': [] }], // Text align

      ['link', 'image', 'video'], // Link, Image, Video
      ['clean'] // Clear formatting
    ],
  };

  // Define the formats (tags) that the editor will recognize
  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent', 'link', 'image', 'video',
    'color', 'background', 'font', 'size', 'align', 'direction',
    'script' // Add script for sub/super
  ];

  const handleChange = (html) => {
    setEditorHtml(html);
  };

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>My Rich Text Editor</h2>
      <div style={{ height: '250px', marginBottom: '20px' }}> {/* Set a height for the editor */}
        <ReactQuill
          theme="snow" // 'snow' is a clean, simple theme. You can also use 'bubble'.
          value={editorHtml}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder="Start typing your content here..."
        />
      </div>

      <h3>Content Preview (HTML):</h3>
      <div
        style={{
          border: '1px dashed #eee',
          padding: '10px',
          minHeight: '100px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px'
        }}
      >
        {editorHtml ? (
          <div dangerouslySetInnerHTML={{ __html: editorHtml }} />
        ) : (
          <p style={{ color: '#888' }}>No content yet.</p>
        )}
      </div>

      <button
        onClick={() => alert('Content Saved:\n' + editorHtml)}
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Save Content
      </button>
    </div>
  );
}

export default MyTextEditor;