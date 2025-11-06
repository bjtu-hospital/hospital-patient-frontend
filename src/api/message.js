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

