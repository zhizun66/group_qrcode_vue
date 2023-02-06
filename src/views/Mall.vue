<template>
  <div class="common-main">
    <div class="common-header">
      <div class="common-filter">
        <el-button type="primary" plain :icon="ShoppingCart" @click="onBatchAddtoCartClick"
          :disabled="!isBatchAddButtonEnabled">批量加入购物车</el-button>
        <el-input placeholder="群名" clearable v-model="filter.group_name"></el-input>
        <el-input placeholder="企业" clearable v-model="filter.company"></el-input>
        <!-- <el-select placeholder="标签" multiple clearable collapse-tags v-model="filter.tags">
          <el-option v-for="tag of tags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </el-select> -->
        <!-- <elui-china-area-dht placeholder="地区" isall clearable v-model="filter.area"></elui-china-area-dht> -->

        <!-- <el-input placeholder="备注" clearable v-model="filter.remark"></el-input> -->
        <el-select placeholder="群类型" clearable v-model="filter.type">
          <el-option label="企微" :value="1" />
          <el-option label="个微" :value="2" />
        </el-select>
        <el-select placeholder="企微可进" v-model="filter.joinable" v-if="filter.type !== 2">
          <el-option label="未知" :value="0" />
          <el-option label="正常" :value="1" />
          <el-option label="拒绝" :value="2" />
        </el-select>
        <div class="common-filter-buttons">
          <el-button :icon="Search" @click="onFilterClick">查询</el-button>
          <el-button :icon="Refresh" @click="onRefreshClick">刷新</el-button>
        </div>
      </div>
      <div class="common-action">
        <el-button type="primary" :icon="ShoppingCart" @click="onBatchBuyClick" :disabled="cart.length === 0">
          购买群码（{{cart.length}}）</el-button>
      </div>
    </div>
    <div class="common-content">
      <el-table :data="tableData" ref="mainTableRef" @selection-change="onSelectChange" v-loading="tableLoading"
        height="100%">
        <el-table-column type="selection" width="30" :selectable="selectable" />
        <el-table-column label="群名称" width="300">
          <template #default="props">
            <div class="avatar">
              <img :src="props.row.avatar ?? 'http://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'" />
              <span>{{props.row.name ?? '(未命名)'}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="成员数量" align="center">
          <template #default="scope">{{scope.row.members === null ? '--' : scope.row.members}}</template>
        </el-table-column>
        <el-table-column label="企业" prop="company" :formatter="cellFormatter" />
        <!-- <el-table-column label="地区" prop="area" :formatter="areaFormatter" /> -->
        <!-- <el-table-column label="备注" prop="remark" :formatter="cellFormatter" /> -->
        <!-- <el-table-column label="标签" min-width="120">
          <template #default="scope">
            <el-tag style="margin:2px;" v-for="tag of scope.row.tags" :key="tag" v-if="scope.row.tags.length > 0">
              {{tag}}</el-tag>
            <span v-else>--</span>
          </template>
        </el-table-column> -->
        <el-table-column label="类型" width="80">
          <template #default="scope">{{scope.row.type === 1 ? '企微' : '个微'}}</template>
        </el-table-column>
        <!-- <el-table-column label="价格" align="center">
          <template #default="scope">{{scope.row.price}} 金币</template>
        </el-table-column> -->
        <!-- <el-table-column label="企微可进" align="center">
          <template #default="scope">{{ ['未知', '正常', '拒绝'][scope.row.joinable] }}</template>
        </el-table-column> -->
        <el-table-column label="企微可进" width="100px" align="center" class-name="joinable">
          <template #default="scope">
            <span style="margin-right:3px;"
              :style="{color: ['var(--el-color-warning)', 'var(--el-color-success)',  'var(--el-color-info)'][scope.row.joinable_wc]}">{{['未知',
              '正常', '拒绝'][scope.row.joinable_wc]}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="销量" align="center" prop="buy_cnt"></el-table-column> -->
        <el-table-column label="到期时间" prop="expire_date" align="center" width="160" :formatter="cellFormatter" />
        <el-table-column label="验证时间" prop="update_time" align="center" width="160" :formatter="cellFormatter" />
        <el-table-column label="添加时间" prop="add_time" align="center" width="160" :formatter="cellFormatter" />
        <el-table-column label="操作" width="160" align="center">
          <template #default="props">
            <el-button :type="cartType(props.row)" plain :icon="ShoppingCart"
              @click="props.row.isInCart ? onRemoveFromCartClick(props.row) : onAddToCartClick(props.row)"
              :disabled="props.row.bought === 1">{{cartText(props.row)}}</el-button>

            <!-- <el-button :type="cartType(props.row)" plain :icon="ShoppingCart"
              @click="props.row.isInCart ? onRemoveFromCartClick(props.row) : onAddToCartClick(props.row)"
              :disabled="props.row.bought === 1" v-if="filter.bought === 0">{{cartText(props.row)}}</el-button>
            <el-button :type="props.row.isInDownloadList ? 'warning' : 'primary'"
              :icon="props.row.isInDownloadList ? Minus : Plus" plain
              @click="props.row.isInDownloadList ? onRemoveFromDownloadClick(props.row) : onAddToDownloadClick(props.row)"
              v-else>{{props.row.isInDownloadList ? '移出下载' : '加入下载'}}</el-button> -->
          </template>
        </el-table-column>
        <template #append>
          <div style="margin:10px 0 0 10px;">
            <el-button type="primary" plain :icon="ShoppingCart" @click="onBatchAddtoCartClick"
              :disabled="!isBatchAddButtonEnabled">批量加入购物车</el-button>
          </div>
          <!-- <div style="margin:10px 0 0 10px;">
            <el-button type="primary" plain :icon="ShoppingCart" @click="onBatchAddtoCartClick"
              :disabled="!isBatchAddButtonEnabled" v-if="filter.bought === 0">批量加入购物车</el-button>
            <el-button type="primary" plain :icon="Plus" :disabled="!isBatchAddButtonEnabled"
              @click="onBatchAddToDownloadClick" v-else>批量加入下载</el-button>
          </div> -->
        </template>
      </el-table>
    </div>
    <div class="common-pagination" style="position:relative;">
      <el-pagination background layout="total,prev,pager,next" :default-page-size="pagination.pageSize"
        v-model:current-page="pagination.page" :total="pagination.total" />
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, onMounted, getCurrentInstance, watch, computed } from 'vue'
  import { toRaw } from '@vue/reactivity'
  import { Search, Refresh, ShoppingCart, Plus, Minus } from '@element-plus/icons-vue'
  import { EluiChinaAreaDht } from 'elui-china-area-dht'
  import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

  const vm = getCurrentInstance()
  const axios = vm.proxy.axios

  // 查询参数
  const filter = reactive({
    company: '',
    group_name: '',
    // bought: 0,
    type: null,
    joinable_wc: null
  })

  // 标签
  // const tags = ref([])

  // 列表数据
  const tableData = ref([])

  // 分页数据
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0
  })

  watch(() => pagination.page, (newValue, oldValue) => {
    loadData()
  })

  const tableLoading = ref(false)

  // 加载数据
  const loadData = () => {
    tableLoading.value = true
    axios.post('index/mall/index', filter, {
      params: {
        page: pagination.page
      }
    }).then(({ data }) => {
      tableData.value = data.data.map((item) => {
        // 标记已加购
        for (let c of cart.value) {
          if (c.id === item.id) {
            item.isInCart = true
            break
          }
        }
        return item
      })

      qrImgPreviewList.value = data.data.reduce((prev, curr) => {
        if (curr.im) {
          prev.push(curr.im)
        }
        return prev
      }, [])

      pagination.pageSize = data.page_size
      pagination.total = data.total
    }).catch(() => {

    }).finally(() => {
      tableLoading.value = false
    })
  }

  onMounted(() => {
    // axios.get('index/common/tags').then(({ data }) => {
    //   tags.value = data
    // })
    loadData()
  })

  // 地区改变
  const chinaData = new EluiChinaAreaDht.ChinaArea().chinaAreaflat

  // 购物车
  const cart = ref([])

  const mainTableRef = ref()
  const onAddToCartClick = (row) => {
    const o = cart.value.find((item) => {
      return item.id === row.id
    })
    if (o) {
      ElNotification.warning(row.name + ' 已在购物车中')
    } else {
      cart.value.push(toRaw(row))
      row.isInCart = true
      mainTableRef.value.toggleRowSelection(row, false)
    }
  }
  const onRemoveFromCartClick = (row) => {
    row.isInCart = false
    const index = cart.value.findIndex((item) => {
      return item.id === row.id
    })
    cart.value.splice(index, 1)

  }

  // 批量加入购物车
  const onBatchAddtoCartClick = () => {
    const rows = mainTableRef.value.getSelectionRows()
    console.log(rows)
    rows.forEach((row) => {
      onAddToCartClick(row)
    })
  }

  const selectable = (row, index) => {
    return !row.isInCart
  }


  const isBatchAddButtonEnabled = ref(false)
  const onSelectChange = (selection) => {
    isBatchAddButtonEnabled.value = selection.length > 0
  }

  // 查询
  const onFilterClick = () => {
    pagination.page = 1
    loadData()
  }

  // 刷新
  const onRefreshClick = () => {
    loadData()
  }

  // computed
  const cartText = computed(() => (row) => {
    if (row.bought === 1) {
      return '您已经购买'
    }
    if (row.isInCart) {
      return '移出购物车';
    } else {
      return '加入购物车'
    }
  })
  const cartType = computed(() => (row) => {
    if (row.bought === 1) {
      return 'success'
    }
    if (row.isInCart) {
      return 'warning';
    } else {
      return 'primary'
    }
  })

  // 购买
  const onBatchBuyClick = () => {
    const totalPrice = cart.value.reduce((prev, curr) => {
      return prev + curr.price
    }, 0)
    const entranceIdArr = cart.value.map((item) => {
      return item.id
    })
    ElMessageBox.confirm(`确认支付 ${totalPrice} 金币？`, '购买', { type: 'warning' }).then(() => {
      axios.post('index/mall/buy', { eids: entranceIdArr }).then(() => {
        ElMessageBox.alert('购买成功！', '提示', { type: 'success' }).finally(() => {
          location.reload()
        });
      }).catch(() => { })
    }).catch(() => { })
  }

  // 预览图片
  const qrImgPreviewList = ref([])

  function areaFormatter (_row, _column, cellValue, _index) {
    if (!cellValue) {
      return '--'
    }
    let [a, b, c] = cellValue
    const d = [chinaData[a]?.label, chinaData[b]?.label, chinaData[c]?.label].filter(item => item)
    return d.length === 0 ? '--' : d.join('/')
  }

  function cellFormatter (_row, _column, cellValue, _index) {
    return cellValue?.length ? cellValue : '--'
  }

</script>

<style scoped>
  .common-filter .el-radio-group {
    width: auto;
  }

  .el-table {
    border-radius: 8px;
  }

  .avatar {
    display: flex;
    align-items: center;
  }

  .avatar img {
    width: 40px;
    height: 40px;
    margin-right: 8px;
  }
</style>