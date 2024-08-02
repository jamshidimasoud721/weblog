const Yup = require('yup');

//* validate for UI by Yup
const schema = Yup.object().shape({
    fullName: Yup.string().required('نام ونام خانوادگی الزامی است.').min(4, 'نام و نام خانوادگی نباید کمتر از 4 کاراکتر باشد.').max(255, 'نام و نام خانوادگی نباید بیشتر از 255 کاراکتر باشد.'),
    email: Yup.string().email('ایمیل معتبر نمی باشد.').required('ایمیل الزامی می باشد.'),
    password: Yup.string().min(4, 'کلمه عبور نباید کمتر از 4 کاراکتر باشد.').max(255, 'کلمه عبور نباید بیشتر از 255 کاراکتر باشد.').required('کلمه عبور الزامی می باشد.'),
    confirmPassword: Yup.string().required('تکرار کلمه عبور الزامی می باشد.').oneOf([Yup.ref('password'), null], 'کلمه های عبور یکسان نیست')
});

module.exports = {
    schema
}



//=========== fastest-validator======================================================================================

// const fastestValidator = require('fastest-validator');
// const validator = new fastestValidator();


// const Schema = {
//     fullName: {
//         type: 'string',
//         trim: true,
//         min:4,
//         max: 255,
//         messages: {
//             stringMin:'نام و نام خانوادگی نباید کمتر از 4 کاراکتر باشد.',
//             stringMax: 'نام و نام خانوادگی نباید بیشتر از 255 کاراکتر باشد.'
//         }
//     },
//     email: {
//         type: 'email',
//         normalize: true,
//         messages: {
//             emailEmpty: 'ایمیل الزامی می باشد.',
//             string: 'ایمیل را بررسی کنید.',
//             unique: 'ایمیل از قبل موجود است.'
//         }
//     },
//     password: {
//         type: 'string',
//         min: 4,
//         max: 255,
//         messages: {
//             string: 'کلمه عبور را بررسی کنید.',
//             stringMin: 'کلمه عبور نباید کمتر از 4 کاراکتر باشد.',
//             stringMax: 'کلمه عبور نباید بیشتر از 255 کاراکتر باشد.'
//         }
//     },
//     confirmPassword: {
//         type: 'string',
//         min: 4,
//         max: 255,
//         messages: {
//             string: 'تکرار کلمه عبور را بررسی کنید.',
//             stringMin: 'تکرار کلمه عبور نباید کمتر از 4 کاراکتر باشد.',
//             stringMax: 'تکرار کلمه عبور نباید بیشتر از 255 کاراکتر باشد.'
//         }
//     },
// }

// const validate = validator.validate(req.body, Schema);
// console.logs(validate);
// const errorArr = [];
// if (validate === true) {
//     const {fullName, email, password, confirmPassword} = req.body;
//     if (password !== confirmPassword) {
//         errorArr.push({message: 'کلمه های عبور یکسان نیست'});
//         return res.render('register', {
//             pageTitle: 'ثبت نام',
//             path: '/register',
//             errors: errorArr
//         })
//     } else {
//         res.redirect('/users/login');
//     }
// } else {
//      res.render('register', {
//         pageTitle: 'ثبت نام',
//         path: '/register',
//         errors: validate
//     })
// }
