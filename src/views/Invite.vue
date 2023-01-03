<template>
  <div class="common-main">
    <div class="common-header">
      <div class="common-filter"></div>
      <div class="common-action">
        <el-button type="primary" :icon="Position" @click="onInviteClick" :loading="inviteLoading"
          v-if="tableData.length > 0">邀请返利</el-button>
        <el-button type="primary" :icon="Coin" @click="onWithdrawClick">积分提现</el-button>
        <el-button type="primary" :icon="Clock" @click="onInvitedClick">邀请记录</el-button>
        <el-button type="primary" :icon="Clock" @click="onWithdrawedClick">提现记录</el-button>
      </div>
    </div>
    <div class="common-content">
      <el-table height="100%" :data="tableData" v-loading="tableLoading" v-if="tableData.length > 0">
        <el-table-column label="到账时间" prop="add_time"></el-table-column>
        <el-table-column label="下级用户" prop="username"></el-table-column>
        <el-table-column label="支付金币" prop="pay"></el-table-column>
        <el-table-column label="返利积分" prop="commission"></el-table-column>
        <el-table-column label="返利比例">
          <template #default="scope">{{scope.row.rate}}%</template>
        </el-table-column>
      </el-table>
      <template v-else>
        <el-empty description="暂无返利记录" />
        <div style="display:flex;justify-content:center;">
          <el-button type="primary" size="large" :icon="Position" @click="onInviteClick" :loading="inviteLoading">邀请新用户
          </el-button>
        </div>
      </template>
    </div>
    <div class="common-pagination" v-if="tableData.length > 0">
      <el-pagination background layout="total,prev,pager,next" :default-page-size="pagination.pageSize"
        v-model:current-page="pagination.page" :total="pagination.total" />
    </div>
  </div>

  <el-dialog v-model="showInvitedDlg" title="邀请记录" width="400px">
    <el-table height="300px" :data="invitedData" v-loading="invitedLoading">
      <el-table-column label="账号" prop="username"></el-table-column>
      <el-table-column label="邀请时间" prop="add_time"></el-table-column>
    </el-table>
    <div style="display:flex;justify-content:center;margin-top:10px">
      <el-pagination small background layout="total,prev,pager,next" :default-page-size="invitedPagination.pageSize"
        v-model:current-page="invitedPagination.page" :total="invitedPagination.total" />
    </div>
  </el-dialog>

  <el-dialog v-model="showWithdrawDlg" title="提现记录" width="1000px">
    <el-table height="300px" :data="withdrawData" v-loading="withdrawLoading">
      <el-table-column label="提现积分" prop="score"></el-table-column>
      <el-table-column label="收款账号" prop="alipay"></el-table-column>
      <el-table-column label="提现状态" prop="status" :formatter="statusFormatter"></el-table-column>
      <el-table-column label="执行时间" prop="op_time"></el-table-column>
      <el-table-column label="提交时间" prop="add_time"></el-table-column>
    </el-table>
    <div style="display:flex;justify-content:center;margin-top:10px">
      <el-pagination small background layout="total,prev,pager,next" :default-page-size="withdrawPagination.pageSize"
        v-model:current-page="withdrawPagination.page" :total="withdrawPagination.total" />
    </div>
  </el-dialog>

</template>

<script setup>
  import { ref, reactive, getCurrentInstance, onMounted, watch, inject } from 'vue'
  import { Position, Clock, Coin } from '@element-plus/icons-vue'
  import { ElMessageBox } from 'element-plus'

  const { proxy } = getCurrentInstance()
  const axios = proxy.axios

  const showInvitedDlg = ref(false)
  const showWithdrawDlg = ref(false)
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const invitedPagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const withdrawPagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const inviteLoading = ref(false)
  const tableData = ref([])
  const invitedData = ref([])
  const withdrawData = ref([])
  const tableLoading = ref(false)
  const invitedLoading = ref(false)
  const withdrawLoading = ref(false)

  onMounted(() => {
    loadData()
  })

  watch(() => pagination.page, () => {
    loadData()
  })
  watch(() => invitedPagination.page, () => {
    loadInvitedData()
  })
  watch(() => withdrawPagination.page, () => {
    loadInvitedData()
  })

  function loadData () {
    tableLoading.value = true
    axios.get('index/invite/index', {
      params: {
        page: pagination.page
      }
    }).then(({ data }) => {
      tableData.value = data.data
      pagination.pageSize = data.page_size
      pagination.total = data.total
    }).catch(() => {

    }).finally(() => {
      tableLoading.value = false
    })
  }

  function loadInvitedData () {
    invitedLoading.value = true
    axios.get('index/invite/inviteList', {
      params: {
        page: invitedPagination.page
      }
    }).then(({ data }) => {
      invitedData.value = data.data
      invitedPagination.pageSize = data.page_size
      invitedPagination.total = data.total
    }).catch(() => {

    }).finally(() => {
      invitedLoading.value = false
    })
  }

  function loadWithdrawData () {
    withdrawLoading.value = true
    axios.get('index/invite/withdrawList', {
      params: {
        page: withdrawPagination.page
      }
    }).then(({ data }) => {
      withdrawData.value = data.data
      withdrawPagination.pageSize = data.page_size
      withdrawPagination.total = data.total
    }).catch(() => {

    }).finally(() => {
      withdrawLoading.value = false
    })
  }

  function onInvitedClick () {
    showInvitedDlg.value = true
    loadInvitedData()
  }

  function onInviteClick () {
    inviteLoading.value = true
    axios.get('index/invite/inviteUrl').then(({ data }) => {
      ElMessageBox.alert(data.url, '您的邀请链接', { type: 'success', width: "800" }).catch(() => { })
    }).catch(() => { }).finally(() => {
      inviteLoading.value = false
    })
  }

  function onWithdrawedClick () {
    showWithdrawDlg.value = true
    loadWithdrawData()
  }

  function statusFormatter (_row, _column, cellValue, _index) {
    return {
      0: '正在审核',
      1: '已发放',
      '-1': '发放失败'
    }[cellValue]
  }

  const showWithdrawDlg2 = inject('showWithdrawDlg')
  function onWithdrawClick () {
    showWithdrawDlg2.value = true
  }

</script>