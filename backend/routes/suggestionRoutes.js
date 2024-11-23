import express from 'express';
import * as suggestionController from '../controllers/suggestion-controller.js';

const router = express.Router();

router.route('/score') 
    .post(suggestionController.suggestScore);

export default router;