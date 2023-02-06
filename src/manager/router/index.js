import { createRouter, createWebHashHistory } from 'vue-router'

import Provider from '../views/Provider.vue'
import Entrance from '../views/Entrance.vue'
import Qrcode from '../views/Qrcode.vue'
import Exchange from '../views/Exchange.vue'
import Work from '../views/Work.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'provider',
      component: Provider
    },
    {
      path: '/entrance',
      name: 'entrance',
      component: Entrance
    },
    {
      path: '/qrcode',
      name: 'qrcode',
      component: Qrcode
    },
    {
      path: '/exchange',
      name: 'exchange',
      component: Exchange
    },
    {
      path: '/work',
      name: 'work',
      component: Work
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../../views/NotFound.vue')
    }
  ]
})

export default router