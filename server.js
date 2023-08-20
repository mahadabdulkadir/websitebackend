const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fileRoutes = require('./routes/fileRoutes');
const { PORT, MONGODB_URI } = require('./utils/constants');

const app = express();

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use(fileRoutes);

app.get('/', (req, res) => res.send('Hello from the server!'));

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));


