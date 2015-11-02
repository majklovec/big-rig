/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../ui/base/color_scheme.js");

'use strict';

global.tr.exportTo('tr.model', function() {

  /**
   * EventInfo is an annotation added to Events in order to document
   * what they represent, and override their title/colorId values.
   *
   * TODO(ccraik): eventually support more complex structure/paragraphs.
   *
   * @param {string} title A user-visible title for the event.
   * @param {string} description A user-visible description of the event.
   * @param {Array} docLinks A list of Objects, each of the form
   * {label: str, textContent: str, href: str}
   *
   * @constructor
   */
  function EventInfo(title, description, docLinks) {
    this.title = title;
    this.description = description;
    this.docLinks = docLinks;
    this.colorId = tr.ui.b.getColorIdForGeneralPurposeString(title);
  }

  return {
    EventInfo: EventInfo
  };
});
