(function () {
  const wojSelect = document.querySelector('#wojewodztwa');

  const powSelect = document.querySelector('#powiat');

  const gmiSelect = document.querySelector('#gmina');

  const miaSelect = document.querySelector('#miasta');

  async function show (props) {
    console.log('lol');
    let ret = await fetch(props.url, {
      method: props.method,
      body: JSON.stringify(props.data),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
      .then(res => res.json())
      .then(res => { console.log(res); return res; });
    console.log(ret);
    return ret;
  }

  async function init () {
    let data = await show({ url: `http://${window.location.host}/api/woj`, method: 'GET' });
    console.log(data);
    while (wojSelect.children.length > 1) {
      wojSelect.removeChild(wojSelect.children[1]);
    }
    for (let dataKey of data) {
      console.log('data: ', dataKey);
      let tmp = document.createElement('option');
      tmp.value = dataKey.value;
      tmp.innerText = dataKey.text;
      wojSelect.appendChild(tmp);
    }
    wojSelect.disabled = false;
    powSelect.disabled = true;
    gmiSelect.disabled = true;
    miaSelect.disabled = true;
  };

  init();

  wojSelect.addEventListener('change', async function (evt) {
    console.log('test');
    let data = await show({ url: `http://${window.location.host}/api/pow`, method: 'POST', data: { woj: evt.target.value } });
    console.log(data);
    while (powSelect.children.length > 1) {
      powSelect.removeChild(powSelect.children[1]);
    }
    gmiSelect.disabled = true;
    miaSelect.disabled = true;
    for (let dataKey of data) {
      let tmp = document.createElement('option');
      tmp.value = dataKey.value;
      tmp.innerText = dataKey.text;
      powSelect.appendChild(tmp);
    }
    powSelect.disabled = false;
  });

  powSelect.addEventListener('change', async evt => {
    console.log('test')
    let data = await show({ url: `http://${window.location.host}/api/gmi`, method: 'POST', data: { woj: wojSelect.value, pow: evt.target.value } });
    console.log(data);
    while (gmiSelect.children.length > 1) {
      gmiSelect.removeChild(gmiSelect.children[1]);
    }
    gmiSelect.disabled = false;
    miaSelect.disabled = true;
    for (let dataKey of data) {
      let tmp = document.createElement('option');
      tmp.value = dataKey.value;
      tmp.innerText = dataKey.text;
      gmiSelect.appendChild(tmp);
    }
  });

  gmiSelect.addEventListener('change', async evt => {
    let data = await show({ url: `http://${window.location.host}/api/mia`, method: 'POST', data: { woj: wojSelect.value, pow: powSelect.value, gmi: evt.target.value } });
    while (miaSelect.children.length > 1) {
      miaSelect.removeChild(miaSelect.children[1]);
    }
    miaSelect.disabled = false;
    for (let dataKey of data) {
      let tmp = document.createElement('option');
      tmp.value = dataKey.value;
      tmp.innerText = dataKey.text;
      miaSelect.appendChild(tmp);
    }
  });
})();

/// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Backup

// (function () {
//   let tercXMLData;
//   // eslint-disable-next-line no-undef
//   let terc = new XMLHttpRequest();
//   terc.onreadystatechange = function () {
//     if (this.readyState === 4 && this.status === 200) {
//       tercXMLData = terc.responseXML;
//       showWoj(tercXMLData);
//       showPow(tercXMLData, document.querySelector('#wojewodztwa').value);
//       showGmi(tercXMLData, document.querySelector('#wojewodztwa').value, document.querySelector('#powiat').value);
//       showCity(tercXMLData, document.querySelector('#wojewodztwa').value, document.querySelector('#powiat').value, document.querySelector('#gmina').value);
//     }
//   };
//   terc.open('GET', '/xml/TERC_Urzedowy_2018-09-04.xml', true);
//   terc.send();
//
//   function showWoj (xml) {
//     let path = '//row[NAZWA_DOD=\'województwo\']';
//     if (xml.evaluate) {
//       // eslint-disable-next-line no-undef
//       let nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
//       let result = nodes.iterateNext();
//       while (result) {
//         console.log(result.childNodes);
//         let tmp = document.createElement('option');
//         tmp.value = result.childNodes[1].innerHTML;
//         tmp.text = result.childNodes[9].innerHTML;
//         document.querySelector('#wojewodztwa').appendChild(tmp);
//         result = nodes.iterateNext();
//       }
//     }
//   }
//
//   function showPow (xml, woj) {
//     const pow = document.querySelector('#powiat');
//     while (pow.children.length > 1) {
//       pow.removeChild(pow.children[1]);
//     }
//     if (woj === 'all') {
//       let path = '//row[NAZWA_DOD=\'powiat\']';
//       if (xml.evaluate) {
//         // eslint-disable-next-line no-undef
//         let nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
//         let result = nodes.iterateNext();
//         while (result) {
//           let tmp = document.createElement('option');
//           tmp.value = result.childNodes[3].innerHTML;
//           tmp.text = result.childNodes[9].innerHTML;
//           pow.appendChild(tmp);
//           result = nodes.iterateNext();
//         }
//       }
//     } else {
//       let path = `//row[NAZWA_DOD='powiat'][WOJ=${woj}]`;
//       if (xml.evaluate) {
//         // eslint-disable-next-line no-undef
//         let nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
//         let result = nodes.iterateNext();
//         while (result) {
//           let tmp = document.createElement('option');
//           tmp.value = result.childNodes[3].innerHTML;
//           tmp.text = result.childNodes[9].innerHTML;
//           pow.appendChild(tmp);
//           result = nodes.iterateNext();
//         }
//       }
//     }
//   }
//
//   function showGmi (xml, woj, pow) {
//     const gmi = document.querySelector('#gmina');
//     while (gmi.children.length > 1) {
//       gmi.removeChild(gmi.children[1]);
//     }
//     if (pow === 'all' && woj === 'all') {
//       let path = '//row[RODZ<=3]/GMI[node()]/..';
//       if (xml.evaluate) {
//         // eslint-disable-next-line no-undef
//         let nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
//         let result = nodes.iterateNext();
//         while (result) {
//           let tmp = document.createElement('option');
//           tmp.value = result.childNodes[3].innerHTML;
//           tmp.text = `${result.childNodes[9].innerHTML} - ${result.childNodes[11].innerHTML.split(' ')[1]}`;
//           gmi.appendChild(tmp);
//           result = nodes.iterateNext();
//         }
//       }
//     } else if (pow === 'all' && woj !== 'all') {
//       let path = `//row[RODZ<=3][WOJ=${woj}]/GMI[node()]/..`;
//       if (xml.evaluate) {
//         // eslint-disable-next-line no-undef
//         let nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
//         let result = nodes.iterateNext();
//         while (result) {
//           let tmp = document.createElement('option');
//           tmp.value = result.childNodes[3].innerHTML;
//           tmp.text = `${result.childNodes[9].innerHTML} - ${result.childNodes[11].innerHTML.split(' ')[1]}`;
//           gmi.appendChild(tmp);
//           result = nodes.iterateNext();
//         }
//       }
//     } else if (pow !== 'all' && woj === 'all') {
//       let path = `//row[RODZ<=3][POW=${pow}]/GMI[node()]/..`;
//       if (xml.evaluate) {
//         // eslint-disable-next-line no-undef
//         let nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
//         let result = nodes.iterateNext();
//         while (result) {
//           let tmp = document.createElement('option');
//           tmp.value = result.childNodes[3].innerHTML;
//           tmp.text = `${result.childNodes[9].innerHTML} - ${result.childNodes[11].innerHTML.split(' ')[1]}`;
//           gmi.appendChild(tmp);
//           result = nodes.iterateNext();
//         }
//       }
//     } else {
//       let path = `//row[RODZ<=3][POW=${pow}][WOJ=${woj}]/GMI[node()]/..`;
//       if (xml.evaluate) {
//         // eslint-disable-next-line no-undef
//         let nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
//         let result = nodes.iterateNext();
//         while (result) {
//           let tmp = document.createElement('option');
//           tmp.value = result.childNodes[3].innerHTML;
//           tmp.text = `${result.childNodes[9].innerHTML} - ${result.childNodes[11].innerHTML.split(' ')[1]}`;
//           gmi.appendChild(tmp);
//           result = nodes.iterateNext();
//         }
//       }
//     }
//   }
//
//   function showCity (xml, woj, pow, gmi) {
//     const city = document.querySelector('#miasta');
//     while (city.children.length > 1) {
//       city.removeChild(city.children[1]);
//     }
//     let path = `//row[RODZ=4][WOJ${woj !== 'all' ? '=' + woj : '[node()]'}][POW${pow !== 'all' ? '=' + pow : '[node()]'}][GMI${gmi !== 'all' ? '=' + gmi : '[node()]'}]`;
//     if (xml.evaluate) {
//       // eslint-disable-next-line no-undef
//       let nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
//       let result = nodes.iterateNext();
//       while (result) {
//         let tmp = document.createElement('option');
//         tmp.value = result.childNodes[3].innerHTML;
//         tmp.text = `${result.childNodes[9].innerHTML}`;
//         city.appendChild(tmp);
//         result = nodes.iterateNext();
//       }
//     }
//   }
//
//   document.querySelector('#wojewodztwa').addEventListener('change', (evt) => {
//     evt.preventDefault();
//     showPow(tercXMLData, evt.target.value);
//     showGmi(tercXMLData, evt.target.value, document.querySelector('#powiat').value);
//     showCity(tercXMLData, document.querySelector('#wojewodztwa').value, document.querySelector('#powiat').value, document.querySelector('#gmina').value);
//   });
//   document.querySelector('#powiat').addEventListener('change', (evt) => {
//     evt.preventDefault();
//     showGmi(tercXMLData, document.querySelector('#wojewodztwa').value, evt.target.value);
//     showCity(tercXMLData, document.querySelector('#wojewodztwa').value, document.querySelector('#powiat').value, document.querySelector('#gmina').value);
//   });
//   document.querySelector('#gmina').addEventListener('change', (evt) => {
//     evt.preventDefault();
//     showCity(tercXMLData, document.querySelector('#wojewodztwa').value, document.querySelector('#powiat').value, document.querySelector('#gmina').value);
//   });
// })();
