<template>
  <div class="common-main">
    <div class="common-header">
      <div class="common-filter">
        <el-input placeholder="企业" clearable v-model="filter.company"></el-input>
        <div class="common-filter-buttons">
          <el-button :icon="Search" @click="onFilterClick">查询</el-button>
          <el-button :icon="Refresh" @click="onRefreshClick">刷新</el-button>
        </div>
      </div>
      <div class="common-action">
        <el-button type="primary" :icon="Plus" @click="showAddDlg = true">添加群码</el-button>
      </div>
    </div>
    <div class="common-content">
      <el-table :data="tableData" v-loading="tableLoading" height="100%">
        <el-table-column label="序号" prop="id" align="center" width="80px" />
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
        <el-table-column label="成员" align="center" width="80px">
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
        <el-table-column label="下载次数" width="80px" align="center">
          <template #default="scope">{{scope.row.buy_cnt}}</template>
        </el-table-column>
        <el-table-column label="到期时间" prop="expire_date" align="center" width="160px" :formatter="cellFormatter" />
        <el-table-column label="添加时间" prop="add_time" align="center" width="160px" />
        <el-table-column label="操作" align="center" width="300px">
          <template #default="scope">
            <el-button type="primary" plain :icon="Edit" @click="onItemEditClick(scope.row)">编辑</el-button>
            <!-- <el-button :disabled="scope.row.status !== 1" :type="scope.row.hide === 0 ? 'warning' : 'info'" plain
              :icon="scope.row.hide === 0 ? Hide : View" @click="onItemHideClick(scope.row)">{{scope.row.hide === 0 ?
              '下架' : '上架'}}</el-button> -->
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

  <!-- 添加对话框 -->
  <el-dialog v-model="showAddDlg" title="添加群码" width="350px" @open="onAddDlgOpen" @closed="onAddDlgClosed"
    :close-on-click-modal="false">
    <el-form label-width="65px" :model="formData" :rules="formRule" ref="addForm">
      <el-form-item label="群&emsp;码" prop="qrcode">
        <el-upload action="/api/staff/index/upload" multiple :auto-upload="false" :show-file-list="false"
          v-model:file-list="formData.qrcode" accept="image/*" ref="uploadRef">
          <div class="qrcode-select">
            <el-icon :size="15" color="#CCC">
              <Plus />
            </el-icon>
          </div>
          <p style="margin-left:10px;font-size:12px;color:var(--el-color-primary);" v-if="formData.qrcode.length > 0">已选
            {{formData.qrcode.length}} 个</p>
        </el-upload>
        <div class="qrcode-wrapper" v-if="formData.qrcode.length > 0">
          <div class="qrcode-img" v-for="(file, index) in formData.qrcode" :key="file.uid">
            <img :src="file2ImageBlobUrl(file.raw)" />
            <div class="qrcode-remove" @click="onRemoveQrcodeClick(index)">
              <el-icon color="#FFF" :size="20">
                <DeleteFilled />
              </el-icon>
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="链&emsp;接" prop="urls">
        <el-input type="textarea" :row="2" placeholder="每行1个" v-model="urls" />
      </el-form-item>
      <el-form-item label="类&emsp;型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio :label="1" border>企微</el-radio>
          <el-radio :label="2" border>个微</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="企业名" prop="company">
        <el-input v-model="formData.company" clearable />
      </el-form-item>
      <!-- <el-form-item label="标&emsp;签" prop="tags">
        <el-select v-model="formData.tags" style="width:100%;" clearable filterable multiple>
          <el-option v-for="tag of tags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select>
      </el-form-item> -->
      <!-- <div style="text-align:center;margin-bottom:20px;" v-if="!showMoreForm">
        <el-button type="primary" :icon="ArrowDown" text @click="showMoreForm = true">更多选项</el-button>
      </div> -->
      <!-- <template v-else> -->

      <!-- <el-form-item label="地&emsp;区" prop="area">
          <elui-china-area-dht placeholder="请选择" isall clearable v-model="formData.area" style="width:100%;">
          </elui-china-area-dht>
        </el-form-item>
        <el-form-item label="备&emsp;注" prop="remark">
          <el-input v-model="formData.remark" clearable />
        </el-form-item>
        <el-form-item label="群名称" prop="name">
          <el-input v-model="formData.name" clearable />
        </el-form-item>
        <el-form-item label="有效期" prop="expire">
          <el-date-picker type="datetime" v-model="formData.expire" style="width:100%;" clearable />
        </el-form-item>
        <el-form-item label="成员数" prop="members">
          <el-input-number :min="0" v-model="formData.members" style="width:100%;" clearable />
        </el-form-item>
        <el-form-item label="价&emsp;格" prop="price">
          <el-input-number :min="0" v-model="formData.price" style="width:100%;" clearable placeholder="金币" />
        </el-form-item>
        <el-form-item label="限&emsp;购" prop="price">
          <el-input-number :min="0" v-model="formData.limit" style="width:100%;" clearable placeholder="限制购买下载次数" />
        </el-form-item> -->
      <!-- </template> -->
    </el-form>
    <div style="text-align:center;">
      <el-button type="primary" @click="onSubmitClick" :loading="submitLoading">提交</el-button>
    </div>
  </el-dialog>

  <!-- 修改对话框 -->
  <el-dialog v-model="showEditDlg" title="修改群码" width="350px" :close-on-click-modal="false" @click="onEditDlgClosed">
    <el-form label-width="55px" :model="formData" ref="editForm">
      <!-- <template v-if="!editRow.qrcode_id">
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
      </template> -->
      <el-form-item label="企业名">
        <el-input v-model="formData.company" clearable />
      </el-form-item>
      <!-- <el-form-item label="价&emsp;格">
        <el-input v-model="formData.price" clearable />
      </el-form-item> -->
    </el-form>
    <div style="text-align:center;">
      <el-button type="primary" @click="onEditConfirmClick">确认修改</el-button>
    </div>
  </el-dialog>

</template>

<script setup>
  import { ref, reactive, getCurrentInstance, onMounted, computed, watch, inject } from 'vue'
  import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
  import { Search, Refresh, ArrowDown, Plus, DeleteFilled, Delete, Edit, Hide, View } from '@element-plus/icons-vue'
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
    company: '',
  })

  const chinaData = new EluiChinaAreaDht.ChinaArea().chinaAreaflat
  const showAddDlg = ref(false)
  const formData = reactive({
    qrcode: [],
    urls: [],
    // tags: [],
    company: '',
    type: 1,
    // area: [],
    // remark: '',
    // name: '',
    // members: 0,
    // expire: '',
    // price: 0,
    // limit: 0
  })

  const urls = computed({
    get() {
      return formData.urls.join('\n')
    },
    set(value) {
      formData.urls = value.split('\n')
    }
  })

  const formRule = reactive({
    qrcode: {
      trigger: 'submit', validator: (_rule, _value, callback) => {
        formData.qrcode.length > 0 || formData.urls.length > 0 ? callback() : callback(new Error('群码或链接必填其一'))
      }
    },
    urls: {
      trigger: 'submit', validator: (_rule, _value, callback) => {
        formData.qrcode.length > 0 || formData.urls.length > 0 ? callback() : callback(new Error('群码或链接必填其一'))
      }
    },
    type: {
      trigger: 'submit',
      required: true,
      message: '类型必选'
    },
    // tags: {
    //   trigger: 'submit',
    //   required: true,
    //   message: '标签必选'
    // }
  })

  // const showMoreForm = ref(false)
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
    axios.post('provider/entrance/index', filter, {
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


  // 移除二维码
  function onRemoveQrcodeClick (index) {
    formData.qrcode.splice(index, 1)
  }

  // 表单对话框关闭
  function onAddDlgClosed () {
    addForm.value.resetFields()
    // showMoreForm.value = false
  }

  const editForm = ref()
  // 修改对话框关闭
  function onEditDlgClosed () {
    editForm.value.resetFields()
  }

  function onAddDlgOpen () {
    formData.price = entrancePrice.value
    formData.limit = maxBuyTimes.value
  }

  // 提交
  function onSubmitClick () {
    addForm.value.validate(async (valid) => {
      if (!valid) {
        return
      }

      const fd = new FormData()
      // fd.append('tags', formData.tags)
      fd.append('company', formData.company)
      // fd.append('area', formData.area)
      // fd.append('remark', formData.remark)
      // fd.append('name', formData.name)
      // fd.append('members', formData.members)
      // fd.append('expire', formData.expire)
      // fd.append('price', formData.price)
      fd.append('type', formData.type)

      //const uidArr = []
      let n = 0
      for (let file of formData.qrcode) {
        n++
        const qr = new QrCode()
        try {
          const res = await qr.decodeFromImage(URL.createObjectURL(file.raw))
          if (!res) {
            throw new Error(`第 ${n} 个二维码识别失败`)
          }
          //uidArr.push(file.uid)
          //fd.append('qrcode_' + file.uid, file.raw)
          //fd.append('decode_' + file.uid, res.data)
          fd.append('decode[]', res.data)
        } catch (err) {
          if (err instanceof Object) {
            ElNotification.error(err.message)
          } else {
            ElNotification.error(err)
          }
        }
      }
      //fd.append('uid', uidArr)

      // if (uidArr.length === 0) {
      //   return
      // }

      for (let url of formData.urls) {
        fd.append('decode[]', url)
      }

      submitLoading.value = true
      axios.post('provider/entrance/upload', fd, {
        'Content-type': 'multipart/form-data'
      }).then(() => {
        showAddDlg.value = false
        ElMessageBox.alert('提交成功', '提示', {
          type: 'success',
          callback: () => {
            location.reload()
          }
        })
      }).catch(() => {
      }).finally(() => {
        submitLoading.value = false
      })
    })
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
      await axios.post('provider/entrance/itemDel', {
        eid: row.id
      })
      const index = tableData.value.indexOf(row)
      tableData.value.splice(index, 1)
      ElMessage.success('已删除')
    } catch (e) {

    }
  }

  // 下架/上架
  function onItemHideClick (row) {
    const hide = 1 - row.hide
    axios.post('provider/entrance/itemHide', {
      eid: row.id,
      hide: hide
    }).then(() => {
      row.hide = hide
    }).catch(() => {
    })
  }

  // 编辑
  let editRow = ref(null)
  function onItemEditClick (row) {
    showEditDlg.value = true
    editRow.value = row
    formData.company = row.company
    // formData.name = row.name
    // formData.members = row.members
    // formData.expire = row.expire_date
    // formData.area = row.area
    // formData.remark = row.remark
    // formData.price = row.price
  }

  // 确定修改
  function onEditConfirmClick () {
    axios.post('provider/entrance/itemEdit', {
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