const fs = require('fs');

const multer = require("multer");
const sharp = require('sharp');
const shortid = require('shortid');
const appRoot = require('app-root-path');

const Blog = require('../models/blogModel');

const {get500} = require('./errorController');
const {formatDate} = require('../utils/jalaliMoment')
const {storage, fileFilter} = require('../utils/multer');

const getDashboard = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // <-Equal-> // const page= +req.query.page // because type of page is String
    const postPerPage = 2;

    try {
        const numberOfPost = await Blog.find({user: req.user._id}).countDocuments();
        const blogs = await Blog.find({user: req.user.id}).skip((page - 1) * postPerPage).limit(postPerPage);

        res.render('private/blogs', {
            pageTitle: 'داشبورد',
            path: '/dashboard',
            layout: './layouts/dashboardLayout',
            fullName: req.user.fullName,
            blogs,
            formatDate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPost,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPost / postPerPage)
        });

    } catch (e) {
        console.log(e);
        get500(req, res);
    }

}

const getAddPost = (req, res) => {
    res.render('private/addPost', {
        pageTitle: 'ساخت پست جدید',
        path: '/dashboard/add-post',
        layout: './layouts/dashboardLayout',
        fullName: req.user.fullName
    })
}

const getEditPost = async (req, res) => {
    const post = await Blog.findOne({
        _id: req.params.id
    });

    if (!post) {
        return res.redirect('/404');
    } else if (post.user.toString() !== req.user._id.toString()) {
        return res.redirect('/dashboard');
    } else {
        res.render('private/editPost', {
            pageTitle: 'ویرایش پست ',
            path: '/dashboard/edit-post',
            layout: './layouts/dashboardLayout',
            fullName: req.user.fullName,
            post
        })
    }
}

const editPost = async (req, res) => {
    const errorsArray = [];
    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortid.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
    const post = await Blog.findOne({_id: req.params.id});
    try {
        if (thumbnail.name)
            await Blog.postValidation({...req.body, thumbnail});
        else
            await Blog.postValidation({
                ...req.body,
                thumbnail: {
                    name: "placeholder",
                    size: 0,
                    mimetype: "image/jpeg",
                },
            });
        if (!post) {
            return res.redirect("/404");
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.redirect("/dashboard");
        } else {
            if (thumbnail.name) {
                fs.unlink(`${appRoot}/public/uploads/thumbnails/${post.thumbnail}`, async (err) => {
                        if (err) console.log(err);
                        else {
                            await sharp(thumbnail.data).jpeg({quality: 60}).toFile(uploadPath).catch((err) => console.log(err));
                        }
                    }
                );
            }
            const {title, status, body} = req.body;
            post.title = title;
            post.status = status;
            post.body = body;
            post.thumbnail = thumbnail.name ? fileName : post.thumbnail;
            await post.save();
            return res.redirect("/dashboard");
        }
    } catch (e) {
        console.log(e);
        e.inner.forEach((error) => {
            errorsArray.push({
                name: error.path,
                message: error.message
            });
        });
        res.render("private/editPost", {
            pageTitle: " ویرایش پست",
            path: "/dashboard/edit-post",
            layout: "./layouts/dashboardLayout",
            fullName: req.user.fullName,
            errors: errorsArray,
            post,
        });
    }
};

const deletePost = async (req, res) => {
    try {
        const result = await Blog.findByIdAndRemove(req.params.id);
        // console.log(result);
        res.redirect('/dashboard');
    } catch (e) {
        console.log(e);
        get500(req, res);
    }
}

const createPost = async (req, res) => {
    const errorsArray = [];

    /*---upload pic thumbnail---*/
    const thumbnail = req.files ? req.files.thumbnail : {};
    // console.log(thumbnail);
    const fileName = `${shortid.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
    /*---upload pic thumbnail---*/

    try {
        req.body = {...req.body, thumbnail}
        // console.log(req.body);
        await sharp(thumbnail.data).jpeg({quality: 60}).toFile(uploadPath).catch(err => console.log(err));
        await Blog.postValidation(req.body);
        await Blog.create({
            // ...req.body  -> this is spread operator
            title: req.body.title,
            status: req.body.status,
            desc: req.body.desc,
            user: req.user.id,
            thumbnail: fileName
        })
        res.redirect('/dashboard');
    } catch (e) {
        console.log(e);
        // get500(req, res);
        e.inner.forEach((error) => {
            errorsArray.push({
                name: error.path,
                message: error.message
            });
        });
        res.render('private/addPost', {
            pageTitle: 'ساخت پست جدید',
            path: '/dashboard/add-post',
            layout: './layouts/dashboardLayout',
            fullName: req.user.fullName,
            errors: errorsArray
        })

    }
}

const uploadImage = (req, res) => {

    const upload = multer({
        limits: {fileSize: 4000000},
        // dest: 'uploads/',
        // storage: storage,
        fileFilter: fileFilter
    }).single('image');


    upload(req, res, async (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send('حجم عکس زیاد می باشد.');
            }
            res.status(400).send(err);
        } else {
            if (req.file) {
                const fileName = `${shortid.generate()}_${req.file.originalname}`;
                await sharp(req.file.buffer).jpeg({
                    quality: 60
                }).toFile(`./public/uploads/${fileName}`).catch(err => console.log(err));
                res.status(200).send(`http://localhost:4000/uploads/${fileName}`);

            } else
                res.send('جهت آپلود عکسی انتخاب کنید.')
        }
    })

}

const handleSearchDashboard = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // <-Equal-> // const page= +req.query.page // because type of page is String
    const postPerPage = 2;

    try {
        const numberOfPost = await Blog.find(
            {
                user: req.user._id,
                $text: {
                    $search: req.body.search
                }
            }
        ).countDocuments();
        const blogs = await Blog.find(
            {
                user: req.user.id,
                $text: {
                    $search: req.body.search
                }
            }
        ).skip((page - 1) * postPerPage).limit(postPerPage);

        res.render('private/blogs', {
            pageTitle: 'داشبورد',
            path: '/dashboard',
            layout: './layouts/dashboardLayout',
            fullName: req.user.fullName,
            blogs,
            formatDate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPost,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPost / postPerPage)
        });

    } catch (e) {
        console.log(e);
        get500(req, res);
    }

}


module.exports = {
    getDashboard,
    getAddPost,
    createPost,
    uploadImage,
    editPost,
    getEditPost,
    deletePost,
    handleSearchDashboard
}