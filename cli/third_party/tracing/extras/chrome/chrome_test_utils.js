/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../base/base.js");
require("../../core/test_utils.js");
require("./chrome_process_helper.js");
require("../../model/model.js");

'use strict';

/**
 * @fileoverview Base class for trace data Auditors.
 */
global.tr.exportTo('tr.e.chrome', function() {
  function ChromeTestUtils() {
  }

  ChromeTestUtils.newChromeModel = function(customizeModelCallback) {
    return tr.c.TestUtils.newModel(function(model) {
      model.browserProcess = model.getOrCreateProcess(1);
      model.browserMain = model.browserProcess.getOrCreateThread(2);
      model.browserMain.name = 'CrBrowserMain';

      model.rendererProcess = model.getOrCreateProcess(2);
      model.rendererMain = model.rendererProcess.getOrCreateThread(3);
      model.rendererMain.name = 'CrRendererMain';

      model.rendererCompositor = model.rendererProcess.getOrCreateThread(4);
      model.rendererCompositor.name = 'Compositor';

      model.rasterWorker1 = model.rendererProcess.getOrCreateThread(5);
      model.rasterWorker1.name = 'CompositorTileWorker1';

      customizeModelCallback(model);
    });
  }

  ChromeTestUtils.addEvent = function(thread, dict) {
    var slice = tr.c.TestUtils.newAsyncSliceEx(dict);
    thread.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addInputEvent = function(model, typeName, dict) {
    dict.title = 'InputLatency::' + typeName;
    dict.isTopLevel = (dict.isTopLevel === undefined);
    dict.startThread = model.browserMain;
    var slice = tr.c.TestUtils.newAsyncSliceEx(dict);
    model.browserMain.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addFlingAnimationEvent = function(model, dict) {
    dict.title = 'InputHandlerProxy::HandleGestureFling::started';
    var slice = tr.c.TestUtils.newAsyncSliceEx(dict);
    model.rendererCompositor.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addRenderingEvent = function(model, dict) {
    dict.title = dict.title || 'DummyEvent';
    dict.type = tr.model.ThreadSlice;
    var slice = tr.c.TestUtils.newSliceEx(dict);
    model.rendererMain.sliceGroup.pushSlice(slice);
    return slice;
  }

  ChromeTestUtils.addFrameEvent = function(model, dict) {
    dict.title = tr.e.audits.IMPL_RENDERING_STATS;
    dict.type = tr.model.ThreadSlice;
    var slice = tr.c.TestUtils.newSliceEx(dict);
    model.rendererMain.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addLoadingEvent = function(model, dict) {
    dict.title = 'WebContentsImpl Loading';
    var slice = tr.c.TestUtils.newAsyncSliceEx(dict);
    model.rendererMain.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addNetworkEvent = function(model, dict) {
    dict.cat = 'netlog';
    dict.title = 'Generic Network event';
    var slice = tr.c.TestUtils.newAsyncSliceEx(dict);
    model.browserMain.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addCommitLoadEvent = function(model, dict) {
    dict.title = 'RenderFrameImpl::didCommitProvisionalLoad';
    var slice = tr.c.TestUtils.newAsyncSliceEx(dict);
    model.rendererMain.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addCreateChildFrameEvent = function(model, dict) {
    dict.title = 'RenderFrameImpl::createChildFrame';
    var slice = tr.c.TestUtils.newAsyncSliceEx(dict);
    model.rendererMain.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addStartProvisionalLoadEvent = function(model, dict) {
    dict.title = 'RenderFrameImpl::didStartProvisionalLoad';
    var slice = tr.c.TestUtils.newAsyncSliceEx(dict);
    model.rendererMain.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addFailProvisionalLoadEvent = function(model, dict) {
    dict.title = 'RenderFrameImpl::didFailProvisionalLoad';
    var slice = tr.c.TestUtils.newAsyncSliceEx(dict);
    model.rendererMain.asyncSliceGroup.push(slice);
    return slice;
  }

  ChromeTestUtils.addCreateThreadsEvent = function(model, dict) {
    dict.title = 'BrowserMainLoop::CreateThreads';
    var slice = tr.c.TestUtils.newSliceEx(dict);
    model.rendererMain.sliceGroup.pushSlice(slice);
  }

  return {
    ChromeTestUtils: ChromeTestUtils
  };
});
