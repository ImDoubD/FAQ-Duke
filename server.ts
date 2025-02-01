import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3000;

// Initialize connections
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});