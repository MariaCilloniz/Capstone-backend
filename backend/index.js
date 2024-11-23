import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import analysisRoutes from './routes/analysisRoutes.js'
import redditRoutes from './routes/redditRoutes.js'
import suggestionRoutes from './routes/suggestionRoutes.js';


const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/reddit', redditRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/suggestion', suggestionRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

