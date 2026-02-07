import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})



function get(url: string, params?: any) {
    axiosInstance.get(url, { params })  
}

function post(url: string, data: any) {
    return axiosInstance.post(url, data)
}

function put(url: string, data: any) {
    axiosInstance.put(url, data)
}


export  {
    get,
    post,
    put,

}