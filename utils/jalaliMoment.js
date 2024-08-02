const jalaliMoment = require('jalali-moment');

const formatDate = (date) => {
    return jalaliMoment(date).locale('fa').format('D MMM YYYY');
}

module.exports = {
    formatDate
}