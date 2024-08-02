const mongoose = require('mongoose');
const {schema} = require('./secure/postValidationModel');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    desc: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "public",
        enum: ["private", "public"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    thumbnail:{
        type:String,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

blogSchema.index({title:"text"});
blogSchema.statics.postValidation = function (body) {
    return schema.validate(body, {
        abortEarly: false
    });

}
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;