<template>
    <div class="common-main">
		<div class="common-header">
			<div class="common-filter">
				<el-radio-group v-model="filter.status" @change="onStatusChange">
					<el-radio-button :label="0">待发放</el-radio-button>
					<el-radio-button :label="1">已发放</el-radio-button>
					<el-radio-button :label="-1">不发放</el-radio-button>
				</el-radio-group>
				<el-select v-model="filter.role" placeholder="角色" clearable>
					<el-option label="用户" value="user" />
					<el-option label="合作商" value="provider" />
				</el-select>
				<div class="common-filter-buttons">
					<el-button :icon="Search" @click="onFilterClick">查询</el-button>
					<el-button :icon="Refresh" @click="onRefreshClick">刷新</el-button>
				</div>
			</div>
            <div class="common-action"></div>
		</div>
		<div class="common-content">
			<el-table :data="tableData" height="100%" v-loading="tableLoading">
				<el-table-column label="序号" prop="id" align="center" width="80" />
				<el-table-column label="账号" prop="username" align="center" />
				<el-table-column label="角色" prop="role" align="center" :formatter="roleFormatter" />
				<el-table-column label="积分" prop="score" align="center" />
				<el-table-column label="状态" prop="status" align="center" :formatter="statusFormatter" />
				<el-table-column label="提交时间" prop="add_time" align="center" />
				<el-table-column label="操作时间" prop="op_time" align="center" v-if="filter.status !== 0" />
				<el-table-column label="操作" align="right">
					<template #default="scope">
						<template v-if="scope.row.status === 0">
							<el-button type="success" plain @click="onPermitClick(scope.row)">已发放</el-button>
							<el-button type="warning" plain @click="onRefuseClick(scope.row)">不发放</el-button>
						</template>
						<span v-else>--</span>
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

<script setup>
import { ref, reactive, onMounted, watch, getCurrentInstance } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const { proxy } = getCurrentInstance()
const axios = proxy.axios

const filter = reactive({
	status: 0,
    role: ''
})
const pagination = reactive({
	page: 1,
	pageSize: 20,
	total: 0
})
const tableLoading = ref(false)
const tableData = ref([])

onMounted(() => {
	loadData()
})

watch(() => pagination.page, () => {
	loadData()
})

function loadData() {
	tableLoading.value = true
	axios.post('admin/withdraw/index', filter, {
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

function statusFormatter(_row, _column, cellValue, _index) {
    return {
        0: '待发放',
        1: '已发放',
        '-1': '不发放'
    }[cellValue]
}

function roleFormatter(_row, _column, cellValue, _index) {
	return {
        'user': '用户',
        'provider': '合作商',
    }[cellValue]
}

function onStatusChange() {
	loadData()
}


// 查询
const onFilterClick = () => {
	pagination.page = 1
	loadData()
}

// 刷新
const onRefreshClick = () => {
	loadData()
}

async function onPermitClick(row) {
	try {
		await ElMessageBox.confirm('确定已经发放吗？', '确认发放', {type: 'warning', confirmButtonClass: 'el-button--success'})
		await axios.post('admin/withdraw/permit', {wid: row.id})
		ElMessage.success('操作成功')
		row.status = 1
	} catch(_e) {

	}
}

async function onRefuseClick(row) {
	try {
		await ElMessageBox.confirm('确定不发放吗？', '不发放', {type: 'warning', confirmButtonClass: 'el-button--danger'})
		await axios.post('admin/withdraw/refuse', {wid: row.id})
		ElMessage.success('操作成功')
		row.status = -1
	} catch(_e) {

	}
}
</script>

<style scoped>
.el-radio-group {
	width: auto !important;
}
</style>