const router = require('express').Router()
const Poll = require('../models/Poll')
const auth = require('../middleware/auth')
const {pollCreateValidation} = require('../validation')

router.post('/create', auth, async (req, res) => {

    const {error} = pollCreateValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    let poll = new Poll({
        userId: req.user._id,
        name: req.body.name,
        options: req.body.options.map(op => ({name: op, score: 0})),
        startTime: new Date(),
        duration: new Date(req.body.duration)
    })
    try {
        await poll.save()
        req.user.polls.push(poll._id)
        await req.user.save()
        res.status(201).send(poll._id)
    } catch (err) {
        console.log(err)
        res.status(400).send()
    }

})

router.get('/:pollId', async (req, res) => {

    let poll = await Poll.findById(req.params.pollId)
    if (!poll) return res.status(404).send('Poll not found')

    return res.status(200).send({
        id: poll._id,
        name: poll.name,
        options: poll.options,
        timeLeft: poll.duration - (Date.now() - poll.startTime)
    })
})

router.post('/:pollId/vote', auth, async (req, res) => {
    let {user} = req

    let poll = await Poll.findById(req.params.pollId)
    if (!poll) return res.status(404).send('Poll not found')

    if(poll.ended) return res.status(400).send('Poll ended')

    let option = poll.options.id(req.body.optionId)
    if (!option) return res.status(400).send('Invalid option')

    if (!poll.usersVoted.includes(user._id)) {
        option.score++
        poll.usersVoted.push(user._id)
    } else {
        return res.status(400).send('User already voted')
    }

    try {
        await poll.save()
        return res.status(200).send()
    } catch (err) {
        console.log(err)
        return res.status(400).send()
    }
})

router.get('/:pollId/ended', async (req, res) => {
    let poll = await Poll.findById(req.params.pollId)
    if (!poll) return res.status(404).send('Poll not found')

    return res.status(200).send(poll.ended)
})

module.exports = router
