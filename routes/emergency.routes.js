import express from 'express';
import { createEmergencyRequest, getEmergencyRequests, trackEmergencyRequest, updateEmergencyRequestStatus } from '../controllers/emergency.controller.js';


const router = express.Router();


router.post('/', createEmergencyRequest);
router.get('/',  getEmergencyRequests);
router.put('/:id/status',  updateEmergencyRequestStatus);
router.get('/:id/updates', trackEmergencyRequest);

export default router;