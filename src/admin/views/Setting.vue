<template>
  <div class="form" v-loading="loading">
    <el-input v-model="form.api_key">
      <template #prepend>API调用秘钥</template>
    </el-input>
    <el-input v-model="form.api_interval">
      <template #prepend>API调用间隔（秒）</template>
    </el-input>
    <el-input v-model="form.api_day_limit">
      <template #prepend>API调用次数（日）</template>
    </el-input>
    <el-input v-model="form.commission_level_1">
      <template #prepend>佣金比例（%）</template>
    </el-input>
    <el-input v-model="form.service_charge">
      <template #prepend>合作商手续费（%）</template>
    </el-input>
    <el-input v-model="form.max_buy_times">
      <template #prepend>最大购买次数</template>
    </el-input>
    <el-input v-model="form.min_withdraw">
      <template #prepend>最低提现佣金</template>
    </el-input>
    <el-input v-model="form.min_exchange">
      <template #prepend>最低兑换佣金</template>
    </el-input>
    <el-input v-model="form.entrance_status_0">
      <template #prepend>群码未验证价格</template>
    </el-input>
    <el-input v-model="form.entrance_work_joinable">
      <template #prepend>群码企微能进加价</template>
    </el-input>
    <el-input v-model="form.entrance_has_location">
      <template #prepend>群码地区属性加价</template>
    </el-input>
    <el-input v-model="form.qrcode_decode_price">
      <template #prepend>活码解析服务费</template>
    </el-input>
  </div>
  <el-button type="primary" style="width:140px;" @click="onSaveClick">保存</el-button>
</template>

<script setup>
  import { ElMessage } from 'element-plus';
  import { reactive, ref, getCurrentInstance, onMounted } from 'vue'

  const { proxy } = getCurrentInstance()
  const axios = proxy.axios

  const form = reactive({
    api_key: null,
    api_interval: null,
    api_day_limit: null,
    commission_level_1: null,
    // entrance_price: null,
    qrcode_decode_price: null,
    entrance_status_0: null,
    entrance_has_location: null,
    entrance_work_joinable: null,
    max_buy_times: null,
    min_withdraw: null,
    min_exchange: null,
    service_charge: null
  })

  const loading = ref(false)

  onMounted(() => {
    loading.value = true
    axios.get('admin/setting/index').then(({ data }) => {
      form.api_key = data.api_key.str_val
      form.api_interval = data.api_interval.int_val
      form.api_day_limit = data.api_day_limit.int_val
      form.commission_level_1 = data.commission_level_1.int_val
      form.qrcode_decode_price = data.qrcode_decode_price.int_val
      form.entrance_status_0 = data.entrance_status_0.int_val
      form.entrance_has_location = data.entrance_has_location.int_val
      form.entrance_work_joinable = data.entrance_work_joinable.int_val
      form.max_buy_times = data.max_buy_times.int_val
      form.min_withdraw = data.min_withdraw.int_val
      form.min_exchange = data.min_exchange.int_val
      form.service_charge = data.service_charge.int_val
    }).catch(() => { }).finally(() => {
      loading.value = false
    })
  })

  function onSaveClick () {
    axios.post('admin/setting/save', form).then(() => {
      ElMessage.success('已保存')
    }).catch(() => { })
  }
</script>

<style scoped>
  .form>* {
    margin-bottom: 15px;
  }

  :deep(.el-input-group__prepend) {
    width: 120px;
    text-align: left;
    justify-content: flex-start;
  }
</style>