<template>
  <div class="common-main">
    <div class="common-header">
      <div class="common-filter">
        <el-input placeholder="账号" clearable v-model="filter.username"></el-input>
        <el-input placeholder="企业" clearable v-model="filter.company"></el-input>
        <div class="common-filter-buttons">
          <el-button :icon="Search" @click="onFilterClick">查询</el-button>
          <el-button :icon="Refresh" @click="onRefreshClick">刷新</el-button>
        </div>
      </div>
      <div class="common-action">
        <el-button type="primary" :icon="MoreFilled" @click="showExchageDlg = true">转赠</el-button>
      </div>
    </div>
    <div class="common-content">
      <el-table :data="tableData" v-loading="tableLoading" height="100%">
        <el-table-column label="序号" prop="id" align="center" width="80px" />
        <el-table-column label="来源" prop="from_username" align="center" />
        <el-table-column label="群码" align="center" width="80px">
          <template #default="scope">
            <el-image class="qr" :src="scope.row.im" :preview-src-list="previewSrcList" preview-teleported
              hide-on-click-modal :initial-index="tableData.indexOf(scope.row)" v-if="scope.row.im" />
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="群名称" prop="name" :formatter="cellFormatter" />
        <!-- <el-table-column label="标签" :formatter="cellFormatter" min-width="160px">
          <template #default="scope">
            <el-tag style="margin:2px;" v-for="tag of scope.row.tags" :key="tag" v-if="scope.row.tags.length > 0">
              {{tag}}</el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column> -->
        <el-table-column label="成员数量" align="center">
          <template #default="scope">{{scope.row.members === null ? '--' : scope.row.members}}</template>
        </el-table-column>
        <el-table-column label="企业" prop="company" :formatter="cellFormatter" />
        <!-- <el-table-column label="地区" prop="area" :formatter="areaFormatter" />
        <el-table-column label="备注" prop="remark" :formatter="cellFormatter" /> -->

        <el-table-column label="类型" width="80px">
          <template #default="scope">{{scope.row.type === 1 ? '企微' : '个微'}}</template>
        </el-table-column>
        <el-table-column label="状态" width="80px" align="center">
          <template #default="scope">
            <span
              :style="{color: ['var(--el-color-warning)', 'var(--el-color-success)', 'var(--el-color-success)', 'var(--el-color-info)'][scope.row.status]}">{{['等待审核',
              '正常', '正常', '不可进群'][scope.row.status]}}</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="价格" align="center">
          <template #default="scope">{{scope.row.price}} 金币</template>
        </el-table-column> -->
        <!-- <el-table-column label="下载次数" align="center">
          <template #default="scope">{{scope.row.buy_cnt}}/{{scope.row.limit}}</template>
        </el-table-column> -->
        <el-table-column label="到期时间" prop="expire_date" align="center" width="160px" :formatter="cellFormatter" />
        <!-- <el-table-column label="添加时间" prop="add_time" align="center" width="160px" /> -->
        <!-- <el-table-column label="操作" align="right" width="300px">
          <template #default="scope">
            <el-button type="primary" plain :icon="Edit" @click="onItemEditClick(scope.row)">编辑</el-button>
            <el-button :disabled="scope.row.status !== 1" :type="scope.row.hide === 0 ? 'warning' : 'info'" plain
              :icon="scope.row.hide === 0 ? Hide : View" @click="onItemHideClick(scope.row)">{{scope.row.hide === 0 ?
              '下架' : '上架'}}</el-button>
            <el-button type="danger" plain :icon="Delete" @click="onItemDeleteClick(scope.row)">删除</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <div class="common-pagination">
      <el-pagination background layout="total,prev,pager,next" :default-page-size="pagination.pageSize"
        v-model:current-page="pagination.page" :total="pagination.total" />
    </div>
  </div>





  <!-- 交换对话框 -->
  <el-dialog v-model="showExchageDlg" title="转赠群码" width="350px">
    <el-row :gutter="15">
      <el-col :span="12">
        <el-input placeholder="对方账号" v-model="exchange.username" />
      </el-col>
      <el-col :span="12">
        <el-input-number placeholder="转赠数量" :min="1" v-model="exchange.quantity" />
      </el-col>
    </el-row>
    <div style="text-align:center;margin-top:20px;">
      <el-button type="primary" @click="onExchangeClick">确定</el-button>
    </div>
  </el-dialog>

</template>

<script setup>
  import { ref, reactive, getCurrentInstance, onMounted, computed, watch, inject } from 'vue'
  import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
  import { Search, Refresh, ArrowDown, Plus, DeleteFilled, Delete, Edit, Hide, View, MoreFilled } from '@element-plus/icons-vue'
  import { EluiChinaAreaDht } from 'elui-china-area-dht'
  import QrCode from 'qrcode-decoder'

  const vm = getCurrentInstance()
  const axios = vm.proxy.axios

  const entrancePrice = inject('entrancePrice')
  const maxBuyTimes = inject('maxBuyTimes')

  const addForm = ref()

  onMounted(() => {
    axios.get('provider/base/tags').then(({ data }) => {
      tags.value = data
    })

    loadData()
  })

  const tags = ref([])

  const filter = reactive({
    username: '',
    company: '',
  })

  const chinaData = new EluiChinaAreaDht.ChinaArea().chinaAreaflat
  const showAddDlg = ref(false)
  const showExchageDlg = ref(false)
  const formData = reactive({
    qrcode: [],
    company: '',
    name: '',
    members: 0,
    expire: '',
    price: 0,
    type: 1,
    limit: 0
  })
  const formRule = reactive({
    qrcode: {
      trigger: 'submit',
      required: true,
      message: '群码必选'
    },
    type: {
      trigger: 'submit',
      required: true,
      message: '类型必选'
    },
    tags: {
      trigger: 'submit',
      required: true,
      message: '标签必选'
    }
  })

  const showMoreForm = ref(false)
  const submitLoading = ref(false)

  const tableData = ref([])
  const tableLoading = ref(false)
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const showEditDlg = ref(false)


  const previewSrcList = ref([])

  const file2ImageBlobUrl = computed(() => (file) => {
    return URL.createObjectURL(file)
  })

  watch(() => pagination.page, () => {
    loadData()
  })

  function loadData () {
    tableLoading.value = true
    axios.post('manager/exchange/index', filter, {
      page: pagination.page
    }).then(({ data }) => {
      tableData.value = data.data
      previewSrcList.value = data.data.map((item) => {
        return item.im
      })
      pagination.pageSize = data.page_size
      pagination.total = data.total
    }).catch(() => {

    }).finally(() => {
      tableLoading.value = false
    })
  }

  function onFilterClick () {
    pagination.page = 1
    loadData()
  }

  function onRefreshClick () {
    loadData()
  }



  function onAddDlgOpen () {
    formData.price = entrancePrice.value
    formData.limit = maxBuyTimes.value
  }



  function cellFormatter (_row, _column, cellValue, _index) {
    return cellValue?.length ? cellValue : '--'
  }

  function areaFormatter (_row, _column, cellValue, _index) {
    if (!cellValue) {
      return '--'
    }
    let [a, b, c] = cellValue
    const d = [chinaData[a]?.label, chinaData[b]?.label, chinaData[c]?.label].filter(item => item)
    return d.length === 0 ? '--' : d.join('/')
  }





  const exchange = reactive({
    username: '',
    quantity: 1
  })
  function onExchangeClick () {
    axios.post('manager/exchange/exchange', exchange).then(() => {
      ElMessage.success('交换成功')
      showExchageDlg.value = false
      pagination.page = 1
      loadData()
    }).catch(() => { })
  }

</script>

<style scoped>
  .qrcode-select {
    border: 1px dashed var(--el-border-color);
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: border-color .2s;
    cursor: pointer;
    overflow: hidden;
  }

  .qrcode-select:hover {
    border-color: var(--el-color-primary);
  }

  .qrcode-wrapper {
    overflow-x: auto;
    white-space: nowrap;
    border: 1px solid var(--el-border-color);
    padding: 5px;
    border-radius: 4px;
    line-height: 1px;
    width: 100%;
    box-sizing: border-box;
    margin-top: 8px;
  }

  .qrcode-img {
    display: inline-block;
    width: 50px;
    height: 50px;
    border: 1px dashed var(--el-border-color);
    padding: 1px;
    border-radius: 4px;
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
  }

  .qrcode-img:not(:last-child) {
    margin-right: 5px;
  }

  .qrcode-img img {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: block;
    cursor: pointer;
  }

  .qrcode-remove {
    position: absolute;
    top: -50px;
    bottom: 50px;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-color-danger);
    opacity: .8;
    cursor: pointer;
    transition: all .15s ease-out;
  }

  .qrcode-img:hover .qrcode-remove {
    top: 0px;
    bottom: 0px;
  }

  .qr {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid #f2f2f2;
    padding: 1px;
    display: block;
    margin: 0 auto;
  }

  :deep(.el-radio) {
    margin-right: 10px;
  }
</style>