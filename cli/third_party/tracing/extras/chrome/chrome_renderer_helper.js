/**
Copyright (c) 2014 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("./chrome_process_helper.js");

'use strict';

/**
 * @fileoverview Utilities for accessing trace data about the Chrome browser.
 */
global.tr.exportTo('tr.e.audits', function() {
  function ChromeRendererHelper(modelHelper, process) {
    tr.e.audits.ChromeProcessHelper.call(this, modelHelper, process);
    this.mainThread_ = process.findAtMostOneThreadNamed('CrRendererMain');
    this.compositorThread_ = process.findAtMostOneThreadNamed('Compositor');
    this.rasterWorkerThreads_ = process.findAllThreadsMatching(function(t) {
      if (t.name === undefined)
        return false;
      if (t.name.indexOf('CompositorTileWorker') === 0)
        return true;
      if (t.name.indexOf('CompositorRasterWorker') === 0)
        return true;
      return false;
    });
  };

  ChromeRendererHelper.isRenderProcess = function(process) {
    if (!process.findAtMostOneThreadNamed('CrRendererMain'))
      return false;
    if (!process.findAtMostOneThreadNamed('Compositor'))
      return false;
    return true;
  };

  ChromeRendererHelper.prototype = {
    __proto__: tr.e.audits.ChromeProcessHelper.prototype,

    get mainThread() {
      return this.mainThread_;
    },

    get compositorThread() {
      return this.compositorThread_;
    },

    get rasterWorkerThreads() {
      return this.rasterWorkerThreads_;
    }
  };

  return {
    ChromeRendererHelper: ChromeRendererHelper
  };
});
