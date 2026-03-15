const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const filesController = require('../controllers/files');
const jobsController = require('../controllers/jobs');
const leadsController = require('../controllers/leads');
const authMiddleware = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/files/upload', authMiddleware, uploadMiddleware.single('file'), filesController.uploadFile);
router.get('/jobs/:jobId', authMiddleware, jobsController.getJobStatus);
router.get('/jobs/:jobId/result', authMiddleware, jobsController.getJobResult);
router.post('/interest', leadsController.submitInterest);

module.exports = router;