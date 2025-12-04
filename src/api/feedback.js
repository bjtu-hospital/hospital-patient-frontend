/**
 * 意见反馈相关 API
 */
import request from './request'

/**
 * 获取反馈列表
 * @returns {Promise} 反馈列表
 */
export const getFeedbackList = () => {
  return request.get('/common/feedback')
}

/**
 * 提交反馈
 * @param {Object} data - 反馈数据
 * @param {String} data.type - 反馈类型：bug(功能异常) | suggestion(功能建议) | complaint(服务投诉) | praise(表扬建议)
 * @param {String} data.content - 反馈内容
 * @param {String} [data.contactPhone] - 联系电话（可选）
 * @param {String} [data.contactEmail] - 联系邮箱（可选）
 * @returns {Promise} 提交结果
 */
export const submitFeedback = (data) => {
  return request.post('/common/feedback', data)
}

/**
 * 获取反馈详情
 * @param {String|Number} feedbackId - 反馈ID
 * @returns {Promise} 反馈详情
 */
export const getFeedbackDetail = (feedbackId) => {
  return request.get(`/common/feedback/${feedbackId}`)
}
