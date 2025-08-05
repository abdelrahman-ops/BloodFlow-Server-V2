import express from 'express';
import { addDonation, getDonorProfile, getDonors, getNearbyRequests, updateAvailability, updateHealthInfo } from '../controllers/donor.controller.js';
import { protect } from '../middlewares/auth.js';


const router = express.Router();

router.get('/', getDonors);
router.get('/profile', protect, getDonorProfile);
router.put('/availability', protect, updateAvailability);
router.get('/nearby-requests', protect, getNearbyRequests);
router.post('/donate', protect , addDonation);
router.put('/health-info', protect , updateHealthInfo);


export default router;