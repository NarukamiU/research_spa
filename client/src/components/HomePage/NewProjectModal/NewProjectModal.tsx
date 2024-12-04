// client/src/components/NewProjectModal/NewProjectModal.tsx

import React, { useState } from 'react';
import api from '../../../api.ts';
//import './NewProjectModal.css';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: string) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
  const [projectName, setProjectName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!projectName.trim()) {
      setError('プロジェクト名を入力してください。');
      return;
    }

    // 正規表現を用いたプロジェクト名のフォーマットチェック
    const isValid = /^[a-zA-Z0-9-_ ]{3,30}$/.test(projectName);
    if (!isValid) {
      setError('プロジェクト名は3〜30文字の英数字、ハイフン、アンダースコア、スペースのみ使用できます。');
      return;
    }

    try {
      const response = await api.post('/api/image-classing/projects', { projectName });
      if (response.data.success) {
        onProjectCreated(projectName);
        onClose();
      } else {
        setError(response.data.message || 'プロジェクト作成に失敗しました。');
      }
    } catch (error: any) {
      setError(error.message || 'プロジェクト作成中にエラーが発生しました。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>新規プロジェクト作成</h2>
        {error && <p className="error-message">{error}</p>}
        <input
          type="text"
          placeholder="プロジェクト名"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <div className="modal-buttons">
          <button className="create-button" onClick={handleCreate}>作成</button>
          <button className="cancel-button" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;