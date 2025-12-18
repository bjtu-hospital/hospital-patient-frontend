/**
 * 消息相关接口
 */
import request from './request'

/**
 * 获取消息列表
 * @param {Object} params - 查询参数 { page, pageSize }
 */
export const getMessages = (params) => {
  return request.get('/patient/messages', params)
}

/**
 * 标记消息为已读
 * @param {String} messageId - 消息ID
 */
export const markMessageAsRead = (messageId) => {
  return request.put(`/patient/messages/${messageId}/read`)
}

/**
 * 删除消息
 * @param {String} messageId - 消息ID
 */
export const deleteMessage = (messageId) => {
  return request.delete(`/patient/messages/${messageId}`)
}

/**
 * 提交意见反馈
 * @param {Object} data - 反馈内容
 */
export const submitFeedback = (data) => {
  return request.post('/patient/feedback', data)
}

// ==================== 微信订阅消息接口 ====================

/**
 * 使用 wx.login() 的 code 绑定当前用户的微信 openid
 * 
 * 对应后端接口: POST /patient/wechat/bind-by-code
 * 
 * 后端会做：
 * 1. 使用 code + AppID + AppSecret 调用微信接口换取 openid
 * 2. 将 openid 与当前用户关联并保存到数据库
 * 3. 返回操作结果
 * 
 * @param {string} code - wx.login() 获取的临时code
 * @returns {Promise<Object>} 返回绑定结果
 */
export const bindWechatByCode = (code) => {
  return request.post('/patient/wechat/bind-by-code', { code })
}

/**
 * 查询当前用户是否已授权指定订阅消息模板
 * 
 * 对应后端接口: GET /patient/wechat/authorized?templateId=xxx
 * 
 * @param {string} templateId - 模板ID
 * @returns {Promise<Object>} 返回授权状态
 */
export const checkWechatAuthorized = (templateId) => {
  return request.get('/patient/wechat/authorized', { templateId })
}

/**
 * 手动发送就诊提醒
 * 
 * 对应后端接口: POST /patient/appointments/{appointmentId}/send-reminder
 * 
 * 业务规则:
 * - 只能对未来日期且距离就诊不超过1天的订单发送提醒
 * - 只能对已支付已确认的订单发送
 * - 防止重复发送
 * 
 * @param {number} appointmentId - 预约ID
 * @returns {Promise<string>} 返回发送结果消息
 */
export const sendAppointmentReminder = (appointmentId) => {
  return request.post(`/patient/appointments/${appointmentId}/send-reminder`)
}

