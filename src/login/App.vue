<script setup>
  import { User, Lock } from '@element-plus/icons-vue'
  import { ref, reactive, getCurrentInstance, onMounted, computed } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'

  const vm = getCurrentInstance()
  const axios = vm.proxy.axios

  onMounted(() => {
    if (location.search.startsWith('?staff')) {
      role.value = 'staff'
    } else if (location.search.startsWith('?admin')) {
      role.value = 'admin'
    } else if (location.search.startsWith('?provider')) {
      role.value = 'provider'
    } else if (location.search.startsWith('?manager')) {
      role.value = 'manager'
    } else {
      role.value = 'user'
    }

    if (document.cookie.includes('_invite_') && role.value === 'provider') {
      showRegDlg.value = true
    }
  })

  const role = ref('user')

  // 注册
  const showRegDlg = ref(false)
  const regForm = reactive({
    username: '',
    password: '',
    confirm: '',
    name: ''
  })
  const validatePasswd = (_rule, value, callback) => {
    if (!value) {
      callback(new Error('请填写确认密码'))
      return;
    }
    regForm.password != value ? callback(new Error('两次输入的密码不一致')) : callback()
  }
  const regRules = reactive({
    username: {
      trigger: 'blur',
      required: true,
      message: '请填写账号'
    },
    password: {
      trigger: 'blur',
      required: true,
      message: '请填写密码'
    },
    confirm: {
      trigger: 'blur',
      required: true,
      validator: validatePasswd
    }
  })
  const regFormRef = ref()
  const onRegClosed = () => {
    regFormRef.value.resetFields()
  }
  const onRegSubmitClick = () => {
    regFormRef.value.validate((valid) => {
      if (!valid) {
        return
      }

      const conf = {
        user: 'index/user/reg',
        staff: 'staff/user/reg',
        provider: 'provider/base/reg',
        manager: 'manager/base/reg'
      }

      axios.post(conf[role.value], regForm).then(() => {
        ElMessageBox.alert('注册成功。', '提示', { type: 'success' });
        showRegDlg.value = false
      }).catch(() => {
      })
    })
  }

  // 登录
  const loginFormRef = ref()
  const loginForm = reactive({
    username: '',
    password: ''
  })
  const onLoginClick = () => {
    const conf = {
      user: {
        uri: 'index/user/login',
        url: '/'
      },
      staff: {
        uri: 'staff/user/login',
        url: '/staff.html'
      },
      admin: {
        uri: 'admin/base/login',
        url: '/admin.html'
      },
      provider: {
        uri: 'provider/base/login',
        url: '/provider.html'
      },
      manager: {
        uri: 'manager/base/login',
        url: '/manager.html'
      }
    }
    axios.post(conf[role.value].uri, loginForm).then(() => {
      ElMessage.success('登录成功')
      location.href = conf[role.value].url
    }).catch(() => { })
  }

  const roleName = computed(() => (role) => {
    return { user: '用户', staff: '员工', admin: '管理员', provider: '合作商', manager: 'XXX' }[role]
  })
</script>

<template>
  <div class="main-login">
    <div class="form">
      <p class="caption">{{roleName(role)}}登录</p>
      <el-form ref="loginFormRef" :model="loginForm" @keyup.enter.native="onLoginClick">
        <el-form-item>
          <el-input v-model="loginForm.username" placeholder="账号">
            <template #prepend>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginForm.password" placeholder="密码" show-password>
            <template #prepend>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" style="width:100%;" @click="onLoginClick">登录</el-button>
      <div style="margin-top:10px;text-align:center;">
        <el-button type="primary" text @click="showRegDlg = true" v-if="role !== 'admin'">注册</el-button>
      </div>
    </div>
  </div>

  <el-dialog title="注册" v-model="showRegDlg" width="340px" @closed="onRegClosed">
    <el-form ref="regFormRef" :model="regForm" :rules="regRules">
      <el-form-item label="账&emsp;&emsp;号" prop="username">
        <el-input v-model="regForm.username" />
      </el-form-item>
      <el-form-item label="密&emsp;&emsp;码" prop="password">
        <el-input v-model="regForm.password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirm">
        <el-input v-model="regForm.confirm" />
      </el-form-item>
      <!-- <el-form-item label="&nbsp;&nbsp;&nbsp;昵&emsp;&emsp;称" prop="name">
        <el-input v-model="regForm.name" />
      </el-form-item> -->
    </el-form>
    <div style="text-align:center;">
      <el-button type="primary" @click="onRegSubmitClick">提交注册</el-button>
    </div>
  </el-dialog>
</template>

<style scoped>
  .caption {
    font-size: 24px;
    text-align: center;
    margin-bottom: 15px;
  }

  .main-login {
    background-color: var(--el-color-primary-light-3);
    min-height: 100vh;
    border: 1px solid transparent;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form {
    width: 260px;
    background-color: var(--el-color-primary-light-9);
    padding: 30px;
    border-radius: 10px;
  }
</style>