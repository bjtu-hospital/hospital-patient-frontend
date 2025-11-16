<template>
  <view class="basic-info-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <uni-icons type="left" size="24" color="#1f2937"></uni-icons>
      </view>
      <text class="navbar-title">基本信息</text>
      <view class="navbar-right"></view>
    </view>

    <!-- 编辑表单 -->
    <view class="form-container">
      <!-- 身高 -->
      <view class="form-group">
        <view class="form-label">
          <text class="label-text">身高</text>
          <text class="label-unit">cm</text>
        </view>
        <view class="form-input-wrapper">
          <input 
            v-model="formData.height" 
            type="number" 
            placeholder="请输入身高"
            class="form-input"
          />
        </view>
      </view>

      <!-- 体重 -->
      <view class="form-group">
        <view class="form-label">
          <text class="label-text">体重</text>
          <text class="label-unit">kg</text>
        </view>
        <view class="form-input-wrapper">
          <input 
            v-model="formData.weight" 
            type="number" 
            placeholder="请输入体重"
            class="form-input"
          />
        </view>
      </view>

      <!-- BMI 显示 -->
      <view class="bmi-card">
        <view class="bmi-header">
          <text class="bmi-title">BMI 指数</text>
          <text class="bmi-value" :class="bmiStatus">{{ bmiValue }}</text>
        </view>
        <view class="bmi-info">
          <text class="bmi-status">{{ bmiStatusText }}</text>
          <text class="bmi-range">正常范围：18.5 - 24.9</text>
        </view>
      </view>

      <!-- 血型 -->
      <view class="form-group">
        <view class="form-label">
          <text class="label-text">血型</text>
        </view>
        <view class="blood-type-selector">
          <view 
            v-for="type in bloodTypes" 
            :key="type"
            class="blood-type-btn"
            :class="{ active: formData.bloodType === type }"
            @tap="formData.bloodType = type"
          >
            {{ type }}
          </view>
        </view>
      </view>

      <!-- 过敏史 -->
      <view class="form-group">
        <view class="form-label">
          <text class="label-text">过敏史</text>
          <text class="label-optional">（可多选）</text>
        </view>
        <view class="allergy-selector">
          <view 
            v-for="allergy in allergyOptions" 
            :key="allergy"
            class="allergy-chip"
            :class="{ active: formData.allergies.includes(allergy) }"
            @tap="toggleAllergy(allergy)"
          >
            {{ allergy }}
          </view>
        </view>
        <view class="custom-allergy">
          <input 
            v-model="customAllergy" 
            type="text" 
            placeholder="其他过敏源"
            class="form-input"
            @confirm="addCustomAllergy"
          />
          <button class="add-btn" @tap="addCustomAllergy">
            <uni-icons type="plus" size="18" color="white"></uni-icons>
          </button>
        </view>
      </view>

      <!-- 慢性病史 -->
      <view class="form-group">
        <view class="form-label">
          <text class="label-text">慢性病史</text>
          <text class="label-optional">（可多选）</text>
        </view>
        <view class="disease-selector">
          <view 
            v-for="disease in diseaseOptions" 
            :key="disease"
            class="disease-chip"
            :class="{ active: formData.chronicDiseases.includes(disease) }"
            @tap="toggleDisease(disease)"
          >
            {{ disease }}
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-group">
        <view class="form-label">
          <text class="label-text">备注</text>
          <text class="label-optional">（可选）</text>
        </view>
        <textarea 
          v-model="formData.notes" 
          placeholder="添加其他健康信息"
          class="form-textarea"
          maxlength="200"
        ></textarea>
        <text class="textarea-count">{{ formData.notes.length }}/200</text>
      </view>

      <!-- 最后更新时间 -->
      <view class="update-time">
        <text>最后更新：{{ lastUpdateTime }}</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-actions">
      <button class="btn btn-cancel" @tap="goBack">取消</button>
      <button class="btn btn-save" @tap="saveInfo">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const formData = ref({
  height: 175,
  weight: 70,
  bloodType: 'A型',
  allergies: ['青霉素'],
  chronicDiseases: [],
  notes: ''
})

const customAllergy = ref('')
const lastUpdateTime = ref('2024-11-15')

const bloodTypes = ['A型', 'B型', 'AB型', 'O型']
const allergyOptions = ref(['青霉素', '头孢', '阿司匹林', '海鲜', '花生'])
const diseaseOptions = ['高血压', '糖尿病', '冠心病', '哮喘', '甲状腺疾病']

// 计算属性
const bmiValue = computed(() => {
  if (!formData.value.height || !formData.value.weight) return '--'
  const height = formData.value.height / 100
  const bmi = (formData.value.weight / (height * height)).toFixed(1)
  return bmi
})

const bmiStatus = computed(() => {
  const bmi = parseFloat(bmiValue.value)
  if (isNaN(bmi)) return 'normal'
  if (bmi < 18.5) return 'low'
  if (bmi <= 24.9) return 'normal'
  if (bmi <= 29.9) return 'high'
  return 'very-high'
})

const bmiStatusText = computed(() => {
  const statusMap = {
    low: '偏瘦',
    normal: '正常',
    high: '超重',
    'very-high': '肥胖'
  }
  return statusMap[bmiStatus.value] || '未知'
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const toggleAllergy = (allergy) => {
  const index = formData.value.allergies.indexOf(allergy)
  if (index > -1) {
    formData.value.allergies.splice(index, 1)
  } else {
    formData.value.allergies.push(allergy)
  }
}

const addCustomAllergy = () => {
  if (customAllergy.value.trim()) {
    if (!allergyOptions.value.includes(customAllergy.value)) {
      allergyOptions.value.push(customAllergy.value)
    }
    if (!formData.value.allergies.includes(customAllergy.value)) {
      formData.value.allergies.push(customAllergy.value)
    }
    customAllergy.value = ''
  }
}

const toggleDisease = (disease) => {
  const index = formData.value.chronicDiseases.indexOf(disease)
  if (index > -1) {
    formData.value.chronicDiseases.splice(index, 1)
  } else {
    formData.value.chronicDiseases.push(disease)
  }
}

const saveInfo = () => {
  // 验证
  if (!formData.value.height || !formData.value.weight) {
    uni.showToast({
      title: '请填写身高和体重',
      icon: 'none'
    })
    return
  }

  if (formData.value.height < 50 || formData.value.height > 250) {
    uni.showToast({
      title: '身高范围应为 50-250 cm',
      icon: 'none'
    })
    return
  }

  if (formData.value.weight < 20 || formData.value.weight > 200) {
    uni.showToast({
      title: '体重范围应为 20-200 kg',
      icon: 'none'
    })
    return
  }

  // 保存到本地存储
  uni.setStorageSync('basicHealthInfo', {
    ...formData.value,
    lastUpdated: new Date().toISOString()
  })

  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })

  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

onMounted(() => {
  // 从本地存储加载数据
  const savedData = uni.getStorageSync('basicHealthInfo')
  if (savedData) {
    formData.value = {
      ...formData.value,
      ...savedData
    }
    lastUpdateTime.value = new Date(savedData.lastUpdated).toLocaleDateString('zh-CN')
  }
})
</script>

<style lang="scss" scoped>
$hospital-primary: #00BFCC;
$color-slate-50: #f8fafc;
$color-slate-100: #f1f5f9;
$color-slate-200: #e2e8f0;
$color-slate-300: #cbd5e1;
$color-slate-600: #475569;
$color-slate-900: #0f172a;
$spacing-sm: 8rpx;
$spacing-md: 16rpx;
$spacing-lg: 24rpx;
$border-radius-base: 12rpx;
$box-shadow-base: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

.basic-info-container {
  background: $color-slate-50;
  min-height: 100vh;
  padding-bottom: 120rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  background: white;
  padding: 16rpx $spacing-md;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid $color-slate-200;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left,
.navbar-right {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6rpx;
  transition: all 0.2s ease;

  &:active {
    background: $color-slate-100;
  }
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $color-slate-900;
}

/* 表单容器 */
.form-container {
  padding: $spacing-lg $spacing-md;
}

.form-group {
  background: white;
  border-radius: $border-radius-base;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $box-shadow-base;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-bottom: $spacing-md;
}

.label-text {
  font-size: 26rpx;
  font-weight: 600;
  color: $color-slate-900;
}

.label-unit {
  font-size: 22rpx;
  color: $color-slate-600;
}

.label-optional {
  font-size: 22rpx;
  color: $color-slate-600;
}

/* 输入框 */
.form-input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  height: 48rpx;
  padding: 12rpx $spacing-md;
  border: 1rpx solid $color-slate-200;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: $color-slate-900;
  background: $color-slate-50;
  transition: all 0.2s ease;

  &:focus {
    border-color: $hospital-primary;
    background: white;
  }
}

/* BMI 卡片 */
.bmi-card {
  background: linear-gradient(135deg, $hospital-primary 0%, #00a8b8 100%);
  border-radius: $border-radius-base;
  padding: $spacing-lg;
  color: white;
  margin-bottom: $spacing-lg;
}

.bmi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.bmi-title {
  font-size: 26rpx;
  font-weight: 600;
}

.bmi-value {
  font-size: 40rpx;
  font-weight: 700;

  &.low,
  &.high,
  &.very-high {
    color: #fbbf24;
  }
}

.bmi-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.bmi-status {
  font-size: 24rpx;
  opacity: 0.9;
}

.bmi-range {
  font-size: 22rpx;
  opacity: 0.8;
}

/* 血型选择 */
.blood-type-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
}

.blood-type-btn {
  padding: 12rpx;
  border: 2rpx solid $color-slate-200;
  border-radius: 8rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  color: $color-slate-600;
  background: white;
  transition: all 0.2s ease;

  &.active {
    border-color: $hospital-primary;
    background: rgba(0, 191, 204, 0.1);
    color: $hospital-primary;
  }

  &:active {
    transform: scale(0.95);
  }
}

/* 过敏史选择 */
.allergy-selector,
.disease-selector {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.allergy-chip,
.disease-chip {
  padding: 8rpx 16rpx;
  border: 2rpx solid $color-slate-200;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: $color-slate-600;
  background: white;
  transition: all 0.2s ease;

  &.active {
    border-color: $hospital-primary;
    background: rgba(0, 191, 204, 0.1);
    color: $hospital-primary;
  }

  &:active {
    transform: scale(0.95);
  }
}

/* 自定义过敏源 */
.custom-allergy {
  display: flex;
  gap: $spacing-md;
}

.custom-allergy .form-input {
  flex: 1;
}

.add-btn {
  width: 48rpx;
  height: 48rpx;
  background: $hospital-primary;
  border: none;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

/* 文本框 */
.form-textarea {
  width: 100%;
  min-height: 100rpx;
  padding: $spacing-md;
  border: 1rpx solid $color-slate-200;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: $color-slate-900;
  background: $color-slate-50;
  font-family: inherit;
  resize: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: $hospital-primary;
    background: white;
  }
}

.textarea-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: $color-slate-600;
  margin-top: 6rpx;
}

/* 更新时间 */
.update-time {
  text-align: center;
  padding: $spacing-lg;
  font-size: 22rpx;
  color: $color-slate-600;
}

/* 底部按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: $spacing-md;
  border-top: 1rpx solid $color-slate-200;
  display: flex;
  gap: $spacing-md;
}

.btn {
  flex: 1;
  height: 56rpx;
  border: none;
  border-radius: $border-radius-base;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;

  &:active {
    transform: translateY(2rpx);
  }
}

.btn-cancel {
  background: white;
  color: $color-slate-600;
  border: 2rpx solid $color-slate-200;
}

.btn-save {
  background: linear-gradient(135deg, $hospital-primary 0%, #00a8b8 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 204, 0.3);

  &:active {
    box-shadow: 0 2rpx 8rpx rgba(0, 191, 204, 0.2);
  }
}
</style>
