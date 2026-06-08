import { Router } from 'express';
import { pushController } from './push.controller.js';
import { validateBody } from '../../middleware/validateRequest.js';
import { pushSubscriptionSchema } from './push.schema.js';

const router = Router();

// Get VAPID public key
router.get('/vapid-public-key', pushController.getPublicKey);

// Subscribe to push notifications
router.post(
  '/subscribe',
  validateBody(pushSubscriptionSchema),
  pushController.subscribe
);

// Unsubscribe from push notifications
router.post('/unsubscribe', pushController.unsubscribe);

export default router;
