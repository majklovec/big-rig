/**
Copyright (c) 2012 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("./parser.js");
require("../../../model/counter_series.js");

'use strict';

/**
 * @fileoverview Parses trace_marker events that were inserted in the trace by
 * userland.
 */
global.tr.exportTo('tr.e.importer.linux_perf', function() {
  var Parser = tr.e.importer.linux_perf.Parser;

  /**
   * Parses linux trace mark events that were inserted in the trace by userland.
   * @constructor
   */
  function AndroidParser(importer) {
    Parser.call(this, importer);

    importer.registerEventHandler('tracing_mark_write:android',
        AndroidParser.prototype.traceMarkWriteAndroidEvent.bind(this));
    importer.registerEventHandler('0:android',
        AndroidParser.prototype.traceMarkWriteAndroidEvent.bind(this));

    this.model_ = importer.model_;
    this.ppids_ = {};
  }

  function parseArgs(argsString) {
    var args = {};
    if (argsString) {
      var argsArray = argsString.split(';');
      for (var i = 0; i < argsArray.length; ++i) {
        var parts = argsArray[i].split('=');
        if (parts[0])
          args[parts.shift()] = parts.join('=');
      }
    }
    return args;
  }

  AndroidParser.prototype = {
    __proto__: Parser.prototype,

    openAsyncSlice: function(thread, category, name, cookie, ts, args) {
      var asyncSliceConstructor =
         tr.model.AsyncSlice.getConstructor(
            category, name);
      var slice = new asyncSliceConstructor(
          category, name,
          tr.ui.b.getColorIdForGeneralPurposeString(name), ts, args);
      var key = category + ':' + name + ':' + cookie;
      slice.id = cookie;
      slice.startThread = thread;

      if (!this.openAsyncSlices) {
        this.openAsyncSlices = { };
      }
      this.openAsyncSlices[key] = slice;
    },

    closeAsyncSlice: function(thread, category, name, cookie, ts, args) {
      if (!this.openAsyncSlices) {
        // No async slices have been started.
        return;
      }

      var key = category + ':' + name + ':' + cookie;
      var slice = this.openAsyncSlices[key];
      if (!slice) {
        // No async slices w/ this key have been started.
        return;
      }

      for (var arg in args) {
        if (slice.args[arg] !== undefined) {
          this.model_.importWarning({
            type: 'parse_error',
            message: 'Both the S and F events of ' + slice.title +
                ' provided values for argument ' + arg + '.' +
                ' The value of the F event will be used.'
          });
        }
        slice.args[arg] = args[arg];
      }

      slice.endThread = thread;
      slice.duration = ts - slice.start;
      slice.startThread.asyncSliceGroup.push(slice);
      slice.subSlices = [new tr.model.AsyncSlice(slice.category,
          slice.title, slice.colorId, slice.start, slice.args, slice.duration)];
      delete this.openAsyncSlices[key];
    },

    traceMarkWriteAndroidEvent: function(eventName, cpuNumber, pid, ts,
                                  eventBase) {
      var eventData = eventBase.details.split('|');
      switch (eventData[0]) {
        case 'B':
          var ppid = parseInt(eventData[1]);
          var title = eventData[2];
          var args = parseArgs(eventData[3]);
          var category = eventData[4];
          if (category === undefined)
            category = 'android';

          var thread = this.model_.getOrCreateProcess(ppid)
              .getOrCreateThread(pid);
          thread.name = eventBase.threadName;
          if (!thread.sliceGroup.isTimestampValidForBeginOrEnd(ts)) {
            this.model_.importWarning({
              type: 'parse_error',
              message: 'Timestamps are moving backward.'
            });
            return false;
          }

          this.ppids_[pid] = ppid;
          thread.sliceGroup.beginSlice(category, title, ts, args);

          break;

        case 'E':
          var ppid = this.ppids_[pid];
          if (ppid === undefined) {
            // Silently ignore unmatched E events.
            break;
          }

          var thread = this.model_.getOrCreateProcess(ppid)
              .getOrCreateThread(pid);
          if (!thread.sliceGroup.openSliceCount) {
            // Silently ignore unmatched E events.
            break;
          }

          var slice = thread.sliceGroup.endSlice(ts);

          var args = parseArgs(eventData[3]);
          for (var arg in args) {
            if (slice.args[arg] !== undefined) {
              this.model_.importWarning({
                type: 'parse_error',
                message: 'Both the B and E events of ' + slice.title +
                    ' provided values for argument ' + arg + '.' +
                    ' The value of the E event will be used.'
              });
            }
            slice.args[arg] = args[arg];
          }

          break;

        case 'C':
          var ppid = parseInt(eventData[1]);
          var name = eventData[2];
          var value = parseInt(eventData[3]);
          var category = eventData[4];
          if (category === undefined)
            category = 'android';

          var ctr = this.model_.getOrCreateProcess(ppid)
              .getOrCreateCounter(category, name);
          // Initialize the counter's series fields if needed.
          if (ctr.numSeries === 0) {
            ctr.addSeries(new tr.model.CounterSeries(value,
                tr.ui.b.getColorIdForGeneralPurposeString(
                    ctr.name + '.' + 'value')));
          }

          ctr.series.forEach(function(series) {
            series.addCounterSample(ts, value);
          });

          break;

        case 'S':
          var ppid = parseInt(eventData[1]);
          var name = eventData[2];
          var cookie = parseInt(eventData[3]);
          var args = parseArgs(eventData[4]);
          var category = eventData[5];
          if (category === undefined)
            category = 'android';


          var thread = this.model_.getOrCreateProcess(ppid)
            .getOrCreateThread(pid);
          thread.name = eventBase.threadName;

          this.ppids_[pid] = ppid;
          this.openAsyncSlice(thread, category, name, cookie, ts, args);

          break;

        case 'F':
          // Note: An async slice may end on a different thread from the one
          // that started it so this thread may not have been seen yet.
          var ppid = parseInt(eventData[1]);

          var name = eventData[2];
          var cookie = parseInt(eventData[3]);
          var args = parseArgs(eventData[4]);
          var category = eventData[5];
          if (category === undefined)
            category = 'android';

          var thread = this.model_.getOrCreateProcess(ppid)
            .getOrCreateThread(pid);
          thread.name = eventBase.threadName;

          this.ppids_[pid] = ppid;
          this.closeAsyncSlice(thread, category, name, cookie, ts, args);

          break;

        default:
          return false;
      }

      return true;
    }
  };

  Parser.register(AndroidParser);

  return {
    AndroidParser: AndroidParser
  };
});
