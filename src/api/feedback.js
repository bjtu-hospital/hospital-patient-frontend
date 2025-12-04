/**
 * 意见反馈相关接口
 */
import request from './request'

// 是否使用 Mock 数据
const USE_MOCK = false  // ← 已对接后端真实接口

// 类型映射函数（后端返回英文type，前端显示中文）
const getTypeText = (type) => {
  const typeMap = {
    'bug': '功能异常',
    'suggestion': '功能建议',
    'complaint': '服务投诉',
    'praise': '表扬建议'
  }
  return typeMap[type] || type
}

// ==================== 反馈相关 ====================

/**
 * 提交反馈到后端数据库
 * @param {Object} data - 反馈信息 { type, content, contactPhone, contactEmail }
 * @returns {Promise} 返回提交结果 { code: 0, message: { id, type, content, ... } }
 */
export const submitFeedback = (data) => {
  // 构建API数据
  const apiData = {
    type: data.type,
    content: data.content,
    contactPhone: data.contactPhone || null,
    contactEmail: data.contactEmail || null
  }
  
  // 如果手机号或邮箱是空字符串，设置为null
  if (apiData.contactPhone === '') apiData.contactPhone = null
  if (apiData.contactEmail === '') apiData.contactEmail = null
  
  console.log('📤 [反馈API] 提交请求:', {
    url: '/common/feedback',
    method: 'POST',
    data: apiData,
    类型: apiData.type,
    内容长度: apiData.content.length,
    手机号: apiData.contactPhone ? '已填写' : '未填写',
    邮箱: apiData.contactEmail ? '已填写' : '未填写'
  })
  
  return request.post('/common/feedback', apiData).then(response => {
    console.log('📥 [反馈API] 提交原始响应:', response)
    
    // 🚨 关键修复：处理后端返回的多种格式
    // 格式1: { feedback_id: 5, type: 'bug', ... } (直接返回对象)
    // 格式2: { code: 0, message: { ... } } (标准格式)
    // 格式3: 直接返回插入的数据对象
    
    if (response && typeof response === 'object') {
      // 情况1：后端直接返回插入的数据（有feedback_id字段）
      if (response.feedback_id) {
        console.log('✅ 检测到后端返回直接数据格式')
        
        // 转换为前端期望的格式
        return {
          code: 0,
          message: {
            id: response.feedback_id,
            feedback_id: response.feedback_id,
            type: response.type,
            typeText: getTypeText(response.type),
            content: response.content || '',
            status: response.status || 'pending',
            submitDate: response.submitDate || response.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            createdAt: response.createdAt || new Date().toISOString(),
            contactPhone: response.contactPhone || '',
            contactEmail: response.contactEmail || ''
          }
        }
      }
      
      // 情况2：标准格式 { code: 0, message: {...} }
      else if (response.code === 0 && response.message) {
        console.log('✅ 标准格式响应')
        return response
      }
      
      // 情况3：其他格式，尝试适配
      else {
        console.log('🔄 适配其他响应格式:', response)
        
        // 尝试提取可能的反馈ID
        let feedbackId = response.id || response.feedback_id || response.data?.id
        
        return {
          code: response.code || 0,
          message: {
            id: feedbackId || `temp_${Date.now()}`,
            feedback_id: feedbackId,
            type: response.type || data.type,
            typeText: getTypeText(response.type || data.type),
            content: response.content || data.content || '',
            status: response.status || 'pending',
            submitDate: response.submitDate || response.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            createdAt: response.createdAt || new Date().toISOString(),
            contactPhone: response.contactPhone || data.contactPhone || '',
            contactEmail: response.contactEmail || data.contactEmail || ''
          }
        }
      }
    }
    
    // 未知响应格式
    console.warn('⚠️ 未知响应格式:', response)
    return {
      code: 0,
      message: {
        id: `temp_${Date.now()}`,
        type: data.type,
        typeText: getTypeText(data.type),
        content: data.content,
        status: 'pending',
        submitDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        contactPhone: data.contactPhone || '',
        contactEmail: data.contactEmail || ''
      }
    }
    
  }).catch(error => {
    console.error('❌ [反馈API] 提交失败:', error)
    
    return {
      code: 98,
      message: { 
        error: '网络请求失败',
        detail: error.message 
      }
    }
  })
}

/**
 * 从后端数据库获取历史反馈列表
 * @param {Object} params - 查询参数 { page, pageSize }
 * @returns {Promise} 返回反馈列表 { code: 0, message: [...] }
 */
export const getFeedbackHistory = (params = {}) => {
  // ⚠️ 重要：与提交接口保持一致
  const apiParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 20
  }
  
  console.log('📤 [反馈API] 获取历史请求:', {
    url: '/common/feedback',
    method: 'GET',
    params: apiParams
  })
  
  return request.get('/common/feedback', apiParams).then(response => {
    console.log('📥 [反馈API] 获取历史响应:', response)
    
    // 处理Token失效的情况
    if (response && response.code === 105) {
      console.warn('⚠️ [反馈API] Token失效，返回105错误')
      return {
        code: 105,
        message: [],
        error: 'Token无效或已失效'
      }
    }
    
    // 标准化响应格式
    if (response && typeof response === 'object') {
      let feedbackList = []
      
      // 情况1：后端直接返回数组在 message 字段
      if (response.code === 0 && Array.isArray(response.message)) {
        feedbackList = response.message
      }
      // 情况2：后端返回 { list: [...] } 格式
      else if (response.code === 0 && response.message && Array.isArray(response.message.list)) {
        feedbackList = response.message.list
      }
      // 情况3：后端直接返回数组
      else if (Array.isArray(response)) {
        feedbackList = response
      }
      // 情况4：后端返回 { data: [...] } 格式
      else if (response.data && Array.isArray(response.data)) {
        feedbackList = response.data
      }
      
      // 格式化数据供前端显示
      const formattedList = feedbackList.map(item => ({
        id: item.id || `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: item.type || '',  // 保留原始英文类型
        typeText: getTypeText(item.type),  // 转换为中文类型显示
        content: item.content ? 
          (item.content.length > 20 ? item.content.substring(0, 20) + '...' : item.content) 
          : '无内容',
        fullContent: item.content || '',
        submitDate: item.submitDate || 
          (item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
        createdAt: item.createdAt,
        status: item.status || 'pending',
        contactPhone: item.contactPhone || '',
        contactEmail: item.contactEmail || ''
      }))
      
      return {
        code: 0,
        message: formattedList,
        original: response  // 保留原始响应，便于调试
      }
    }
    
    // 响应格式异常
    return {
      code: 106,
      message: [],
      error: '响应格式异常'
    }
  }).catch(error => {
    console.error('❌ [反馈API] 获取历史失败:', error)
    
    // 如果是网络错误或Token错误
    if (error.message && (error.message.includes('401') || error.message.includes('未授权'))) {
      return {
        code: 105,
        message: [],
        error: '登录状态已过期'
      }
    }
    
    return {
      code: 98,
      message: [],
      error: '网络请求失败'
    }
  })
}

/**
 * 获取单条反馈详情
 * @param {String} feedbackId - 反馈记录ID
 * @returns {Promise} 返回反馈详情 { code: 0, message: {...} }
 */
export const getFeedbackDetail = (feedbackId) => {
  if (!feedbackId) {
    console.warn('⚠️ [反馈API] 获取详情缺少ID')
    return Promise.resolve({
      code: 99,
      message: { error: '缺少反馈ID' }
    })
  }
  
  console.log('📤 [反馈API] 获取详情:', feedbackId)
  
  return request.get(`/common/feedback/${feedbackId}`).then(response => {
    console.log('📥 [反馈API] 详情响应:', response)
    
    if (response && response.code === 0 && response.message) {
      const detail = response.message
      
      return {
        ...response,
        message: {
          id: detail.id || feedbackId,
          type: detail.type,
          typeText: getTypeText(detail.type),
          content: detail.content || '',
          contactPhone: detail.contactPhone || '',
          contactEmail: detail.contactEmail || '',
          status: detail.status || 'pending',
          submitDate: detail.submitDate || '未知日期',
          createdAt: detail.createdAt || new Date().toISOString()
        }
      }
    }
    
    return response || {
      code: 106,
      message: { error: '未找到反馈详情' }
    }
  }).catch(error => {
    console.error('❌ [反馈API] 获取详情失败:', error)
    return {
      code: 98,
      message: { error: '网络请求失败' }
    }
  })
}

// 导出所有函数
export {
  getTypeText
}

// 默认导出（兼容旧代码）
export default {
  submitFeedback,
  getFeedbackHistory,
  getFeedbackDetail,
  getTypeText
}