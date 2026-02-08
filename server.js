const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use(require('./middleware/errorMiddleware'));
app.use('/api/anime', require('./routes/animeRoutes'));


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

