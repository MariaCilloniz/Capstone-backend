import express from "express";
import * as redditController from '../controllers/reddit-controller.js'

const router = express.Router();


router
    .route("/:subreddit")
    .get(redditController.analyzeSubreddit)

export default router;
