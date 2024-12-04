// client/src/hooks/useSocket.ts

import { useEffect } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
  useEffect(() => {
    const socket = io('http://localhost:3001', {
      withCredentials: true,
    });

    socket.on('sessionExpired', () => {
      alert('セッションの有効期限が切れました。再度ログインしてください。');
      // ログインページにリダイレクト
      window.location.href = '/login';
    });

    socket.on('projectCreated', (data) => {
      // 新しいプロジェクトが作成された際の処理
      console.log('プロジェクトが作成されました:', data.projectName);
      // 必要に応じてUIを更新
    });

    socket.on('labelAdded', (data) => {
      // 新しいラベルが追加された際の処理
      console.log('ラベルが追加されました:', data.labelName);
      // 必要に応じてUIを更新
    });

    socket.on('labelAddedVerifyData', (data) => {
      // Verify Data用のラベルが追加された際の処理
      console.log('Verify Data用ラベルが追加されました:', data.labelName);
      // 必要に応じてUIを更新
    });

    socket.on('imageMoved', (data) => {
      // 画像が移動された際の処理
      console.log('画像が移動されました:', data.imageName, `from ${data.fromLabel} to ${data.toLabel}`);
      // 必要に応じてUIを更新
    });

    socket.on('imageMovedVerifyData', (data) => {
      // Verify Data用の画像が移動された際の処理
      console.log('Verify Data用画像が移動されました:', data.imageName);
      // 必要に応じてUIを更新
    });

    socket.on('imageDeleted', (data) => {
      // 画像が削除された際の処理
      console.log('画像が削除されました:', data.imageName);
      // 必要に応じてUIを更新
    });

    socket.on('imageDeletedVerifyData', (data) => {
      // Verify Data用の画像が削除された際の処理
      console.log('Verify Data用画像が削除されました:', data.imageName);
      // 必要に応じてUIを更新
    });

    socket.on('uploadProgress', (data) => {
      // 画像アップロードの進行状況を処理
      console.log(`アップロード進行状況: ${data.progress}%`);
      // プログレスバーなどを更新
    });

    socket.on('uploadCompleted', (data) => {
      // 画像アップロード完了時の処理
      console.log('アップロードが完了しました。アップロードされた画像:', data.images);
      // 必要に応じてUIを更新
    });

    return () => {
      // クリーンアップ時にイベントリスナーを削除
      socket.off('sessionExpired');
      socket.off('projectCreated');
      socket.off('labelAdded');
      socket.off('labelAddedVerifyData');
      socket.off('imageMoved');
      socket.off('imageMovedVerifyData');
      socket.off('imageDeleted');
      socket.off('imageDeletedVerifyData');
      socket.off('uploadProgress');
      socket.off('uploadCompleted');
      socket.disconnect();
    };
  }, []);

  return null;
};

export default useSocket;