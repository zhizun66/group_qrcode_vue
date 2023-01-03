<template>
    <div class="common-main">
        <div class="common-header">
            <div class="common-filter"></div>
            <div class="common-action">
                <el-button type="primary" :icon="Coin" @click="onWithdrawClick" :loading="withdrawBtnLoading">积分提现</el-button>
                <el-button type="primary" :icon="Clock" @click="onWithdrawedClick">提现记录</el-button>
            </div>
        </div>
        <div class="common-content" style="overflow:auto;">
            <div class="box" ref="chartRef"></div>
        </div>
    </div>

    <el-dialog v-model="showWithdrawDlg" title="提现记录" width="1000px">
        <el-table height="300px" :data="withdrawData" v-loading="withdrawLoading">
            <el-table-column label="提现积分" prop="score"></el-table-column>
            <el-table-column label="收款账号" prop="alipay"></el-table-column>
            <el-table-column label="提现状态" prop="status" :formatter="statusFormatter"></el-table-column>
            <el-table-column label="执行时间" prop="op_time"></el-table-column>
            <el-table-column label="提交时间" prop="add_time"></el-table-column>
        </el-table>
        <div style="display:flex;justify-content:center;margin-top:10px">
            <el-pagination 
                small 
                background
                layout="total,prev,pager,next"
                :default-page-size="withdrawPagination.pageSize" 
                v-model:current-page="withdrawPagination.page"
                :total="withdrawPagination.total" />
        </div>
    </el-dialog>

</template>

<script setup>
import { Coin, Clock } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, getCurrentInstance, inject } from 'vue'
import * as echarts from 'echarts'

const { proxy } = getCurrentInstance()
const axios = proxy.axios

const chartRef = ref()
const withdrawPagination = reactive({
	page: 1,
	pageSize: 20,
	total: 0
})
const withdrawLoading = ref(false)
const showWithdrawDlg = ref(false)
const withdrawData = ref([])
const withdrawBtnLoading = ref(false)

onMounted(() => {
	const option = {
		xAxis: {
			type: 'category',
			data: []
		},
		yAxis: {
			type: 'value',
            minInterval: 1
		},
		series: [
			{
				data: [],
				type: 'line',
				lineStyle: {
					color: '#409eff'
				},
				itemStyle: {
					color: '#409eff'
				}
			}
		],
		title: {
			text: '收益',
			padding: 20
		},
        grid: {
            left: 60,
            right: 20,
            bottom: 40
        },
        tooltip: {
            trigger: 'axis'
        }
	}

    axios.get('provider/withdraw/income').then(({data}) => {
        option.xAxis.data = Object.keys(data).map((item) => {
            const arr = item.split('-')
            return arr[1] + '月' + arr[2] + '日'
        })
        option.xAxis.data[option.xAxis.data.length - 1] = '今天'
        option.xAxis.data[option.xAxis.data.length - 2] = '昨天'
        option.xAxis.data[option.xAxis.data.length - 3] = '前天'
        option.series[0].data = Object.values(data)
        const chart = echarts.init(chartRef.value)
	    chart.setOption(option)
    }).catch(() => {})

})

function onWithdrawedClick() {
    showWithdrawDlg.value = true
    loadWithdrawData()
}

function loadWithdrawData() {
    withdrawLoading.value = true
    axios.get('provider/withdraw/withdrawList', {
        params: {
            page: withdrawPagination.page
        }
    }).then(({data}) => {
        withdrawData.value = data.data
        withdrawPagination.pageSize = data.page_size
        withdrawPagination.total = data.total
    }).catch(() => {

    }).finally(() => {
        withdrawLoading.value = false
    })
}

function statusFormatter(_row, _column, cellValue, _index) {
    return {
        0: '正在审核',
        1: '已发放',
        '-1': '发放失败'
    }[cellValue]
}

const onWithdrawClick = inject('onWithdrawClick')


</script>

<style scoped>
.box {
    background-color: #FFF;
    height: 400px;
    border-radius: 10px;
    box-shadow: 0 0 1px rgb(0 0 0 / 13%), 0 1px 3px rgb(0 0 0 / 20%);
    margin: 3px;
}
</style>