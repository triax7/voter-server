const router = require('express').Router()
const User = require('../models/User')
const {registerValidation, loginValidation} = require('../validation')
const bcrypt = require('bcrypt')
const auth = require('../middleware/auth')

const msInYear = 1000 * 60 * 60 * 24 * 365

router.get('/current', auth, async (req, res) => {
    return res.send({
        name: req.user.name,
        email: req.user.email
    })
})

router.post('/exists', async (req, res) => {
    let {email} = req.body
    return res.send(!!(await User.findOne({email})))
})

router.post('/register', async (req, res) => {

    const {error} = registerValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const userExists = await User.findOne({email: req.body.email})
    if (userExists) return res.status(400).send('User with given e-mail already exists')

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: hashedPassword
    })

    try {
        let refreshToken = user.addRefreshToken()
        await user.save()
        return res
            .cookie('access-token', user.genAccessToken(),
                {maxAge: msInYear, httpOnly: true})
            .cookie('refresh-token', refreshToken,
                {maxAge: msInYear, httpOnly: true})
            .cookie('username', user.name,
                {maxAge: msInYear, httpOnly: true})
            .send()
    } catch (err) {
        console.log(err)
        return res.status(400).send()
    }
})

router.post('/login', async (req, res) => {

    const {error} = loginValidation(req.body)
    if (error) return res.status(400).send(error.details[0].message)

    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(404).send('User with such email does not exist')
    const passwordValid = await bcrypt.compare(req.body.password, user.passwordHash)
    if (!passwordValid) return res.status(400).send('Invalid password')

    const refreshToken = user.addRefreshToken()
    await user.save()
    return res
        .cookie('access-token', user.genAccessToken(),
            {maxAge: msInYear, httpOnly: true})
        .cookie('refresh-token', refreshToken,
            {maxAge: msInYear, httpOnly: true})
        .cookie('username', user.name,
            {maxAge: msInYear, httpOnly: true})
        .send()
})

router.post('/logout', auth, async (req, res) => {
    let {user} = req

    let refreshToken = req.cookies['refresh-token']
    if (!refreshToken)
        return res.status(401).send('No refresh token provided')

    user.cancelRefreshToken(refreshToken)
    await user.save()
    res
        .clearCookie('access-token', {httpOnly: true})
        .clearCookie('refresh-token', {httpOnly: true})
        .clearCookie('username', {httpOnly: true})
        .send()
})

module.exports = router
