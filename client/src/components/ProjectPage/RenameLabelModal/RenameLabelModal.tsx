// client/src/components/RenameLabelModal/RenameLabelModal.tsx

import React, { useState, useEffect } from 'react';
import './RenameLabelModal.css';

interface RenameLabelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRename: (newLabelName: string) => void;
    currentLabelName: string;
}

const RenameLabelModal: React.FC<RenameLabelModalProps> = ({
    isOpen,
    onClose,
    onRename,
    currentLabelName
}) => {
    const [newLabelName, setNewLabelName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNewLabelName(currentLabelName);
        }
    }, [isOpen, currentLabelName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newLabelName.trim()) {
            onRename(newLabelName.trim());
            setNewLabelName('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>ラベル名を変更</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="新しいラベル名"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        required
                    />
                    <div className="modal-buttons">
                        <button type="submit">変更</button>
                        <button type="button" onClick={onClose}>
                            キャンセル
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RenameLabelModal;