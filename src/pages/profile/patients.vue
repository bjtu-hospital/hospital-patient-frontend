<template>
  <view class="patients-container">
    <!-- 顶部提示 -->
    <view class="tips-card">
      <view class="tip-content">
        <view class="tip-icon">
          <Info :size="16" color="#00BFCC" />
        </view>
        <text class="tip-text">为保证就诊顺利，请添加准确的就诊人信息</text>
      </view>
    </view>

    <!-- 就诊人列表 -->
    <view class="patients-list">
      <view 
        class="patient-item" 
        v-for="patient in patients" 
        :key="patient.id"
        @tap="editPatient(patient)"
      >
        <view class="patient-info">
          <view class="patient-header">
            <text class="patient-name">{{ patient.name }}</text>
            <view class="patient-tags">
              <text class="tag default" v-if="patient.isDefault">默认</text>
              <text class="tag relation">{{ patient.relation || patient.relationType }}</text>
            </view>
          </view>
          <view class="patient-details">
            <text class="detail-item" v-if="patient.identifier">学号/工号：{{ patient.identifier }}</text>
            <text class="detail-item">身份证：{{ patient.idCard || '未填写' }}</text>
            <text class="detail-item" v-if="patient.phone">手机号：{{ patient.phone }}</text>
            <text class="detail-item">关系：{{ patient.relation || patient.relationType }}</text>
          </view>
        </view>
        <view class="patient-actions">
          <view class="action-btn edit" @tap.stop="editPatient(patient)">
            <text class="btn-text">编辑</text>
          </view>
          <view class="action-btn delete" @tap.stop="deletePatient(patient)" v-if="!patient.isDefault">
            <text class="btn-text">删除</text>
          </view>
        </view>
      </view>

      <!-- 添加就诊人 -->
      <view class="add-patient-card" @tap="addPatient">
        <view class="add-content">
          <view class="add-icon">
            <Plus :size="20" color="#00BFCC" />
          </view>
          <text class="add-text">添加就诊人</text>
        </view>
        <text class="add-desc">最多可添加6个就诊人</text>
      </view>
    </view>

    <!-- 添加就诊人弹窗 -->
    <view class="modal-overlay" v-if="showAddModal" @tap="showAddModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingPatient ? '编辑就诊人' : '添加就诊人' }}</text>
          <view class="modal-close" @tap="showAddModal = false">
            <X :size="20" color="#999" />
          </view>
        </view>
        
        <view class="form-content">
          <view class="input-group">
            <text class="input-label">姓名 *</text>
            <input 
              class="input-field" 
              type="text" 
              placeholder="请输入真实姓名"
              v-model="formData.name"
            />
          </view>
          
          <view class="input-group">
            <text class="input-label">身份证号 *</text>
            <input 
              class="input-field" 
              type="text" 
              placeholder="请输入身份证号"
              v-model="formData.idCard"
            />
          </view>
          
          <view class="input-group">
            <text class="input-label">手机号</text>
            <input 
              class="input-field" 
              type="text" 
              placeholder="请输入手机号（可选）"
              v-model="formData.phone"
            />
          </view>
          
          <view class="input-group">
            <text class="input-label">与您的关系</text>
            <view class="relation-options">
              <view 
                class="relation-option" 
                :class="{ active: formData.relation === relation }"
                v-for="relation in relations" 
                :key="relation"
                @tap="formData.relation = relation"
              >
                <text class="relation-text">{{ relation }}</text>
              </view>
            </view>
          </view>
          
          <view class="checkbox-group">
            <view class="checkbox-item" @tap="formData.isDefault = !formData.isDefault">
              <view class="checkbox" :class="{ checked: formData.isDefault }">
                <Check v-if="formData.isDefault" :size="14" color="white" />
              </view>
              <text class="checkbox-text">设为默认就诊人</text>
            </view>
          </view>
        </view>
        
        <view class="modal-actions">
          <button class="cancel-btn" @tap="showAddModal = false">取消</button>
          <button class="confirm-btn" @tap="savePatient">{{ editingPatient ? '保存' : '添加' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  getPatients, 
  addPatient as addPatientApi, 
  updatePatient as updatePatientApi, 
  deletePatient as deletePatientApi 
} from '@/api/user'

// 就诊人列表
const patients = ref([])

// 关系选项
const relations = ref(['本人', '父母', '配偶', '子女', '其他'])

// 弹窗状态
const showAddModal = ref(false)
const editingPatient = ref(null)

// 表单数据
const formData = reactive({
  name: '',
  idCard: '',
  phone: '',
  relation: '本人',
  isDefault: false
})

// 获取患者类型文本
const getPatientTypeText = (type) => {
  const typeMap = {
    student: '学生',
    teacher: '教师',
    family: '家属',
    other: '其他'
  }
  return typeMap[type] || '其他'
}

// 身份证脱敏
const maskIdCard = (idCard) => {
  if (!idCard) return ''
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1****$2')
}

// 加载就诊人列表
const loadPatients = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const data = await getPatients()
    console.log('加载就诊人数据:', data)
    patients.value = data || []
    uni.hideLoading()
  } catch (error) {
    console.error('加载就诊人失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  }
}

// 添加就诊人（打开弹窗）
const addPatient = () => {
  // 检查就诊人数量限制
  if (patients.value.length >= 6) {
    uni.showToast({
      title: '最多只能添加6个就诊人',
      icon: 'none'
    })
    return
  }
  
  // 重置表单
  Object.assign(formData, {
    name: '',
    idCard: '',
    phone: '',
    relation: '本人',
    isDefault: false
  })
  editingPatient.value = null
  showAddModal.value = true
}

// 编辑就诊人（打开弹窗）
const editPatient = (patient) => {
  Object.assign(formData, {
    name: patient.name,
    idCard: patient.idCard,
    phone: patient.phone,
    relation: patient.relation || patient.relationType,
    isDefault: patient.isDefault
  })
  editingPatient.value = patient
  showAddModal.value = true
}

// 删除就诊人
const deletePatient = (patient) => {
  if (patient.isDefault) {
    uni.showToast({
      title: '默认就诊人不能删除',
      icon: 'none'
    })
    return
  }
  
  uni.showModal({
    title: '删除就诊人',
    content: `确定要删除就诊人"${patient.name}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          await deletePatientApi(patient.id)
          uni.hideLoading()
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          // 重新加载数据
          loadPatients()
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          })
        }
      }
    }
  })
}

// 保存就诊人
const savePatient = async () => {
  // 表单验证
  if (!formData.name.trim()) {
    uni.showToast({ title: '请输入姓名', icon: 'none' })
    return
  }
  if (!formData.idCard.trim()) {
    uni.showToast({ title: '请输入身份证号', icon: 'none' })
    return
  }
  // 简单验证身份证号格式
  if (!/^\d{17}[\dXx]$/.test(formData.idCard)) {
    uni.showToast({ title: '身份证号格式不正确', icon: 'none' })
    return
  }
  // 验证手机号格式（如果填写了手机号）
  if (formData.phone.trim() && !/^1[3-9]\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: editingPatient.value ? '保存中...' : '添加中...' })
    
    // 构建请求数据，将relation映射为relationType
    const requestData = {
      name: formData.name,
      idCard: formData.idCard,
      phone: formData.phone,
      relationType: formData.relation,  // 映射字段名
      isDefault: formData.isDefault
    }
    
    if (editingPatient.value) {
      // 编辑现有就诊人
      await updatePatientApi(editingPatient.value.id, requestData)
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      // 添加新就诊人
      console.log('添加就诊人数据:', requestData)
      await addPatientApi(requestData)
      uni.showToast({ title: '添加成功', icon: 'success' })
    }
    
    uni.hideLoading()
    showAddModal.value = false
    
    // 重新加载数据
    await loadPatients()
    
  } catch (error) {
    console.error('保存就诊人失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: error.message || '操作失败',
      icon: 'none'
    })
  }
}

onMounted(() => {
  console.log('就诊人管理页面加载')
  loadPatients()
})
</script>

<style lang="scss" scoped>
.patients-container {
  background: #f8fafc;
  min-height: 100vh;
  padding: 24rpx;
}

/* 顶部提示 */
.tips-card {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.tip-content {
  display: flex;
  align-items: center;
}

.tip-icon {
  margin-right: 12rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #475569;
  line-height: 1.4;
}

/* 就诊人列表 */
.patients-list {
  margin-bottom: 32rpx;
}

.patient-item {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid #e2e8f0;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.2s ease;
}

.patient-item:active {
  background: #f8fafc;
  transform: translateY(-1rpx);
}

.patient-info {
  flex: 1;
}

.patient-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.patient-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #0f172a;
}

.patient-tags {
  display: flex;
  gap: 8rpx;
}

.tag {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 500;
}

.tag.default {
  background: #00BFCC;
  color: white;
}

.tag.student {
  background: #dbeafe;
  color: #1d4ed8;
}

.tag.family {
  background: #dcfce7;
  color: #16a34a;
}

.patient-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.detail-item {
  font-size: 22rpx;
  color: #64748b;
}

.patient-actions {
  display: flex;
  gap: 16rpx;
  margin-left: 24rpx;
}

.action-btn {
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn.edit {
  background: #f0fdff;
  border: 1rpx solid #00BFCC;
}

.action-btn.edit .btn-text {
  color: #00BFCC;
  font-size: 24rpx;
  font-weight: 500;
}

.action-btn.delete {
  background: #fef2f2;
  border: 1rpx solid #ef4444;
}

.action-btn.delete .btn-text {
  color: #ef4444;
  font-size: 24rpx;
  font-weight: 500;
}

.action-btn:active {
  transform: scale(0.95);
}

/* 添加就诊人卡片 */
.add-patient-card {
  background: white;
  border: 2rpx dashed #cbd5e1;
  border-radius: 12rpx;
  padding: 32rpx;
  text-align: center;
  transition: all 0.2s ease;
}

.add-patient-card:active {
  background: #f8fafc;
  border-color: #00BFCC;
}

.add-content {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.add-icon {
  margin-right: 12rpx;
}

.add-text {
  font-size: 26rpx;
  color: #00BFCC;
  font-weight: 500;
}

.add-desc {
  font-size: 22rpx;
  color: #94a3b8;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.modal-content {
  background: white;
  border-radius: 16rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: 32rpx;
  border-bottom: 1rpx solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.modal-close {
  padding: 8rpx;
}

.form-content {
  padding: 32rpx;
}

.input-group {
  margin-bottom: 24rpx;
}

.input-label {
  font-size: 26rpx;
  color: #374151;
  margin-bottom: 12rpx;
  display: block;
  font-weight: 500;
}

.input-field {
  width: 100%;
  height: 80rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #0f172a;
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #00BFCC;
  background: white;
  box-shadow: 0 0 0 3rpx rgba(0, 191, 204, 0.1);
}

.relation-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.relation-option {
  padding: 16rpx 24rpx;
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  border-radius: 20rpx;
  transition: all 0.2s ease;
}

.relation-option.active {
  background: #00BFCC;
  border-color: #00BFCC;
}

.relation-text {
  font-size: 24rpx;
  color: #64748b;
}

.relation-option.active .relation-text {
  color: white;
}

.checkbox-group {
  margin-top: 32rpx;
}

.checkbox-item {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #cbd5e1;
  border-radius: 6rpx;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox.checked {
  background: #00BFCC;
  border-color: #00BFCC;
}

.checkbox-text {
  font-size: 26rpx;
  color: #374151;
}

.modal-actions {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f1f5f9;
  display: flex;
  gap: 16rpx;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-btn {
  background: #f8fafc;
  border: 1rpx solid #e2e8f0;
  color: #64748b;
}

.confirm-btn {
  background: linear-gradient(135deg, #00BFCC 0%, #4DD0DB 100%);
  border: none;
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 204, 0.3);
}

.cancel-btn:active {
  background: #f1f5f9;
}

.confirm-btn:active {
  transform: translateY(-1rpx);
  box-shadow: 0 6rpx 16rpx rgba(0, 191, 204, 0.4);
}
</style>