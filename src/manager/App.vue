<template>
  <header class="app-header">
    <div class="app-name">
      <div></div>
      <span>企微活码收集</span>
    </div>
    <div class="app-menu">
      <el-menu mode="horizontal" :default-active="currentRouteName" router>
        <el-menu-item index="provider" :route="routes[0]">账号</el-menu-item>
        <el-menu-item index="entrance" :route="routes[1]">群码</el-menu-item>
        <el-menu-item index="qrcode" :route="routes[2]">活码</el-menu-item>
        <el-menu-item index="exchange" :route="routes[3]">转赠</el-menu-item>
        <el-menu-item index="work" :route="routes[4]">工作</el-menu-item>
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
    <div class="app-balance" style="display:flex;align-items:center;text-align:center;">
      <div style="margin-right:5px;">有效数<span>{{entranceValid}}</span></div>
      <div style="margin-right:5px;">已结算<span>{{score}}</span></div>
      <el-link type="primary" @click="onWithdrawClick" v-loading="withdrawBtnLoading">提现</el-link>
    </div>
    <el-popover trigger="click" width="200">
      <el-image src="http://52tg.cc/static/kf_provider.png" />
      <p style="text-align:center;color:var(--el-color-primary);">扫码联系客服</p>
      <template #reference>
        <el-link type="primary" style="margin-left:10px;">联系客服</el-link>
      </template>
    </el-popover>
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
</template>

<script setup>
  import { ref, reactive, onMounted, getCurrentInstance, computed, provide } from 'vue'
  import { ArrowDown } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter } from "vue-router"

  const { proxy } = getCurrentInstance()
  const axios = proxy.axios

  const username = ref(null)
  const score = ref(null)
  const entrancePrice = ref(null)
  const maxBuyTimes = ref(null)
  const entranceValid = ref(null)

  provide('entrancePrice', entrancePrice)
  provide('maxBuyTimes', maxBuyTimes)


  const routes = ref(useRouter().getRoutes())

  onMounted(async () => {
    try {
      const { data } = await axios.get('manager/index/index')
      username.value = data.username
      score.value = data.score
      entranceValid.value = data.entrance_valid
      entrancePrice.value = data.entrance_price
      maxBuyTimes.value = data.max_buy_times

    } catch (_e) {

    }
  })

  const currentRouteName = computed(() => useRouter().currentRoute.value.name)

  function onUserDropdownCommand (command) {
    if (command === 'logout') {
      axios.post('provider/base/logout').then(() => {
        location.href = '/login.html?provider'
      }).catch(() => { })
    } else if (command === 'alter_pwd') {
      showChangePwdDlg.value = true
    }
  }

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
      axios.post('provider/index/repwd', { password: changePwdForm.password }).then(() => {
        showChangePwdDlg.value = false
        ElMessage.success('修改密码成功')
      }).catch(() => { })
    })
  }

  const withdrawBtnLoading = ref(false)
  async function onWithdrawClick () {
    try {
      withdrawBtnLoading.value = true
      const { data } = await axios.get('provider/withdraw/alipay')
      withdrawBtnLoading.value = false
      const res = await ElMessageBox.prompt(`输入下支付宝收款账号,写错未收到款概不负责`, '提现', {
        inputValue: data.alipay,
        inputPlaceholder: '请填写收款支付宝账号',
        type: 'warning'
      })
      if (!res.value) {
        ElMessage.error('请填写支付宝账号')
        throw new Error()
      }
      await axios.post('provider/withdraw/withdraw', { alipay: res.value })
      ElMessageBox.alert('请等待审核', '申请提现成功', {
        type: 'success',
        callback: () => {
          location.reload()
        }
      }).catch(() => { })
    } catch (_e) {

    } finally {
      withdrawBtnLoading.value = false
    }
  }
  provide('onWithdrawClick', onWithdrawClick)

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

  :deep(.el-link span) {
    font-weight: normal;
  }
</style>