import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})



function get(url: string, params?: any) {
    return axiosInstance.get(url, { params })  
}

function post(url: string, data: any) {
    return axiosInstance.post(url, data)
}

function put(url: string, data: any) {
    return axiosInstance.put(url, data)
}

function del(url: string, params?: any) {
    return axiosInstance.delete(url, { params })
}

export {
    get,
    post,
    put,
    del,
}