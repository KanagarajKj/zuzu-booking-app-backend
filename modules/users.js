var mongoose = require('mongoose');
var UserRegister = mongoose.model('UserRegister');
var UserLog = mongoose.model('UserLog');
const { sign } = require('../utils/jwt');

const validator = require('validator');
const moment = require('moment');
const bcrypt = require('bcrypt');
const { response } = require('express');
const saltRounds = 10;

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

module.exports.signUp = (fullName, phone, email, password, typeOfPerson) => {
  return new Promise((resolve, reject) => {
    if (typeOfPerson === 'admin') {
      UserRegister.findOne({
        email: email,
        typeOfPerson: 'admin',
        isActive: true,
      })
        .then((user) => {
          if (user) {
            return reject({
              message: 'Admin Already Exist',
              code: 'adminExist',
            });
          } else {
            var user = new UserRegister();
            user.email = email;
            user.fullName = fullName;
            user.phone = phone;
            user.typeOfPerson = typeOfPerson;
            bcrypt.hash(password, saltRounds, function (err, hash) {
              user.hash = hash;
              user
                .save()
                .then(async function () {
                  UserLog.create({
                    userId: user.id,
                    typeOfPerson: user.typeOfPerson,
                    logType: 'Sign Up',
                  });
                  let { token } = await sign(user);
                  return resolve({
                    token,
                    message: 'Admin registered successfully!',
                    code: 'adminRegistered',
                  });
                })
                .catch((err) => reject(err));
            });
          }
        })
        .catch((err) => reject(err));
    } else {
      UserRegister.findOne({
        email: email,
        typeOfPerson: 'user',
        isActive: true,
      })
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
            user.typeOfPerson = typeOfPerson;
            bcrypt.hash(password, saltRounds, function (err, hash) {
              user.hash = hash;
              user
                .save()
                .then(async function () {
                  UserLog.create({
                    userId: user.id,
                    typeOfPerson: user.typeOfPerson,
                    logType: 'Sign Up',
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
    }
  });
};

module.exports.login = (email, password, typeOfPerson) => {
  return new Promise((resolve, reject) => {
    if (typeOfPerson === 'admin') {
      UserRegister.findOne({
        email: email,
        typeOfPerson: 'admin',
        isActive: true,
      })
        .then(async (user) => {
          if (!user) {
            return reject({
              message: 'Admin Not Found',
              code: 'adminNotFound',
            });
          }
          bcrypt.compare(password, user.hash, async function (err, result) {
            if (result) {
              UserLog.create({
                userId: user.id,
                typeOfPerson: user.typeOfPerson,
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
    } else {
      UserRegister.findOne({
        email: email,
        typeOfPerson: 'user',
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
                typeOfPerson: user.typeOfPerson,
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
    }
  });
};

module.exports.getUserData = (userId) => {
  return new Promise(async (resolve, reject) => {
    let user = await UserRegister.findOne({ _id: userId._id, isActive: true });
    if (user) {
      UserRegister.findOne(
        { _id: userId._id, isActive: true },
        'fullName phone email isActive typeOfPerson isPhoneNumberVerified'
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
        typeOfPerson: user.typeOfPerson,
        logType: 'Log Out',
      });
      return resolve({
        message: 'Logout Successfully',
      });
    } else {
      return reject({ message: 'User Not Found', code: 'userNotFound' });
    }
  });
};

module.exports.updatePassword = (userId, oldPassword, newPassword) => {
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

module.exports.sendOTP = (userId, phone) => {
  return new Promise(async (resolve, reject) => {
    let userDetails = await UserRegister.findOne({
      _id: userId.id,
      isActive: true,
      phone: phone,
    });
    const client = twilio(accountSid, authToken);

    if (userDetails) {
      let otp = Math.floor(1000 + Math.random() * 9000);

      await client.messages
        .create({
          body: `Your OTP is ${otp}`,
          from: twilioNumber,
          to: '+91' + phone,
        })
        .then(async () => {
          const userData = await UserRegister.findOneAndUpdate(
            { _id: userId.id },
            { $set: { isActive: true, otp: otp } },
            { new: true }
          );
          if (userData) {
            return resolve({
              message: 'OTP Sent Successfully',
              code: 'otpSentSuccessfully',
            });
          }
        })
        .catch((err) => reject(err));
    } else {
      return reject({
        message: 'Enter Your Registered Phone Number',
        code: 'enterYourRegisteredPhoneNumber',
      });
    }
  });
};

module.exports.verifyOTP =  (user, otp) => {
  return new Promise(async (resolve, reject) => {
    const userDetails = UserRegister.findOne({
      _id: user.id,
      isActive: true,
    });

    if (userDetails) {
      if (user.otp === Number(otp)) {
        const userData = await UserRegister.findOneAndUpdate(
          { _id: user.id },
          { $set: { isPhoneNumberVerified: true } },
          { new: true }
        );
        if (userData) {
          return resolve({
            message: 'OTP Verified',
            code: 'otpVerified',
          });
        }
      } else {
        return reject({
          message: 'Invalid OTP',
          code: 'invalidOTP',
        });
      }
    } else {
      const message =
        userDetails.typeOfPerson === 'admin'
          ? 'Admin Not Found'
          : 'User Not Found';
      return reject({
        message: { message },
        code: { message },
      });
    }
  });
};
