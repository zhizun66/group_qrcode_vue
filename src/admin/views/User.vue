<template>
  <div class="common-main">
    <div class="common-header">
      <div class="common-filter">
        <el-radio-group v-model="filter.enable" @change="onEnableChange" style="width:auto;">
          <el-radio-button :label="1">已启用</el-radio-button>
          <el-radio-button :label="0">未启用</el-radio-button>
        </el-radio-group>
        <el-input placeholder="用户名" clearable v-model="filter.username" />
        <div class="common-filter-buttons">
          <el-button :icon="Search" @click="onFilterClick">查询</el-button>
          <el-button :icon="Refresh" @click="onRefreshClick">刷新</el-button>
        </div>
      </div>
    </div>
    <div class="common-content">
      <el-table :data="tableData" v-loading="tableLoading" height="100%">
        <el-table-column label="序号" prop="id" align="center" width="80px" />
        <el-table-column label="账号" prop="username" align="center" />
        <el-table-column label="邀请人账号" prop="invite_user_username" align="center" />
        <!-- <el-table-column label="姓名" prop="name" align="center" /> -->
        <el-table-column label="余额" prop="balance" align="center" />
        <el-table-column label="积分" prop="score" align="center" />
        <el-table-column label="注册时间" prop="add_time" align="center" />
        <el-table-column label="状态" align="center">
          <template #default="scope">{{ scope.row.enable === 1 ? '已启用' : '未启用' }}</template>
        </el-table-column>
        <el-table-column label="操作" align="right" width="350px">
          <template #default="scope">
            <el-button @click="onToggleEnableClick(scope.row)">{{ scope.row.enable === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button @click="onRechargeClick(scope.row)">充值</el-button>
            <el-button @click="onEditClick(scope.row)">修改密码</el-button>
            <el-button type="danger" plain @click="onDeleteClick(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="common-pagination">
      <el-pagination background layout="total,prev,pager,next,jumper" :default-page-size="pagination.pageSize"
        v-model:current-page="pagination.page" :total="pagination.total" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Axios } from 'axios';
  import { getCurrentInstance, onMounted, ref, reactive, watch } from 'vue'
  import { ElMessage, ElMessageBox, MessageBoxData } from 'element-plus'
  import { Search, Refresh } from '@element-plus/icons-vue'

  const { proxy } = getCurrentInstance() as any
  const axios: Axios = proxy.axios

  const tableData = ref([])
  const filter = reactive({
    enable: 1,
    username: ''
  })
  const tableLoading = ref < boolean > (false)
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

  function loadData (): void {
    tableLoading.value = true
    axios.post('admin/user/index', filter, {
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

  function onFilterClick () {
    pagination.page = 1
    loadData()
  }

  function onRefreshClick () {
    loadData()
  }

  function onEnableChange () {
    loadData()
  }

  function onToggleEnableClick (row: any) {
    const enable: number = 1 - row.enable
    axios.post('admin/user/enable', {
      uid: row.id,
      enable: enable
    }).then(() => {
      row.enable = enable
      ElMessage.success('操作成功')
    }).catch(() => { })
  }

  async function onDeleteClick (row: any) {
    try {
      await ElMessageBox.confirm('确定要删除吗？', '提示', { type: 'warning' })
      await axios.post('admin/user/del', { uid: row.id })
      ElMessage.success('已删除')
      const index: number = tableData.value.indexOf(row as never)
      tableData.value.splice(index, 1)
    } catch (e: any) {

    }
  }

  async function onEditClick (row: any) {
    try {
      const res: MessageBoxData = await ElMessageBox.prompt('输入新密码', '修改密码')
      if (!res.value) {
        ElMessage.error('密码不能为空')
        return
      }
      await axios.post('admin/user/edit', {
        uid: row.id,
        password: res.value
      })
      ElMessage.success('密码已修改')
    } catch (e: any) {

    }
  }

  async function onRechargeClick (row: any) {
    try {
      const res: MessageBoxData = await ElMessageBox.prompt('输入充值数量', '充值')
      const value: number = parseInt(res.value)
      if (!res.value || value === 0) {
        ElMessage.error('充值数量不能为空')
        return
      }
      await axios.post('admin/user/recharge', {
        uid: row.id,
        value: res.value
      })
      ElMessage.success(`成功充值 ${value}`)
      row.balance += value
    } catch (e: any) {

    }
  }

</script>