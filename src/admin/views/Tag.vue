<template>
  <div class="common-main">
    <div class="common-header">
      <div class="common-filter">
      </div>
      <div class="common-action">
        <el-button type="primary" :icon="Plus" @click="onAddClick">添加标签</el-button>
      </div>
    </div>
    <div class="common-content">
      <el-table :data="tableData" v-loading="tableLoading" height="100%">
        <el-table-column label="序号" prop="id" align="center" width="80px"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="价值" prop="price" width="100px"></el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="scope">
            <el-button :icon="Edit" @click="onEditClick(scope.row)">编辑</el-button>
            <el-button :icon="Delete" @click="onDeleteClick(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="common-pagination">
      <el-pagination background layout="total,prev,pager,next" :default-page-size="pagination.pageSize"
        v-model:current-page="pagination.page" :total="pagination.total" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, getCurrentInstance, onMounted, watch } from 'vue'
  import { Plus, Edit, Delete } from '@element-plus/icons-vue'
  import { Axios } from 'axios'
  import { ElMessage, ElMessageBox, MessageBoxData } from 'element-plus'

  const { proxy } = getCurrentInstance() as any
  const axios: Axios = proxy.axios

  const tableLoading = ref < boolean > (false)
  const tableData = ref([])
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })

  onMounted(() => {
    loadData()
  })

  watch(() => pagination.page, () => {
    loadData()
  })


  function loadData () {
    tableLoading.value = true
    axios.get('admin/tag/index', {
      params: { page: pagination.page }
    }).then(({ data }) => {
      tableData.value = data.data
      pagination.pageSize = data.page_size
      pagination.total = data.total
    }).catch(() => {

    }).finally(() => {
      tableLoading.value = false
    })
  }

  async function onAddClick () {
    try {
      const res: MessageBoxData = await ElMessageBox.prompt('请输入标签名称', '添加标签')
      if (!res.value) {
        ElMessage.error('标签名称不合法')
        return
      }
      await axios.post('admin/tag/add', {
        name: res.value
      })
      ElMessage.success('添加成功')
      location.reload()
    } catch (e) {

    }
  }

  async function onEditClick (row: any) {
    try {
      const res: MessageBoxData = await ElMessageBox.prompt('请输入标签名称', '修改标签', { inputValue: row.name })
      if (!res.value) {
        ElMessage.error('标签名称不合法')
        return
      }
      await axios.post('admin/tag/edit', {
        id: row.id,
        name: res.value
      })
      row.name = res.value
      ElMessage.success('修改成功')
    } catch (e) {

    }
  }

  async function onDeleteClick (row: any) {
    try {
      await ElMessageBox.confirm('确定要删除该标签吗？', '删除标签')
      await axios.post('admin/tag/del', {
        id: row.id
      })
      const index = tableData.value.indexOf(row as never)
      tableData.value.splice(index, 1)
      ElMessage.success('删除成功')
    } catch (e) {

    }
  }

</script>

<style scoped>
</style>