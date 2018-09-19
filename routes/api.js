#!/usr/bin/env node
const libxmljs = require('libxmljs');

const { request, get } = require('http');

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
            let path = `//row[POW=${body.pow}][WOJ=${body.woj}][GMI[node()]][RODZ!=4 and RODZ!=5]`; // [RODZ<=3]
            let obj = xmlDom[0].find(path);
            for (let value of obj) {
              let tmp = {};
              tmp.value = value.get('GMI').text();
              tmp.text = `${value.get('NAZWA').text()} (${value.get('NAZWA_DOD').text()} - ${value.get('RODZ').text()})`; // NAZWA_DOD
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
          let postData = qs.stringify({
            city: body.mia
          });
          let options = {
            hostname: 'pocztowekody.pl',
            path: '/ajax/city',
            port: 80,
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': postData.length
            }
          };
          let reqe = request(options, function (resons) {
            console.log('STATUS:', resons.statusCode);
            console.log('HEADERS:', JSON.stringify(resons.headers));

            resons.setEncoding('utf8');
            let allData = '';

            resons.on('data', function (chunk) {
              allData += chunk;
            });

            resons.on('end', function () {
              let data = JSON.parse(allData);
              // console.log(data);
              let obj = data.find(value => {
                return (value.Gmina.toLowerCase() === body.gmi.split(' ')[0].toLowerCase() && value.Powiat.toLowerCase() === body.pow.toLowerCase() && value.Wojewodztwo.toLowerCase() === body.woj.toLowerCase());
              });
              if (obj) {
                get(new URL(`http://pocztowekody.pl/index/index/id_city/${obj.IdMiasta}/city/${qs.escape(obj.MiastoFull)}/page/${body.page}`), (respons) => {
                  console.log('running');
                  let resArr = [];
                  respons.setEncoding('utf8');
                  let allData = '';
                  respons.on('data', (data) => {
                    allData += data;
                  });
                  respons.on('end', () => {
                    allData = allData.replace(/\r?\n|\r| {2,}/g, '');
                    const doc = libxmljs.parseHtmlString(allData);
                    let data = doc.find('//table[1]/tbody/tr');
                    let max = doc.find('//span[@class=\'lblPaging\']');
                    max = max[0].text().split(' ')[2];
                    for (let value of data) {
                      value = value.childNodes();
                      let tmp = {
                        zipcode: value[0].text(),
                        city: value[1].text(),
                        street: value[2].text(),
                        number: value[3].text()
                      };
                      resArr.push(tmp);
                    }
                    let respObj = {
                      nextIter: (parseInt(body.page) + 1 <= max) ? parseInt(body.page) + 1 : null,
                      page: body.page,
                      max: max,
                      data: resArr
                    };

                    res.end(JSON.stringify(respObj));
                  });
                }).on('error', err => console.log(err.message));
              } else {
                res.end(JSON.stringify({ msg: 'No data' }));
              }
            });
          });
          reqe.on('error', er => console.log(er.message));
          reqe.write(postData);
          reqe.end();
        });
      }
      break;
  }
};
