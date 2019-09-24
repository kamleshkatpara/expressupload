const express = require('express')
const app = express()
const path = require('path');
const multer = require('multer')
const port = 3000
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const dburl = 'mongodb://localhost:27017/thermometerapp';
const chalk = require('chalk');
const connected = chalk.bold.cyan;
const error = chalk.bold.yellow;
const server = chalk.bold.red;
const fs = require('fs')


mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(connected(`Mongoose connection is open to  ${dburl}`)))
  .catch((err) => console.log(error(`Mongoose connection has occured ${err} error`)));

mongoose.set('useFindAndModify', false);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage }).single('datafile')

const DataSchema = new Schema({ ts: Number, value: Number })

app.get('/', (req, res) => res.sendFile(path.resolve('./index.html')))

app.post('/upload', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log('A Multer error occurred when uploading');
    } else if (err) {
      console.log('An unknown error occurred when uploading');
    }

    const stream = fs.readFileSync(`./uploads/${req.file.originalname}`, 'utf-8');
    const jsonData = JSON.parse(stream);

    const Data = mongoose.model('Data', DataSchema, req.file.originalname.substr(0, req.file.originalname.indexOf('.')));

    for (let i = 0; i < jsonData.length; i += 10000) {
      Data.collection.insertMany(jsonData.slice(i, i + 10000));
    }

    res.send(req.file)
  })
})

app.get('/read', function (req, res) {

  const stream = fs.readFileSync('./uploads/THERM0001.json', 'utf-8');
  const jsonData = JSON.parse(stream);

  for (let i = 0; i < jsonData.length; i += 10000) {
    Data.collection.insertMany(jsonData.slice(i, i + 10000));
  }

  res.send('Done');

});

app.listen(port, () => console.log(server(`Thermometer app listening on port ${port}!`)))
