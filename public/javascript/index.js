(async function () {
  let txt = await fetch('/xml/SIMC_Urzedowy_2018-09-04.xml', { method: 'GET' });
  const simc = (new window.DOMParser()).parseFromString(txt.text(), 'text/xml');
  console.log(txt, simc);
  document.querySelector('#miasto');
})();
