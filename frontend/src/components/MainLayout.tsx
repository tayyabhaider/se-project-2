import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Modal, Drawer, Input, message, Table, Space } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
  FileOutlined,
  SignatureOutlined,
  SoundOutlined,
  SolutionOutlined,
  CodeOutlined,
  RestOutlined,
  UndoOutlined
} from '@ant-design/icons';
import { useFeatures } from '../contexts/FeatureFlags';
import '../styles/MainLayout.css';
import Logo from './assets/Frame.svg';
import axios, { AxiosError } from 'axios';
import { authedApi, searchApi } from './api';
import SettingsModal from './SettingsModal';

interface Note {
  _id: string;
  title: string;
  content: string;
  created_at: string;
}

interface TrashedNote extends Note {
  deleted_at: string;
}

const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isQuizVisible, setQuizVisible] = useState(false);
  const [isSummaryVisible, setSummaryVisible] = useState(false);
  const [isNewToolVisible, setNewToolVisible] = useState(false);
  const [isTrashModalVisible, setIsTrashModalVisible] = useState(false);
  const [isEnhanceModalVisible, setIsEnhanceModalVisible] = useState(false);
  const [quizContent, setQuizContent] = useState('');
  const [summaryContent, setSummaryContent] = useState('');
  const [enhancePrompt, setEnhancePrompt] = useState('');
  const [enhanceResult, setEnhanceResult] = useState('');

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [trashedNotes, setTrashedNotes] = useState<TrashedNote[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [token] = useState<string | null>(localStorage.getItem('token'));
  const { aiTools } = useFeatures();

  const navigate = useNavigate();
  const location = useLocation();
  const isNoteEditorPage =
    location.pathname.includes('/Dashboard/') && location.pathname.includes('/edit');

  useEffect(() => {
    if (isNoteEditorPage || !aiTools) {
      setSidebarCollapsed(true);
    }
  }, [isNoteEditorPage, aiTools]);

  authedApi.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        message.warning('Session expired. Please log in again.');
        navigate('/');
      }
      return Promise.reject(err);
    }
  );

  useEffect(() => {
    if (token) {
      authedApi.defaults.headers['Authorization'] = `Bearer ${token}`;
      fetchNotes();
    } else {
      navigate('/');
    }
  }, [token]);

  const fetchNotes = async () => {
    try {
      const { data } = await authedApi.get('/notes');
      setNotes(data);
      setFilteredNotes(data);
    } catch (e) {
      handleApiError(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashedNotes = async () => {
    setLoadingTrash(true);
    try {
      const { data } = await authedApi.get('/notes/trash');
      setTrashedNotes(data);
    } catch (e) {
      handleApiError(e, 'Failed to load trashed notes');
    } finally {
      setLoadingTrash(false);
    }
  };

  const handleTrashClick = () => {
    fetchTrashedNotes();
    setIsTrashModalVisible(true);
  };

  const handleRestoreNote = async (noteId: string) => {
    try {
      await authedApi.post(`/notes/${noteId}/restore`);
      message.success('Note restored successfully');
      // Remove from trash list
      setTrashedNotes(trashedNotes.filter(note => note._id !== noteId));
      // Refresh notes list
      fetchNotes();
    } catch (e) {
      handleApiError(e, 'Failed to restore note');
    }
  };

  const handlePermanentDelete = async (noteId: string) => {
    try {
      await authedApi.delete(`/notes/${noteId}/permanent`);
      message.success('Note permanently deleted');
      // Remove from trash list
      setTrashedNotes(trashedNotes.filter(note => note._id !== noteId));
    } catch (e) {
      handleApiError(e, 'Failed to delete note');
    }
  };

  const handleApiError = (error: unknown, custom?: string) => {
    if (error instanceof AxiosError && error.response) {
      const { status } = error.response;
      if (status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else message.error(custom || 'An error occurred');
    } else message.error('An unknown error occurred');
    console.error(error);
  };

  const handleCreate = async (v: { title: string }) => {
    try {
      const { data } = await authedApi.post('/notes/create', {
        title: v.title,
        content: '',
      });
      navigate(`/Dashboard/${data.note_id}/edit`);
      setIsModalVisible(false);
      form.resetFields();
      message.success('Note created successfully!');
    } catch (e) {
      handleApiError(e, 'Failed to create note');
    }
  };

  const handleLogout = async () => {
    try {
      // await axios.post('http://127.0.0.1:5000/auth/logout', {}, { withCredentials: true });
      await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('token');
      navigate('/');
    } catch (e) {
      message.error('Logout failed');
      console.error(e);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 3) {
      setFilteredNotes(
        notes.filter((n) => n.title.toLowerCase().includes(q.toLowerCase()))
      );
    }
  };

  const handleSearchSubmit = async (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return;
    const q = searchQuery.trim();
    if (q.length < 3) return;
    try {
      const { data } = await searchApi.get(`/search?q=${encodeURIComponent(q)}`);
      setFilteredNotes(data.notes);
    } catch {
      message.warning('Search failed, showing local matches');
      setFilteredNotes(
        notes.filter((n) => n.title.toLowerCase().includes(q.toLowerCase()))
      );
    }
  };

  const toggleSearch = () => {
    setIsSearchVisible((v) => !v);
    if (!isSearchVisible) {
      setTimeout(() => {
        (document.querySelector('.search-input input') as HTMLInputElement)?.focus();
      }, 300);
    }
  };

  /* ───────────── AI tools ───────────── */
  const handleTextToSpeech = async () => {
    try {
      const noteId = location.pathname.split('/Dashboard/')[1].split('/')[0];
      const response = await authedApi.get(`/notes/${noteId}/tts`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: 'audio/mpeg' })
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `note_${noteId}.mp3`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      message.error('Failed to download text-to-speech audio.');
      console.error('TTS error:', error);
    }
  };

  const handleQuizIt = async () => {
    try {
      const noteId = location.pathname.split('/Dashboard/')[1].split('/')[0];
      const response = await authedApi.get(`/notes/${noteId}/quiz`);
      setQuizContent(response.data.quiz);
      setQuizVisible(true);
    } catch (error) {
      message.error('Failed to generate quiz.');
      console.error('Quiz generation error:', error);
    }
  };

  const handleSummarize = async () => {
    try {
      const noteId = location.pathname.split('/Dashboard/')[1].split('/')[0];
      const response = await authedApi.get(`/notes/${noteId}/summary`);
      setSummaryContent(response.data.summary);
      setSummaryVisible(true);
    } catch (error) {
      message.error('Failed to generate summary.');
      console.error('Summary generation error:', error);
    }
  };

  const handleEnhanceText = async () => {
    try {
      const noteId = location.pathname.split('/Dashboard/')[1].split('/')[0];
      message.loading({ content: 'Enhancing...', key: 'enhance' });
  
      const { data } = await authedApi.post(`/notes/${noteId}/prompt_enhance`, {
        prompt: enhancePrompt,
      });
  
      setEnhanceResult(data.result); // Set result to show in drawer
      message.success({ content: 'Enhancement complete!', key: 'enhance' });
    } catch (error) {
      console.error(error);
      setEnhanceResult('Enhancement failed. Please try again.');
      message.error({ content: 'Enhancement failed', key: 'enhance' });
    }
  };

  // Format date utility function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Columns for the trashed notes table
  const trashColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span className="trash-note-title">{text}</span>,
    },
    {
      title: 'Date Deleted',
      dataIndex: 'deleted_at',
      key: 'deleted_at',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TrashedNote) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<UndoOutlined />} 
            className="restore-note-btn"
            onClick={() => handleRestoreNote(record._id)}
          >
            Restore
          </Button>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            className="delete-note-permanently-btn"
            onClick={() => handlePermanentDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="main-layout">
      {/* Logout Confirmation */}
      <Modal
        title="Confirm Logout"
        open={isLogoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setIsLogoutModalVisible(false)}
        okText="Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>

      {/* Create Note */}
      <Modal
        title="Create New Note"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreate}>
          <Form.Item
            name="title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Title" autoFocus />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Enhance Text Modal */}
      <Modal
        title="Enhance Text"
        open={isEnhanceModalVisible}
        onCancel={() => setIsEnhanceModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsEnhanceModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={async () => {
              try {
                const noteId = location.pathname.split('/Dashboard/')[1].split('/')[0];
                message.loading({ content: 'Enhancing...', key: 'enhance' });

                const { data } = await authedApi.post(`/notes/${noteId}/prompt_enhance`, {
                  prompt: enhancePrompt,
                });

                // Emit an event or store the enhanced result in state if needed
                message.success({ content: 'Note enhanced!', key: 'enhance' });

                // Optional: Reload note content after enhancing (if not using local state)
                setEnhanceResult(data.result);
                setNewToolVisible(true);

              } catch (error) {
                console.error(error);
                message.error({ content: 'Enhancement failed', key: 'enhance' });
              } finally {
                setIsEnhanceModalVisible(false);
                setEnhancePrompt('');
              }
            }}
          >
            Enhance
          </Button>,
        ]}
      >
        <p>Write a prompt or request for AI to improve this note.</p>
        <Input.TextArea
          rows={4}
          placeholder="e.g. Make this more concise and formal..."
          value={enhancePrompt}
          onChange={(e) => setEnhancePrompt(e.target.value)}
        />
      </Modal>

      {/* Trash Modal */}
      <Modal
        title="Trash"
        open={isTrashModalVisible}
        onCancel={() => setIsTrashModalVisible(false)}
        footer={null}
        width={700}
        className="trash-modal"
      >
        {loadingTrash ? (
          <div className="loading-trash">Loading trashed notes...</div>
        ) : trashedNotes.length === 0 ? (
          <div className="empty-trash-state">
            <RestOutlined className="empty-trash-icon" />
            <p>Your trash is empty</p>
          </div>
        ) : (
          <Table 
            dataSource={trashedNotes} 
            columns={trashColumns} 
            rowKey="_id"
            pagination={false}
            className="trash-table"
          />
        )}
      </Modal>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div
            className="logo"
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <img src={Logo} alt="Logo" className="sidebar-logo" />
          </div>
          <div className="search-container">
            <div
              className={`search-input-wrapper ${
                isSearchVisible ? 'visible' : ''
              }`}
            >
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleSearchSubmit}
                onBlur={() => {
                  if (searchQuery.trim() === '') setIsSearchVisible(false);
                }}
              />
            </div>
            <SearchOutlined className="search-icon" onClick={toggleSearch} />
          </div>
        </div>

        <div className="new-note-container">
          <Button
            className="new-note-btn"
            onClick={() => setIsModalVisible(true)}
          >
            <PlusOutlined /> New Note
          </Button>
        </div>

        <div className="notes-section">
          <div className="all-notes-header">All Notes</div>
          {loading ? (
            <div className="loading-notes">Loading...</div>
          ) : (
            (searchQuery ? filteredNotes : notes).map((n) => (
              <div
                key={n._id}
                className={`note-item ${
                  location.pathname.includes(n._id) ? 'active' : ''
                }`}
                onClick={() => navigate(`/Dashboard/${n._id}/edit`)}
              >
                <FileOutlined className="note-icon" />
                <span>{n.title}</span>
              </div>
            ))
          )}

          <div className="more-section">More</div>
          <div className="note-list-footer">
            <div
              className="note-item"
              onClick={handleTrashClick}
            >
              <DeleteOutlined className="note-icon" />
              <span>Trash</span>
            </div>
            <div
              className="note-item"
              onClick={() => setIsSettingsVisible(true)}
            >
              <SettingOutlined className="note-icon" />
              <span>Settings</span>
            </div>
          </div>

          {/* AI Tools Section */}
          {isNoteEditorPage && aiTools && (
            <div className="ai-tools-section">
              <div
                className="note-item ai-tool-item"
                onClick={handleTextToSpeech}
              >
                <SoundOutlined className="note-icon" />
                <span>Text-To-Speech</span>
              </div>
              <div className="note-item ai-tool-item" onClick={handleQuizIt}>
                <SignatureOutlined className="note-icon" />
                <span>Quiz-It</span>
              </div>
              <div
                className="note-item ai-tool-item"
                onClick={handleSummarize}
              >
                <SolutionOutlined className="note-icon" />
                <span>Summarize</span>
              </div>

              {/* Fourth AI tool button */}
              <div
                className="note-item ai-tool-item"
                onClick={() => setIsEnhanceModalVisible(true)}
              >
                <CodeOutlined className="note-icon" />
                <span>Enhance Text</span>
              </div>
            </div>
          )}

          <div
            className="collapse-sidebar"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d={
                  sidebarCollapsed
                    ? 'M9 18L15 12L9 6'
                    : 'M15 18L9 12L15 6'
                }
                stroke="#4F4F4F"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        open={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onLogout={handleLogout}
      />

      {/* Quiz-It Drawer */}
      <Drawer
        className="side-drawer"
        title="Quiz-It"
        placement="right"
        width="35vw"
        open={isQuizVisible}
        onClose={() => setQuizVisible(false)}
        destroyOnClose
      >
        {/* TODO: Quiz-It UI */}
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {quizContent || 'Generating quiz...'}
        </div>
      </Drawer>

      {/* Summarize Drawer */}
      <Drawer
        className="side-drawer"
        title="Summary"
        placement="right"
        width="35vw"
        open={isSummaryVisible}
        onClose={() => setSummaryVisible(false)}
        destroyOnClose
      >
        {/* TODO: Summarize UI */}
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {summaryContent || 'Generating summary...'}
        </div>
      </Drawer>

      {/* Enhance Text Drawer */}
      <Drawer
        className="side-drawer"
        title="Enhance Text"
        placement="right"
        width="35vw"
        open={isNewToolVisible}
        onClose={() => {
          setNewToolVisible(false);
          setEnhancePrompt('');
          setEnhanceResult('');
        }}
        destroyOnClose
      >
        <div style={{ marginBottom: 12 }}>
          <p style={{ marginBottom: 4 }}>Describe how you want the note to be enhanced:</p>
          <Input.TextArea
            rows={3}
            placeholder="e.g. Make this more concise and formal…"
            value={enhancePrompt}
            onChange={(e) => setEnhancePrompt(e.target.value)}
          />
          <Button
            type="primary"
            style={{ marginTop: 8 }}
            onClick={handleEnhanceText}
            disabled={!enhancePrompt.trim()}
          >
            Enhance
          </Button>
        </div>

        {/* Result display */}
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', marginTop: 20 }}>
          {enhanceResult || 'Your enhanced content will appear here...'}
        </div>
      </Drawer>
    </div>
  );
};

export default MainLayout;