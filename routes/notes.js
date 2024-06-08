const express = require('express');
const router = express.Router();

router.get('/', (req, res)=>{
    obj = {
        a: 'thios',
        num: 34
    }
    res.send(obj)
})

module.exports = router;