<template>
	<header class="app-header">
		<div class="sys-name">
			<div></div>
			<span>活码扫描系统</span>
		</div>
		<div class="username">
			<el-dropdown @command="onUserDropdownCommand">
				<div class="dropdown-link">
					<span>{{username}}</span>
					<el-icon><ArrowDown /></el-icon>
				</div>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item command="alter_pwd">修改密码</el-dropdown-item>
						<el-dropdown-item command="logout">退出登录</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
		</div>
	</header>
	<div class="left">
		<router-link to="/">
			<el-icon :size="18"><House /></el-icon>
			<span>后台首页</span>
		</router-link>
		<router-link to="/user">
			<el-icon :size="18"><User /></el-icon>
			<span>用户管理</span>
		</router-link>
		<!-- <router-link to="/staff">
			<el-icon :size="18"><ElementPlus /></el-icon>
			<span>员工管理</span>
		</router-link> -->
		<router-link to="/provider">
			<el-icon :size="18"><Connection /></el-icon>
			<span>合作管理</span>
		</router-link>
		<router-link to="/qrcode">
			<el-icon :size="18"><Aim /></el-icon>
			<span>活码管理</span>
		</router-link>
		<router-link to="/entrance">
			<el-icon :size="18"><Files /></el-icon>
			<span>群码管理</span>
		</router-link>
		<router-link to="/tag">
			<el-icon :size="18"><Discount /></el-icon>
			<span>标签管理</span>
		</router-link>
		<router-link to="/withdraw">
			<el-icon :size="18"><Coin /></el-icon>
			<span>提现管理</span>
		</router-link>
		<router-link to="/buy">
			<el-icon :size="18"><ShoppingCart /></el-icon>
			<span>购买记录</span>
		</router-link>
		<router-link to="/deposit">
			<el-icon :size="18"><Money /></el-icon>
			<span>充值记录</span>
		</router-link>
		<router-link to="/setting">
			<el-icon :size="18"><Setting /></el-icon>
			<span>系统设置</span>
		</router-link>
	</div>
	<div class="main">
		<router-view />
	</div>

	<!-- 修改密码 -->
	<el-dialog v-model="showChangePwdDlg" width="300px" title="修改密码">
		<el-form :model="changePwdForm" :rules="changePwdRule" ref="changePwdFormRef">
			<el-form-item label="新的密码" prop="password">
				<el-input show-password v-model="changePwdForm.password" />
			</el-form-item>
			<el-form-item label="确认密码" prop="confirm">
				<el-input placeholder="重复输入上面的密码" show-password v-model="changePwdForm.confirm" />
			</el-form-item>
		</el-form>
		<div style="text-align:center;">
			<el-button type="primary" @click="onChangePwdClick">确定</el-button>
		</div>
	</el-dialog>

</template>


<script setup>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { House, User, Aim, ArrowDown, Files, Discount, Connection, Coin, Setting, ShoppingCart, Money } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { proxy } = getCurrentInstance()
const axios = proxy.axios

const username = ref(null)

function onUserDropdownCommand(command) {
	if (command === 'logout') {
		axios.get('admin/base/logout').then(() => {
			location.href = '/login.html?admin'
		}).catch(() => {})
	} else if (command === 'alter_pwd') {
		showChangePwdDlg.value = true
	}
}

onMounted(() => {
	axios.get('admin/index/index').then(({data}) => {
		username.value = data.username
	}).catch(() => {
	})
})

// 修改密码
const showChangePwdDlg = ref(false)
const changePwdForm = reactive({
	password: '',
	confirm: ''
})
const changePwdRule = reactive({
	password: {
		trigger: 'blur',
		required: true,
		message: '请输入密码'
	},
	confirm: {
		trigger: 'blur',
		required: true,
		validator: (_rule, value, callback) => {
			changePwdForm.password !== value ? callback(new Error('两次输入的密码不一致')) : callback()
		}
	}
})
const changePwdFormRef = ref()
function onChangePwdClick() {
	changePwdFormRef.value.validate((valid) => {
		if (!valid) {
			return
		}
		axios.post('admin/index/repwd', {password: changePwdForm.password}).then(() => {
			showChangePwdDlg.value = false
			ElMessage.success('修改密码成功')
		}).catch(() => {})
	})
}
</script>


<style scoped>
.sys-name {
	display: flex;
	align-items: center;
	font-weight: bold;
}

.sys-name div {
	background-color: var(--el-color-primary);
	width: 30px;
	height: 30px;
	border-radius: 50%;
	margin-right: 8px;
}

.username {
	flex: 1;
	text-align: right;
}
.dropdown-link {
	display: flex;
	color: var(--el-color-primary);
	cursor: pointer;
}
.dropdown-link > span {
	margin-right: 3px;
}
.left {
	width: 200px;
	position: fixed;
	top: 60px;
	left: 0;
	bottom: 0;
	background-color: #FFF;
	padding-right: 20px;
	border-right: 1px #F2F2F2 solid;
	box-sizing: border-box;
	overflow-y: auto;
}
.left a,
.left a:visited {
	display: block;
	color: #999;
	text-decoration: none;
	padding: 0 15px;
	line-height: 40px;
	display: flex;
	align-items: center;
	border-left: 2px solid;
	border-color: transparent;
	transition: color .15s ease-in-out, background-color .15s ease-in-out;
}

.left a:hover {
	color: #333;
}

.router-link-active {
	color: var(--el-color-primary) !important;
	border-color: var(--el-color-primary) !important;
	background-color: var(--el-color-primary-light-9) !important;
}
.left a span {
	margin-left: 8px;
}
.balance {
	margin-left: 15px;
}
.balance span {
	font-weight: bold;
}
</style>
