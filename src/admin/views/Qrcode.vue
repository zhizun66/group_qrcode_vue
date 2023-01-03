<template>
  <div class="common-main">
    <div class="common-header">
      <div class="common-filter">
        <el-input placeholder="企业" clearable v-model="filter.company"></el-input>
        <el-select placeholder="标签" multiple clearable collapse-tags v-model="filter.tags">
          <el-option v-for="tag of tags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
        <elui-china-area-dht placeholder="地区" isall clearable v-model="filter.area"></elui-china-area-dht>
        <!-- <el-input placeholder="备注" clearable v-model="filter.remark"></el-input> -->
        <el-select placeholder="状态" clearable v-model="filter.status">
          <el-option label="解析中" :value="0" />
          <el-option label="已失效" :value="1" />
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
      <el-table :data="tableData" ref="mainTable" @row-dblclick="onTableRowDoubleClick" v-loading="tableLoading"
        row-key="id" height="100%">
        <el-table-column type="expand">
          <template #default="props">
            <div class="entrance">
              <el-table :ref="'entrance_table_' + props.row.id" :show-header="false" :data="props.row.entrance"
                row-key="id" cell-class-name="sub-cell" @selection-change="onEntranceSelectChange($event, props.row)">
                <el-table-column label="群码ID" prop="id"></el-table-column>
                <el-table-column label="头像" prop="avatar" width="70">
                  <template #default="scope">
                    <el-avatar :size="40" shape="square" :src="scope.row.avatar" style="vertical-align:middle;">
                    </el-avatar>
                  </template>
                </el-table-column>
                <el-table-column label="群名称" prop="name" width="270"></el-table-column>
                <el-table-column label="总人数">
                  <template #default="scope">
                    <span style="opacity:0.7;"
                      :style="{color: scope.row.members === null ? 'var(--el-color-danger)'  : 'var(--el-color-success)'}">{{scope.row.members
                      === null ? '成员未知' :scope.row.members+'人'}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="二维码">
                  <template #default>
                    <img src="../../assets/icon-qrcode.svg" class="qr-icon" />
                  </template>
                </el-table-column>
                <el-table-column label="有效期" width="270">
                  <template #default="scope">
                    <span style="opacity:0.7;"
                      :style="{color: scope.row.expire_date === null ? 'var(--el-color-danger)'  : 'var(--el-color-success)'}">{{scope.row.expire_date
                      === null ? '有效期未知' :scope.row.expire_date+'到期'}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="价格">
                  <template #default="scope">{{scope.row.price}} 金币</template>
                </el-table-column>
                <el-table-column label="状态" prop="status">
                  <template #default="scope">
                    <!-- <span style="opacity:0.7;"
                      :style="{ color: scope.row.status === 1 ? 'var(--el-color-success)' : 'var(--el-color-danger)' }">{{
                      scope.row.status
                      === 1 ? '状态已验证' : '状态待验证'
                      }}</span> -->
                    <span
                      :style="{color: ['var(--el-color-warning)', 'var(--el-color-success)', 'var(--el-color-info)'][scope.row.status]}">{{['待验',
                      '正常', '失效'][scope.row.status]}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="拒绝企微" prop="status">
                  <template #default="scope">
                    <span
                      :style="{color: ['var(--el-color-warning)', 'var(--el-color-success)', 'var(--el-color-info)'][scope.row.joinable]}">{{['待验',
                      '正常', '拒绝'][scope.row.joinable]}}</span>
                    <!-- <span style="opacity:0.7;"
                      :style="{ color: scope.row.joinable === 1 ? 'var(--el-color-success)' : 'var(--el-color-danger)' }">{{
                      scope.row.joinable
                      === 1 ? '企微可进正常' : '企微可进待验证'
                      }}</span> -->
                  </template>
                </el-table-column>

                <el-table-column label="操作" align="right" min-width="200px">
                  <template #default="scope">
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="序号" prop="id" width="100" align="center" />
        <el-table-column label="首传用户" prop="username" width="150" />
        <el-table-column label="企业" prop="company" />
        <el-table-column label="地区" prop="area" width="250" align="center" :formatter="areaFormatter" />
        <!-- <el-table-column label="备注" prop="remark" :formatter="cellFormatter" /> -->
        <el-table-column label="标签" class-name="tags" width="250">
          <template #default="scope">
            <el-tag v-for="tag of scope.row.tags" :key="tag" v-if="scope.row.tags.length > 0">{{tag}}</el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <div class="status"
              :class="{'status-scaning': scope.row.status === 0, 'status-waiting': scope.row.status === 1}">
              {{statusText(scope.row.status)}}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态信息" prop="err_msg" />
        <el-table-column label="加群限制" align="center">
          <template #default="scope">{{['未验证', '无限制', '企微不可进'][scope.row.sub_status]}}</template>
        </el-table-column>
        <el-table-column label="活码" align="center">
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
        </el-table-column>
        <el-table-column label="群码数" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="onEntranceNumClick(scope.row)">{{scope.row.entrance.length}}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="200px">
          <template #default="scope">
            <el-button :icon="Edit" @click="onItemEditClick(scope.row)">编辑</el-button>
            <el-button :icon="Delete" type="danger" plain @click="onItemDeleteClick(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="common-pagination">
      <el-pagination background layout="total,prev,pager,next" :default-page-size="pagination.pageSize"
        v-model:current-page="pagination.page" :total="pagination.total" />
    </div>
  </div>

  <!-- 修改活码对话框 -->
  <el-dialog v-model="showEditDlg" title="编辑活码" width="350px">
    <el-form>
      <el-form-item label="企业">
        <el-input v-model="editForm.company" clearable />
      </el-form-item>
      <el-form-item label="地区">
        <elui-china-area-dht placeholder="选择地区" isall clearable style="width:100%" v-model="editForm.area" />
      </el-form-item>
      <el-form-item label="标签">
        <el-select placeholder="选择标签" multiple clearable style="width:100%" v-model="editForm.tags">
          <el-option v-for="tag of tags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="限制">
        <el-select placeholder="选择进群限制" style="width:100%" v-model="editForm.sub_status">
          <el-option label="未验证" :value="0" />
          <el-option label="无限制" :value="1" />
          <el-option label="企微不可进" :value="2" />
        </el-select>
      </el-form-item>
    </el-form>
    <div style="text-align:center;">
      <el-button type="primary" @click="onEditSubmitClick">保存</el-button>
    </div>
  </el-dialog>

</template>

<script setup>
  import { Search, Delete, Edit, Refresh } from '@element-plus/icons-vue'
  import { ElMessageBox, ElMessage } from 'element-plus';
  import { EluiChinaAreaDht } from 'elui-china-area-dht'
  import { reactive, ref, getCurrentInstance, onMounted, computed, watch } from 'vue'
  import VueQr from 'vue-qr/src/packages/vue-qr.vue'
  // import { ElMessageBox, ElNotification } from 'element-plus'

  const vm = getCurrentInstance()
  const axios = vm.proxy.axios

  const filter = reactive({
    company: '',
    tags: [],
    area: [],
    remark: '',
    status: null
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

  // 双击行展开
  const mainTable = ref()
  const onTableRowDoubleClick = (row, _column, _event) => {
    mainTable.value.toggleRowExpansion(row)
  }

  // 点击群入口数量展开
  const onEntranceNumClick = (row) => {
    mainTable.value.toggleRowExpansion(row)
  }

  // 列表
  const tableData = ref([])
  const statusText = computed(() => (status) => {
    return ['解析中', '已失效'][status]
  })

  // 加载数据
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const loadData = () => {
    tableLoading.value = true
    axios.post('admin/qrcode/index', filter, {
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
    axios.get('admin/base/tags').then(({ data }) => {
      tags.value = data
    })

    loadData()
  })

  const onEntranceSelectChange = (selection, row) => {
    row.isSelectAllEnabled = selection.length > 0
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
      await ElMessageBox.confirm('确定要删除吗？', '删除', { type: 'warning' })
      await axios.post('admin/qrcode/del', { qid: row.id })
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
    area: [],
    tags: [],
    sub_status: 0
  })
  function onItemEditClick (row) {
    showEditDlg.value = true

    editForm.id = row.id
    editForm.company = row.company
    editForm.area = row.area
    editForm.tags = row.tags.map((item) => {
      return tags.value.find((value) => {
        return value.name === item
      }).id
    })
    editForm.sub_status = row.sub_status

  }
  function onEditSubmitClick () {
    axios.post('admin/qrcode/edit', editForm).then(() => {
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

  .status-waiting {
    color: var(--el-color-warning);
  }

  .status-waiting::before {
    background-color: var(--el-color-warning);
  }

  .status-scaning {
    color: var(--el-color-success);
  }

  .status-scaning::before {
    background-color: var(--el-color-success);
  }

  :deep(.sub-cell) {
    color: #999;
  }

  :deep(.sub-cell .qr-icon) {
    opacity: .6;
  }
</style>