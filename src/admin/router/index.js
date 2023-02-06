import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import User from '../views/User.vue'
// import Staff from '../views/Staff.vue'
import Provider from '../views/Provider.vue'
import Manager from '../views/Manager.vue'
import Qrcode from '../views/Qrcode.vue'
import Entrance from '../views/Entrance.vue'
import Tag from '../views/Tag.vue'
import Withdraw from '../views/Withdraw.vue'
import Buy from '../views/Buy.vue'
import Deposit from '../views/Deposit.vue'
import Setting from '../views/Setting.vue'
// const routerHistory = createWebHistory()
// createWebHashHistory hash 路由
// createWebHistory history 路由
// createMemoryHistory 带缓存 history 路由
const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: '/',
			component: Home
		},
		{
			path: '/user',
			component: User
		},
		// {
		// 	path: '/staff',
		// 	component: Staff
		// },
		{
			path: '/manager',
			component: Manager
		},
		{
			path: '/provider',
			component: Provider
		},
		{
			path: '/qrcode',
			component: Qrcode
		},
		{
			path: '/entrance',
			component: Entrance
		},
		{
			path: '/tag',
			component: Tag
		},
		{
			path: '/withdraw',
			component: Withdraw
		},
		{
			path: '/buy',
			component: Buy
		},
		{
			path: '/deposit',
			component: Deposit
		},
		{
			path: '/setting',
			component: Setting
		},
		{
			path: '/:pathMatch(.*)*',
			component: () => import('../../views/NotFound.vue')
		}
	]
})

export default router