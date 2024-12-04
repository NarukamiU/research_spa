// server/helpers/imageHelper.js

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * 画像を圧縮する関数（ファイルサイズ基準、安全にファイルを置換）
 * @param {string} filePath - 圧縮する画像のファイルパス
 * @returns {Promise<void>}
 */
async function compressImage(filePath) {
  const COMPRESSION_THRESHOLD = 500 * 1024 ; // 500KB
  const TARGET_SIZE = 500 * 1024; // 500KB
  const ext = path.extname(filePath).toLowerCase();
  
  // ファイルサイズを取得
  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch (err) {
    console.error(`Cannot access file ${filePath}:`, err);
    throw err;
  }

  // 閾値未満の場合は圧縮をスキップ
  if (stats.size < COMPRESSION_THRESHOLD) {
    console.log(`Skipping compression for ${filePath} (size: ${stats.size} bytes)`);
    return;
  }

  let transformer = sharp(filePath);

  // オリジナルのフォーマットを維持しつつ圧縮
  switch (ext) {
    case '.jpeg':
    case '.jpg':
      transformer = transformer.jpeg({ quality: 70 }); // 初期品質70に設定
      break;
    case '.png':
      transformer = transformer.png({ compressionLevel: 8 }); // 圧縮レベル8に設定
      break;
    case '.webp':
      transformer = transformer.webp({ quality: 70 });
      break;
    default:
      // 他のフォーマットの場合は圧縮しない
      console.warn(`Unsupported file format for compression: ${ext}`);
      return;
  }

  // 一時ファイル名を生成
  const tempFilePath = `${filePath}.tmp`;

  try {
    // 一時ファイルに圧縮した画像を書き込む
    await transformer.toFile(tempFilePath);
    
    // 圧縮後のファイルサイズを取得
    let compressedStats = await fs.stat(tempFilePath);

    // 目標サイズに達するまで品質を調整
    while (compressedStats.size > TARGET_SIZE) {
      let quality = Math.max(10, Math.floor((TARGET_SIZE / compressedStats.size) * 70)); // 品質を調整
      transformer = sharp(filePath);
      switch (ext) {
        case '.jpeg':
        case '.jpg':
          transformer = transformer.jpeg({ quality });
          break;
        case '.png':
          transformer = transformer.png({ compressionLevel: 8 });
          break;
        case '.webp':
          transformer = transformer.webp({ quality });
          break;
      }
      await transformer.toFile(tempFilePath);
      compressedStats = await fs.stat(tempFilePath);
    }

    // 元のファイルを置換（上書き）
    await fs.rename(tempFilePath, filePath);
    console.log(`Compressed ${filePath} successfully to ${compressedStats.size} bytes.`);
  } catch (error) {
    console.error(`Error compressing image ${filePath}:`, error);
    // 一時ファイルが存在すれば削除
    try {
      await fs.unlink(tempFilePath);
    } catch (unlinkError) {
      console.error(`Error deleting temp file ${tempFilePath}:`, unlinkError);
    }
    throw error; // エラーを再スロー
  }
}

module.exports = {
  compressImage,
};