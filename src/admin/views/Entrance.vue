<script setup>
  import { ref, reactive, getCurrentInstance, onMounted, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Search, Refresh, Delete, Edit, Hide, View, ArrowDown } from '@element-plus/icons-vue'
  import { EluiChinaAreaDht } from 'elui-china-area-dht'

  const vm = getCurrentInstance()
  const axios = vm.proxy.axios

  onMounted(() => {
    axios.get('admin/base/tags').then(({ data }) => {
      tags.value = data
    })

    loadData()
  })

  const tags = ref([])

  const filter = reactive({
    company: '',
    area: [],
    tags: [],
    remark: '',
    type: null
  })

  const chinaData = new EluiChinaAreaDht.ChinaArea().chinaAreaflat
  const formData = reactive({
    qrcode: [],
    tags: [],
    company: '',
    area: [],
    remark: '',
    name: '',
    members: 0,
    expire: '',
    price: 1
  })


  const tableData = ref([])
  const tableLoading = ref(false)
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const showEditDlg = ref(false)


  const previewSrcList = ref([])

  // 翻页
  watch(() => pagination.page, () => {
    loadData()
  })

  function loadData () {
    tableLoading.value = true
    axios.post('admin/entrance/index', filter, {
      params: {
        page: pagination.page
      }
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


  const editForm = ref()
  // 修改对话框关闭
  function onEditDlgClosed () {
    editForm.value.resetFields()
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

  // 删除
  async function onItemDeleteClick (row) {
    try {
      await ElMessageBox.confirm('确认要删除吗？', '提醒', { type: 'warning' })
      await axios.post('admin/entrance/itemDel', {
        eid: row.id
      })
      const index = tableData.value.indexOf(row)
      tableData.value.splice(index, 1)
      ElMessage.success('已删除')
    } catch (e) {

    }
  }

  // 下架/上架
  // function onItemHideClick(row) {
  // 	const hide = 1 - row.hide
  // 	axios.post('admin/entrance/itemHide', {
  // 		eid: row.id,
  // 		hide: hide
  // 	}).then(() => {
  // 		row.hide = hide
  // 	}).catch(() => {
  // 	})
  // }

  function onHideChange (value, row) {
    axios.post('admin/entrance/itemHide', {
      eid: row.id,
      hide: value
    }).then(() => {
      ElMessage.success('操作成功')
    }).catch(() => {
      //row.hide = 1 - value
    })
  }

  // 编辑
  let editRow = ref(null)
  function onItemEditClick (row) {
    showEditDlg.value = true
    editRow.value = row

    formData.name = row.name
    formData.members = row.members
    formData.expire = row.expire_date
    formData.company = row.company
    formData.area = row.area
    formData.remark = row.remark
    formData.price = row.price
  }

  // 确定修改
  function onEditConfirmClick () {
    axios.post('admin/entrance/itemEdit', {
      eid: editRow.value.id,
      name: formData.name,
      members: formData.members,
      expire: formData.expire,
      company: formData.company,
      area: formData.area,
      remark: formData.remark,
      price: formData.price,
    }).then(() => {
      showEditDlg.value = false
      ElMessage.success('修改成功')
      loadData()
    }).catch(() => { })
  }

  // 更改状态
  function onStatusCommand (status, row) {
    axios.post('admin/entrance/itemStatus', { eid: row.id, status: status }).then(() => {
      ElMessage.success('操作成功')
      row.status = status
    }).catch(() => { })
  }

</script>

<template>
  <div class="common-main">
    <div class="common-header">
      <div class="common-filter">
        <!-- <el-input placeholder="企业" clearable v-model="filter.company"></el-input> -->
        <el-input placeholder="群名" clearable v-model="filter.group_name"></el-input>
        <el-select placeholder="标签" multiple clearable collapse-tags v-model="filter.tags">
          <el-option v-for="tag of tags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
        <elui-china-area-dht placeholder="地区" isall clearable v-model="filter.area"></elui-china-area-dht>
        <el-input placeholder="备注" clearable v-model="filter.remark"></el-input>
        <el-select placeholder="类型" clearable v-model="filter.type">
          <el-option label="企微" :value="1" />
          <el-option label="个微" :value="2" />
        </el-select>
        <el-select placeholder="企微可进" clearable v-model="filter.joinable" v-if="filter.type !== 2">
          <el-option label="待验" :value="1" />
          <el-option label="正常" :value="2" />
          <el-option label="拒绝" :value="3" />
        </el-select>
        <el-select placeholder="状态" clearable v-model="filter.status" v-if="filter.type !== 2">
          <el-option label="待验" :value="1" />
          <el-option label="正常" :value="2" />
          <el-option label="失效" :value="3" />
        </el-select>
        <div class="common-filter-buttons">
          <el-button :icon="Search" @click="onFilterClick">查询</el-button>
          <el-button :icon="Refresh" @click="onRefreshClick">刷新</el-button>
        </div>
      </div>
      <div class="common-action">
      </div>
    </div>
    <div class="common-content">
      <el-table :data="tableData" v-loading="tableLoading" height="100%">
        <el-table-column label="序号" prop="id" align="center" width="80px" fixed />
        <el-table-column label="群码" align="center" width="80px">
          <template #default="scope">
            <el-image class="qr" :src="scope.row.im" :preview-src-list="previewSrcList" preview-teleported
              hide-on-click-modal :initial-index="tableData.indexOf(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="头像" prop="avatar" width="70">
          <template #default="scope">
            <el-avatar :size="40" shape="square" :src="scope.row.avatar" style="vertical-align:middle;">
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="群名称" prop="name" width="250px" :formatter="cellFormatter" />
        <el-table-column label="成员数量" align="center">
          <template #default="scope">{{scope.row.members === null ? '--' : scope.row.members}}</template>
        </el-table-column>
        <el-table-column label="标签" align="left" min-width="140" :formatter="cellFormatter">
          <template #default="scope">
            <el-tag style="margin:2px;" v-for="tag of scope.row.tags" :key="tag" v-if="scope.row.tags.length > 0">
              {{tag}}</el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>

        <!-- <el-table-column label="企业" prop="company" :formatter="cellFormatter" /> -->
        <!-- <el-table-column label="地区" prop="area" :formatter="areaFormatter" /> -->
        <!-- <el-table-column label="备注" prop="remark" :formatter="cellFormatter" /> -->
        <el-table-column label="类型" width="60px">
          <template #default="scope">{{scope.row.type === 1 ? '企微' : '个微'}}</template>
        </el-table-column>
        <el-table-column label="价格" prop="price" width="80px" align="center" />
        <el-table-column label="购买" prop="buy_cnt" width="80px" align="center">
          <template #default="scope">{{scope.row.buy_cnt}}次</template>
        </el-table-column>
        <el-table-column label="到期时间" prop="expire_date" align="center" :formatter="cellFormatter" />
        <el-table-column label="验证时间" prop="update_time" align="center" />
        <el-table-column label="添加时间" prop="add_time" align="center" />
        <el-table-column label="企微拒绝" width="100px" align="center" class-name="joinable">
          <template #default="scope">
            <!-- <div style="display:flex;align-items:center;justify-content:center;cursor:pointer;"> -->
            <span style="margin-right:3px;"
              :style="{color: ['var(--el-color-warning)', 'var(--el-color-success)',  'var(--el-color-info)'][scope.row.joinable]}">{{['待验',
              '正常', '拒绝'][scope.row.joinable]}}</span>
            <!-- </div> -->
          </template>

        </el-table-column>
        <el-table-column label="状态" width="100px" align="center" class-name="status">
          <template #default="scope">
            <el-dropdown @command="onStatusCommand($event, scope.row)">
              <div style="display:flex;align-items:center;justify-content:center;cursor:pointer;">
                <span style="margin-right:3px;"
                  :style="{color: ['var(--el-color-warning)', 'var(--el-color-success)',  'var(--el-color-info)'][scope.row.status]}">{{['待验',
                  '正常', '失效'][scope.row.status]}}</span>
                <el-icon>
                  <!-- 'var(--el-color-primary)', -->
                  <ArrowDown />
                </el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :command="0" :disabled="scope.row.status === 0">待验</el-dropdown-item>
                  <el-dropdown-item :command="1" :disabled="scope.row.status === 1">正常</el-dropdown-item>
                  <el-dropdown-item :command="2" :disabled="scope.row.status === 2">失效</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <el-table-column label="状态信息" prop="error_msg"></el-table-column>
        <el-table-column label="上架" width="100px" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.hide" :active-value="0" :inactive-value="1"
              @change="onHideChange($event, scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="200px" fixed="right">
          <template #default="scope">
            <el-button type="primary" plain :icon="Edit" @click="onItemEditClick(scope.row)">编辑</el-button>
            <el-button type="danger" plain :icon="Delete" @click="onItemDeleteClick(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="common-pagination">
      <el-pagination background layout="total,prev,pager,next" :default-page-size="pagination.pageSize"
        v-model:current-page="pagination.page" :total="pagination.total" />
    </div>
  </div>

  <!-- 修改对话框 -->
  <el-dialog v-model="showEditDlg" title="修改群码" width="350px" :close-on-click-modal="false" @click="onEditDlgClosed">
    <el-form label-width="55px" :model="formData" ref="editForm">
      <template v-if="!editRow.qrcode_id">
        <el-form-item label="群名称">
          <el-input v-model="formData.name" clearable />
        </el-form-item>
        <el-form-item label="成员数">
          <el-input-number :min="0" v-model="formData.members" style="width:100%;" clearable />
        </el-form-item>
        <el-form-item label="有效期">
          <el-date-picker type="datetime" v-model="formData.expire" style="width:100%;" clearable />
        </el-form-item>
        <el-form-item label="企业名">
          <el-input v-model="formData.company" clearable />
        </el-form-item>
        <el-form-item label="地&emsp;区">
          <elui-china-area-dht placeholder="请选择" isall clearable v-model="formData.area" style="width:100%;">
          </elui-china-area-dht>
        </el-form-item>
        <el-form-item label="备&emsp;注">
          <el-input v-model="formData.remark" clearable />
        </el-form-item>
      </template>
      <el-form-item label="价&emsp;格">
        <el-input v-model="formData.price" clearable />
      </el-form-item>
    </el-form>
    <div style="text-align:center;">
      <el-button type="primary" @click="onEditConfirmClick">确认修改</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
  .main {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 60px);
    box-sizing: border-box;
  }

  .content {
    flex: 1;
    overflow: hidden;
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

  .qr {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid #f2f2f2;
    padding: 1px;
    display: block;
    margin: 0 auto;
  }

  :deep(.status .cell) {
    line-height: normal;
  }
</style>