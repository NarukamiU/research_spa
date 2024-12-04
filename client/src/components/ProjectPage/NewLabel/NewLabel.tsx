// client/src/components/NewLabel/NewLabel.tsx
import React, { useState } from 'react';
import axios from 'axios';
import './NewLabel.css';


// Define a type for labelType to ensure type safety
type LabelType = 'training-data' | 'verify-data'; // Extend this union type as needed


interface NewLabelProps {
    projectId: string;
    onLabelAdded: () => void;
    labelType: LabelType; // Added prop to distinguish between Label and Check
}

const NewLabel: React.FC<NewLabelProps> = ({ projectId, onLabelAdded, labelType }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [labelName, setLabelName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setLabelName('');
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!labelName.trim()) {
            setError('ラベル名を入力してください。');
            return;
        }

        try {
            // Mapping object for endpoints based on labelType
            const endpointMap: Record<LabelType, string> = {
                'training-data': `/api/image-classing/projects/${projectId}/training-data/labels`,
                'verify-data': `/api/image-classing/projects/${projectId}/verify-data/labels`,
                // Add more label types here as needed
            };
            const endpoint = endpointMap[labelType];

            const response = await axios.post(
                endpoint,
                { labelName },
                { withCredentials: true }
            );

            if (response.data.success) {
                console.log('Label added:', response.data.label);
                onLabelAdded();
                closeModal();
            } else {
                setError(response.data.message || 'ラベルの追加に失敗しました。');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'ラベル追加中にエラーが発生しました。');
        }
    };

    return (
        <>
            <div className="new-label-button" onClick={openModal}>
                + 新しいラベル
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>新しいラベルを追加</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="ラベル名"
                                value={labelName}
                                onChange={(e) => setLabelName(e.target.value)}
                                required
                            />
                            {error && <p className="error-message">{error}</p>}
                            <div className="modal-buttons">
                                <button type="submit">追加</button>
                                <button type="button" onClick={closeModal}>
                                    キャンセル
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default NewLabel;