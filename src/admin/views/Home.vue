<template>
	<el-row :gutter="20">
		<el-col :span="8">
			<div class="box" ref="qrcodeDom">1</div>
		</el-col>
		<el-col :span="8">
			<div class="box" ref="entranceDom">2</div>
		</el-col>
		<el-col :span="8">
			<div class="box" ref="buyDom">3</div>
		</el-col>
	</el-row>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import * as echarts from 'echarts'

const { proxy } = getCurrentInstance()
const axios = proxy.axios

const qrcodeDom = ref()
const entranceDom = ref()
const buyDom = ref()

onMounted(() => {
	const qrcodeChart = echarts.init(qrcodeDom.value)
	const entranceChart = echarts.init(entranceDom.value)
	const buyChart = echarts.init(buyDom.value)

	axios.get('admin/index/visualization').then(({data}) => {
		visualization(qrcodeChart, '活码', data.qrcode)
		visualization(entranceChart, '群码', data.entrance)
		visualization(buyChart, '销量', data.buy)
	}).catch(() => {})
})

function visualization(chart, title, data) {
	const option = {
		xAxis: {
			type: 'category',
			data: ['14日', '15日', '16日', '17日', '前天', '昨天', '今天']
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
			},
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
			text: '',
			padding: 20
		},
		grid: {
            left: 50,
            right: 20,
            bottom: 40
        },
        tooltip: {
            trigger: 'axis'
        }
	}

	option.title.text = title
	option.xAxis.data = Object.keys(data).map((item) => {
		return item.split('-')[2] + '日'
	})
	option.xAxis.data[option.xAxis.data.length - 1] = '今天'
	option.xAxis.data[option.xAxis.data.length - 2] = '昨天'
	option.xAxis.data[option.xAxis.data.length - 3] = '前天'
	option.series[0].data = Object.values(data)
	chart.setOption(option)
}

</script>

<style scoped>
.box {
    background-color: #FFF;
    height: 300px;
    border-radius: 10px;
    box-shadow: 0 0 1px rgb(0 0 0 / 13%), 0 1px 3px rgb(0 0 0 / 20%);
    margin: 3px;
}
</style>