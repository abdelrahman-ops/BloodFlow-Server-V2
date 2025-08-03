import express  from 'express';
import admin from './admin.routes.js';
import auth from './auth.routes.js';
import requests from './request.routes.js';
import emergency from './emergency.routes.js'
import donors from './donor.routes.js';
import notification from './notification.routes.js'

const router = express.Router();

router.use('/auth', auth);
router.use('/requests', requests);
router.use('/emergency', emergency);
router.use('/donors', donors);
router.use('/admin', admin);
router.use('/notification', notification);

export default router;