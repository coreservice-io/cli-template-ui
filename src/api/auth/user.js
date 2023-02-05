import request from "../request";

import _ from "./user_mock";

/////////////////////////////////////////////////////////////
async function login(email, password, captcha) {
  let url = "/api/user/login";
  return await request.Post(url, {
    email: email,
    password: password,
    captcha: captcha,
  });
}

/////////////////////////////////////////////////////////////

async function register(email, password, captcha, vcode) {
  let url = "/api/user/register";
  return await request.Post(url, {
    email: email,
    password: password,
    captcha: captcha,
    vcode: vcode,
  });
}

/////////////////////////////////////////////////////////////

async function reset_pass(email, new_password, captcha, vcode) {
  let url = "/api/user/reset_pass";
  return await request.Post(url, {
    email: email,
    new_password: new_password,
    captcha: captcha,
    vcode: vcode,
  });
}

/////////////////////////////////////////////////////////////

async function detail(token) {
  let url = "/api/user/detail";
  return await request.Post(url, {
    token: token,
  });
}

export default {
  login,
  register,
  reset_pass,
  detail,
};
