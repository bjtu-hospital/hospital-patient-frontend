<template>
  <view class="doctors-container">
    <!-- 搜索和筛选 -->
    <view class="search-section">
      <view class="search-bar">
        <Search :size="18" color="#64748b" class="search-icon" />
        <input 
          class="search-input" 
          type="text" 
          placeholder="搜索医生姓名或专长..."
          v-model="searchKeyword"
        />
        <view class="filter-btn" @tap="showFilter">
          <Filter :size="16" color="#64748b" />
        </view>
      </view>
    </view>

    <!-- 科室分类 -->
    <view class="department-tabs">
      <view 
        class="tab-item" 
        :class="{ active: selectedDept === dept.key }"
        v-for="dept in departmentTabs" 
        :key="dept.key"
        @tap="switchDepartment(dept.key)"
      >
        <text class="tab-text">{{ dept.name }}</text>
        <text class="tab-count">({{ dept.count }})</text>
      </view>
    </view>

    <!-- 医生列表 -->
    <view class="doctors-list">
      <view 
        class="doctor-card" 
        v-for="doctor in filteredDoctors" 
        :key="doctor.id"
        @tap="viewDoctorDetail(doctor)"
      >
        <view class="doctor-info">
          <view class="doctor-header">
            <view class="doctor-avatar">
              <text class="avatar-text">{{ doctor.name.charAt(0) }}</text>
            </view>
            <view class="doctor-basic">
              <text class="doctor-name">{{ doctor.name }}</text>
              <text class="doctor-title">{{ doctor.title }}</text>
              <text class="doctor-dept">{{ doctor.department }}</text>
            </view>
            <view class="doctor-level" :class="doctor.level">
              <text class="level-text">{{ getLevelText(doctor.level) }}</text>
            </view>
          </view>

          <view class="doctor-specialty">
            <text class="specialty-label">专业特长：</text>
            <text class="specialty-content">{{ doctor.specialty }}</text>
          </view>

          <view class="doctor-stats">
            <view class="stat-item">
              <text class="stat-label">出诊时间</text>
              <text class="stat-value">{{ doctor.workTime }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">挂号费</text>
              <text class="stat-value price">¥{{ doctor.price }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">今日余号</text>
              <text class="stat-value" :class="{ low: doctor.todaySlots < 5 }">
                {{ doctor.todaySlots }}
              </text>
            </view>
          </view>

          <!-- 医生介绍 -->
          <view class="doctor-intro" v-if="doctor.introduction">
            <text class="intro-label">医生简介：</text>
            <text class="intro-content">{{ doctor.introduction }}</text>
          </view>
        </view>

        <view class="doctor-actions">
          <button 
            class="appointment-btn" 
            :class="{ disabled: doctor.todaySlots === 0 }"
            @tap.stop="appointmentWithDoctor(doctor)"
          >
            {{ doctor.todaySlots > 0 ? '立即预约' : '无号源' }}
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredDoctors.length === 0">
        <Users :size="48" color="#cbd5e1" />
        <text class="empty-text">未找到相关医生</text>
        <text class="empty-desc">请尝试其他搜索条件</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Filter, Users, Star, Award } from 'lucide-vue-next'

const searchKeyword = ref('')
const selectedDept = ref('all')

// 科室标签
const departmentTabs = ref([
  { key: 'all', name: '全部', count: 15 },
  { key: 'internal', name: '内科', count: 6 },
  { key: 'surgical', name: '外科', count: 4 },
  { key: 'specialist', name: '专科', count: 5 }
])

// 医生数据
const doctors = ref([
  {
    id: 1,
    name: '张建国',
    title: '主任医师/教授',
    department: '心血管内科',
    specialty: '冠心病、心律失常、心力衰竭的诊治',
    introduction: '从事心血管内科临床工作30余年，擅长复杂心血管疾病的诊治...',
    level: 'expert',
    workTime: '周一至周五上午',
    price: 35,
    todaySlots: 3,
    category: 'internal'
  },
  {
    id: 2,
    name: '李淑华',
    title: '副主任医师',
    department: '呼吸内科',
    specialty: '呼吸系统感染、慢性阻塞性肺病',
    introduction: '具有丰富的呼吸系统疾病诊治经验...',
    level: 'senior',
    workTime: '周二、周四全天',
    price: 25,
    todaySlots: 8,
    category: 'internal'
  },
  {
    id: 3,
    name: '王明',
    title: '主治医师',
    department: '普通外科',
    specialty: '腹腔镜微创手术、疝气修补',
    introduction: '专注于微创外科技术的临床应用...',
    level: 'regular',
    workTime: '周一、周三、周五',
    price: 20,
    todaySlots: 12,
    category: 'surgical'
  },
  {
    id: 4,
    name: '陈雅丽',
    title: '主任医师',
    department: '妇科',
    specialty: '妇科肿瘤、内分泌疾病',
    introduction: '妇科疑难病症诊治专家...',
    level: 'expert',
    workTime: '周二、周四上午',
    price: 40,
    todaySlots: 5,
    category: 'specialist'
  },
  {
    id: 5,
    name: '赵光明',
    title: '副主任医师',
    department: '眼科',
    specialty: '白内障、青光眼、眼底病',
    introduction: '眼科常见病多发病诊治经验丰富...',
    level: 'senior',
    workTime: '周一至周五',
    price: 30,
    todaySlots: 0,
    category: 'specialist'
  }
])

// 过滤后的医生列表
const filteredDoctors = computed(() => {
  let filtered = doctors.value

  if (selectedDept.value !== 'all') {
    filtered = filtered.filter(doctor => doctor.category === selectedDept.value)
  }

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(doctor => 
      doctor.name.toLowerCase().includes(keyword) || 
      doctor.specialty.toLowerCase().includes(keyword) ||
      doctor.department.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 切换科室
const switchDepartment = (deptKey) => {
  selectedDept.value = deptKey
}

// 获取医生级别文本
const getLevelText = (level) => {
  const levelMap = {
    expert: '专家',
    senior: '资深',
    regular: '普通'
  }
  return levelMap[level] || level
}

// 显示筛选
const showFilter = () => {
  uni.showActionSheet({
    itemList: ['按科室筛选', '按职称筛选', '按价格筛选', '只看有号医生'],
    success: (res) => {
      uni.showToast({
        title: `筛选功能开发中`,
        icon: 'none'
      })
    }
  })
}

// 查看医生详情
const viewDoctorDetail = (doctor) => {
  uni.showModal({
    title: doctor.name,
    content: `${doctor.title}\n科室：${doctor.department}\n专长：${doctor.specialty}\n出诊：${doctor.workTime}\n挂号费：¥${doctor.price}`,
    showCancel: false,
    confirmText: '知道了'
  })
}

// 预约医生
const appointmentWithDoctor = (doctor) => {
  if (doctor.todaySlots === 0) {
    uni.showToast({
      title: '该医生今日无号源',
      icon: 'none'
    })
    return
  }

  uni.showModal({
    title: '预约' + doctor.name,
    content: `确定要预约${doctor.name} ${doctor.title}吗？\n挂号费：¥${doctor.price}`,
    success: (res) => {
      if (res.confirm) {
        // 保存医生信息
        uni.setStorageSync('selectedDoctor', doctor)
        
        // 跳转到选择时间页面
        uni.navigateTo({
          url: '/pages/appointment/select-time'
        })
      }
    }
  })
}

onMounted(() => {
  console.log('科室专家页面加载')
})
</script>

<style lang="scss" scoped>
.doctors-container {
  background: #f8fafc;
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

/* 搜索栏 - 队友风格 */
.search-section {
  margin-bottom: 24rpx;
}

.search-bar {
  background: white;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.search-bar:focus-within {
  border-color: #00BFCC;
  box-shadow: 0 0 0 3rpx rgba(0, 191, 204, 0.1);
}

.search-icon {
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #0f172a;
  background: transparent;
  border: none;
}

.filter-btn {
  padding: 12rpx;
  margin: -12rpx;
}

/* 科室标签 - 队友风格 */
.department-tabs {
  display: flex;
  background: white;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  gap: 8rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 20rpx;
  border-radius: 8rpx;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: #00BFCC;
  color: white;
}

.tab-text {
  font-size: 24rpx;
  color: #64748b;
  font-weight: 500;
}

.tab-count {
  font-size: 20rpx;
  color: #94a3b8;
  margin-left: 6rpx;
}

.tab-item.active .tab-text,
.tab-item.active .tab-count {
  color: white;
}

/* 医生列表 - 队友风格 */
.doctors-list {
  margin-bottom: 32rpx;
}

.doctor-card {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.doctor-card:active {
  background: #f8fafc;
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.doctor-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.doctor-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #00BFCC 0%, #4DD0DB 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-text {
  color: white;
  font-size: 28rpx;
  font-weight: 600;
}

.doctor-basic {
  flex: 1;
}

.doctor-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
  display: block;
  margin-bottom: 6rpx;
}

.doctor-title {
  font-size: 22rpx;
  color: #00BFCC;
  display: block;
  margin-bottom: 4rpx;
}

.doctor-dept {
  font-size: 20rpx;
  color: #64748b;
}

.doctor-level {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.doctor-level.expert {
  background: #fef3c7;
  color: #d97706;
}

.doctor-level.senior {
  background: #dbeafe;
  color: #1d4ed8;
}

.doctor-level.regular {
  background: #f3f4f6;
  color: #6b7280;
}

.doctor-specialty {
  display: flex;
  margin-bottom: 20rpx;
}

.specialty-label {
  font-size: 22rpx;
  color: #64748b;
  margin-right: 8rpx;
  white-space: nowrap;
}

.specialty-content {
  font-size: 22rpx;
  color: #374151;
  line-height: 1.4;
}

.doctor-stats {
  display: flex;
  justify-content: space-around;
  padding: 16rpx 0;
  border-top: 1rpx solid #f1f5f9;
  border-bottom: 1rpx solid #f1f5f9;
  margin-bottom: 16rpx;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 20rpx;
  color: #94a3b8;
  display: block;
  margin-bottom: 6rpx;
}

.stat-value {
  font-size: 24rpx;
  font-weight: 600;
  color: #0f172a;
}

.stat-value.price {
  color: #dc2626;
}

.stat-value.low {
  color: #f59e0b;
}

.doctor-intro {
  display: flex;
  margin-bottom: 20rpx;
}

.intro-label {
  font-size: 22rpx;
  color: #64748b;
  margin-right: 8rpx;
  white-space: nowrap;
}

.intro-content {
  font-size: 22rpx;
  color: #374151;
  line-height: 1.4;
}

.doctor-actions {
  text-align: right;
}

.appointment-btn {
  background: linear-gradient(135deg, #00BFCC 0%, #4DD0DB 100%);
  border: none;
  border-radius: 20rpx;
  padding: 16rpx 32rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: white;
  box-shadow: 0 2rpx 8rpx rgba(0, 191, 204, 0.3);
  transition: all 0.2s ease;
}

.appointment-btn:active {
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 204, 0.4);
}

.appointment-btn.disabled {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
  transform: none;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-text {
  font-size: 28rpx;
  color: #94a3b8;
  margin: 24rpx 0 12rpx;
}

.empty-desc {
  font-size: 22rpx;
  color: #cbd5e1;
}
</style>