<template>
	<div class="common-main">
		<div class="common-header">
			<div class="common-filter">
				<el-radio-group v-model="filter.enable" @change="onEnableChange">
					<el-radio-button :label="1">已启用</el-radio-button>
					<el-radio-button :label="0">未启用</el-radio-button>
				</el-radio-group>
			</div>
		</div>
		<div class="common-content">
			<el-table :data="tableData" v-loading="tableLoading" height="100%">
				<el-table-column label="序号" prop="id" align="center" width="80px" />
				<el-table-column label="账号" prop="username" align="center" />
				<el-table-column label="姓名" prop="name" align="center" />
				<el-table-column label="注册时间" prop="add_time" align="center" />
				<el-table-column label="状态" align="center">
					<template #default="scope">{{scope.row.enable === 1 ? '已启用' : '未启用'}}</template>
				</el-table-column>
				<el-table-column label="操作" align="right" width="300px">
					<template #default="scope">
						<el-button @click="onToggleEnableClick(scope.row)">{{scope.row.enable === 1 ? '禁用' : '启用'}}</el-button>
						<el-button @click="onEditClick(scope.row)">修改密码</el-button>
						<el-button type="danger" plain @click="onDeleteClick(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div class="common-pagination">
			<el-pagination 
				background 
				layout="total,prev,pager,next"
				:default-page-size="pagination.pageSize" 
				v-model:current-page="pagination.page"
				:total="pagination.total" />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { Axios } from 'axios';
import { getCurrentInstance, onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, MessageBoxData } from 'element-plus'

const { proxy } = getCurrentInstance() as any
const axios: Axios = proxy.axios

const tableData = ref([])
const filter = reactive({
	enable: 1
})
const tableLoading = ref<boolean>(false)
const pagination = reactive({
	page: 1,
	pageSize: 20,
	total: 0
})

onMounted(() => {
	loadData()
})

function loadData(): void {
	tableLoading.value = true
	axios.post('admin/staff/index', filter, {
		params: {page: pagination.page}
	}).then(({ data }) => {
		tableData.value = data.data
		pagination.pageSize = data.page_size
		pagination.total = data.total
	}).catch(() => {

	}).finally(() => {
		tableLoading.value = false
	})
}

function onEnableChange() {
	loadData()
}

function onToggleEnableClick(row: any) {
	const enable: number = 1 - row.enable
	axios.post('admin/staff/enable', {
		sid: row.id,
		enable: enable
	}).then(() => {
		row.enable = enable
		ElMessage.success('操作成功')
	}).catch(() => {})
}

async function onDeleteClick(row: any) {
	try {
		await ElMessageBox.confirm('确定要删除吗？', '提示', {type: 'warning'})
		await axios.post('admin/staff/del', {uid: row.id})
		ElMessage.success('已删除')
		const index: number = tableData.value.indexOf(row as never)
		tableData.value.splice(index, 1)
	} catch(e: any) {

	}
}

async function onEditClick(row: any) {
	try {
		const res: MessageBoxData = await ElMessageBox.prompt('输入新密码', '修改密码')
		if (!res.value) {
			ElMessage.error('密码不能为空')
			return
		}
		await axios.post('admin/staff/edit', {
			sid: row.id,
			password: res.value
		})
		ElMessage.success('密码已修改')
	} catch(e: any) {

	}
}

</script>