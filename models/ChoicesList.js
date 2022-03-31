// Copyright 2022 lgorman
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*
This schema is for creating choices
which can be used in the design form
builder
*/

const mongoose = require('mongoose');

const translationSchema = mongoose.Schema({
    country: String,
    value: String
})

const choicesSchema = mongoose.Schema({
    label: String,
    translations: [translationSchema],
    choiceType: String,
    createdAt: Date

})

module.exports = mongoose.model('choices', choicesSchema)
