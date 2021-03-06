import {requestPost} from '../../common/utils/request';

export function loginValidate(opt) {
    const route = '/Api/User/Login';
    return requestPost(route, opt)
}

export function accessToken(opt) {
    const route = '/Api/User/Accesstoken';
    return requestPost(route, opt)
}

export function getAllUser(opt) {
    const route = '/api/getalluser';
    return requestPost(route, opt)
}

export function delUser(opt) {
    const route = '/api/deluser';
    return requestPost(route, opt)
}

export function addUser(opt) {
    const route = '/api/createUser';
    return requestPost(route, opt)
}