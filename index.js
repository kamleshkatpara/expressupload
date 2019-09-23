const express = require('express')
const app = express()
const path = require('path');
const multer  = require('multer')
const port = 3000
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const dburl = 'mongodb://localhost:27017/thermometerapp';
const chalk = require('chalk');
const connected = chalk.bold.cyan;
const error = chalk.bold.yellow;
const server = chalk.bold.red;
const fs = require('fs')
const async = require('async')
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

app.get('/', (req, res) => res.sendFile(path.resolve('./index.html')))

app.post('/upload', function (req, res) {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          console.log('A Multer error occurred when uploading');
        } else if (err) {
            console.log('An unknown error occurred when uploading');
        }

        const absolutePath = path.join('./uploads/', req.file.originalname);
        const jsonString = fs.readFileSync(absolutePath, "utf-8");
        const jsonObject = JSON.parse(jsonString);

        let DataSchema = new Schema({
            ts: Number,
            value: Number
        })
        
        const Data = mongoose.model('Data', DataSchema, 'temperatures');

        Data.collection.insert(jsonObject)  
        .then((res) => {
            console.log("insert sampleCollection result ", res);
        })
        .catch(err => {
            console.log("bulk insert sampleCollection error ", err);
        });
        
        res.send(req.file)
    })
})

app.get('/read', async (req, res) => {
  const jsonString = JSON.parse(fs.readFileSync('./uploads/THERM0001.json', "utf-8"));

  let DataSchema = new Schema({
    ts: Number,
    value: Number
  })

  const Data = mongoose.model('Data', DataSchema, 'temperatures');

  timer = (new Date()).getTime() / 1000;

  for (let i = 0; i < jsonString.length; i += 100000) {
    if( i % 100000 === 0 ) {
      await Data.collection.insert(jsonString.slice(i, i + 100000), {ordered: false});
    }
  }

  res.send('Done')
});

app.listen(port, () => console.log(server(`Thermometer app listening on port ${port}!`)))
