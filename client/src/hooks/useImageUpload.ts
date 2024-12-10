// client/src/hooks/useImageUpload.ts

import { useState } from 'react';
import axios from 'axios';

interface UseImageUploadProps {
  projectId: string;
  labelName: string;
  onUploadSuccess: () => void;
}

const useImageUpload = ({ projectId, labelName, onUploadSuccess }: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await axios.post(
        `/api/image-classing/projects/${projectId}/training-data/labels/${labelName}/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        onUploadSuccess();
      } else {
        console.error('アップロード失敗:', response.data.message);
        setUploadError(response.data.message || '画像のアップロードに失敗しました。');
      }
    } catch (error: any) {
      console.error('アップロードエラー:', error);
      setUploadError(error.response?.data?.message || '画像アップロード中にエラーが発生しました。');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadError,
    handleFileChange,
  };
};

export default useImageUpload;