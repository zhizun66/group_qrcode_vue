<template>
    <div class="common-main">
        <div class="common-header">
            <div class="common-filter">
                <el-input v-model="filter.username" placeholder="用户账号" clearable />
                <el-date-picker v-model="filter.date" type="daterange" start-placeholder="起始日期" end-placeholder="截止日期" clearable />
                <div class="common-filter-buttons">
                    <el-button :icon="Search" @click="onFilterClick">查询</el-button>
					<el-button :icon="Refresh" @click="onRefreshClick">刷新</el-button>
                </div>
            </div>
            <div class="common-action">
            </div>
        </div>
        <div class="common-content">
            <el-table :data="tableData" height="100%" v-loading="tableLoading">
                <el-table-column label="序号" prop="id" align="center" width="90" />
                <el-table-column label="用户" prop="username" align="center" />
                <el-table-column label="充值金币" prop="value" align="center" />
                <el-table-column label="充值方式" align="center">
                    <template #default="scope">{{scope.row.way === 1 ? '现金': '兑换'}}</template>
                </el-table-column>
                <el-table-column label="充值时间" prop="add_time" align="right" />
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
import { ref, reactive, getCurrentInstance, onMounted, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()
const axios = proxy.axios

const pagination = reactive({
	page: 1,
	pageSize: 20,
	total: 0
})
const tableData = ref([])
const filter = reactive({
    username: '',
    date: null
})
const tableLoading = ref(false)

onMounted(() => {
    loadData()
})

watch(() => pagination.page, () => {
    loadData()
})

function loadData() {
    tableLoading.value = true
    axios.post('admin/user/depositList', {
        username: filter.username,
        date: filter.date ? [filter.date[0]?.getTime() / 1000, filter.date[1]?.getTime() / 1000] : null
    }, {params: {page: pagination.page}}).then(({data}) => {
        tableData.value = data.data
        pagination.pageSize = data.page_size
        pagination.total = data.total
    }).catch(() => {}).finally(() => {
        tableLoading.value = false
    })
}


function onFilterClick() {
    pagination.page = 1
    loadData()
}

function onRefreshClick() {
    loadData()
}

</script>

<style scoped>
:deep(.el-date-editor)  {
    width: 200px !important;
}
</style>