const sendReq = (res, statusCode, message, dataSend) => {
  let status;
  if (`${statusCode}`.startsWith('2')) status = 'success';
  else status = 'error';

  res.status(statusCode).json({
    status,
    message,
    data:dataSend,
  });
}; 

// exports.send = (res, statusCode, doc,message, doc) => {
//   let status;
//   if (`${statusCode}`.startsWith('2')) status = 'success';
//   else status = 'error';

//   res.status(statusCode).json({
//     status,
//     message,
//     doc,
//     ...doc,
//   });
// };

module.exports = sendReq;
 