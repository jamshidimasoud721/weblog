const passport = require('passport');
const fetch = require('node-fetch');
const jwt = require("jsonwebtoken");


const User = require('../models/userModel');
const {sendEmail} = require("../utils/mailer");

const login = (req, res) => {
    res.render('login', {
        pageTitle: 'ورود',
        path: '/login',
        message: req.flash('success_msg'),
        error: req.flash('error')
    });
}

const handleLogin = async (req, res, next) => {
    // console.log(req.body['g-recaptcha-response']);
    if (!req.body['g-recaptcha-response']) {
        req.flash('error', 'اعتبارسنجی captcha الزامی می باشد.');
        return res.redirect('/users/login');
    }

    const secretKey = process.env.CAPTHCA_SECRET;
    const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body["g-recaptcha-response"]}&remoteip=${req.connection.remoteAddress}`
    const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-from-urlencoded;charset=utf-8"
        }
    })
    const json = await response.json();
    console.log(json);
    if (json.success) {
        passport.authenticate("local", {
            // successRedirect: "/dashboard",
            failureRedirect: "/users/login",
            failureFlash: true,
        })(req, res, next);
    } else {
        req.flash("error", "اعتبار سنجی captcha انجام نشده است.");
        res.redirect('/users/login');
    }


};

const rememberMe = (req, res) => {
    if (req.body.remember) {
        req.session.cookie.originalMaxAge = 24 * 60 * 60 * 1000 //1 day
    } else {
        req.session.cookie.expire = null
    }

    res.redirect('/dashboard');
}

const logout = (req, res) => {
    req.session = null;
    req.logout();
    // req.flash('success_msg', 'خروج موفقیت آمیز بود.');
    res.redirect('/users/login');
    req.session = null;
}

const register = (req, res) => {
    res.render('register', {
        pageTitle: 'ثبت نام',
        path: '/register',
    })
}

const createUser = async (req, res) => {
    const errorsArray = [];

    try {

        await User.userValidation(req.body);
        const {fullName, email, password} = req.body;
        const user = await User.findOne({email});
        if (user) {
            errorsArray.push({message: 'کاربر با این ایمیل موجود است.'});
            return res.render('register', {
                pageTitle: 'ثبت نام',
                path: '/register',
                errors: errorsArray
            });
        }

        await User.create({
            fullName,
            email,
            password
        });

        /*----send email------*/
        sendEmail(email, fullName, ' وبلاگ', 'خوش آمدی . از ثبت نام شما خوشحالیم ')
        /*----send email------*/

        req.flash('success_msg', 'ثبت نام موفقیت آمیز بود.')
        res.redirect('/users/login');

        /*----second way------*/
        // bcrypt.genSalt(10, (err, salt) => {
        //     if (err) throw err;
        //     bcrypt.hash(password, salt, async (err, hash) => {
        //         await User.create({
        //             fullName,
        //             email,
        //             password: hash
        //         });
        //         res.redirect('/users/login');
        //     });
        // })

    } catch (e) {

        console.log(e);
        e.inner.forEach((error) => {
            errorsArray.push({
                name: error.path,
                message: error.message
            });
        });
        return res.render('register', {
            pageTitle: 'ثبت نام',
            path: '/register',
            errors: errorsArray
        })
    }
}

const forgetPassword = async (req, res) => {
    res.render('forgetPass', {
        pageTitle: 'فراموشی رمز عبور',
        path: '/login',
        message: req.flash('success_msg'),
        error: req.flash('error')
    })
}

const handleForgetPassword = async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email: email});
    if (!user) {
        req.flash('error', 'کاربری با این ایمیل موجود نیست');
        return res.render('forgetPass', {
            pageTitle: 'فراموشی رمز عبور',
            path: '/login',
            message: req.flash('success_msg'),
            error: req.flash('error')
        });
    }
    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
    const resetLink = `http://localhost:4000/users/reset-password/${token}`;
    sendEmail(user.email, user.fullName, 'فراموشی رمز عبور', `جهت تغییر رمز عبور فعلی روی لینک زیر 
              <br/>
               <a href="${resetLink}"> لینک تغیرر رمز عبور </a>
                                                                `);
    req.flash('success_msg', 'ایمیل حاوی لینک با موفقیت ارسال شد.');
    res.render('forgetPass', {
        pageTitle: 'فراموشی رمز عبور',
        path: '/login',
        message: req.flash('success_msg'),
        error: req.flash('error')
    })
}

const resetPassword = async (req, res) => {
    const token = req.params.token;
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        console.log(e);
        if (!decodedToken) {
            res.redirect('/404');

        }
    }
    return res.render('resetPass', {
        pageTitle: 'تغییر رمز عبور',
        path: '/login',
        message: req.flash('success_msg'),
        error: req.flash('error'),
        userId: decodedToken.userId
    });
}

const handleResetPassword = async (req, res) => {
    const {password, confirmPassword} = req.body;
    if (password !== confirmPassword) {
        req.flash('error', 'کلمه های عبور یکسان نیستند');
        return res.render('resetPass', {
            pageTitle: 'تغییر رمز عبور',
            path: '/login',
            message: req.flash('success_msg'),
            error: req.flash('error'),
            userId: req.params.id
        });
    }
    const user = await User.findOne({_id: req.params.id});
    if (!user) {
        return res.redirect('/404');
    }
    user.password = password;
    await user.save();
    req.flash('success_msg','کلمه عبور با موفقیت بروزرسانی شد.');
    res.redirect('/users/login');
}

module.exports = {
    login,
    register,
    createUser,
    handleLogin,
    logout,
    rememberMe,
    forgetPassword,
    handleForgetPassword,
    resetPassword,
    handleResetPassword
}