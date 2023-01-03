<template>
  <header class="app-header">
    <div class="app-name">
      <div></div>
      <span>企微群码系统</span>
    </div>
    <div class="app-menu">
      <el-menu mode="horizontal" :default-active="currentRouteName" router>
        <el-menu-item index="decode" :route="routes[1]">活码解析</el-menu-item>
        <el-menu-item index="mall" :route="routes[2]">群码商城</el-menu-item>
        <el-menu-item index="bought" :route="routes[3]">已购群码</el-menu-item>
        <el-menu-item index="invite" :route="routes[4]">推广返利</el-menu-item>
      </el-menu>
    </div>
    <div class="app-user">
      <el-dropdown @command="onUserDropdownCommand">
        <div class="dropdown-link">
          <span>{{username}}</span>
          <el-icon>
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="alter_pwd">修改密码</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="app-balance">
      <div>金币<span>{{balance}}</span></div>
      <el-popover trigger="click" width="200">
        <el-image src="http://52tg.cc/static/kf_user.png" />
        <p style="text-align:center;color:var(--el-color-primary);">扫码联系客服充值</p>
        <template #reference>
          <el-link type="primary">充值</el-link>
        </template>
      </el-popover>
    </div>
    <div class="app-balance">
      <div>佣金<span>{{score}}</span></div>
      <el-link type="primary" @click="showWithdrawDlg = true">提现</el-link>
    </div>
  </header>
  <div class="main">
    <router-view />
  </div>

  <!-- 修改密码 -->
  <el-dialog v-model="showChangePwdDlg" width="300px" title="修改密码">
    <el-form :model="changePwdForm" :rules="changePwdRule" ref="changePwdFormRef">
      <el-form-item label="新的密码" prop="password">
        <el-input show-password v-model="changePwdForm.password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirm">
        <el-input placeholder="重复输入上面的密码" show-password v-model="changePwdForm.confirm" />
      </el-form-item>
    </el-form>
    <div style="text-align:center;">
      <el-button type="primary" @click="onChangePwdClick">确定</el-button>
    </div>
  </el-dialog>

  <!-- 提现 -->
  <el-dialog title="佣金提现" v-model="showWithdrawDlg" width="400px" @open="onWithdrawOpen">
    <div class="withdraw-dlg">
      <div style="text-align:center">
        <el-radio-group v-model="withdrawWay">
          <el-radio-button label="balance">兑换为金币</el-radio-button>
          <el-radio-button label="alipay">提现到支付宝</el-radio-button>
        </el-radio-group>
      </div>
      <el-alert :title="withdrawWay === 'balance' ? '1 佣金 = 1 金币' : '100 佣金 = 1 元'" type="info" show-icon
        :closable="false" center />
      <el-input v-model="withdrawScore" placeholder="佣金" type="number" :min="0">
        <template #prepend>佣&emsp;金</template>
      </el-input>
      <el-input v-model="withdrawAlipay" placeholder="收款支付宝账号" v-show="withdrawWay === 'alipay'">
        <template #prepend>支付宝</template>
      </el-input>
      <div style="margin-bottom:0;text-align:center;">
        <el-button type="primary" :disabled="withdrawScore < 1 || (withdrawWay === 'alipay' && !withdrawAlipay)"
          @click="onWithdrawConfirmClick">确定</el-button>
      </div>
    </div>
  </el-dialog>

</template>


<script setup>
  import { ref, reactive, onMounted, getCurrentInstance, computed, provide } from 'vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter } from "vue-router"

  const { proxy } = getCurrentInstance()
  const axios = proxy.axios

  const username = ref(null)
  const balance = ref(null)
  const score = ref(null)

  const routes = ref(useRouter().getRoutes())
  const currentRouteName = computed(() => useRouter().currentRoute.value.name)

  function onUserDropdownCommand (command) {
    if (command === 'logout') {
      axios.post('index/user/logout').then(() => {
        location.href = '/login.html'
      }).catch(() => { })
    } else if (command === 'alter_pwd') {
      showChangePwdDlg.value = true
    }
  }

  onMounted(() => {
    axios.get('index/index').then(({ data }) => {
      username.value = data.username
      balance.value = data.balance
      score.value = data.score
    }).catch(() => {
      location.href = '/login.html'
    })
  })

  // 修改密码
  const showChangePwdDlg = ref(false)
  const changePwdForm = reactive({
    password: '',
    confirm: ''
  })
  const changePwdRule = reactive({
    password: {
      trigger: 'blur',
      required: true,
      message: '请输入密码'
    },
    confirm: {
      trigger: 'blur',
      required: true,
      validator: (_rule, value, callback) => {
        changePwdForm.password !== value ? callback(new Error('两次输入的密码不一致')) : callback()
      }
    }
  })
  const changePwdFormRef = ref()
  function onChangePwdClick () {
    changePwdFormRef.value.validate((valid) => {
      if (!valid) {
        return
      }
      axios.post('index/index/repwd', { password: changePwdForm.password }).then(() => {
        showChangePwdDlg.value = false
        ElMessage.success('修改密码成功')
      }).catch(() => { })
    })
  }

  const showWithdrawDlg = ref(false)
  provide('showWithdrawDlg', showWithdrawDlg)
  const withdrawWay = ref('balance')
  const withdrawScore = ref()
  const withdrawAlipay = ref()
  function onWithdrawOpen () {
    axios.get('index/invite/alipay').then(({ data }) => {
      withdrawScore.value = data.score
      withdrawAlipay.value = data.alipay
    }).catch(() => { })
  }
  function onWithdrawConfirmClick () {
    if (withdrawWay.value === 'alipay') {
      axios.post('index/invite/withdraw', {
        alipay: withdrawAlipay.value,
        score: withdrawScore.value
      }).then(() => {
        showWithdrawDlg.value = false
        ElMessageBox.alert('申请提现成功，请等待审核。', '成功', {
          type: 'success',
          callback: () => {
            location.reload()
          }
        })
      }).catch(() => { })
    } else if (withdrawWay.value === 'balance') {
      axios.post('index/invite/exchange', {
        score: withdrawScore.value
      }).then(() => {
        showWithdrawDlg.value = false
        ElMessageBox.alert('兑换成功。', '成功', {
          type: 'success',
          callback: () => {
            location.reload()
          }
        })
      }).catch(() => { })
    }

  }

</script>


<style scoped>
  .main {
    margin-left: 0;
  }

  .app-menu {
    margin: 0 20px;
  }

  .app-menu .el-menu {
    border-bottom: none;
  }

  .app-balance {
    display: flex;
    align-items: center;
  }

  .app-balance>div {
    margin-right: 4px;
  }

  :deep(.el-link span) {
    font-weight: normal;
  }

  .withdraw-dlg>* {
    margin-bottom: 15px;
  }
</style>