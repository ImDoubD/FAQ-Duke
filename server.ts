import app from './app';

const PORT = process.env.PORT || 3000;

// Initialize connections

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});