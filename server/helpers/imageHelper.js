const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * 画像を圧縮する関数（ファイルサイズ基準、安全にファイルを置換）
 * @param {string} filePath - 圧縮する画像のファイルパス
 * @param {Object} [options={}] - 圧縮オプション
 * @returns {Promise<boolean>} 圧縮が成功したかどうか
 */
async function compressImage(filePath, options = {}) {
  // デフォルトオプション
  const defaultOptions = {
    compressionThreshold: 500 * 1024, // 500KB
    targetSize: 500 * 1024, // 500KB
    maxAttempts: 10, // 最大試行回数→これが大きければ、大きい画像も圧縮できるが時間がかかるため、そもそもアップロードできる画像のサイズに上限を設けるべき。
    qualityStep: 10, // 圧縮品質のステップ
    minQuality: 10, // 最小品質
    logFunction: console.log,
    convertToWebp: true // PNG to WebP変換オプション
  };

  // オプションのマージ
  const config = { ...defaultOptions, ...options };
  const log = config.logFunction;

  const ext = path.extname(filePath).toLowerCase();
  const tempFilePath = `${filePath}.tmp`;

  try {
    // ファイルサイズのチェック
    const stats = await fs.stat(filePath);
    if (stats.size < config.compressionThreshold) {
      log(`Skipping compression for ${filePath} (size: ${stats.size} bytes)`);
      return false;
    }

    // サポートされているフォーマットのチェック
    const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!supportedFormats.includes(ext)) {
      log(`Unsupported file format for compression: ${ext}`);
      return false;
    }

    // 圧縮処理
    let compressed = false;
    let convertedToWebp = false;
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      let transformer;
      let compressionOptions;

      switch (ext) {
        case '.jpg':
        case '.jpeg':
          compressionOptions = {
            quality: Math.max(config.minQuality, 70 - (attempt - 1) * config.qualityStep),
            rotateBeforeExport: false,
            withMetadata: true
          };
          transformer = sharp(filePath)
            .rotate()
            .jpeg(compressionOptions);
          break;
        case '.png':
          compressionOptions = {
            // PNG圧縮の詳細設定
            compressionLevel: 9, // 最大圧縮
            adaptiveFiltering: true, // 高度なフィルタリング
            palette: true, // カラーパレットを使用
            // オプション: 色数を減らす
            colors: attempt * 32, // 試行回数に応じて色数を削減
            dither: 1.0 // ディザリングを適用して画質を維持
          };
          
          transformer = sharp(filePath)
            .png(compressionOptions);
          
          // WebPへの変換オプション
          if (config.convertToWebp && attempt > 2) {
            transformer = sharp(filePath)
              .webp({ 
                quality: Math.max(config.minQuality, 70 - (attempt - 1) * config.qualityStep),
                // アルファチャンネルの品質も調整
                alphaQuality: Math.max(config.minQuality, 70 - (attempt - 1) * config.qualityStep)
              });
            convertedToWebp = true;
          }
          break;
        case '.webp':
          compressionOptions = {
            quality: Math.max(config.minQuality, 70 - (attempt - 1) * config.qualityStep),
            withMetadata: true,
            alphaQuality: Math.max(config.minQuality, 70 - (attempt - 1) * config.qualityStep)
          };
          transformer = sharp(filePath)
            .webp(compressionOptions);
          break;
      }

      // 一時ファイルに出力
      const outputFilePath = convertedToWebp 
        ? `${filePath}.webp` 
        : tempFilePath;

      await transformer.toFile(outputFilePath);

      // 圧縮後のファイルサイズをチェック
      const compressedStats = await fs.stat(outputFilePath);
      log(`Attempt ${attempt}: Compressed size is ${compressedStats.size} bytes`);

      // サイズ目標を達成したら置換
      if (compressedStats.size <= config.targetSize) {
        // WebPに変換された場合
        if (convertedToWebp) {
          // 元のPNGファイルを削除
          await fs.unlink(filePath);
          // WebPファイルをリネーム
          await fs.rename(outputFilePath, filePath.replace('.png', '.webp'));
        } else {
          // 通常の圧縮の場合
          await fs.rename(outputFilePath, filePath);
        }
        
        log(`Compressed ${filePath} successfully to ${compressedStats.size} bytes.`);
        compressed = true;
        break;
      }
    }

    // 最終的に圧縮できなかった場合
    if (!compressed) {
      log(`Could not compress ${filePath} to under ${config.targetSize} bytes after ${config.maxAttempts} attempts.`);
      
      // 一時ファイルを削除
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        log(`Error deleting temp file ${tempFilePath}:`, unlinkError);
      }
      
      return false;
    }

    // 新たに追加: 圧縮が成功した場合もtmpファイルを削除
    try {
      await fs.unlink(tempFilePath);
    } catch (unlinkError) {
      // tmpファイルが存在しない場合のエラーは無視
      if (unlinkError.code !== 'ENOENT') {
        log(`Error deleting temp file ${tempFilePath}:`, unlinkError);
      }
    }

    return true;
  } catch (error) {
    log(`Error compressing image ${filePath}:`, error);
    
    // 一時ファイルがあれば削除
    try {
      await fs.unlink(tempFilePath);
    } catch (unlinkError) {
      log(`Error deleting temp file ${tempFilePath}:`, unlinkError);
    }
    
    throw error;
  }
}

module.exports = {
  compressImage,
};

//使用例
/*
const { compressImage } = require('./imageHelper');

// デフォルト設定で使用
await compressImage('/path/to/image.jpg');

// カスタム設定で使用
await compressImage('/path/to/image.png', {
  compressionThreshold: 1024 * 1024, // 1MB
  targetSize: 750 * 1024, // 750KB
  qualityStep: 5,
  logFunction: customLogger
});
*/