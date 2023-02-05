import config from "@/config/config";
import request from "./request";

async function createKv(key,value,description, token) {
    let url = config.api.endpoint + "/api/kv/create";
    return await request.Post(
        url,
        {
            key:key,
            value:value,
            description:description,
        },
        token
    );
}

async function queryKv(keys, token) {
    let url = config.api.endpoint + "/api/kv/query";
    return await request.Post(
        url,
        {
            filter: {
                keys:keys
            },
        },
        token
    );
}

async function deleteKv(keys,token) {
    let url = config.api.endpoint + "/api/kv/delete";
    return await request.Post(url, {
        filter:{
            keys:keys
        }
    }, token);
}

async function updateKv(key,value,description,token) {
    let url = config.api.endpoint + "/api/kv/update";
    return await request.Post(url, {
        filter:{
            key:key
        },
        update:{
            value:value,
            description:description
        },
    }, token);
}


export default {
    createKv,
    queryKv,
    deleteKv,
    updateKv
};