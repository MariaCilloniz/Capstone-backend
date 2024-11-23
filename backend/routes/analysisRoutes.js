import express from 'express';
import * as analysisController from '../controllers/analysis-controller.js';



const router = express.Router();

router.route('/')
    .post(analysisController.analyzeText);
    
export default router;
