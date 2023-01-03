import axios from 'axios';
import VueAxios from 'vue-axios';

import { ElMessage } from 'element-plus';

export default (app) => {

    axios.interceptors.response.use(
        (response) => {
            if (response.status === 200) {
                if (response.data.code === 0) {
                    return Promise.resolve(response.data);
                } else if (response.data.code === -999) {
                    ElMessage.error('会话已过期，请重新登录');
                    setTimeout(() => {
                        location.href = response.data.message
                    }, 1500)
                } else {
                    ElMessage.error(response.data.message);
                    return Promise.reject(response);
                }
            } else {
                return Promise.reject(response);
            }
        },

        (error) => {
            ElMessage.error('网络错误');
            return Promise.reject(error.response);
        }
    )
    
    //axios.defaults.baseURL = '/api/rest/'
    axios.defaults.baseURL = import.meta.env.DEV ? '/api/rest/' : '/rest/';

    app.use(VueAxios, axios)
}