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

const router = require('express').Router();
const auth = require('../validation/verifyToken')
const cors = require("cors");
const User = require('../models/User');
const ChoicesList = require('../models/ChoicesList');
router.get('/', async (req, res) => {

    const choices = await ChoicesList.find({})
    res.status(200).send(choices)
})

router.post('/', auth, async (req, res) => {

    try {

        const oldChoices = await ChoicesList.find({
            label: req.body.label
        })

        if (oldChoices.lenght > 0) {
            throw "There is already a choice with the label you provided"
        }
        const date = new Date()
        const newChoice = req.body
        newChoice.createdAt = date
        const savedChoice = new ChoicesList(newChoice).save()

        res.status(200).send('Choice successfully added')


    } catch (err) {
        res.status(400).send(err)
    }

})

module.exports = router;