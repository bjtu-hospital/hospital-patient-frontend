/**
 * 预约状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppointmentStore = defineStore('appointment', () => {
  // State - 预约流程中的临时数据
  const selectedHospital = ref(null)
  const selectedDepartment = ref(null)
  const selectedDoctor = ref(null)
  const selectedSchedule = ref(null)
  const selectedPatient = ref(null)
  
  // State - 预约列表
  const appointments = ref([])

  // State - 改约流程
  const rescheduleContext = ref(uni.getStorageSync('rescheduleContext') || null)
  const rescheduleSelectedSchedule = ref(uni.getStorageSync('rescheduleSelectedSchedule') || null)
  
  // Actions
  
  /**
   * 设置选中的医院
   */
  const setSelectedHospital = (hospital) => {
    selectedHospital.value = hospital
    uni.setStorageSync('selectedHospital', hospital)
  }
  
  /**
   * 设置选中的科室
   */
  const setSelectedDepartment = (department) => {
    selectedDepartment.value = department
    uni.setStorageSync('selectedDepartment', department)
  }
  
  /**
   * 设置选中的医生
   */
  const setSelectedDoctor = (doctor) => {
    selectedDoctor.value = doctor
    uni.setStorageSync('selectedDoctor', doctor)
  }
  
  /**
   * 设置选中的排班
   */
  const setSelectedSchedule = (schedule) => {
    selectedSchedule.value = schedule
    uni.setStorageSync('selectedSchedule', schedule)
  }
  
  /**
   * 设置选中的就诊人
   */
  const setSelectedPatient = (patient) => {
    selectedPatient.value = patient
  }
  
  /**
   * 清空预约流程数据
   */
  const clearAppointmentData = () => {
    selectedHospital.value = null
    selectedDepartment.value = null
    selectedDoctor.value = null
    selectedSchedule.value = null
    selectedPatient.value = null
    
    uni.removeStorageSync('selectedHospital')
    uni.removeStorageSync('selectedDepartment')
    uni.removeStorageSync('selectedDoctor')
    uni.removeStorageSync('selectedSchedule')
  }

  /**
   * 设置改约上下文
   */
  const setRescheduleContext = (context) => {
    rescheduleContext.value = context
    if (context) {
      uni.setStorageSync('rescheduleContext', context)
    } else {
      uni.removeStorageSync('rescheduleContext')
    }
  }

  /**
   * 设置改约选择的排班
   */
  const setRescheduleSelectedSchedule = (schedule) => {
    rescheduleSelectedSchedule.value = schedule
    if (schedule) {
      uni.setStorageSync('rescheduleSelectedSchedule', schedule)
    } else {
      uni.removeStorageSync('rescheduleSelectedSchedule')
    }
  }

  /**
   * 清空改约数据
   */
  const clearRescheduleData = () => {
    rescheduleContext.value = null
    rescheduleSelectedSchedule.value = null
    uni.removeStorageSync('rescheduleContext')
    uni.removeStorageSync('rescheduleSelectedSchedule')
  }

  /**
   * 恢复改约数据
   */
  const restoreRescheduleData = () => {
    rescheduleContext.value = uni.getStorageSync('rescheduleContext') || null
    rescheduleSelectedSchedule.value = uni.getStorageSync('rescheduleSelectedSchedule') || null
  }
  
  /**
   * 恢复预约流程数据
   */
  const restoreAppointmentData = () => {
    selectedHospital.value = uni.getStorageSync('selectedHospital')
    selectedDepartment.value = uni.getStorageSync('selectedDepartment')
    selectedDoctor.value = uni.getStorageSync('selectedDoctor')
    selectedSchedule.value = uni.getStorageSync('selectedSchedule')
  }
  
  /**
   * 设置预约列表
   */
  const setAppointments = (list) => {
    appointments.value = list
  }
  
  return {
    // State
    selectedHospital,
    selectedDepartment,
    selectedDoctor,
    selectedSchedule,
    selectedPatient,
    appointments,
    rescheduleContext,
    rescheduleSelectedSchedule,
    
    // Actions
    setSelectedHospital,
    setSelectedDepartment,
    setSelectedDoctor,
    setSelectedSchedule,
    setSelectedPatient,
    setRescheduleContext,
    setRescheduleSelectedSchedule,
    clearAppointmentData,
    restoreAppointmentData,
    clearRescheduleData,
    restoreRescheduleData,
    setAppointments
  }
})

