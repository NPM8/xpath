#!/usr/bin/env node
const xpath = require('xpath');

// const fs = require('fs');

module.exports = function api (req, res, xmlDom) {
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
