import request from "../request";

// import _ from "./user_mock";

import config from "@/config/config.js";


async function auth_config() {
  let url = config.api.endpoint + "/api/user/auth_config";
  return await request.Get(url);
}

async function login(email, password, captchaId, captcha) {
  let url = config.api.endpoint + "/api/user/login";
  return await request.Post(url, {
    email: email,
    password: password,
    captcha_id: captchaId,
    captcha: captcha,
  });
}

async function register(email, password, vcode) {
  let url = config.api.endpoint + "/api/user/register";
  return await request.Post(url, {
    email: email,
    password: password,
    vcode: vcode,
  });
}

async function resetPassword(email, password, vcode) {
  let url = config.api.endpoint + "/api/user/reset_password";
  return await request.Post(url, {
    email: email,
    password: password,
    vcode: vcode,
  });
}

async function getUserInfo(token) {
  let url = config.api.endpoint + "/api/user/info";
  return await request.Get(url, token);
}

async function getCaptcha() {
  let url = config.api.endpoint + "/api/user/captcha";
  return await request.Get(url);
}

async function getEmailVCode(email, captchaId, captcha) {
  let url = config.api.endpoint + "/api/user/email_vcode";
  return await request.Post(url, {
    email: email,
    captcha_id: captchaId,
    captcha: captcha,
  });
}

async function queryUser(userId, emailPattern,userToken, forbidden, limit, offset, token) {
  let url = config.api.endpoint + "/api/user/admin/query";
  return await request.Post(
      url,
      {
          filter: {
              id: userId,
              email_pattern: emailPattern,
              token:userToken,
              forbidden: forbidden,
          },
          limit: limit,
          offset: offset,
      },
      token
  );
}


async function updateUser(id, forbidden, roles, permissions, token) {
  let url = config.api.endpoint + "/api/user/admin/update";
  return await request.Post(
      url,
      {
          filter: {
              id: [id],
          },
          update: {
              forbidden: forbidden,
              roles: roles,
              permissions: permissions,
          },
      },
      token
  );
}   

async function createUser(email, password,roles, permissions, token) {
  let url = config.api.endpoint + "/api/user/admin/create";
  return await request.Post(
      url,
      {
          email:email,
          password:password,
          roles:roles,
          permissions:permissions
      },
      token
  );
} 

/////////////////////////////////////////////////////////////

export default {
  auth_config,
  login,
  register,
  resetPassword,
  getUserInfo,
  getCaptcha,
  getEmailVCode,
  queryUser,
  updateUser,
  createUser
};
