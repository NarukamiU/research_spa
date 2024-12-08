// client/src/hooks/useProjectPageCommon.ts

import { useState, useEffect } from 'react';
import axios from 'axios';

interface SelectedImage {
  projectId: string;
  labelName: string;
  imageName: string;
}

interface VerificationImage {
  name: string;
  confidence: number[];
}

interface VerificationResults {
  classes: string[];
  images: VerificationImage[];
  execTime_ms: number;
}

interface UseProjectPageCommonProps {
  projectId: string;
  user: { username: string } | null;
  dataType: 'verify' | 'training';
}

const useProjectPageCommon = ({ projectId, user, dataType }: UseProjectPageCommonProps) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [labelImages, setLabelImages] = useState<{ [key: string]: string[] }>({});
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [verifiedResults, setVerifiedResults] = useState<{ [imageName: string]: { [label: string]: number } }>({});
  const [verificationStatus, setVerificationStatus] = useState<{ [label: string]: string }>({});

  useEffect(() => {
    fetchLabels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user, dataType]);

  useEffect(() => {
    if (labels.length > 0) {
      labels.forEach((label) => {
        fetchLabelImages(label);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels]);

  const fetchLabels = async () => {
    if (!user || !projectId) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/image-classing/projects/${projectId}/${dataType}-data/labels`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setLabels(response.data.labels);
      } else {
        setError(response.data.message || 'ラベル取得に失敗しました。');
      }
    } catch (error: any) {
      console.error('ラベル取得エラー:', error);
      setError(error.response?.data?.message || 'ラベル取得中にエラーが発生しました。');
    }
  };

  const fetchLabelImages = async (label: string) => {
    if (!user) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/image-classing/projects/${projectId}/${dataType}-data/labels/${label}/images`,
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

  const handleMoveImages = async () => {
    console.log('画像を移動:', selectedImages);
    await fetchLabels(); // ラベル一覧を更新
    setSelectedImages([]); // 選択状態をクリア
    console.log('選択状態 after fetchLabels:', selectedImages);
  };

  const handleRenameLabel = async (oldLabelName: string, newLabelName: string) => {
    if (!user) return;

    try {
      const response = await axios.put(
        `http://localhost:3001/api/image-classing/projects/${projectId}/${dataType}-data/labels/${oldLabelName}/rename`,
        { newLabelName },
        { withCredentials: true }
      );

      if (response.data.success) {
        await fetchLabels();
      } else {
        setError(response.data.message || 'ラベルリネームに失敗しました。');
      }
    } catch (error: any) {
      console.error('ラベルリネームエラー:', error);
      setError(error.response?.data?.message || 'ラベルリネーム中にエラーが発生しました。');
    }
  };

  const handleDeleteLabel = async (label: string) => {
    if (!user) return;
    const confirmDelete = window.confirm(`ラベル「${label}」を削除しますか?`);
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:3001/api/image-classing/projects/${projectId}/${dataType}-data/labels/${label}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        await fetchLabels();
      } else {
        setError(response.data.message || 'ラベル削除に失敗しました。');
      }
    } catch (error: any) {
      console.error('ラベル削除エラー:', error);
      alert(error.response?.data?.message || 'ラベル削除中にエラーが発生しました。');
    }
  };

  const handleDeleteSelectedImages = async () => {
    if (!user) return;

    if (selectedImages.length === 0) {
      alert('削除する画像を選択してください。');
      return;
    }

    const confirmDelete = window.confirm(`選択した${selectedImages.length}枚の画像を本当に削除しますか？`);
    if (!confirmDelete) return;

    try {
      const deletePromises = selectedImages.map((img) =>
        axios.delete(
          `http://localhost:3001/api/image-classing/projects/${img.projectId}/${dataType}-data/labels/${img.labelName}/images/${img.imageName}`,
          { withCredentials: true }
        )
      );

      const responses = await Promise.all(deletePromises);

      // 全ての削除が成功したか確認
      const allSuccess = responses.every((res) => res.data.success);
      if (allSuccess) {
        await fetchLabels();
        alert('選択した画像を削除しました。');
      } else {
        setError('一部の画像削除に失敗しました。');
      }
    } catch (error: any) {
      console.error('画像一括削除エラー:', error);
      setError(error.response?.data?.message || '画像削除中にエラーが発生しました。');
    } finally {
      // 選択状態をリセット
      setSelectedImages([]);
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
      setSelectedImages(selectedImages.filter(
        (img) =>
          !(img.projectId === image.projectId &&
            img.labelName === image.labelName &&
            img.imageName === image.imageName)
      ));
    } else {
      setSelectedImages([...selectedImages, image]);
    }
  };

  const handleLabelAdded = async () => {
    // ラベル追加後にラベルと画像を再取得
    await fetchLabels();
    // 各ラベルの画像も再取得
    await Promise.all(labels.map((label) => fetchLabelImages(label)));
  };

  const handleUploadSuccess = async (label: string) => {
    await fetchLabelImages(label);
  };

  const fetchVerificationResults = async (label: string) => {
    if (!user) return;

    try {
      const response = await axios.get(
        `http://localhost:3001/api/image-classing/projects/${projectId}/${dataType}-data/labels/${label}/verification-results`,
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

  const handleVerify = async (label: string) => {
    if (!user) return;

    setVerificationStatus((prev) => ({ ...prev, [label]: '検証中' }));

    try {
      const response = await axios.post(
        `http://localhost:3001/api/image-classing/projects/${projectId}/${dataType}-data/labels/${label}/verify`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        await fetchVerificationResults(label);
        setVerificationStatus((prev) => ({ ...prev, [label]: '検証完了' }));
      } else {
        setVerificationStatus((prev) => ({ ...prev, [label]: '検証失敗' }));
        setError(response.data.message || '検証に失敗しました。');
      }
    } catch (error: any) {
      console.error('検証エラー:', error);
      setVerificationStatus((prev) => ({ ...prev, [label]: '検証失敗' }));
      setError(error.response?.data?.message || '検証中にエラーが発生しました。');
    }
  };

  return {
    labels,
    labelImages,
    selectedImages,
    verifiedResults,
    error,
    handleUploadSuccess,
    handleRenameLabel,
    handleDeleteLabel,
    handleDeleteSelectedImages,
    handleSelectImage,
    handleLabelAdded,
    handleMoveImages,
    handleVerify,
    verificationStatus,
  };
};

export default useProjectPageCommon;