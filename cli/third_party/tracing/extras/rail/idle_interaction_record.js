/**
Copyright (c) 2015 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("./rail_interaction_record.js");

'use strict';

/**
 * @fileoverview Base class for trace data Auditors.
 */
global.tr.exportTo('tr.e.rail', function() {
  function IdleInteractionRecord(parentModel, start, duration) {
    tr.e.rail.RAILInteractionRecord.call(
        this, parentModel, 'Idle', 'rail_idle',
        start, duration);
  }

  IdleInteractionRecord.prototype = {
    __proto__: tr.e.rail.RAILInteractionRecord.prototype,

    get normalizedUserComfort() {
      return 1;
    },

    // Unlike during active IRs, while the user is idle, the CPU should not be
    // utilized much.

    get minCpuFraction() {
      return 0.1;
    },

    get maxCpuFraction() {
      return 1;
    }
  };

  return {
    IdleInteractionRecord: IdleInteractionRecord
  };
});
