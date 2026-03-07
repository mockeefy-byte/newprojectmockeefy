import express from 'express';
import * as certificationController from '../controllers/certificationController.js';

const router = express.Router();

router.get('/status/:userId', certificationController.getCertificationStatus);
router.post('/issue', certificationController.issueCertificate);

export default router;
