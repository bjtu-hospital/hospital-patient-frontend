<template>
  <view class="edit-basic-info">
    <view class="form-container">
      <uni-forms ref="form" :modelValue="formData" :rules="rules">
        <uni-forms-item label="姓名" name="name">
          <uni-easyinput v-model="formData.name" placeholder="请输入姓名" />
        </uni-forms-item>
        <uni-forms-item label="性别" name="gender">
          <uni-data-checkbox v-model="formData.gender" :localdata="genderOptions" />
        </uni-forms-item>
        <uni-forms-item label="年龄" name="age">
          <uni-easyinput type="number" v-model="formData.age" placeholder="请输入年龄" />
        </uni-forms-item>
        <uni-forms-item label="身高(cm)" name="height">
          <uni-easyinput type="number" v-model="formData.height" placeholder="请输入身高" />
        </uni-forms-item>
        <uni-forms-item label="体重(kg)" name="weight">
          <uni-easyinput type="number" v-model="formData.weight" placeholder="请输入体重" />
        </uni-forms-item>
        <uni-forms-item label="手机号" name="phone">
          <uni-easyinput v-model="formData.phone" placeholder="请输入手机号" />
        </uni-forms-item>
        <uni-forms-item label="身份证号" name="idCard">
          <uni-easyinput v-model="formData.idCard" placeholder="请输入身份证号" />
        </uni-forms-item>
        <uni-forms-item label="地址" name="address">
          <uni-easyinput type="textarea" v-model="formData.address" placeholder="请输入居住地址" />
        </uni-forms-item>
      </uni-forms>
      
      <button class="submit-btn" @tap="submit">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  name: '',
  gender: '男',
  age: '',
  height: '',
  weight: '',
  phone: '',
  idCard: '',
  address: ''
})

const genderOptions = [
  { text: '男', value: '男' },
  { text: '女', value: '女' }
]

const rules = {
  name: { rules: [{ required: true, errorMessage: '请输入姓名' }] },
  phone: { rules: [{ required: true, errorMessage: '请输入手机号' }] }
}

const submit = () => {
  // TODO: 调用保存接口
  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style lang="scss" scoped>
.edit-basic-info {
  padding: 24rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  
  .form-container {
    background: white;
    padding: 32rpx;
    border-radius: 16rpx;
  }
  
  .submit-btn {
    margin-top: 48rpx;
    background-color: #00BFCC;
    color: white;
    border-radius: 44rpx;
    font-size: 32rpx;
    
    &:active {
      opacity: 0.9;
    }
  }
}
</style>