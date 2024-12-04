// client/src/hooks/useCheck.ts

import { useState, useEffect } from 'react';
import axios from 'axios';


interface VerificationImage {
  name: string;
  confidence: number[];
}
interface VerificationResults {
  classes: string[];
  images: VerificationImage[];
  execTime_ms: number;
}




interface SelectedImage {
  projectId: string;
  labelName: string;
  imageName: string;
}

const useCheck = (projectId: string, user: { username: string } | null) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [labelImages, setLabelImages] = useState<{ [key: string]: string[] }>({});
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [verifiedResults, setVerifiedResults] = useState<{ [imageName: string]: { [label: string]: number } }>({});
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveModalTargetLabel, setMoveModalTargetLabel] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<{ [label: string]: string }>({});

  useEffect(() => {
    fetchCheckLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  useEffect(() => {
    if (labels.length > 0) {
      labels.forEach((label) => {
        fetchCheckLabelImages(label);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels]);

  const fetchCheckLabels = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLabels(response.data.labels);
        setError(null);
      } else {
        console.error('Checkラベル取得失敗:', response.data.message);
        setError(response.data.message || 'Checkラベルの取得に失敗しました。');
      }
    } catch (error: any) {
      console.error('Checkラベル取得エラー:', error);
      setError('Checkラベル取得中にエラーが発生しました。');
    }
  };

  const fetchCheckLabelImages = async (label: string) => {
    if (!user) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels/${label}/images`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLabelImages((prev) => ({ ...prev, [label]: response.data.images }));
      } else {
        console.error(`Check画像取得失敗 (${label}):`, response.data.message);
      }
    } catch (error: any) {
      console.error(`Check画像取得エラー (${label}):`, error);
    }
  };

  const fetchVerificationResults = async (label: string) => {
    if (!user) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels/${label}/verification-results`,
        { withCredentials: true }
      );

      if (response.data.success) {
        const results: { [imageName: string]: { [label: string]: number } } = {};
        const verificationData: VerificationResults = response.data.results;

        verificationData.images.forEach((image) => {
          const { name, confidence } = image;
          results[name] = {};
          verificationData.classes.forEach((cls, idx) => {
            results[name][cls] = confidence[idx];
          });
        });

        setVerifiedResults((prev) => ({ ...prev, ...results }));
        setVerificationStatus((prev) => ({ ...prev, [label]: '検証完了' }));
      } else {
        setError(response.data.message || '検証結果取得に失敗しました。');
        setVerificationStatus((prev) => ({ ...prev, [label]: '検証失敗' }));
      }
    } catch (error: any) {
      console.error(`Error fetching verification results for label (${label}):`, error);
      setError(`検証結果の取得中にエラーが発生しました (${label})`);
      setVerificationStatus((prev) => ({ ...prev, [label]: '検証失敗' }));
    }
  };

  const handleUploadSuccess = (label: string) => {
    fetchCheckLabelImages(label);
  };

  const handleLabelAdded = async () => {
    await fetchCheckLabels();
  };

  const handleRenameLabel = async (oldLabelName: string, newLabelName: string) => {
    if (!user) return;

    try {
      const response = await axios.put(
        `/api/image-classing/projects/${projectId}/verify-data/labels/${oldLabelName}/rename`,
        { newLabelName },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update labels state
        setLabels((prevLabels) =>
          prevLabels.map((label) => (label === oldLabelName ? newLabelName : label))
        );
        // Update labelImages state
        setLabelImages((prevImages) => {
          const updatedImages = { ...prevImages };
          updatedImages[newLabelName] = updatedImages[oldLabelName];
          delete updatedImages[oldLabelName];
          return updatedImages;
        });
        // Update verifiedResults
        setVerifiedResults((prev) => {
          const newResults: { [imageName: string]: { [label: string]: number } } = {};
          Object.keys(prev).forEach((imageName) => {
            newResults[imageName] = { ...prev[imageName] };
            newResults[imageName][newLabelName] = newResults[imageName][oldLabelName];
            delete newResults[imageName][oldLabelName];
          });
          return newResults;
        });
      } else {
        setError(response.data.message || 'ラベルのリネームに失敗しました。');
      }
    } catch (error: any) {
      console.error('ラベルリネームエラー:', error);
      setError(error.response?.data?.message || 'ラベルリネーム中にエラーが発生しました。');
    }
  };

  const handleVerify = async (label: string) => {
    if (!user) return;

    setVerificationStatus((prev) => ({ ...prev, [label]: '検証中' }));

    try {
      const response = await axios.post(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels/${label}/verify`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // 検証が開始されたら結果を取得
        fetchVerificationResults(label);
      } else {
        setError(response.data.message || '検証に失敗しました。');
        setVerificationStatus((prev) => ({ ...prev, [label]: '検証失敗' }));
      }
    } catch (error: any) {
      console.error('検証開始エラー:', error);
      setError(error.response?.data?.message || '検証の開始に失敗しました。');
      setVerificationStatus((prev) => ({ ...prev, [label]: '検証失敗' }));
    }
  };

  const handleDeleteImage = async (label: string, imageName: string) => {
    const confirmDelete = window.confirm(`画像「${imageName}」を削除しますか？`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels/${label}/images/${imageName}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        fetchCheckLabelImages(label);
        alert('画像を削除しました。');
      } else {
        console.error('Check画像削除失敗:', response.data.message);
        alert(response.data.message || '画像の削除に失敗しました。');
      }
    } catch (error: any) {
      console.error('画像削除エラー:', error);
      alert(error.response?.data?.message || '画像削除中にエラーが発生しました。');
    }
  };

  const handleDeleteLabel = async (labelName: string) => {
    if (!user) return;

    const confirmDelete = window.confirm(`ラベル「${labelName}」を削除しますか？`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels/${labelName}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Remove the deleted label from the labels state
        setLabels((prevLabels) => prevLabels.filter((label) => label !== labelName));
        // Remove the deleted label's images from the labelImages state
        setLabelImages((prevImages) => {
          const updatedImages = { ...prevImages };
          delete updatedImages[labelName];
          return updatedImages;
        });
        alert(`ラベル「${labelName}」を削除しました。`);
      } else {
        console.error('ラベル削除失敗:', response.data.message);
        alert(response.data.message || 'ラベルの削除に失敗しました。');
      }
    } catch (error: any) {
      console.error('ラベル削除エラー:', error);
      alert(error.response?.data?.message || 'ラベル削除中にエラーが発生しました。');
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

  const handleMoveImages = async () => {
    if (selectedImages.length === 0 || !moveModalTargetLabel) {
      setError('移動する画像と移動先ラベルを選択してください。');
      return;
    }

    setError(null);

    try {
      // 移動先のラベルに応じて全ての画像を移動
      const response = await axios.post(
        `http://localhost:3001/api/image-classing/projects/${projectId}/verify-data/labels/${selectedImages[0].labelName}/move-images`,
        {
          targetLabel: moveModalTargetLabel,
          images: selectedImages.map((img) => img.imageName),
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // 移動後に画像データを再取得
        fetchCheckLabelImages(selectedImages[0].labelName);
        fetchCheckLabelImages(moveModalTargetLabel);
        setSelectedImages([]);
        closeMoveModal();
        alert('画像を移動しました。');
      } else {
        console.error('画像移動失敗:', response.data.message);
        setError(response.data.message || '画像の移動に失敗しました。');
      }
    } catch (error: any) {
      console.error('画像移動エラー:', error);
      setError(error.response?.data?.message || '画像移動中にエラーが発生しました。');
    }
  };

  const openMoveModal = () => {
    if (selectedImages.length === 0) {
      setError('移動する画像を選択してください。');
      return;
    }
    setIsMoveModalOpen(true);
  };

  const closeMoveModal = () => {
    setIsMoveModalOpen(false);
    setMoveModalTargetLabel('');
    setError(null);
  };

  const openLightbox = (images: string[], index: number) => {
    // Lightbox のオープンはコンポーネント側で処理
  };

  const closeLightbox = () => {
    // Lightbox のクローズはコンポーネント側で処理
  };

  return {
    labels,
    labelImages,
    selectedImages,
    verifiedResults,
    isMoveModalOpen,
    moveModalTargetLabel,
    error,
    handleUploadSuccess,
    handleVerify,
    handleRenameLabel,
    handleDeleteImage,
    handleDeleteLabel,
    handleSelectImage,
    handleMoveImages,
    openMoveModal,
    closeMoveModal,
    setMoveModalTargetLabel,
    handleLabelAdded, 
    openLightbox,
    closeLightbox,
    verificationStatus,
  };
};

export default useCheck;