const Winston = require('winston');
const appRoot = require('app-root-path');

const options = {
    File: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        format: Winston.format.json(),
        maxsize: 5000000, // 5MG
        maxFiles: 5
    },
    Console: {
        level: 'debug',
        handleExceptions: true,
        format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
    }
}

const logger = new Winston.createLogger({
    transports: [
        new Winston.transports.File(options.File),
        new Winston.transports.Console(options.Console)
    ],
    exitOnError: false
});

logger.stream = {
    write: function (msg) {
        logger.info(msg);
    }
};

module.exports = logger;