// client/src/components/ProjectCard/ProjectCard.tsx

import React, { useState } from 'react';
import './ProjectCard.css';
import { FaTrash, FaEdit } from 'react-icons/fa'; // アイコンを追加

interface ProjectCardProps {
  title: string;
  onDelete: () => void; // 削除ハンドラーを追加
  onRename: (newTitle: string) => void; // リネームハンドラーを追加
  onClick: () => void; // クリックハンドラーを追加
}

const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ title, onDelete, onRename, onClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleRenameClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // イベントの伝播を停止
    setIsEditing(true);
  };

  const handleRenameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRename(newTitle);
    setIsEditing(false);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // イベントの伝播を停止
    onDelete();
  };

  return (
    <div className="project-card" onClick={onClick}>
      <div className="project-card-info">
        {isEditing ? (
          <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="rename-input"
            />
            <button type="submit" className="rename-submit-button">保存</button>
          </form>
        ) : (
          <>
            <h2 className="project-card-title">{title}</h2>
            <button className="rename-button" onClick={handleRenameClick}>
              <FaEdit />
            </button>
            <button className="delete-button" onClick={handleDeleteClick}>
              <FaTrash />
            </button>
          </>
        )}
      </div>
    </div>
  );
});

export default ProjectCard;