import { createRouter, createWebHashHistory } from 'vue-router'
import Qrcode from '../views/Qrcode.vue'
import Entrance from '../views/Entrance.vue'
import Income from '../views/Income.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'income',
      component: Income
    },
    {
      path: '/qrcode',
      name: 'qrcode',
      component: Qrcode
    },
    {
      path: '/entrance',
      name: 'entrance',
      component: Entrance
    },
    // {
    // 	path: '/income',
    // 	name: 'income',
    // 	component: Income
    // },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../../views/NotFound.vue')
    }
  ]
})

export default router