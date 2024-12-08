// server/controllers/projectController.js

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const util = require('util');
const {sessionSocketMap} = require('../sockets/socketHandler');
const { compressImage } = require('../helpers/imageHelper');
const TFhelper = require('../TFhelper');


// プロミス化
const mkdir = util.promisify(fs.mkdir);
const access = util.promisify(fs.access);
const readdir = util.promisify(fs.readdir);
const rm = util.promisify(fs.rm);
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);

// プロジェクト一覧取得
exports.getProjects = async (req, res) => {
  const username = req.session.username;
  const projectsDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing');

  try {
    await access(projectsDir, fs.constants.F_OK);
    const files = await readdir(projectsDir);
    const projectDirs = files.filter(file => {
      const filePath = path.join(projectsDir, file);
      return fs.statSync(filePath).isDirectory();
    });
    res.json({ success: true, projects: projectDirs });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('プロジェクトディレクトリが存在しません:', err);
      return res.status(404).json({ success: false, message: 'プロジェクトディレクトリが見つかりません。' });
    }
    console.error('プロジェクト一覧取得エラー:', err);
    return res.status(500).json({ success: false, message: 'プロジェクト一覧の取得に失敗しました。' });
  }
};

// プロジェクト作成
exports.createProject = async (req, res) => {
  const username = req.session.username;
  const { projectName } = req.body;

  if (!projectName) {
    return res.status(400).json({ success: false, message: 'プロジェクト名が提供されていません。' });
  }

  const projectDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectName);


  try {
    await mkdir(projectDir, { recursive: true });
    console.log(`Project directory created: ${projectDir}`);

    const trainingDataDir = path.join(projectDir, 'training-data');
    const verifyDataDir = path.join(projectDir, 'verify-data');

    await mkdir(trainingDataDir, { recursive: true });
    await mkdir(verifyDataDir, { recursive: true });
    
    // セッションIDの取得
    const sessionID = req.sessionID;

    // Socketに通知する処理は別途Socketハンドラー内で行う

    return res.json({ success: true, message: 'プロジェクトが作成されました。' });
  } catch (error) {
    console.error('プロジェクトディレクトリ作成エラー:', error);
    return res.status(500).json({ success: false, message: 'プロジェクト作成に失敗しました。' });
  }
};

// プロジェクト削除
exports.deleteProject = async (req, res) => {
    const username = req.session.username;
    const { projectId } = req.params;
  
    const projectDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId);
  
    try {
      await rm(projectDir, { recursive: true, force: true });
      res.json({ success: true, message: 'プロジェクトが正常に削除されました。' });
    } catch (err) {
      console.error('プロジェクト削除エラー:', err);
      return res.status(500).json({ success: false, message: 'プロジェクトの削除に失敗しました。' });
    }
};


// プロジェクトリネーム
exports.renameProject = async (req, res) => {
  const username = req.session.username;
  const { projectId } = req.params;
  const { newProjectName } = req.body;

  if (!newProjectName) {
    return res.status(400).json({ success: false, message: '新しいプロジェクト名が提供されていません。' });
  }

  const oldProjectDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId);
  const newProjectDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', newProjectName);

  try {
    await rename(oldProjectDir, newProjectDir);
    res.json({ success: true, message: 'プロジェクトが正常にリネームされました。' });
  } catch (err) {
    console.error('プロジェクトリネームエラー:', err);
    return res.status(500).json({ success: false, message: 'プロジェクトのリネームに失敗しました。' });
  }
};

// プロジェクト詳細取得
exports.getProjectDetails = async (req, res) => {
  const username = req.session.username;
  const { projectId } = req.params;
  const projectDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId);

  try {
    await access(projectDir, fs.constants.F_OK);
    // ここで必要な詳細情報を追加で取得可能
    res.json({ success: true, project: { id: projectId, path: projectDir } });
  } catch (err) {
    console.error('プロジェクトディレクトリが存在しません:', err);
    return res.status(404).json({ success: false, message: 'プロジェクトディレクトリが見つかりません。' });
  }
};

// トレーニングデータ用ラベル追加
exports.addTrainingLabel = async (req, res) => {
  const username = req.session.username;
  const { projectId } = req.params;
  const { labelName } = req.body;

  if (!labelName) {
    return res.status(400).json({ success: false, message: 'ラベル名が提供されていません。' });
  }

  const labelDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'training-data', labelName);
  console.log(labelDir);
  try {
    await mkdir(labelDir, { recursive: true });
    res.json({ success: true, message: 'ラベルが正常に追加されました。' });
  } catch (err) {
    console.error('ラベルディレクトリ作成エラー:', err);
    return res.status(500).json({ success: false, message: 'ラベルディレクトリの作成に失敗しました。' });
  }
};


// トレーニングデータ用ラベルリネーム
exports.renameTrainingLabel = async (req, res) => {
  const username = req.session.username;
  const { projectId, labelName } = req.params;
  const { newLabelName } = req.body;

  if (!newLabelName) {
    return res.status(400).json({ success: false, message: '新しいラベル名が必要です。' });
  }

  const oldLabelDir = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    username,
    'image-classing',
    projectId,
    'training-data',
    labelName
  );
  const newLabelDir = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    username,
    'image-classing',
    projectId,
    'training-data',
    newLabelName
  );

  try {
    // 新しいラベルディレクトリが既に存在するか確認
    await access(newLabelDir, fs.constants.F_OK);
    // 存在する場合はエラーを返す
    return res.status(400).json({ success: false, message: '新しいラベル名が既に存在します。' });
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('ラベルリネームエラー:', err);
      return res.status(500).json({ success: false, message: 'ラベルのリネームに失敗しました。' });
    }
    // 新しいディレクトリが存在しない場合はリネームを実行
  }

  try {
    await fs.promises.rename(oldLabelDir, newLabelDir);
    res.json({ success: true, message: 'ラベルがリネームされました。' });
  } catch (err) {
    console.error('ラベルリネームエラー:', err);
    res.status(500).json({ success: false, message: 'ラベルのリネームに失敗しました。' });
  }
};

// トレーニングデータ用ラベル削除
exports.deleteTrainingLabel = async (req, res) => {
  const username = req.session.username;
  const { projectId, labelName } = req.params;

  const labelDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'training-data', labelName);

  try {
    await rm(labelDir, { recursive: true, force: true });
    res.json({ success: true, message: 'ラベルが正常に削除されました。' });
  } catch (err) {
    console.error('ラベルディレクトリ削除エラー:', err);
    return res.status(500).json({ success: false, message: 'ラベルディレクトリの削除に失敗しました。' });
  }
};


exports.deleteTrainingLabelImages = async (req, res) => {
  const username = req.session.username;
  const { projectId, labelName, imageName } = req.params;

  if (!projectId || !labelName || !imageName) {
    return res.status(400).json({ success: false, message: '必要なパラメータが不足しています。' });
  }

  const imagePath = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    username,
    'image-classing',
    projectId,
    'training-data',
    labelName,
    imageName
  );

  try {
    // 画像ファイルが存在するか確認
    await access(imagePath, fs.constants.F_OK);

    // 画像ファイルを削除
    await unlink(imagePath);

    console.log(`画像削除成功: ${imagePath}`);
    return res.json({ success: true, message: '画像の削除に成功しました。' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`画像が存在しません: ${imagePath}`);
      return res.status(404).json({ success: false, message: `画像 "${imageName}" が見つかりません。` });
    }

    console.error('画像削除エラー:', error);
    return res.status(500).json({ success: false, message: '画像の削除に失敗しました。' });
  }
};

// トレーニングデータ用ラベル一覧取得
exports.getTrainingLabels = async (req, res) => {
  try {
    const { projectId } = req.params;
    const username = req.session.username;

    const labelsDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'training-data');
    const labelDirs = await readdir(labelsDir);

    const labelList = labelDirs.filter(file => {
      const filePath = path.join(labelsDir, file);
      return fs.statSync(filePath).isDirectory();
    });

    res.json({ success: true, labels: labelList });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('ラベルディレクトリが存在しません:', err);
      return res.status(404).json({ success: false, message: 'ラベルディレクトリが見つかりません。' });
    }
    console.error('ラベル一覧取得エラー:', err);
    return res.status(500).json({ success: false, message: 'ラベル一覧の取得に失敗しました。' });
  }
};

// トレーニングデータ用ラベル内の画像取得
exports.getTrainingLabelImages = async (req, res) => {
  const username = req.session.username;
  const { projectId, labelName } = req.params;

  const labelDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'training-data', labelName);

  try {
    await access(labelDir, fs.constants.F_OK);
    const files = await readdir(labelDir);
    const imageFiles = files.filter(file => {
      const filePath = path.join(labelDir, file);
      return fs.statSync(filePath).isFile() && /\.(jpg|jpeg|JPG|png|PNG|webp|bmp)$/.test(file);
    });
    res.json({ success: true, images: imageFiles });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('ラベルディレクトリが存在しません:', err);
      return res.status(404).json({ success: false, message: 'ラベルディレクトリが見つかりません。' });
    }
    console.error('ラベル画像取得エラー:', err);
    return res.status(500).json({ success: false, message: 'ラベル画像の取得に失敗しました。' });
  }
};

// トレーニングデータ用の画像アップロード
exports.uploadTrainingImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'アップロードする画像がありません。' });
  }

  try {
    // 画像圧縮処理を並列で実行
    const compressPromises = req.files.map(async (file) => {
      const filePath = file.path;
      await compressImage(filePath); // 画像を圧縮
      return file.filename;
    });

    const uploadedFiles = await Promise.all(compressPromises);
    res.json({ success: true, images: uploadedFiles });
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    res.status(500).json({ success: false, message: '画像のアップロード中にエラーが発生しました。' });
  }
};


exports.moveTrainingImages = async (req, res) => {
  const username = req.session.username;
  const { projectId, label } = req.params;
  const { targetLabel, images } = req.body; // images は画像名の配列

  // バリデーション
  if (!projectId || !label || !targetLabel || !images || !Array.isArray(images)) {
    return res.status(400).json({ success: false, message: '必要なデータが不足しています。' });
  }

  try {
    for (const imageName of images) {
      const sourcePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        username,
        'image-classing',
        projectId,
        'training-data',
        label,
        imageName
      );

      const targetPath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        username,
        'image-classing',
        projectId,
        'training-data',
        targetLabel,
        imageName
      );

      // ソースファイルの存在確認
      await access(sourcePath, fs.constants.F_OK);

      // ターゲットディレクトリの存在確認・作成
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // ファイルの移動
      await rename(sourcePath, targetPath);
    }

    console.log(`画像の移動成功: プロジェクトID=${projectId}, ラベル=${label} → ${targetLabel}`);
    return res.json({ success: true, message: '画像の移動に成功しました。' });
  } catch (error) {
    console.error('画像移動エラー:', error);
    return res.status(500).json({ success: false, message: '画像の移動に失敗しました。' });
  }
};


// Verifyデータ用ラベル追加
exports.addVerifyLabel = async (req, res) => {
  const username = req.session.username;
  const { projectId } = req.params;
  const { labelName } = req.body;

  if (!labelName) {
    return res.status(400).json({ success: false, message: 'ラベル名が提供されていません。' });
  }

  const labelDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'verify-data', labelName);

  try {
    await mkdir(labelDir, { recursive: true });
    res.json({ success: true, message: 'ラベルが正常に追加されました。' });
  } catch (err) {
    console.error('Verifyデータラベルディレクトリ作成エラー:', err);
    return res.status(500).json({ success: false, message: 'Verifyデータラベルディレクトリの作成に失敗しました。' });
  }
};

// Verifyデータ用ラベル削除
exports.deleteVerifyLabel = async (req, res) => {
  const username = req.session.username;
  const { projectId, labelName } = req.params;

  const labelDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'verify-data', labelName);

  try {
    await rm(labelDir, { recursive: true, force: true });
    res.json({ success: true, message: 'Verifyデータラベルが正常に削除されました。' });
  } catch (err) {
    console.error('Verifyデータラベルディレクトリ削除エラー:', err);
    return res.status(500).json({ success: false, message: 'Verifyデータラベルディレクトリの削除に失敗しました。' });
  }
};

// Verifyデータ用ラベル一覧取得
exports.getVerifyLabels = async (req, res) => {
  const username = req.session.username;
  const { projectId } = req.params;

  const verifyLabelsDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'verify-data');

  try {
    await access(verifyLabelsDir, fs.constants.F_OK);
    const files = await readdir(verifyLabelsDir);
    const verifyLabelDirs = files.filter(file => {
      const filePath = path.join(verifyLabelsDir, file);
      return fs.statSync(filePath).isDirectory();
    });
    res.json({ success: true, labels: verifyLabelDirs });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Verifyデータラベルディレクトリが存在しません:', err);
      return res.status(404).json({ success: false, message: 'Verifyデータラベルディレクトリが見つかりません。' });
    }
    console.error('Verifyデータラベル一覧取得エラー:', err);
    return res.status(500).json({ success: false, message: 'Verifyデータラベル一覧の取得に失敗しました。' });
  }
};

// Verifyデータ用ラベル内の画像取得
exports.getVerifyLabelImages = async (req, res) => {
  const username = req.session.username;
  const { projectId, labelName } = req.params;

  const labelDir = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'verify-data', labelName);

  try {
    await access(labelDir, fs.constants.F_OK);
    const files = await readdir(labelDir);
    const imageExtensions = ['.jpg', '.jpeg', '.JPG', '.PNG', '.png', '.bmp', '.webp'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    res.json({ success: true, images: imageFiles });
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Verifyデータラベルディレクトリが存在しません:', err);
      return res.status(404).json({ success: false, message: 'Verifyデータラベルディレクトリが見つかりません。' });
    }
    console.error('Verifyデータラベル画像取得エラー:', err);
    return res.status(500).json({ success: false, message: 'Verifyデータラベル画像の取得に失敗しました。' });
  }
};

// verify用の画像アップロード（既存）
exports.uploadVerifyImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'アップロードする画像がありません。' });
  }

  try {
    // 画像圧縮処理を並列で実行
    const compressPromises = req.files.map(async (file) => {
      const filePath = file.path;
      await compressImage(filePath); // 画像を圧縮
      return file.filename;
    });

    const uploadedFiles = await Promise.all(compressPromises);
    res.json({ success: true, images: uploadedFiles });
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    res.status(500).json({ success: false, message: '画像のアップロード中にエラーが発生しました。' });
  }
};

exports.deleteVerifyLabelImages = async (req, res) => {
  const username = req.session.username;
  const { projectId, labelName, imageName } = req.params;

  if (!projectId || !labelName || !imageName) {
    return res.status(400).json({ success: false, message: '必要なパラメータが不足しています。' });
  }

  const imagePath = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    username,
    'image-classing',
    projectId,
    'verify-data',
    labelName,
    imageName
  );

  try {
    // 画像ファイルが存在するか確認
    await access(imagePath, fs.constants.F_OK);

    // 画像ファイルを削除
    await unlink(imagePath);

    console.log(`画像削除成功: ${imagePath}`);
    return res.json({ success: true, message: '画像の削除に成功しました。' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`画像が存在しません: ${imagePath}`);
      return res.status(404).json({ success: false, message: `画像 "${imageName}" が見つかりません。` });
    }

    console.error('画像削除エラー:', error);
    return res.status(500).json({ success: false, message: '画像の削除に失敗しました。' });
  }
}


// Verifyデータ用ラベルリネーム
exports.renameVerifyLabel = async (req, res) => {
  const username = req.session.username;
  const { projectId, labelName } = req.params;
  const { newLabelName } = req.body;

  if (!newLabelName) {
    return res.status(400).json({ success: false, message: '新しいラベル名が必要です。' });
  }

  const oldLabelDir = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    username,
    'image-classing',
    projectId,
    'verify-data',
    labelName
  );
  const newLabelDir = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    username,
    'image-classing',
    projectId,
    'verify-data',
    newLabelName
  );

  try {
    await rename(oldLabelDir, newLabelDir);
    res.json({ success: true, message: 'ラベルをリネームしました。' });
  } catch (err) {
    console.error('Verifyラベルリネームエラー:', err);
    res.status(500).json({ success: false, message: 'ラベルのリネームに失敗しました。' });
  }
};



//検証画像の移動
exports.moveVerifyImages = async (req, res) => {
  try {
    const username = req.session.username;
    const { projectId, label } = req.params; // `labelName` から `label` に変更
    const { targetLabel, images } = req.body;

    console.log('moveVerifyImages called with:', { username, projectId, label, targetLabel, images });

    if (!username) {
      return res.status(401).json({ success: false, message: '認証されていません。' });
    }

    if (!targetLabel || !images || !Array.isArray(images)) {
      return res.status(400).json({ success: false, message: '必要なデータが不足しています。' });
    }

    for (const imageName of images) {
      const sourcePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        username,
        'image-classing',
        projectId,
        'verify-data',
        label,
        imageName
      );

      const targetDir = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        username,
        'image-classing',
        projectId,
        'verify-data',
        targetLabel
      );

      const targetPath = path.join(targetDir, imageName);

      console.log(`Moving image from ${sourcePath} to ${targetPath}`);

      try {
        await access(sourcePath, fs.constants.F_OK);
      } catch (err) {
        console.error(`画像が存在しません: ${sourcePath}`);
        return res.status(404).json({ success: false, message: `画像 "${imageName}" が見つかりません。` });
      }

      try {
        await access(targetDir, fs.constants.F_OK);
      } catch (err) {
        console.log(`移動先ディレクトリが存在しないため作成します: ${targetDir}`);
        await mkdir(targetDir, { recursive: true });
      }

      try {
        await rename(sourcePath, targetPath);
        console.log(`画像を移動しました: ${imageName}`);
      } catch (err) {
        console.error(`画像移動中にエラーが発生しました: ${err}`);
        return res.status(500).json({ success: false, message: '画像移動中にエラーが発生しました。' });
      }
    }

    res.json({ success: true, message: '画像の移動に成功しました。' });
  } catch (error) {
    console.error('moveVerifyImages エラー:', error);
    res.status(500).json({ success: false, message: 'サーバー内部エラーが発生しました。' });
  }
};

// 学習プロセス開始
exports.trainModel = async (req, res) => {
  const username = req.session.username;
  const { projectId } = req.params;

  const trainingDataPath = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'training-data');
  try {
    // セッションIDを取得
    const sessionID = req.session.id;
    const socket = sessionSocketMap.get(sessionID); // ソケットを取得

    if (!socket) {
      return res.status(400).json({ success: false, message: 'ソケットが接続されていません。' });
    }
    // 学習プロセスを非同期で開始
    TFhelper.learnTransferModel(trainingDataPath)
      .then(([model, classes]) => {
        console.log('学習完了');
        socket.emit('trainingProgress', '学習が完了しました。');
      })
      .catch((error) => {
        console.error('Training failed:', error);
      });

    res.json({ success: true, message: '学習が開始されました。' });
  } catch (error) {
    console.error('学習開始エラー:', error);
    res.status(500).json({ success: false, message: '学習の開始に失敗しました。' });
  }
};

// 検証プロセス開始
exports.verifyData = async (req, res) => {
  const username = req.session.username;
  const { projectId, label } = req.params;

  const verifyDataPath = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'verify-data', label);
  const modelPath = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'model', 'model.json');
  const classPath = path.join(__dirname, '..', '..', 'uploads', username, 'image-classing', projectId, 'model', 'classes.json');

  try {
    await fsp.access(modelPath, fs.constants.F_OK);
  } catch (err) {
    return res.status(400).json({ success: false, message: 'モデルが存在しません。学習を先に実行してください。' });
  }

  try {
    // 検証プロセスを非同期で開始
    await TFhelper.validateImages(verifyDataPath)
      .then((result) => {
        console.log('検証完了');
      })
      .catch((error) => {
        console.error('Validation failed:', error);
      });

    res.json({ success: true, message: '検証が開始されました。' });
  } catch (error) {
    console.error('検証開始エラー:', error);
    res.status(500).json({ success: false, message: '検証の開始に失敗しました。' });
  }
};

// 検証結果取得
exports.getVerificationResults = async (req, res) => {
  const username = req.session.username;
  const { projectId, label } = req.params;

  const resultsPath = path.join(
    __dirname,
    '..',
    '..',
    'uploads',
    username,
    'image-classing',
    projectId,
    'verify-data',
    label,
    'verify-result.json'
  );

  try {
    // ファイルの存在と読み取り権限を確認
    await fsp.access(resultsPath, fs.constants.R_OK);

    // ファイルを読み取る
    const data = await fsp.readFile(resultsPath, 'utf-8');
    const verificationResults = JSON.parse(data);

    res.json({ success: true, results: verificationResults });
  } catch (err) {
    console.error('Error fetching verification results:', err);
    res.status(500).json({ success: false, message: '検証結果の取得に失敗しました。' });
  }
};