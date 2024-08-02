const path = require('path');
module.exports = path.dirname(require.main.filename);
// module.exports = path.dirname(process.mainModule.filename);          /* deprecated */
// console.logs(require.main.filename);