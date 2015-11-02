/**
Copyright (c) 2013 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../base/extension_registry.js");
require("../base/units/time_stamp.js");
require("./timed_event.js");

'use strict';

/**
 * @fileoverview Provides the AsyncSlice class.
 */
global.tr.exportTo('tr.model', function() {
  /**
   * A AsyncSlice represents an interval of time during which an
   * asynchronous operation is in progress. An AsyncSlice consumes no CPU time
   * itself and so is only associated with Threads at its start and end point.
   *
   * @constructor
   */
  function AsyncSlice(category, title, colorId, start, args, duration,
                      opt_isTopLevel, opt_cpuStart, opt_cpuDuration,
                      opt_argsStripped) {
    tr.model.TimedEvent.call(this, start);

    this.category = category || '';
    this.title = title;
    this.colorId = colorId;
    this.args = args;
    this.startStackFrame = undefined;
    this.endStackFrame = undefined;
    this.didNotFinish = false;
    this.important = false;
    this.subSlices = [];
    this.parentContainer = undefined;

    this.id = undefined;
    this.startThread = undefined;
    this.endThread = undefined;
    this.cpuStart = undefined;
    this.cpuDuration = undefined;
    this.argsStripped = false;

    this.startStackFrame = undefined;
    this.endStackFrame = undefined;

    this.duration = duration;


    // TODO(nduca): Forgive me for what I must do.
    this.isTopLevel = (opt_isTopLevel === true);

    if (opt_cpuStart !== undefined)
      this.cpuStart = opt_cpuStart;

    if (opt_cpuDuration !== undefined)
      this.cpuDuration = opt_cpuDuration;

    if (opt_argsStripped !== undefined)
      this.argsStripped = opt_argsStripped;
  };

  AsyncSlice.prototype = {
    __proto__: tr.model.TimedEvent.prototype,

    get analysisTypeName() {
      return this.title;
    },

    get viewSubGroupTitle() {
      return this.title;
    },

    get userFriendlyName() {
      return 'Async slice ' + this.title + ' at ' +
          tr.b.u.TimeStamp.format(this.start);
    },

    get stableId() {
      var parentAsyncSliceGroup = this.parentContainer.asyncSliceGroup;
      return parentAsyncSliceGroup.stableId + '.' +
          parentAsyncSliceGroup.slices.indexOf(this);
    },

    findDescendentSlice: function(targetTitle) {
      if (!this.subSlices)
        return undefined;

      for (var i = 0; i < this.subSlices.length; i++) {
        if (this.subSlices[i].title == targetTitle)
          return this.subSlices[i];
        var slice = this.subSlices[i].findDescendentSlice(targetTitle);
        if (slice) return slice;
      }
      return undefined;
    },

    iterateAllDescendents: function(callback, opt_this) {
      this.subSlices.forEach(callback, opt_this);
      this.subSlices.forEach(function(subSlice) {
        subSlice.iterateAllDescendents(callback, opt_this);
      }, opt_this);
    },

    compareTo: function(that) {
      return this.title.localeCompare(that.title);
    }
  };

  tr.model.EventRegistry.register(
      AsyncSlice,
      {
        name: 'asyncSlice',
        pluralName: 'asyncSlices',
        singleViewElementName: 'tr-ui-a-single-async-slice-sub-view',
        multiViewElementName: 'tr-ui-a-multi-async-slice-sub-view'
      });


  var options = new tr.b.ExtensionRegistryOptions(
      tr.b.TYPE_BASED_REGISTRY_MODE);
  options.mandatoryBaseClass = AsyncSlice;
  options.defaultConstructor = AsyncSlice;
  tr.b.decorateExtensionRegistry(AsyncSlice, options);

  return {
    AsyncSlice: AsyncSlice
  };
});
