const router = require('express').Router()
const User = require('../models/User')

router.get('/:userId/polls', async (req, res) => {
    let user = await User.findById(req.params.userId).populate('polls')
    if (!user) return res.status(404).send('User not found')

    let polls = user.polls.map(p => ({id: p._id, name: p.name}))

    return res.status(200).send(polls)
})

module.exports = router
