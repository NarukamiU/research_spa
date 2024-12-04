// client/src/components/NewProjectCard/NewProjectCard.tsx

import React from 'react';
import './NewProjectCard.css';
import { FaPlus } from 'react-icons/fa'; // アイコンを追加

interface NewProjectCardProps {
  onCreate: () => void;
}

const NewProjectCard: React.FC<NewProjectCardProps> = React.memo(({ onCreate }) => {
  return (
    <div className="new-project-card" onClick={onCreate}>
      <FaPlus className="plus-icon" />
      <p className="card-title">新しいプロジェクトを作成</p>
    </div>
  );
});

export default NewProjectCard;