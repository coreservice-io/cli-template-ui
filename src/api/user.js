import config from "../config/config";
import request from "./request";

async function getAuthConfig() {
    let url = config.api.endpoint + "/api/user/auth_config";
    return await request.Get(url);
}

async function getUserInfo(token) {
    let url = config.api.endpoint + "/api/user/info";
    return await request.Get(url, token);
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

async function register(email, password, captchaId, captcha, vcode) {
    let url = config.api.endpoint + "/api/user/register";
    return await request.Post(url, {
        email: email,
        password: password,
        vcode: vcode,
        captcha_id: captchaId,
        captcha: captcha,
    });
}


async function resetPassword(email, password,captchaId, captcha, vcode) {
    let url = config.api.endpoint + "/api/user/reset_password";
    return await request.Post(url, {
        email: email,
        password: password,
        vcode: vcode,
        captcha_id: captchaId,
        captcha: captcha,
    });
}

async function getEmailVCode(email) {
    let url = config.api.endpoint + "/api/user/email_vcode";
    return await request.Post(url, {
        email: email,
    });
}

async function queryUser(userId, emailPattern,userToken, forbidden, limit, offset, token) {
    let url = config.api.endpoint + "/api/user/query";
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
    let url = config.api.endpoint + "/api/user/update";
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


export default {
    getAuthConfig,
    getUserInfo,
    login,
    register,
    resetPassword,
    getEmailVCode,
    queryUser,
    updateUser,
};
