import { createRouter, createWebHashHistory } from 'vue-router'
import Decode from '../views/Decode.vue'
import Mall from '../views/Mall.vue'
import Bought from '../views/Bought.vue'
// const routerHistory = createWebHistory()
// createWebHashHistory hash 路由
// createWebHistory history 路由
// createMemoryHistory 带缓存 history 路由
const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: '/',
			redirect: '/decode'
		},
		{
			path: '/decode',
			name: 'decode',
			component: Decode
		},
		{
			path: '/mall',
			name: 'mall',
			component: Mall
		},
		{
			path: '/bought',
			name: 'bought',
			component: Bought
		},
		{
			path: '/invite',
			name: 'invite',
			component: () => import('../views/Invite.vue')
		},
		{
			path: '/:pathMatch(.*)*',
			component: () => import('../views/NotFound.vue')
		}
	]
})

export default router