var mongoose = require('mongoose');
var UserRegister = mongoose.model('UserRegister');
var UserLog = mongoose.model("UserLog");
const { sign } = require('../utils/jwt');

const validator = require('validator');
const moment = require('moment');
const bcrypt = require('bcrypt');
const { response } = require('express');
const saltRounds = 10;

module.exports.signUp = (fullName, phone, email, password) => {
  return new Promise((resolve, reject) => {
    UserRegister.findOne({ $or: [{ email }], isActive: true })
      .then((user) => {
        if (user) {
          return reject({
            message: 'User Already Exist',
            code: 'userExist',
          });
        } else {
          var user = new UserRegister();
          user.email = email;
          user.fullName = fullName;
          user.phone = phone;
          bcrypt.hash(password, saltRounds, function (err, hash) {
            user.hash = hash;
            user
              .save()
              .then(async function () {
                UserLog.create({
                  userId: user.id,
                  logType:"Sign Up",
                });
                let { token } = await sign(user);
                return resolve({
                  token,
                  message: 'User registered successfully!',
                  code: 'userRegistered',
                });
              })
              .catch((err) => reject(err));
          });
        }
      })
      .catch((err) => reject(err));
  });
};

module.exports.login = (email, password) => {
  return new Promise((resolve, reject) => {
    UserRegister.findOne({
      email: email,
      isActive: true,
    })
      .then(async (user) => {
        if (!user) {
          return reject({ message: 'User Not Found', code: 'userNotFound' });
        }
        bcrypt.compare(password, user.hash, async function (err, result) {
          if (result) {
            UserLog.create({
              userId: user.id,
              logType: 'Log In',
            });
            let { token } = await sign(user);
            return resolve({ token });
          } else {
            return reject({
              message: 'Wrong password',
              code: 'failedAuthentication',
            });
          }
        });
      })
      .catch((err) => reject(err));
  });
};

module.exports.getUserData = (userId) => {
  return new Promise(async (resolve, reject) => {
    let user = await UserRegister.findOne({ _id: userId._id, isActive: true });
    if (user) {
      UserRegister.findOne(
        { _id: userId._id, isActive: true },
        'fullName phone email isActive'
      )
        .then((response) => {
          return resolve({ data: response });
        })
        .catch((err) => reject(err));
    } else {
      return reject({ message: 'User Not Found', code: 'userNotFound' });
    }
  });
};

module.exports.getLogDetails = (userId) => {
  return new Promise(async (resolve, reject) => {
    let user = await UserRegister.findOne({ _id: userId._id, isActive: true });
    if (user) {
      UserLog.find(
        { userId: userId._id, isActive: true },
        'logType userId createdAt isActive'
      )
        .then((response) => {
          return resolve({ data: response });
        })
        .catch((err) => reject(err));
    } else {
      return reject({ message: 'User Not Found', code: 'userNotFound' });
    }
  });
};

module.exports.logout = (userId) => {
  return new Promise(async (resolve, reject) => {
    let user = await UserRegister.findOne({ _id: userId._id, isActive: true });
    if (user) {
      UserLog.create({
        userId: user.id,
        logType: 'Log Out',
      });
      return resolve({
        message:"Logout Successfully"
      })
    } else {
      return reject({ message: 'User Not Found', code: 'userNotFound' });
    }
  });
};


module.exports.updatePassword = (
  userId,
  oldPassword,
  newPassword
) => {
  return new Promise(async (resolve, reject) => {
    let userDetails = await UserRegister.findOne({
      _id: userId.id,
      isActive: true,
    });
    if (userDetails) {
      bcrypt.compare(
        oldPassword,
        userDetails.hash,
        async function (err, result) {
          if (result) {
            bcrypt.hash(newPassword, saltRounds, function (err, hash) {
              userDetails.hash = hash;
              userDetails
                .save()
                .then(function () {
                  return resolve({
                    message: 'Password Changed',
                    code: 'passwordChanged',
                  });
                })
                .catch((err) => reject(err));
            });
          } else {
            return reject({
              message: 'Invalid Old Password',
              code: 'invalidOldPassword',
            });
          }
        }
      );
    } else {
      return reject({ message: 'Network Error', code: 'networkError' });
    }
  });
};