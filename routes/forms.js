const router = require('express').Router()
const fs = require('fs')
const axios = require('axios')

const cors = require("cors");
router.use(cors());
router.options("*", cors());


const getCentralToken = require('./centralAuth')


router.post("/new", async (req, res) => {
    // write file then read it
    //const writeStatus = await writeToFile(req, res)
    //const data = await readFile("./survey_modules/node_output.xlsx")



    try {
        // Load the xls form data from the request
        const data = await converToBuffer(req, res)

        const token = await getCentralToken()

        // Save form to central
        const centralResponse = await axios({
            method: "post",
            url: 'https://central.rhomis.cgiar.org/v1/projects/48/forms?ignoreWarnings=true&publish=true',
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'X-XlsForm-FormId-Fallback': 'RHoMIS 1.6',
                'Authorization': 'Bearer ' + token
            },
            data: data
        })
            .catch(function (error) {
                throw error
            })

        res.send(centralResponse.data)


    } catch (err) {
        res.send(err)
    }

    return

    // What to do in the case the request fails





    //console.log(data)
    // End the result we have been writing.
    //res.end()
})


async function converToBuffer(req, res) {
    var data = new Buffer.from('');

    return new Promise((resolve, reject) => {
        req.on('data', function (chunk) {
            data = Buffer.concat([data, chunk]);
        });
        req.on('err', function (err) {
            reject(err)
        })

        req.on('end', () => {
            resolve(data)
        })

    })

}

// Asynchronous file writing
// Based on this: https://stackoverflow.com/questions/16598973/uploading-binary-file-on-node-js
async function writeToFile(req, res) {
    // Creating a new empty buffer
    var data = new Buffer.from('');

    // We listen to the stream of data events
    // We concantenate these events onto the data Buffer
    req.on('data', function (chunk) {
        data = Buffer.concat([data, chunk]);
    });

    // When the data stream ends, we write it to a file
    req.on('end', async function () {

        //This chuck writes to file if needs be
        await fs.writeFile("./survey_modules/node_output.xlsx", data, (err) => {
            if (err) throw err
        });
    })
    res.write("Success in saveing survey file to server \n")
}


// Asynchronous file reading
async function readFile(path) {
    const data = fs.readFileSync(path)
    return data
}

module.exports = router;