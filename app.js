const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const extractorRoute = require('./routes/extractorRoute');
const morgan = require('morgan');

const app = express();

// Menampilkan log setiap request route yang diakses
app.use(morgan('combined'));

// Gunakan middleware "cors"
app.use(cors());
app.options('*', cors());
const corsOptions = {
  origin: 'http://localhost:8081'
};

app.use(cors(corsOptions));

// Middleware untuk memproses body pada request HTTP
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Gunakan rute yang telah dibuat
app.use(extractorRoute);

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
