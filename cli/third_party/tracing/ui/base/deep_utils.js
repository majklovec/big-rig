/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../base/base.js");


'use strict';

global.tr.exportTo('tr.b', function() {
  function _iterateElementDeeplyImpl(element, cb, thisArg, includeElement) {
    if (includeElement) {
      if (cb.call(thisArg, element))
        return true;
    }

    if (element.shadowRoot) {
      if (_iterateElementDeeplyImpl(element.shadowRoot, cb, thisArg, false))
        return true;
    }
    for (var i = 0; i < element.children.length; i++) {
      if (_iterateElementDeeplyImpl(element.children[i], cb, thisArg, true))
        return true;
    }
  }
  function iterateElementDeeply(element, cb, thisArg) {
    _iterateElementDeeplyImpl(element, cb, thisArg, false);
  }

  function findDeepElementMatchingPredicate(element, predicate) {
    var foundElement = undefined;
    function matches(element) {
      var match = predicate(element);
      if (!match)
        return false;
      foundElement = element;
      return true;
    }
    iterateElementDeeply(element, matches);
    return foundElement;
  }

  function findDeepElementsMatchingPredicate(element, predicate) {
    var foundElements = [];
    function matches(element) {
      var match = predicate(element);
      if (match) {
        foundElements.push(element);
      }
      return false;
    }
    iterateElementDeeply(element, matches);
    return foundElements;
  }

  function findDeepElementMatching(element, selector) {
    return findDeepElementMatchingPredicate(element, function(element) {
      return element.matches(selector);
    });
  }
  function findDeepElementsMatching(element, selector) {
    return findDeepElementsMatchingPredicate(element, function(element) {
      return element.matches(selector);
    });
  }
  function findDeepElementWithTextContent(element, re) {
    return findDeepElementMatchingPredicate(element, function(element) {
      if (element.children.length !== 0)
        return false;
      return re.test(element.textContent);
    });
  }
  return {
    iterateElementDeeply: iterateElementDeeply,
    findDeepElementMatching: findDeepElementMatching,
    findDeepElementsMatching: findDeepElementsMatching,
    findDeepElementMatchingPredicate: findDeepElementMatchingPredicate,
    findDeepElementsMatchingPredicate: findDeepElementsMatchingPredicate,
    findDeepElementWithTextContent: findDeepElementWithTextContent
  };
});
