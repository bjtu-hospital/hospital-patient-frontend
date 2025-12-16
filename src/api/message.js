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
 * 提交微信登录code，换取并保存openid
 * 
 * 后端需要做的事：
 * 1. 使用 code + AppID + AppSecret 调用微信接口换取 openid
 * 2. 将 openid 与当前用户关联并保存到数据库
 * 3. 返回操作结果
 * 
 * @param {Object} data
 * @param {string} data.code - wx.login() 获取的临时code
 * @returns {Promise<Object>} 返回 { openid: string, detail: string }
 */
export const submitWxCode = (code) => {
  return request.post('/patient/subscribe/bind-openid', { code })
}

/**
 * 保存订阅消息授权结果
 * 
 * 后端需要做的事：
 * 1. 保存用户对各个模板的授权状态
 * 2. 记录授权时间、业务场景等信息
 * 3. 后续发送消息时检查授权状态
 * 
 * @param {Object} data
 * @param {string} data.scene - 业务场景（appointment/waitlist/reschedule/cancel）
 * @param {Object} data.authResult - 授权结果对象 { [templateId]: 'accept'|'reject'|'ban' }
 * @param {Object} data.businessData - 业务数据（如预约ID、候补ID等）
 * @returns {Promise<Object>} 返回 { detail: string, acceptedTemplates: Array }
 */
export const saveSubscribeAuth = (data) => {
  return request.post('/patient/subscribe/save-auth', data)
}

/**
 * 【完整流程接口】提交订阅授权并创建业务记录
 * 
 * 此接口将订阅消息授权和业务创建（如预约、候补）合并处理
 * 
 * 流程：
 * 1. 前端在按钮点击时先请求订阅授权
 * 2. 获取 code 和授权结果
 * 3. 连同业务数据一起提交到此接口
 * 4. 后端保存 openid、授权信息，并创建业务记录
 * 5. 后端立即发送订阅消息通知用户
 * 
 * @param {Object} data
 * @param {string} data.code - wx.login() 的 code
 * @param {string} data.scene - 业务场景
 * @param {Object} data.authResult - 授权结果
 * @param {Object} data.businessData - 业务数据
 * @returns {Promise<Object>} 返回业务创建结果 + 消息发送结果
 */
export const submitWithSubscribe = (data) => {
  return request.post('/patient/subscribe/submit-with-auth', data)
}

