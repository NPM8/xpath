(function () {
  String.prototype.toFirstUpperCase = function () {
    return this.toString()[0].toUpperCase() + this.toString().substring(1).toLowerCase();
  };
  const wojSelect = document.querySelector('#wojewodztwa');

  const powSelect = document.querySelector('#powiat');

  const gmiSelect = document.querySelector('#gmina');

  const miaSelect = document.querySelector('#miasta');

  const root = document.querySelector('#root');

  const arrow = document.getElementById('arrow');

  const circleArrow = document.querySelector('#circle-arrow');

  const divider = document.querySelector('#divider');

  const count = document.getElementById('count');

  const page = document.querySelector('#page');

  const max = document.querySelector('#max');

  let globalKodObject = {};

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
      .then(res => {
        console.log(res);
        return res;
      });
    console.log(ret);
    return ret;
  }
  function clearRoot () {
    root.style.display = 'none';
    arrow.style.display = 'none';
    count.style.display = 'none';
    while (root.children.length > 4) {
      root.removeChild(root.children[4]);
    }
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
    let data = await show({
      url: `http://${window.location.host}/api/pow`,
      method: 'POST',
      data: { woj: evt.target.value }
    });
    console.log(data);
    while (powSelect.children.length > 1) {
      powSelect.removeChild(powSelect.children[1]);
    }
    clearRoot();
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
    console.log('test');
    let data = await show({
      url: `http://${window.location.host}/api/gmi`,
      method: 'POST',
      data: { woj: wojSelect.value, pow: evt.target.value }
    });
    console.log(data);
    while (gmiSelect.children.length > 1) {
      gmiSelect.removeChild(gmiSelect.children[1]);
    }
    clearRoot();
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
    let data = await show({
      url: `http://${window.location.host}/api/mia`,
      method: 'POST',
      data: { woj: wojSelect.value, pow: powSelect.value, gmi: evt.target.value }
    });
    while (miaSelect.children.length > 1) {
      miaSelect.removeChild(miaSelect.children[1]);
    }
    clearRoot();
    miaSelect.disabled = false;
    for (let dataKey of data) {
      let tmp = document.createElement('option');
      tmp.value = dataKey.value;
      tmp.innerText = dataKey.text;
      miaSelect.appendChild(tmp);
    }
  });

  miaSelect.addEventListener('change', async evt => {
    // console.log(evt);
    clearRoot();
    let ret = await show({
      url: `http://${window.location.host}/api/kod`,
      method: 'POST',
      data: {
        woj: wojSelect.options[wojSelect.selectedIndex].innerHTML.toFirstUpperCase(),
        pow: powSelect.options[powSelect.selectedIndex].innerHTML,
        gmi: gmiSelect.options[gmiSelect.selectedIndex].innerHTML,
        mia: evt.target.value,
        page: '1'
      }
    });
    if (!ret.msg) {
      root.style.display = 'grid';
      arrow.style.display = 'block';
      circleArrow.style.display = 'block';
      divider.style.display = 'block';
      count.style.display = 'flex';
      for (let value of ret.data) {
        console.log(value);
        let tmpDivForZipcode = document.createElement('div');
        let tmpDivForCity = document.createElement('div');
        let tmpDivForStreet = document.createElement('div');
        let tmpDivForNumber = document.createElement('div');
        tmpDivForZipcode.innerText = value.zipcode;
        tmpDivForCity.innerText = value.city;
        tmpDivForStreet.innerText = value.street;
        tmpDivForNumber.innerText = value.number;
        root.appendChild(tmpDivForZipcode);
        root.appendChild(tmpDivForCity);
        root.appendChild(tmpDivForStreet);
        root.appendChild(tmpDivForNumber);
      }
      globalKodObject = {
        nextIter: ret.nextIter,
        page: ret.page,
        max: ret.max
      };
      page.innerText = globalKodObject.page;
      max.innerText = globalKodObject.max;
    }
  });

  arrow.addEventListener('click', async evt => {
    let ret = await show({
      url: `http://${window.location.host}/api/kod`,
      method: 'POST',
      data: {
        woj: wojSelect.options[wojSelect.selectedIndex].innerHTML.toFirstUpperCase(),
        pow: powSelect.options[powSelect.selectedIndex].innerHTML,
        gmi: gmiSelect.options[gmiSelect.selectedIndex].innerHTML,
        mia: miaSelect.value,
        page: globalKodObject.nextIter
      }
    });
    if (!ret.msg) {
      root.style.display = 'grid';
      arrow.style.display = 'block';
      for (let value of ret.data) {
        console.log(value);
        let tmpDivForZipcode = document.createElement('div');
        let tmpDivForCity = document.createElement('div');
        let tmpDivForStreet = document.createElement('div');
        let tmpDivForNumber = document.createElement('div');
        tmpDivForZipcode.innerText = value.zipcode;
        tmpDivForCity.innerText = value.city;
        tmpDivForStreet.innerText = value.street;
        tmpDivForNumber.innerText = value.number;
        root.appendChild(tmpDivForZipcode);
        root.appendChild(tmpDivForCity);
        root.appendChild(tmpDivForStreet);
        root.appendChild(tmpDivForNumber);
      }
      globalKodObject.nextIter = ret.nextIter;
      globalKodObject.page = ret.page;
      page.innerText = globalKodObject.page;
    }
  });
  let isCliced = false;
  circleArrow.addEventListener('click', async evt => {
    isCliced = !isCliced;
    if (isCliced === true) {
      arrow.style.display = 'none';
      divider.style.display = 'none';
      circleArrow.classList.add('spin');
    } else {
      arrow.style.display = 'none';
      divider.style.display = 'none';
    }
    while (globalKodObject.nextIter != null && isCliced) {
      let ret = await show({
        url: `http://${window.location.host}/api/kod`,
        method: 'POST',
        data: {
          woj: wojSelect.options[wojSelect.selectedIndex].innerHTML.toFirstUpperCase(),
          pow: powSelect.options[powSelect.selectedIndex].innerHTML,
          gmi: gmiSelect.options[gmiSelect.selectedIndex].innerHTML,
          mia: miaSelect.value,
          page: globalKodObject.nextIter
        }
      });
      if (!ret.msg) {
        for (let value of ret.data) {
          console.log(value);
          let tmpDivForZipcode = document.createElement('div');
          let tmpDivForCity = document.createElement('div');
          let tmpDivForStreet = document.createElement('div');
          let tmpDivForNumber = document.createElement('div');
          tmpDivForZipcode.innerText = value.zipcode;
          tmpDivForCity.innerText = value.city;
          tmpDivForStreet.innerText = value.street;
          tmpDivForNumber.innerText = value.number;
          root.appendChild(tmpDivForZipcode);
          root.appendChild(tmpDivForCity);
          root.appendChild(tmpDivForStreet);
          root.appendChild(tmpDivForNumber);
        }
        globalKodObject.nextIter = ret.nextIter;
        globalKodObject.page = ret.page;
        page.innerText = globalKodObject.page;
      }
    }
    circleArrow.classList.remove('spin');
  });

  document.querySelector('#');
})();
