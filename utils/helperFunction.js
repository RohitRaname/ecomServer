/* eslint-disable camelcase */
const formatDate = function (date) {
  return new Intl.DateTimeFormat('en-US').format(date);
};

function changeToHash(str) {
  const str0 = str.slice(0, 2);
  const str1Length = str.slice(2).length;
  let str1 = '';

  for (let i = 0; i < str1Length - 1; i++) str1 += '*';
  return str0 + str1;
}

function addHashToEmail(str) {
  const arr = str.split('@');
  let arr0 = arr[0];
  let arr1 = arr[1];

  arr0 = changeToHash(arr0);
  arr1 = changeToHash(arr1);

  return arr0 + '@' + arr1;
}

const format_time = (date) => {
  const ms = new Date() - new Date(date);
  const hour = Math.floor(ms / (1000 * 60 * 60));
  if (hour > 0) return `${hour}h`;
  if (hour > 24) return new Date(date).toLocaleDateString();

  const min = Math.floor((ms % (1000 * 60 * 60)) / (60 * 1000));
  return `${min}m`;
};

const readable_time = (date) => {
  const date_rec = new Date(date);

  const no_of_days = new Date().getDate() - date_rec.getDate();
  if (no_of_days === 0) {
    const ms = new Date() - date_rec;
    const hour = Math.floor(ms / (1000 * 60 * 60));
    if (hour > 0) return `${hour}h`;
    const min = Math.floor((ms % (1000 * 60 * 60)) / (60 * 1000));
    return `${min}m`;
  }

  // no_of_days === 0
  // ? new Intl.DateTimeFormat('en-US', {
  //     weekday: 'short',
  //     hour: 'numeric',
  //     minute: 'numeric',
  //     timeZoneName: 'short',
  //   })
  //     .format(new Date(date_rec))
  //     .split(' ')
  //     .slice(0, 3)
  //     .join(' ')

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date_rec));
};

module.exports = { formatDate, addHashToEmail, format_time, readable_time };
