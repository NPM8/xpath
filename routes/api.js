#!/usr/bin/env node
const xpath = require('xpath');
// const { parse } = require('querystring');
// const fs = require('fs');

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
            if (xpath.evaluate) {
              // eslint-disable-next-line no-undef
              let nodes = xpath.evaluate(path, xmlDom, null, xpath.XPathResult.ANY_TYPE, null);
              let result = nodes.iterateNext();
              while (result) {
                let tmp = {};
                tmp.value = result.childNodes[1].childNodes[0].nodeValue;
                tmp.text = result.childNodes[9].childNodes[0].nodeValue;
                response.push(tmp);
                result = nodes.iterateNext();
              }
              let toSend = JSON.stringify(response);
              res.end(toSend, 'utf-8');
              reqArr.pow.push({ string: JSON.stringify(body), res: toSend });
            }
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
            if (xpath.evaluate) {
              // eslint-disable-next-line no-undef
              let nodes = xpath.evaluate(path, xmlDom, null, xpath.XPathResult.ANY_TYPE, null);
              let result = nodes.iterateNext();
              while (result) {
                let tmp = {};
                tmp.value = result.childNodes[3].childNodes[0].nodeValue;
                tmp.text = `${result.childNodes[9].childNodes[0].nodeValue} - ${result.childNodes[11].childNodes[0].nodeValue.split(' ')[1]}`;
                response.push(tmp);
                result = nodes.iterateNext();
              }
              let toSend = JSON.stringify(response);
              res.end(toSend, 'utf-8');
              reqArr.gmi.push({ string: JSON.stringify(body), res: toSend });
            }
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
            let path = `//row[POW=${body.pow}][WOJ=${body.woj}][GMI=${body.gmi}][RODZ=4]`;
            if (xpath.evaluate) {
              // eslint-disable-next-line no-undef
              let nodes = xpath.evaluate(path, xmlDom, null, xpath.XPathResult.ANY_TYPE, null);
              let result = nodes.iterateNext();
              while (result) {
                let tmp = {};
                tmp.value = result.childNodes[9].childNodes[0].nodeValue;
                tmp.text = `${result.childNodes[9].childNodes[0].nodeValue}`;
                response.push(tmp);
                result = nodes.iterateNext();
              }
              let toSend = JSON.stringify(response);
              res.end(toSend, 'utf-8');
              reqArr.mia.push({ string: JSON.stringify(body), res: toSend });
            }
          }
        });
      }
      break;
    case 'kod':
      break;
  }
  let node;
  let result = xpath.evaluate(
    '/book/title', // xpathExpression
    xmlDom, // contextNode
    null, // namespaceResolver
    xpath.XPathResult.ANY_TYPE, // resultType
    null // result
  );
  node = result.iterateNext();
  while (node) {
    console.log(node);
    node = result.iterateNext();
  }
};
