const mongoose = require('mongoose')
const {Schema} = mongoose
const randToken = require('rand-token')
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    name: String,
    email: String,
    passwordHash: String,
    refreshTokens: [String],
    polls: [{
        type: Schema.Types.ObjectId,
        ref: 'Poll'
    }]
})

userSchema.methods.genAccessToken = function () {
    return jwt.sign({id: this._id}, process.env.TOKEN_SECRET, {expiresIn: '5m'})
}

userSchema.methods.addRefreshToken = function () {
    let token = randToken.uid(256)
    this.refreshTokens.push(token)
    return token
}

userSchema.methods.cancelRefreshToken = function (token) {
    let pos = this.refreshTokens.findIndex(t => t === token)
    if (pos === -1)
        throw new Error(`Refresh token does not exist ${token}`)
    this.refreshTokens.splice(pos, 1)
    return token
}

module.exports = mongoose.model('User', userSchema)
