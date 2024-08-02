const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const {schema} = require('./secure/userValidationModel');
// const shortid=require('shortid');

//* validate for mongo
const userSchema = new mongoose.Schema({
    // _id: {
    //     'type': String,
    //     'default': shortid.generate
    // },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 255,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


userSchema.statics.userValidation = function (body) {
    return schema.validate(body, {
        abortEarly: false
    });
}

userSchema.pre("save", function (next) {
    let user = this;

    if (!user.isModified("password")) return next();

    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) return next(err);

        user.password = hash;
        next();
    });
});

const User = mongoose.model('User', userSchema);

module.exports = User;