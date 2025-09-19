const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const MONGO_URI =
	process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard';
mongoose
	.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('Connected to MongoDB'))
	.catch((err) => console.error('MongoDB connection error:', err));

const app = express();
const port = process.env.PORT || 3000;

app.use('/dashboard', express.static(path.join(__dirname, 'src/view')));
app.use(express.json());

const productRoutes = require('./src/routes/product.routes');
app.use('/api', productRoutes);

app.get('/', (req, res) => {
	res.json({ message: 'Hello from Express API!' });
});

app.get('/api/config', (req, res) => {
	res.json({
		API_BASE_URL: process.env.API_BASE_URL || '',
		CRAWLER_API_ENDPOINT: process.env.CRAWLER_API_ENDPOINT || '',
	});
});

app.listen(port, () => {
	console.log(`API server listening at http://localhost:${port}`);
});
