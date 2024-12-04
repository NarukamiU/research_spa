// client/src/hooks/useLabel.ts

import { useState, useEffect } from 'react';
import axios from 'axios';

interface SelectedImage {
  projectId: string;
  labelName: string;
  imageName: string;
}

interface LabelData {
  labels: string[];
  labelImages: { [label: string]: string[] };
  selectedImages: SelectedImage[];
  error: string | null;
}

const useLabel = (projectId: string, user: { username: string } | null) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [labelImages, setLabelImages] = useState<{ [label: string]: string[] }>({});
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (labels.length > 0) {
      labels.forEach((label) => {
        fetchLabelImages(label);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels]);

  const fetchLabels = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `/api/image-classing/projects/${projectId}/training-data/labels`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLabels(response.data.labels);
        setError(null);
      } else {
        console.error('ラベル取得失敗:', response.data.message);
        setError(response.data.message || 'ラベルの取得に失敗しました。');
      }
    } catch (error: any) {
      console.error('ラベル取得エラー:', error);
      setError('ラベル取得中にエラーが発生しました。');
    }
  };

  const fetchLabelImages = async (label: string) => {
    if (!user) return;

    try {
      const response = await axios.get(
        `/api/image-classing/projects/${projectId}/training-data/labels/${label}/images`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLabelImages((prev) => ({ ...prev, [label]: response.data.images }));
      } else {
        console.error(`画像取得失敗 (${label}):`, response.data.message);
      }
    } catch (error: any) {
      console.error(`画像取得エラー (${label}):`, error);
    }
  };

  /**
   * 画像移動のハンドラ
   */
  const handleMoveImages = () => {
    // 画像移動後に必要な更新処理を実装
    // 例: ラベルの画像を再取得
    fetchLabels();
  };
  /**
   * ラベルリネームのハンドラ
   */
  const handleRenameLabel = async (oldLabelName: string, newLabelName: string) => {
    if (!user) return;

    if (!newLabelName.trim()) {
      alert('新しいラベル名を入力してください。');
      return;
    }

    try {
      const response = await axios.put(
        `/api/image-classing/projects/${projectId}/training-data/labels/${oldLabelName}/rename`,
        { newLabelName },
        { withCredentials: true }
      );

      if (response.data.success) {
        // ラベル名を更新
        setLabels((prevLabels) =>
          prevLabels.map((label) => (label === oldLabelName ? newLabelName : label))
        );

        // ラベル画像のキーも更新
        setLabelImages((prevImages) => {
          const updatedImages = { ...prevImages };
          if (updatedImages[oldLabelName]) {
            updatedImages[newLabelName] = updatedImages[oldLabelName];
            delete updatedImages[oldLabelName];
          }
          return updatedImages;
        });

        alert(`ラベル「${oldLabelName}」を「${newLabelName}」にリネームしました。`);
      } else {
        console.error('ラベルリネーム失敗:', response.data.message);
        alert(response.data.message || 'ラベルのリネームに失敗しました。');
      }
    } catch (error: any) {
      console.error('ラベルリネームエラー:', error);
      alert(error.response?.data?.message || 'ラベルリネーム中にエラーが発生しました。');
    }
  };

  const handleDeleteLabel = async (label: string) => {
    const confirmDelete = window.confirm(
      `ラベル「${label}」を本当に削除しますか？この操作は元に戻せません。`
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `/api/image-classing/projects/${projectId}/training-data/labels/${label}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchLabels();
      } else {
        console.error('ラベル削除失敗:', response.data.message);
        alert(response.data.message || 'ラベルの削除に失敗しました。');
      }
    } catch (error: any) {
      console.error('ラベル削除エラー:', error);
      alert(error.response?.data?.message || 'ラベル削除中にエラーが発生しました。');
    }
  };

  const handleDeleteImage = async (label: string, imageName: string) => {
    const confirmDelete = window.confirm(`画像「${imageName}」を削除しますか？`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `/api/image-classing/projects/${projectId}/training-data/labels/${label}/images/${imageName}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchLabelImages(label);
      } else {
        console.error('画像削除失敗:', response.data.message);
        alert(response.data.message || '画像の削除に失敗しました。');
      }
    } catch (error: any) {
      console.error('画像削除エラー:', error);
      alert(error.response?.data?.message || '画像削除中にエラーが発生しました。');
    }
  };

  const handleSelectImage = (image: SelectedImage) => {
    const exists = selectedImages.some(
      (img) =>
        img.projectId === image.projectId &&
        img.labelName === image.labelName &&
        img.imageName === image.imageName
    );

    if (exists) {
      const updated = selectedImages.filter(
        (img) =>
          !(
            img.projectId === image.projectId &&
            img.labelName === image.labelName &&
            img.imageName === image.imageName
          )
      );
      setSelectedImages(updated);
      console.log('画像選択解除:', updated);
    } else {
      const updated = [...selectedImages, image];
      setSelectedImages(updated);
      console.log('画像選択追加:', updated);
    }
  };

  const handleLabelAdded = () => {
    // ラベル追加後にラベルと画像を再取得
    fetchLabels();
    // 各ラベルの画像も再取得
    labels.forEach((label) => fetchLabelImages(label));
  };

  return {
    labels,
    labelImages,
    selectedImages,
    error,
    handleRenameLabel,
    handleDeleteLabel,
    handleDeleteImage,
    handleSelectImage,
    handleLabelAdded,
    handleMoveImages,
  };
};

export default useLabel;