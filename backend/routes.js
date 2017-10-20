const express = require('express');
const router = express.Router();
const axios = require('axios');
var ip = require("ip");

// YOUR API ROUTES HERE

// SAMPLE ROUTE
router.get('/register', (req, res) => {
    var localIP = ip.address();

    axios.post("https://rocky-brook-68243.herokuapp.com/register", {
        lan: localIP
    }).then(response => res.send(response.data))
        .catch(error => res.send('A problem has occured..'));

});

module.exports = router;
