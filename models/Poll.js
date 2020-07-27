const mongoose = require('mongoose')
const {Schema} = mongoose

const pollSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: String,
    options: [{
        name: String,
        score: Number
    }],
    usersVoted: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    startTime: Date,
    duration: Date
})

pollSchema.virtual('ended').get(function() {
    return (Date.now() - this.startTime) >= this.duration
});

module.exports = mongoose.model('Poll', pollSchema)
