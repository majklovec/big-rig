/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

let mongoose = require('mongoose');
let Schema = require('../../../src/models/schema');

class TestReferrerSchema extends Schema {
  get collectionName () {
    return 'TestReferrerSchema';
  }

  get schema () {
    let mongooseSchema = mongoose.Schema;
    return mongooseSchema({
      _test: {
        type: mongooseSchema.Types.ObjectId,
        ref: 'TestSchema',
        required: true
      },
      name: {
        type: String, required: true, unique: true
      }
    }, {
      autoIndex: false
    });
  }
}

module.exports = new TestReferrerSchema();