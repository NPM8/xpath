#!/usr/bin/env node
const libxmljs = require('libxmljs');

const { request } = require('http');

const qs = require('querystring');

module.exports = function api (req, res, xmlDom, woj, reqArr) {
  switch (req.url.split('/')[2]) {
    case 'woj':
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(woj), 'utf-8');
      break;
    case 'pow':
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          body = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          let tmpRes = reqArr.pow.find(value => value.string === JSON.stringify(body));
          if (tmpRes) {
            res.end(tmpRes.res, 'utf-8');
          } else {
            let response = [];
            let path = `//row[POW[node()]][WOJ=${body.woj}][GMI[not(node())]]`;
            let obj = xmlDom[0].find(path);
            for (let value of obj) {
              let tmp = {};
              tmp.value = value.get('POW').text();
              tmp.text = value.get('NAZWA').text();
              response.push(tmp);
            }
            let toSend = JSON.stringify(response);
            res.end(toSend, 'utf-8');
            reqArr.pow.push({ string: JSON.stringify(body), res: toSend });
          }
        });
      }
      break;
    case 'gmi':
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          console.log(JSON.parse(body));
          body = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          let tmpRes = reqArr.gmi.find(value => value.string === JSON.stringify(body));
          if (tmpRes) {
            res.end(JSON.stringify(tmpRes.res), 'utf-8');
          } else {
            let response = [];
            let path = `//row[POW=${body.pow}][WOJ=${body.woj}][GMI[node()]][RODZ<=3]`;
            let obj = xmlDom[0].find(path);
            for (let value of obj) {
              let tmp = {};
              tmp.value = value.get('GMI').text();
              tmp.text = `${value.get('NAZWA').text()} (${value.get('NAZWA_DOD').text()})`;
              response.push(tmp);
            }
            let toSend = JSON.stringify(response);
            res.end(toSend, 'utf-8');
            reqArr.pow.push({ string: JSON.stringify(body), res: toSend });
          }
        });
      }
      break;
    case 'mia':
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          console.log(JSON.parse(body));
          body = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          let tmpRes = reqArr.mia.find(value => value.string === JSON.stringify(body));
          if (tmpRes) {
            res.end(JSON.stringify(tmpRes.res), 'utf-8');
          } else {
            let response = [];
            let path = `//row[POW=${body.pow}][WOJ=${body.woj}][GMI=${body.gmi}]`;
            let obj = xmlDom[1].find(path);
            for (let value of obj) {
              let tmp = {};
              tmp.text = tmp.value = value.get('NAZWA').text();
              response.push(tmp);
            }
            let toSend = JSON.stringify(response);
            res.end(toSend, 'utf-8');
            reqArr.pow.push({ string: JSON.stringify(body), res: toSend });
          }
        });
      }
      break;
    case 'kod':
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', async () => {
          console.log(JSON.parse(body));
          body = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });

        });
      }
      break;
  }
};
