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
    
    // Actions
    setSelectedHospital,
    setSelectedDepartment,
    setSelectedDoctor,
    setSelectedSchedule,
    setSelectedPatient,
    clearAppointmentData,
    restoreAppointmentData,
    setAppointments
  }
})

