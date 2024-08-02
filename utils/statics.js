const express = require('express');
const path = require('path');
const rootDir = require('../utils/path');


const setStatics = (app) => {
    app.use(express.static(path.join(rootDir, 'public')));
    app.use(express.static(path.join(rootDir, 'node_modules', 'bootstrap-v4-rtl', 'dist')));
    app.use(express.static(path.join(rootDir, 'node_modules', 'font-awesome')));
    app.use(express.static(path.join(rootDir, 'node_modules', 'jquery','dist')));
    app.use(express.static(path.join(rootDir, 'node_modules', 'ckeditor4')));
    app.use(express.static(path.join(rootDir, 'node_modules', 'clipboard','dist')));
};

module.exports = {
    setStatics
}