const UserRegister = require('../models/UserRegister');
const createError = require('http-errors');
const validator = require('validator');
const moment = require('moment');
const UserModules = require('../modules/users');
var mongoose = require('mongoose');

module.exports.signUp = async (req, res, next) => {
  try {
    let { fullName, phone, email, password } = req.body;

    if (!phone || !validator.isMobilePhone(phone, 'en-IN'))
      return next(
        createError(400, {
          message: 'Enter a valid Phone Number',
          code: 'phoneNumberRequired',
        })
      );
    if (!email || !validator.isEmail(email))
      return next(
        createError(400, {
          message: 'Enter a Valid Email ID',
          code: 'emailRequired',
        })
      );
    if (!password || password.length < 6 || password.length > 32)
      return next(
        createError(400, {
          message: 'Password should be between 6 to 32 characters',
          code: 'passwordRequired',
        })
      );
    let data = await UserModules.signUp(fullName, phone, email, password);
    return res.json(data);
  } catch (error) {
    console.log('eeee', error);
    res.status(422).json({
      errors: {
        body: ['User registration failed! ', error.message],
        code: [error.code],
      },
    });
  }
};

module.exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !validator.isEmail(email))
      return next(
        createError(400, {
          message: 'Email Is Required And It Should Be A Valid Email',
          code: 'emailRequired',
        })
      );

    let data = await UserModules.login(email, password);
    return res.json(data);
  } catch (error) {
    res.status(422).json({
      errors: {
        body: [error.message],
        code: [error.code],
      },
    });
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const userId = req.user;
    let data = await UserModules.logout(userId);
    return res.json(data);
  } catch (error) {
    res
      .status(422)
      .json({ errors: { body: [error.message], code: [error.code] } });
  }
};

module.exports.getUserData = async (req, res, next) => {
  try {
    const userId = req.user;
    let data = await UserModules.getUserData(userId);
    return res.json(data);
  } catch (error) {
    res
      .status(422)
      .json({ errors: { body: [error.message], code: [error.code] } });
  }
};

module.exports.getLogDetails = async (req, res, next) => {
  try {
    const userId = req.user;
    let data = await UserModules.getLogDetails(userId);
    return res.json(data);
  } catch (error) {
    res
      .status(422)
      .json({ errors: { body: [error.message], code: [error.code] } });
  }
};

module.exports.updatePassword = async (req, res, next) => {
  try {
    let { oldPassword, newPassword } = req.body;
    const userId = req.user;
    let data = await UserModules.updatePassword(
      userId,
      oldPassword,
      newPassword
    );
    return res.json(data);
  } catch (error) {
    res
      .status(422)
      .json({ errors: { body: [error.message], code: [error.code] } });
  }
};
