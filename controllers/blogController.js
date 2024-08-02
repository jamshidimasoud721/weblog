const Yup = require('yup');
const CaptchaPng = require('captchapng')

const Blog = require('../models/blogModel');
const {formatDate} = require('../utils/jalaliMoment');
const {get500} = require('./errorController');
const {truncate} = require('../utils/helpers');
const {sendEmail} = require("../utils/mailer");

let CAPTCHA_NUM;

const getIndex = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // <-Equal-> // const page= +req.query.page // because type of page is String
    const postPerPage = 3;

    try {
        const numberOfPost = await Blog.find({status: 'public'}).countDocuments();

        const posts = await Blog.find({status: 'public'}).sort({createdAt: 'desc'}).skip((page - 1) * postPerPage).limit(postPerPage);
        // console.log(posts);
        res.render('index', {
            pageTitle: 'وبلاگ',
            path: '/',
            posts,
            formatDate,
            truncate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPost,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPost / postPerPage)
        });

    } catch (e) {
        console.log(e);
        get500();
    }
}

const getSinglePost = async (req, res) => {
    try {
        const singlePost = await Blog.findOne({_id: req.params.id}).populate("user");
        // console.log(singlePost);
        if (!singlePost)
            return res.redirect("/404");
        res.render("post", {
            pageTitle: singlePost.title,
            path: "/post",
            singlePost,
            formatDate,
        });
    } catch (err) {
        console.log(err);
        get500();
    }
}

const getContactPage = (req, res) => {
    res.render('contact', {
        pageTitle: 'تماس با ما',
        path: '/contact',
        message: req.flash('success_msg'),
        error: req.flash('error'),
        errors: []
    })
}

const handleContactPage = async (req, res) => {
    const errorsArray = [];
    const {fullName, email, message, captcha} = req.body;
    const schema = Yup.object().shape({
        fullName: Yup.string().required('نام ونام خانوادگی الزامی است.').min(4, 'نام و نام خانوادگی نباید کمتر از 4 کاراکتر باشد.').max(255, 'نام و نام خانوادگی نباید بیشتر از 255 کاراکتر باشد.'),
        email: Yup.string().email('ایمیل معتبر نمی باشد.').required('ایمیل الزامی می باشد.'),
        message: Yup.string().required('پیام الزامی می باشد .'),
    });
    try {

        await schema.validate(req.body, {abortEarly: false});
        if (parseInt(captcha) === CAPTCHA_NUM) {
            sendEmail(email, fullName, 'پیام کاربر از وبلاگ', `${message} <br/> ایمیل کاربر : ${email}`);
            req.flash('success_msg', 'پیام شما با موفقیت ارسال شد.');
            return res.render('contact', {
                pageTitle: 'تماس با ما',
                path: '/contact',
                message: req.flash('success_msg'),
                error: req.flash('error'),
                errors: errorsArray
            });
        }
        req.flash('error', 'کد امنیتی صحیح نیست');
        return res.render('contact', {
            pageTitle: 'تماس با ما',
            path: '/contact',
            message: req.flash('success_msg'),
            error: req.flash('error'),
            errors: errorsArray
        });
    } catch (e) {

        console.log(e);
        e.inner.forEach((error) => {
            errorsArray.push({
                name: error.path,
                message: error.message
            });
        });
        res.render('contact', {
            pageTitle: 'تماس با ما',
            path: '/contact',
            message: req.flash('success_msg'),
            error: req.flash('error'),
            errors: errorsArray
        });
    }
}

const getCaptchaNum = (req, res) => {
    CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);
    const p = new CaptchaPng(80, 30, CAPTCHA_NUM);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);

    const img = p.getBase64();
    const imgBase64 = Buffer.from(img, "base64");

    res.send(imgBase64);
};

const handleSearchIndex = async (req, res) => {
    const page = parseInt(req.query.page) || 1; // <-Equal-> // const page= +req.query.page // because type of page is String
    const postPerPage = 3;

    try {
        const numberOfPost = await Blog.find(
            {
                status: 'public',
                $text: {
                    $search: req.body.search
                }
            }
        ).countDocuments();

        const posts = await Blog.find(
            {
                status: 'public',
                $text: {
                    $search: req.body.search
                }
            }
        ).sort({createdAt: 'desc'}).skip((page - 1) * postPerPage).limit(postPerPage);
        // console.log(posts);

        res.render('index', {
            pageTitle: 'وبلاگ',
            path: '/',
            posts,
            formatDate,
            truncate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPost,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPost / postPerPage)
        });

    } catch (e) {
        console.log(e);
        get500();
    }
}


module.exports = {
    getIndex,
    getSinglePost,
    getContactPage,
    handleContactPage,
    getCaptchaNum,
    handleSearchIndex
}