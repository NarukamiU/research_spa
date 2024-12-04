// client/src/components/ImageUpload/ImageUpload.tsx
import React, { useState } from 'react';
import axios from 'axios';
import './ImageUpload.css'; // CSSをインポート

interface ImageUploadProps {
  projectId: string;
  labelName: string;
  user: { username: string } | null;
  onUploadSuccess: () => void;
  dataType: 'training' | 'verify';
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  projectId,
  labelName,
  user,
  onUploadSuccess,
  dataType,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      alert('アップロードする画像を選択してください。');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    setIsUploading(true);
    setError(null);

    const uploadUrl = `http://localhost:3001/api/image-classing/projects/${projectId}/${dataType}-data/labels/${labelName}/upload`;

    try {
      const response = await axios.post(uploadUrl, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onUploadSuccess();
        alert('画像をアップロードしました。');
      } else {
        setError(response.data.message || '画像のアップロードに失敗しました。');
      }
    } catch (err: any) {
      console.error('画像アップロードエラー:', err);
      setError(err.response?.data?.message || '画像アップロード中にエラーが発生しました。');
    } finally {
      setIsUploading(false);
      // ファイル入力をリセット
      e.target.value = '';
    }
  };

  return (
    <div className="image-upload-card">
      <label htmlFor={`file-input-${labelName}`} className="plus-icon">
        +
      </label>
      <input
        id={`file-input-${labelName}`}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {isUploading && <p className="uploading-message">アップロード中...</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ImageUpload;