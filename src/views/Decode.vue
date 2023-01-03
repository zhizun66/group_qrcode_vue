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
        <el-button type="primary" :icon="ShoppingCart" v-if="entranceCart.length > 0" @click="onBatchBuyClick">
          购买群码（{{ entranceCart.length }}）</el-button>
        <el-button type="primary" :icon="Plus" @click="onAddClick">提交活码</el-button>
      </div>
    </div>
    <div class="common-content">
      <el-table :data="tableData" ref="mainTableRef" @row-dblclick="onTableRowDoubleClick" v-loading="tableLoading"
        row-key="id" height="100%">
        <el-table-column type="expand">
          <template #default="props">
            <div class="entrance">
              <el-table :ref="(el) => {setRef(el, props.row.id)}" :show-header="false" :data="props.row.entrance"
                row-key="id" cell-class-name="sub-cell" @selection-change="onEntranceSelectChange($event, props.row)">
                <el-table-column type="selection" width="30" :selectable="selectable" />
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
                <!-- <el-table-column label="二维码">
                  <template #default>
                    <img src="../assets/icon-qrcode.svg" class="qr-icon" />
                  </template>
                </el-table-column> -->
                <el-table-column label="有效期" width="270">
                  <template #default="scope">
                    <span style="opacity:0.7;"
                      :style="{color: scope.row.expire_date === null ? 'var(--el-color-danger)'  : 'var(--el-color-success)'}">{{scope.row.expire_date
                      === null ? '有效期未知' :scope.row.expire_date+'到期'}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="价格">
                  <template #default="scope">售价:{{ scope.row.price }} 金币</template>
                </el-table-column>
                <el-table-column label="状态" prop="status">
                  <template #default="scope">
                    <span style="opacity:0.7;"
                      :style="{ color: scope.row.status === 1 ? 'var(--el-color-success)' : 'var(--el-color-danger)' }">{{
                      scope.row.status
                      === 1 ? '状态已验证' : '状态待验证'
                      }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="拒绝企微" prop="status">
                  <template #default="scope">
                    <span style="opacity:0.7;"
                      :style="{ color: scope.row.joinable === 1 ? 'var(--el-color-success)' : 'var(--el-color-danger)' }">{{
                      scope.row.joinable
                      === 1 ? '企微可进正常' : '企微可进待验证'
                      }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="right" min-width="200px">
                  <template #default="scope">
                    <el-button :type="scope.row.isInCart ? 'success' : 'primary'" plain :icon="ShoppingCart"
                      @click="onAddCart(scope.row)" :disabled="scope.row.bought === 1">{{ buyText(scope.row) }}
                    </el-button>
                    <!-- <el-button :icon="Opportunity" :disabled="scope.row.reported === 1"
                      @click="onReportClick(scope.row)">报告不可加群</el-button> -->
                  </template>
                </el-table-column>
              </el-table>
              <div style="margin-top:8px;">
                <el-button @click="onSelectAllClick(props.row.id)">全选/取消</el-button>
                <el-button type="primary" plain @click="onBatchCartClick(props.row.id)"
                  :disabled="!props.row.isSelectAllEnabled">批量加入购物车</el-button>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="序号" prop="id" width="100" align="center" />
        <el-table-column label="企业" prop="company" />
        <el-table-column label="地区" prop="area" :formatter="areaFormatter" />
        <!-- <el-table-column label="备注" prop="remark" :formatter="cellFormatter" /> -->
        <el-table-column label="标签" class-name="tags">
          <template #default="scope">
            <el-tag v-for="tag of scope.row.tags" :key="tag" v-if="scope.row.tags.length > 0">{{ tag }}
            </el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="scope">
            <div class="status"
              :class="{ 'status-scaning': scope.row.status === 0, 'status-waiting': scope.row.status === 1 }">
              {{ statusText(scope.row.status) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态信息" prop="err_msg" />
        <el-table-column label="加群限制" align="center">
          <template #default="scope">{{ ['未验证', '无限制', '企微不可进'][scope.row.sub_status] }}</template>
        </el-table-column>
        <el-table-column label="活码" align="center">
          <template #default="scope">
            <el-popover placement="top" trigger="click" :width="220" :hide-after="0">
              <template #reference>
                <img src="../assets/icon-qrcode.svg" class="qr-icon" style="margin:0 auto;cursor:pointer;" />
              </template>
              <template #default>
                <vue-qr :text="scope.row.code" :width="200" />
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="群码数" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="onEntranceNumClick(scope.row)">
              {{ scope.row.entrance.length }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="上传时间" prop="add_time" />
        <el-table-column label="操作" align="right" width="200px">
          <template #default="scope">
            <el-button :icon="Edit" @click="onItemEditClick(scope.row)">编辑</el-button>
            <el-button :icon="Delete" type="danger" plain @click="onItemDeleteClick(scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="common-pagination">
      <el-pagination background layout="total,prev,pager,next" :default-page-size="pagination.pageSize"
        v-model:current-page="pagination.page" :total="pagination.total" />
    </div>
  </div>


  <!-- 添加活码对话框 -->
  <el-dialog v-model="showAddDlg" title="提交活码" :width="350" @closed="onAddDlgClosed" :close-on-click-modal="false">
    <el-form label-width="50px" :model="formData" :rules="formRules" ref="addFormRef">
      <el-form-item label="活码" prop="qrcode">
        <div style="width:100%;">
          <div style="display:flex;">
            <label class="qrcode-select">
              <el-icon :size="15" color="#CCC">
                <Plus />
              </el-icon>
              <input type="file" accept="image/*" multiple style="display:none;" @change="onFileChange" />
            </label>
            <p style="margin-left:10px;font-size:12px;color:var(--el-color-primary);" v-if="formData.qrcode.length > 0">
              已选 {{ formData.qrcode.length }} 个</p>
          </div>
          <div class="qrcode-wrapper" v-if="formData.qrcode.length > 0">
            <div class="qrcode-img" v-for="(url, index) in qrcodeUrlArr" :key="url">
              <img :src="url" />
              <div class="qrcode-remove" @click="onRemoveQrcodeClick(index)">
                <el-icon color="#FFF" :size="20">
                  <DeleteFilled />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="企业" prop="company">
        <el-input v-model="formData.company" />
      </el-form-item>
      <el-form-item label="标签" prop="tags">
        <el-select placeholder="选择标签" multiple clearable style="width:100%" v-model="formData.tags">
          <el-option v-for="tag of tags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="限制" prop="sub_status">
        <el-select placeholder="选择进群限制" style="width:100%" v-model="formData.sub_status">
          <el-option label="未验证" :value="0" />
          <el-option label="无限制" :value="1" />
          <el-option label="企微不可进" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="地区" prop="area">
        <elui-china-area-dht placeholder="选择地区" isall clearable style="width:100%" v-model="formData.area">
        </elui-china-area-dht>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" />
      </el-form-item>
      <div style="text-align:center;">
        <el-button type="primary" @click="onAddFormSubmit">提交</el-button>
      </div>
    </el-form>
  </el-dialog>

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
  import { Plus, Search, Delete, Edit, ShoppingCart, Refresh, DeleteFilled } from '@element-plus/icons-vue'
  import { EluiChinaAreaDht } from 'elui-china-area-dht'
  import { reactive, ref, getCurrentInstance, onMounted, computed, watch } from 'vue'
  import QrCode from 'qrcode-decoder'
  import VueQr from 'vue-qr/src/packages/vue-qr.vue'
  import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

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

  // 添加活码
  const showAddDlg = ref(false)
  const onAddClick = () => {
    showAddDlg.value = true
  }
  const formData = reactive({
    qrcode: [],
    company: '',
    area: [],
    tags: [],
    remark: '',
    sub_status: 0
  })
  const onAddDlgClosed = () => {
    formData.qrcode = []
    formData.company = ''
    formData.area = []
    formData.tags = []
    formData.remark = ''
    formData.sub_status = 0
    addFormRef.value.resetFields()
    qrcodeUrlArr.value = []
  }

  // 表单验证
  const formRules = reactive({
    qrcode: {
      required: true, trigger: 'submit', validator: (rule, value, callback) => {
        formData.qrcode.length > 0 ? callback() : callback(new Error('活码必选'))
      }
    },
    company: { required: true, trigger: 'blur', message: '企业名称必填' },
    tags: { required: true, trigger: 'blur', message: '标签必选' },
  })

  // 识别二维码
  const qrcodeUrlArr = ref([])
  const onFileChange = (e) => {
    if (e.target.files.length === 0) {
      return
    }
    let n = 0
    for (let file of e.target.files) {
      ++n
      const url = window.webkitURL.createObjectURL(file) || window.URL.createObjectURL(file)
      const qr = new QrCode()
      qr.decodeFromImage(url).then((res) => {
        if (!res.data.includes('work.weixin.qq.com/gm')) {
          ElMessage.error(`该二维码不是企微活码：第 ${n} 个`)
          return
        }
        if (!res) {
          ElMessage.error(`解析二维码失败：第 ${n} 个`)
          return
        }
        if (formData.qrcode.includes(res.data)) {
          ElMessage.error(`二维码已存在：第 ${n} 个`)
          return
        }
        qrcodeUrlArr.value.push(url)
        formData.qrcode.push(res.data)
      }).catch(() => {
        ElMessage.error('解析二维码错误')
      })
    }
    e.target.value = ''
  }

  // 移除单个二维码
  const onRemoveQrcodeClick = (index) => {
    formData.qrcode.splice(index, 1)
    qrcodeUrlArr.value.splice(index, 1)
  }

  // 提交表单
  const addFormRef = ref()
  const onAddFormSubmit = () => {
    addFormRef.value.validate((valid) => {
      if (valid) {
        axios.post('index/qrcode/add', formData).then(() => {
          showAddDlg.value = false
          ElMessageBox.alert('提交成功', '提示', {
            type: 'success',
            callback: () => {
              location.reload()
            }
          })
        }).catch(() => { })
      }
    })
  }

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
  const statusText = computed(() => (status) => {
    return status === 0 ? '解析中' : '已失效'
  })

  // 报告不可加入
  const onReportClick = (entrance) => {
    axios.post('index/qrcode/report', { id: entrance.id }).then(() => {
      entrance.reported = 1;
      ElMessage.success('已上报')
    }).catch(() => { })
  }

  // 加载数据
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const loadData = () => {
    tableLoading.value = true
    axios.post('index/qrcode/index', filter, {
      params: {
        page: pagination.page
      }
    }).then(({ data }) => {
      tableData.value = data.data.map((item) => {
        // 标记已加购
        for (let subItem of item.entrance) {
          for (let cart of entranceCart.value) {
            if (cart.id === subItem.id) {
              subItem.isInCart = true
              return item
            }
          }
        }
        return item
      })
      pagination.pageSize = data.page_size
      pagination.total = data.total
    }).catch(() => {
    })
      .finally(() => {
        tableLoading.value = false
      })
  }

  // 翻页
  watch(() => pagination.page, (newValue, oldValue) => {
    loadData()
  })

  // 页面挂载
  const tags = ref([])
  const tableLoading = ref(false)
  onMounted(() => {
    axios.get('index/common/tags').then(({ data }) => {
      tags.value = data
    })

    loadData()
  })

  /* computed */
  const buyText = computed(() => (row) => {
    if (row.bought === 1) {
      return '您已经购买'
    }
    if (row.isInCart) {
      return '移出购物车'
    } else {
      return '加入购物车'
    }
  })


  /* 购物车 */
  const entranceCart = ref([])
  const onAddCart = (row) => {
    const currItem = entranceCart.value.find((item) => {
      return item.id === row.id
    })
    if (currItem) {
      // 存在 移除
      const index = entranceCart.value.indexOf(currItem)
      entranceCart.value.splice(index, 1)
      row.isInCart = false
    } else {
      // 不存在 加入
      entranceCart.value.push(row)
      row.isInCart = true
    }
  }

  /* 批量购买 */
  const onBatchBuyClick = () => {
    const totalPrice = entranceCart.value.reduce((prev, curr) => {
      return prev + curr.price
    }, 0)
    const entranceIdArr = entranceCart.value.map((item) => {
      return item.id
    })
    ElMessageBox.confirm(`确认支付 ${totalPrice} 金币？`, '购买', { type: 'warning' }).then(() => {
      axios.post('index/qrcode/buy', { eids: entranceIdArr }).then(() => {
        ElMessageBox.alert('购买成功！', '提示', { type: 'success' }).finally(() => {
          location.reload()
        });
        // entranceCart.value = []
        // tableData.forEach(item => {
        // 	item.entrance.forEach(elem => {
        // 		elem.isInCart = false
        // 	})
        // })
      }).catch(() => { })
    }).catch(() => { })
  }

  const tableElList = reactive({})
  function setRef (el, qrcodeId) {
    if (el) {
      tableElList[qrcodeId] = el
    }
  }

  const onSelectAllClick = (qrcodeId) => {
    tableElList[qrcodeId].toggleAllSelection()
  }

  // 批量加购
  const onBatchCartClick = (qrcodeId) => {
    const rows = tableElList[qrcodeId].getSelectionRows()
    console.log(rows)
    rows.forEach(row => {
      const currItem = entranceCart.value.find((item) => {
        return item.id === row.id
      })
      if (!currItem) {
        // 不存在 加入
        entranceCart.value.push(row)
        row.isInCart = true
      } else {
        ElNotification.warning(row.name + ' 已经在购物车')
      }
    })
  }

  const selectable = (row, _index) => {
    return !row.bought && !row.isInCart
  }

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
      await axios.post('index/qrcode/del', { id: row.id })
      const index = tableData.value.indexOf(row)
      tableData.value.splice(index, 1)
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

    editForm.id = row.qrcode_id
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
    axios.post('index/qrcode/edit', editForm).then(() => {
      showEditDlg.value = false
      ElMessage.success('编辑成功')
      loadData()
    }).catch(() => { })
  }

</script>


<!-- <script>
export default {
	name: 'Decode',
}
</script> -->

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

  /* .qrcode-wrapper::-webkit-scrollbar {
	height: 6px;
}
.qrcode-wrapper::-webkit-scrollbar-thumb {
    background-color: #0003;
    border-radius: 3px;
    transition: all .2s ease-in-out;
}
.qrcode-wrapper::-webkit-scrollbar-track {
    border-radius: 6px;
} */
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