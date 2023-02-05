import config from "@/config/config"
import request from "./request";

async function getCaptcha() {
    let url = config.api.endpoint+"/api/captcha";
    return await request.Get(url);
}

export default {
    getCaptcha
}