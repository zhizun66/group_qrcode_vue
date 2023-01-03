import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import './style.css'
import installAxios from './plugins/axios'
 
const app = createApp(App)

app.use(router)
app.use(ElementPlus, { locale: zhCn })
installAxios(app)
 
app.mount('#app')