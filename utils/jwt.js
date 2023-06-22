const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

module.exports.sign = async (user) => {
  const JWT_ACCESS_SECRET = process.env.ACCESS_SECRET
    ? process.env.ACCESS_SECRET
    : 'secret';

  return new Promise(async (resolve, reject) => {
    let token = await jwt.sign(
      {
        userId: user._id,
      },
      JWT_ACCESS_SECRET,
    );

    return resolve({ token });
  });
};

module.exports.decode = async (token) => {
  const JWT_SECRET = process.env.ACCESS_SECRET
    ? process.env.ACCESS_SECRET
    : 'secret';
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      console.log(err);
      if (err) return reject(err);

      return resolve(decoded);
    });
  });
};
