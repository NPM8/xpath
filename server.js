#!/usr/bin/env node
'use strict';

const http = require('http');

const fs = require('fs');

const path = require('path');

const api = require('./routes/api');

const libxml = require('libxmljs');

const mimeTypes = {
  '.html': 'text/html',
  '.xml': 'text/xml',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.svg': 'application/image/svg+xml'
};
let xml = [];

const wojArr = [];

function addXML (url) {
  fs.readFile(url, (err, data) => {
    if (err) {
      throw err;
    }
    let dataTmp = data.toString().replace(/\r?\n|\r| {2,}/g, '');
    xml.push(libxml.parseXmlString(dataTmp));

    if (xml.length === 1) {
      let obj = xml[0].find('//row[NAZWA_DOD=\'województwo\']');

      for (let value of obj) {
        let tmp = {};
        tmp.value = value.get('WOJ').text();
        tmp.text = value.get('NAZWA').text();
        wojArr.push(tmp);
      }
    }
  });
}
addXML('./public/xml/TERC_Urzedowy_2018-09-04.xml');
addXML('./public/xml/SIMC_Urzedowy_2018-09-04.xml');

let reqArr = {
  pow: [],
  gmi: [],
  mia: []
};
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  let filePath;
  console.log('request ', req.url.split('/')[1]);
  switch (req.url.split('/')[1]) {
    case 'api':
      api(req, res, xml, wojArr, reqArr);
      break;
    default:
      filePath = './public' + req.url;
      if (filePath === './public/') {
        filePath = './public/index.html';
      }

      let ext = String(path.extname(filePath)).toLocaleLowerCase();

      let contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            fs.readFile('./error/404.html', function (_error, content) {
              res.writeHead(200, { 'Content-Type': contentType });
              res.end(content, 'utf-8');
            });
          } else {
            res.writeHead(500);
            res.end('Sorry, check with the site admin for error: ' + err.code + ' ..\n');
            res.end();
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
  }
}).listen(PORT);

console.log(`App ${PORT}`);
