import express from 'express';
import cors from 'cors';
import passport from './config/passport';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';

const app = express();

// Middleware
app.use(cors({
  origin: env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:8081']
    : process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Static files
app.use('/uploads', express.static('public/uploads'));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
});

export default app;
