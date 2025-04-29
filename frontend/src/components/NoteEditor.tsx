import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input, Button, message, Tag } from 'antd';
import type { InputRef } from 'antd';
import {
  CalendarOutlined,
  TagOutlined,
  SaveOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import '../styles/NoteEditor.css';
import { useParams, useNavigate } from 'react-router-dom';
import { authedApi, mediaApi } from './api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

/* ---------- custom dark toolbar markup ---------- */
const QuillToolbar = ({ onAddMultimedia }: { onAddMultimedia: () => void }) => (
  <div id="note-toolbar" className="custom-quill-toolbar">
    <select className="ql-header" defaultValue="0">
      <option value="0">Normal</option>
      <option value="1">Heading 1</option>
      <option value="2">Heading 2</option>
      <option value="3">Heading 3</option>
    </select>
    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />
    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />
    <button className="ql-clean" />
    <button className="multimedia-btn" onClick={onAddMultimedia} type="button">
      <span className="multimedia-icon">
        <img src="/media-icon.svg" alt="" />
      </span>
      Add Multimedia
    </button>
  </div>
);

const modules = {
  toolbar: { container: '#note-toolbar' },
  clipboard: { matchVisual: false },
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'clean',
  'image',
];

/* ---------- local types ---------- */


const NoteEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [note, setNote] = useState<{
    _id: string;
    title: string;
    content: string;
    created_at: string;
    tags?: string[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [ uploadProgress, setUploadProgress] = useState(0);
  const [date] = useState(() => new Date().toLocaleDateString());
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [ isUploading, setIsUploading] = useState(false);
  
  const inputRef = useRef<InputRef>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quillRef = useRef<ReactQuill | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await authedApi.get(`/notes/${id}`);
        setNote(response.data);
      } catch (error) {
        message.error('Failed to load note');
        navigate('/Dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const persistNote = useCallback(async () => {
    if (!note || isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      await authedApi.put(`/notes/${id}`, {
        title: note.title,
        content: note.content,
        tags: note.tags,
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [id, note]);

  const debounceSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(persistNote, 2000);
  }, [persistNote]);

  const handleTitleChange = (title: string) => {
    if (!note) return;
    setNote({ ...note, title });
    debounceSave();
  };

  const handleContentChange = (content: string) => {
    if (!note) return;
    setNote({ ...note, content });
    debounceSave();
  };

  const handleManualSave = async () => {
    if (!note) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      message.loading({ content: 'Saving…', key: 'saveNote' });
      await authedApi.put(`/notes/${id}`, {
        title: note.title,
        content: note.content,
        tags: note.tags,
      });
      message.success({ content: 'Note saved!', key: 'saveNote' });
    } catch {
      message.error({ content: 'Failed to save', key: 'saveNote' });
    }
  };

  const handleDeleteNote = async () => {
    try {
      await authedApi.delete(`/notes/${id}`);
      message.success('Note deleted');
      navigate('/Dashboard');
    } catch {
      message.error('Failed to delete note');
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/notes/${id}/pdf`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note_${note?.title || 'untitled'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('PDF export failed');
    } finally {
      setIsExporting(false);
    }
  };



  const handleAddMultimedia = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
  
    // Clear the file input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  
    const formData = new FormData();
    formData.append('file', file);
    formData.append('note_id', id);
  
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const response = await mediaApi.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });
  
      const imageUrl = response.data.url;
      const quillEditor = quillRef.current?.getEditor();
  
      if (quillEditor && imageUrl) {
        const range = quillEditor.getSelection() || { index: 0, length: 0 };
        
        // Insert the image at the current cursor position
        quillEditor.insertEmbed(range.index, 'image', imageUrl);
        
        // Move cursor after the image
        quillEditor.setSelection(range.index + 1, 0);
        
        // Update the note content state to include the new image
        setNote(prev => prev ? { 
          ...prev, 
          content: quillEditor.root.innerHTML 
        } : null);
      }
  
      message.success('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      message.error('Image upload failed.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Tag handling functions
  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && note) {
      const tags = [...(note.tags || [])];
      if (inputValue && !tags.includes(inputValue)) {
        tags.push(inputValue);
        setNote({ ...note, tags });
        debounceSave();
      }
    }
    setInputVisible(false);
    setInputValue('');
  };

  const handleRemoveTag = (removedTag: string) => {
    if (!note) return;
    const tags = note.tags?.filter(tag => tag !== removedTag) || [];
    setNote({ ...note, tags });
    debounceSave();
  };

  if (loading || !note) return <div>Loading…</div>;
  


  return (
    <div className="note-editor-container">
      <div className="note-editor-header">
        <div className="title-and-more">
          <Input
            className="note-title-input"
            value={note.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            bordered={false}
            placeholder="Note Title"
          />
          <div className="action-buttons">
            <Button 
              icon={<SaveOutlined />} 
              className="action-btn save-btn" 
              onClick={handleManualSave}
              title="Save Note"
            />
            <Button 
              icon={<FilePdfOutlined />} 
              className="action-btn export-btn" 
              onClick={handleExportPdf}
              loading={isExporting}
              title="Export as PDF"
            />
            <Button 
              icon={<DeleteOutlined />} 
              className="action-btn delete-btn" 
              onClick={handleDeleteNote}
              title="Delete Note"
            />
          </div>
        </div>

        <div className="meta-container">
          <div className="meta-item">
            <CalendarOutlined className="meta-icon" />
            <div className="meta-label">Date</div>
            <div className="meta-value">{date}</div>
          </div>
          <div className="meta-item">
            <TagOutlined className="meta-icon" />
            <div className="meta-label">Tags</div>
            <div className="meta-value tag-container">
              {note.tags && note.tags.length > 0 ? (
                note.tags.map((tag) => (
                  <Tag
                    className="edit-tag"
                    key={tag}
                    closable
                    onClose={() => handleRemoveTag(tag)}
                  >
                    {tag}
                  </Tag>
                ))
              ) : null}
              {inputVisible ? (
                <Input
                  ref={inputRef}
                  type="text"
                  size="small"
                  className="tag-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputConfirm}
                  onPressEnter={handleInputConfirm}
                  placeholder="Press enter to add"
                />
              ) : (
                <Tag className="site-tag-plus" onClick={showInput}>
                  <PlusOutlined /> Add tag
                </Tag>
              )}
            </div>
          </div>
          <QuillToolbar onAddMultimedia={handleAddMultimedia} />
        </div>
      </div>

      <div className="note-content-area">
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <ReactQuill
          ref={(el) => (quillRef.current = el)}
          theme="snow"
          value={note.content || ''}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          placeholder="Start writing…"
        />
      </div>
    </div>
  );
};

export default NoteEditor;