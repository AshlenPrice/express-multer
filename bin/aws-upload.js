'use strict';

require('dotenv').load();
const crypto = require('crypto');
const mime = require('mime');
const path = require('path');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');

let file = {
  path: process.argv[2],
  title: process.argv[3]
};
let mimeType = mime.lookup(file.path);

let ext = path.extname(file.path);
let folder = (new Date()).toISOString().split('T')[0];

// file.path is the same as process.argv[2]
let stream = fs.createReadStream(file.path);

new Promise((resolve, reject) => {
    crypto.randomBytes(16, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        console.log("buffer is ", buffer.toString('hex'));
        resolve(buffer.toString('hex'));
      }
    });
  }).then((filename) => {
    let params = {
      ACL: 'public-read',
      ContentType: mimeType,
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${folder}/${filename}${ext}`,
      Body: stream
    };


    return new Promise((resolve, reject) => {
      s3.upload(params, function(error, data) {
        if (error) {
          // console.log(error);
          reject(error);
        } else {
          // console.log(data);
          resolve(data);
        }
      });
    });
  })
  .then(console.log)
  .catch(console.error);
