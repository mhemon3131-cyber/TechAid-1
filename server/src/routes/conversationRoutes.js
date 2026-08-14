import express from 'express';
import { getOrCreateConversation, getMessages, listUserConversations } from '../controllers/conversationController.js';
import { startCall, endCall } from '../controllers/callController.js';

const router = express.Router();

router.get('/', listUserConversations);
router.get('/service-request/:serviceRequestId', getOrCreateConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/calls', startCall);
router.patch('/calls/:id/end', endCall);

export default router;
