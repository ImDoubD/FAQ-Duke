import express from 'express';
import bodyParser from 'body-parser';
import faqRoutes from './routes/faqRoutes';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis'

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/faq', faqRoutes);

connectDB();
connectRedis();

export default app;