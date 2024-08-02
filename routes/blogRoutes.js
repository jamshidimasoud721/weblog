// const express = require('express');
// const router = express.Router();
const {Router} = require('express');
const router = new Router();

const blogController = require('../controllers/blogController');

//* @desc : weblog main page
//* @route : GET '/'
router.get('/', blogController.getIndex);

//* @desc : weblog post page
//* @route : GET '/'
router.get('/post/:id', blogController.getSinglePost);

//* @desc : contact page
//* @route : GET '/contact'
router.get('/contact', blogController.getContactPage);

//* @desc : handle contact page
//* @route : POST '/contact'
router.post('/contact', blogController.handleContactPage);

//* @desc : captcha number
//* @route : GET '/contact'
router.get('/captcha.png', blogController.getCaptchaNum);

//* @desc : handle search
//* @route : POST '/search'
router.post('/search', blogController.handleSearchIndex);

module.exports = router;