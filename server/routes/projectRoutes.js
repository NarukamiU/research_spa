// server/routes/projectRoutes.js
//ルーティング設定(server.js)
//app.use('/api/image-classing/projects', projectRoutes);

const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Multerのストレージ設定 for training-data
const trainingStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const { projectId, labelName } = req.params;
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', req.session.username, 'image-classing', projectId, 'training-data', labelName);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

const trainingUpload = multer({ storage: trainingStorage });

// Multerのストレージ設定 for verify-data
const verifyStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const { projectId, labelName } = req.params;
    const uploadPath = path.join(__dirname,'..','..','uploads',req.session.username,'image-classing',projectId,'verify-data',labelName);
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

const verifyUpload = multer({ storage: verifyStorage });

// プロジェクト一覧取得エンドポイント
router.get('/', authMiddleware, projectController.getProjects);
// プロジェクト作成エンドポイント
router.post('/', authMiddleware, projectController.createProject);
// プロジェクト詳細取得エンドポイント
router.get('/:projectId', authMiddleware, projectController.getProjectDetails);
// プロジェクト削除エンドポイント
router.delete('/:projectId', authMiddleware, projectController.deleteProject);
// プロジェクトリネームエンドポイント
router.put('/:projectId/rename', authMiddleware, projectController.renameProject);



//trainingデータ連エンドポイント
router.post('/:projectId/training-data/labels', authMiddleware, projectController.addTrainingLabel);
router.delete('/:projectId/training-data/labels/:labelName', authMiddleware, projectController.deleteTrainingLabel);
router.delete('/:projectId/training-data/labels/:labelName/images/:imageName', authMiddleware, projectController.deleteTrainingLabelImages);
router.get('/:projectId/training-data/labels', authMiddleware, projectController.getTrainingLabels);
router.get('/:projectId/training-data/labels/:labelName/images', authMiddleware, projectController.getTrainingLabelImages);
router.post('/:projectId/training-data/labels/:labelName/upload', authMiddleware, trainingUpload.array('images', 10), projectController.uploadTrainingImages);
//複数画像いける
router.post('/:projectId/training-data/labels/:label/move-images', authMiddleware, projectController.moveTrainingImages);
router.put('/:projectId/training-data/labels/:labelName/rename',authMiddleware, projectController.renameTrainingLabel);






// Verifyデータ関連エンドポイント
router.post('/:projectId/verify-data/labels', authMiddleware, projectController.addVerifyLabel);
router.delete('/:projectId/verify-data/labels/:labelName', authMiddleware, projectController.deleteVerifyLabel);
router.delete('/:projectId/verify-data/labels/:labelName/images/:imageName', authMiddleware, projectController.deleteVerifyLabelImages);
router.get('/:projectId/verify-data/labels', authMiddleware, projectController.getVerifyLabels);
router.get('/:projectId/verify-data/labels/:labelName/images', authMiddleware, projectController.getVerifyLabelImages);
router.post('/:projectId/verify-data/labels/:label/move-images', authMiddleware, projectController.moveVerifyImages);
router.post('/:projectId/verify-data/labels/:labelName/upload', authMiddleware, verifyUpload.array('images', 10), projectController.uploadVerifyImages);
router.put('/:projectId/verify-data/labels/:labelName/rename',authMiddleware, projectController.renameVerifyLabel);


// 学習エンドポイント
router.post('/:projectId/train', authMiddleware, projectController.trainModel);

// 検証エンドポイント
router.post('/:projectId/verify-data/labels/:label/verify', authMiddleware, projectController.verifyData);

// 検証結果取得エンドポイント
router.get('/:projectId/verify-data/labels/:label/verification-results', authMiddleware, projectController.getVerificationResults);

module.exports = router;