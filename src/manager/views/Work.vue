<template>
  <div class="common-main">
    <div class="common-header">
      <div class="common-filter">
        <el-input placeholder="账号" clearable v-model="filter.username"></el-input>
        <!-- <el-input placeholder="群名" clearable v-model="filter.groupname"></el-input> -->
        <el-input placeholder="企业" clearable v-model="filter.company"></el-input>
        <div class="common-filter-buttons">
          <el-button :icon="Search" @click="onFilterClick">查询</el-button>
          <el-button :icon="Refresh" @click="onRefreshClick">刷新</el-button>
        </div>
      </div>
      <div class="common-action">
        <!-- <el-button type="primary" :icon="Plus" @click="onAddClick">提交活码</el-button> -->
      </div>
    </div>
    <div class="common-content">
      <el-table :data="tableData" ref="mainTableRef" @row-dblclick="onTableRowDoubleClick" v-loading="tableLoading"
        row-key="id" height="100%">
        <el-table-column type="expand">
          <template #default="props">
            <div class="entrance">
              <el-table :ref="'entrance_table_' + props.row.id" :show-header="false" :data="props.row.entrance"
                row-key="id" cell-class-name="sub-cell" @selection-change="onEntranceSelectChange($event, props.row)">
                <el-table-column type="selection" width="30" :selectable="selectable" />
                <el-table-column label="头像" prop="avatar" width="70">
                  <template #default="scope">
                    <el-avatar :size="40" shape="square" :src="scope.row.avatar" style="vertical-align:middle;">
                    </el-avatar>
                  </template>
                </el-table-column>
                <el-table-column label="任务链接">
                  <template #default="scope">
                    <p>{{scope.row.name }}</p>
                    <p>{{scope.row.name }}</p>
                  </template>

                </el-table-column>
                <el-table-column label="任务链接">
                  <template #default="scope">{{scope.row.name }}</template>
                </el-table-column>
                <el-table-column label="UV">
                  <template #default="scope">UV:{{scope.row.members }}</template>
                </el-table-column>
                <el-table-column label="提交时间">
                  <template #default="scope">提交时间:{{scope.row.expire_date}}</template>
                </el-table-column>

                <!-- <el-table-column label="企微拒绝" prop="status">
                  <template #default="scope">
                    <span
                      :style="{color: ['var(--el-color-warning)', 'var(--el-color-success)', 'var(--el-color-info)'][scope.row.joinable_wc]}">{{['待验',
                      '正常', '拒绝'][scope.row.joinable_wc]}}</span>
                  </template>
                </el-table-column> -->
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="序号" prop="id" width="100" align="center" />
        <!-- <el-table-column label="上传者" prop="username" align="center" />
        <el-table-column label="企业" prop="company" /> -->
        <!-- <el-table-column label="状态" align="center">
          <template #default="scope">
            <div class="status"
              :class="{'status-scaning': scope.row.status === 0, 'status-invalid': scope.row.status === 1, 'status-pause': scope.row.status === 2}">
              {{statusText(scope.row.status)}}</div>
          </template>
        </el-table-column> -->

        <!-- <el-table-column label="活码" align="center">
          <template #default="scope">
            <el-popover placement="top" trigger="click" :width="220" :hide-after="0">
              <template #reference>
                <img src="../../assets/icon-qrcode.svg" class="qr-icon" style="margin:0 auto;cursor:pointer;" />
              </template>
              <template #default>
                <vue-qr :text="scope.row.code" :width="200" />
              </template>
            </el-popover>
          </template>
        </el-table-column> -->
        <!-- <el-table-column label="审核状态" align="center">
          <template #default="scope">
            <span style="margin-right:3px;"
              :style="{color: ['var(--el-color-warning)', 'var(--el-color-success)',  'var(--el-color-info)'][scope.row.valid]}">{{['等待审核',
              '审核通过', '审核失败'][scope.row.valid]}}</span>
          </template>
        </el-table-column> -->
        <!-- <template #default="scope">{{['等待审核', '审核通过', '审核失败'][scope.row.sub_status]}}</template> -->
        <!-- <el-table-column label="审核时间" prop="valid_time" />
        <el-table-column label="状态信息" prop="err_msg" /> -->
        <el-table-column label="日期" prop="add_time" />
        <el-table-column label="总UV" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="onEntranceNumClick(scope.row)">{{scope.row.entrance.length}}
            </el-button>
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作" align="right" width="200px">
          <template #default="scope">
            <el-button :icon="Edit" @click="onItemEditClick(scope.row)">编辑</el-button>
            <el-button :icon="Delete" type="danger" plain @click="onItemDeleteClick(scope.row)">删除</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </div>
    <div class="common-pagination">
      <el-pagination background layout="total,prev,pager,next,jumper" :default-page-size="pagination.pageSize"
        v-model:current-page="pagination.page" :total="pagination.total" />
    </div>
  </div>

</template>

<script setup>
  import { Plus, Search, Delete, Edit, Refresh, DeleteFilled } from '@element-plus/icons-vue'
  import { EluiChinaAreaDht } from 'elui-china-area-dht'
  import { reactive, ref, getCurrentInstance, onMounted, computed, watch, inject } from 'vue'
  import QrCode from 'qrcode-decoder'
  import VueQr from 'vue-qr/src/packages/vue-qr.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'

  const vm = getCurrentInstance()
  const axios = vm.proxy.axios

  const filter = reactive({
    company: '',
    username: ''
  })

  // 区域
  const chinaData = new EluiChinaAreaDht.ChinaArea().chinaAreaflat

  // 点击查询
  const onFilterClick = () => {
    pagination.page = 1
    loadData()
  }

  // 刷新
  const onRefreshClick = () => {
    loadData()
  }

  // 添加活码
  // const showAddDlg = ref(false)
  // const onAddClick = () => {
  //   showAddDlg.value = true
  // }
  // const entrancePrice = inject('entrancePrice')
  // const maxBuyTimes = inject('maxBuyTimes')
  const formData = reactive({
    qrcode: [],
    company: '',
  })
  const onAddDlgClosed = () => {
    formData.qrcode = []
    formData.company = ''
    addFormRef.value.resetFields()
    qrcodeUrlArr.value = []
  }

  // 表单验证
  // const formRules = reactive({
  //   qrcode: {
  //     required: true, trigger: 'submit', validator: (rule, value, callback) => {
  //       formData.qrcode.length > 0 ? callback() : callback(new Error('活码必选'))
  //     }
  //   },
  //   company: { required: true, trigger: 'blur', message: '企业名称必填' },
  //   // tags: { required: true, trigger: 'blur', message: '标签必选' },
  // })

  // 识别二维码
  // const qrcodeUrlArr = ref([])
  // const onFileChange = (e) => {
  //   if (e.target.files.length === 0) {
  //     return
  //   }
  //   let n = 0
  //   let f = 0
  //   let a = 0
  //   let s = 0
  //   let count = e.target.files.length
  //   for (let file of e.target.files) {

  //     const url = window.webkitURL.createObjectURL(file) || window.URL.createObjectURL(file)
  //     const qr = new QrCode()
  //     qr.decodeFromImage(url).then((res) => {
  //       ++n
  //       if (!res.data.includes('work.weixin.qq.com/gm')) {
  //         ++a
  //         // ElMessage.error(`该二维码不是企微活码：第 ${n} 个`)
  //         // return
  //       } else if (!res) {
  //         ++f
  //         // ElMessage.error(`解析二维码失败：第 ${n} 个`)
  //         // return
  //       } else if (formData.qrcode.includes(res.data)) {
  //         ++f
  //         // ElMessage.error(`二维码已存在：第 ${n} 个`)

  //         // return
  //       } else {
  //         ++s
  //         qrcodeUrlArr.value.push(url)
  //         formData.qrcode.push(res.data)
  //       }
  //       if (n === count) {
  //         ElMessage.success(`一共处理 ${n} 个成功 ${s} 个,非企微活码${a} 个,失败${f} 个`)
  //       }
  //     }).catch(() => {
  //       ++f
  //       ElMessage.error('解析二维码错误')
  //     })

  //   }

  //   e.target.value = ''
  // }

  // // 移除单个二维码
  // const onRemoveQrcodeClick = (index) => {
  //   formData.qrcode.splice(index, 1)
  //   qrcodeUrlArr.value.splice(index, 1)
  // }

  // // 提交表单
  // const addFormRef = ref()
  // const onAddFormSubmit = () => {
  //   addFormRef.value.validate((valid) => {
  //     if (valid) {
  //       axios.post('provider/qrcode/add', formData).then(({ message }) => {
  //         showAddDlg.value = false
  //         ElMessageBox.alert(message, '提示', {
  //           type: 'success',
  //           callback: () => {
  //             location.reload()
  //           }
  //         })
  //       }).catch(() => { })
  //     }
  //   })
  // }

  const mainTableRef = ref()

  // 双击行展开
  const onTableRowDoubleClick = (row, _column, _event) => {
    mainTableRef.value.toggleRowExpansion(row)
  }

  // 点击群入口数量展开
  const onEntranceNumClick = (row) => {
    mainTableRef.value.toggleRowExpansion(row)
  }

  // 列表
  const tableData = ref([])
  // const statusText = computed(() => (status) => {
  //   return ['正在扫描', '无效', '暂时失效'][status]
  // })

  // 加载数据
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const loadData = () => {
    tableLoading.value = true
    axios.post('manager/qrcode/index', filter, {
      params: {
        page: pagination.page
      }
    }).then(({ data }) => {
      tableData.value = data.data
      pagination.pageSize = data.page_size
      pagination.total = data.total
    }).catch(() => {
    })
      .finally(() => {
        tableLoading.value = false
      })
  }

  // 翻页
  watch(() => pagination.page, () => {
    loadData()
  })

  // 页面挂载
  const tags = ref([])
  const tableLoading = ref(false)
  onMounted(() => {
    axios.get('provider/base/tags').then(({ data }) => {
      tags.value = data
    })

    loadData()
  })

  const selectable = (row, index) => {
    return !row.bought && !row.isInCart
  }

  const onEntranceSelectChange = (selection, row) => {
    row.isSelectAllEnabled = selection.length > 0
  }

  function cellFormatter (row, column, cellValue, index) {
    return cellValue?.length ? cellValue : '--'
  }

  function areaFormatter (row, column, cellValue, index) {
    if (!cellValue) {
      return '--'
    }
    let [a, b, c] = cellValue
    const d = [chinaData[a]?.label, chinaData[b]?.label, chinaData[c]?.label].filter(item => item)
    return d.length === 0 ? '--' : d.join('/')
  }

  function onAddDlgOpen () {
    // formData.price = entrancePrice.value
    // formData.limit = maxBuyTimes.value
  }

  // 删除
  async function onItemDeleteClick (row) {
    try {
      await ElMessageBox.confirm('确定要删除吗？', '删除', { type: 'warning' })
      await axios.post('provider/qrcode/del', { qid: row.id })
      const index = tableData.value.indexOf(row)
      tableData.value.splice(index, 1)
      ElMessage.success('已删除')
    } catch (_e) {

    }
  }

  // 修改
  const showEditDlg = ref(false)
  const editForm = reactive({
    id: null,
    company: '',
  })
  function onItemEditClick (row) {
    showEditDlg.value = true

    editForm.id = row.id
    editForm.company = row.company

  }
  function onEditSubmitClick () {
    axios.post('provider/qrcode/edit', editForm).then(() => {
      showEditDlg.value = false
      ElMessage.success('编辑成功')
      loadData()
    }).catch(() => { })
  }
</script>

<style scoped>
  .tags .el-tag {
    margin: 2px;
  }

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

  .entrance {
    padding: 20px;
    background-color: var(--el-color-info-light-9);
  }

  .el-table {
    border-radius: 8px;
  }

  :deep(.el-table__expanded-cell) {
    padding: 0 !important;
  }

  .qr-icon {
    display: block;
    width: 20px;
    height: 20px;
  }

  .status::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 4px;
  }

  .status-scaning {
    color: var(--el-color-warning);
  }

  .status-scaning::before {
    background-color: var(--el-color-warning);
  }

  .status-invalid {
    color: var(--el-color-info);
  }

  .status-invalid::before {
    background-color: var(--el-color-info);
  }

  .status-pause {
    color: var(--el-color-error);
  }

  .status-pause::before {
    background-color: var(--el-color-error);
  }

  :deep(.sub-cell) {
    color: #999;
  }

  :deep(.sub-cell .qr-icon) {
    opacity: .6;
  }
</style>