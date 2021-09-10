const express = require('express');
const router = express.Router();
const dbFunctions = require('../utils/dbFunctions');
router.get('/', async (req, res) => {

    const logins = await dbFunctions.getAllLogins();
    res.render('users/users', { logins })
});

router.get('/:id', async (req, res) => {
    const person = await dbFunctions.getPersonInfo(req.params.id);
    res.render('users/showPerson', { person })
})

module.exports = router;