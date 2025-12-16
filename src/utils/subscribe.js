/**
 * 微信小程序订阅消息工具函数
 * 
 * 功能：
 * 1. 获取微信登录code
 * 2. 请求用户授权订阅消息
 * 3. 提交授权结果到后端
 */

/**
 * 获取微信登录code
 * @returns {Promise<string>} 返回临时code
 */
export const getWxCode = () => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          console.log('✅ 获取微信code成功:', res.code)
          resolve(res.code)
        } else {
          console.error('❌ 获取微信code失败:', res.errMsg)
          reject(new Error(res.errMsg || '获取微信code失败'))
        }
      },
      fail: (err) => {
        console.error('❌ wx.login调用失败:', err)
        reject(err)
      }
    })
    // #endif
    
    // #ifndef MP-WEIXIN
    // 非微信小程序环境，返回模拟code（用于开发调试）
    console.warn('⚠️ 非微信小程序环境，返回模拟code')
    resolve('mock_code_for_development')
    // #endif
  })
}

/**
 * 请求订阅消息授权
 * 
 * ⚠️ 注意：此函数必须在用户点击事件（如按钮tap）的第一层调用，
 * 不能放在异步回调中，否则会报错
 * 
 * @param {Array<string>} templateIds - 订阅消息模板ID数组
 * @returns {Promise<Object>} 返回授权结果对象
 * 
 * 返回格式示例：
 * {
 *   "template_id_1": "accept",  // 用户同意
 *   "template_id_2": "reject",  // 用户拒绝
 *   "template_id_3": "ban"      // 用户已禁用
 * }
 */
export const requestSubscribeMessage = (templateIds) => {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.requestSubscribeMessage({
      tmplIds: templateIds,
      success: (res) => {
        console.log('✅ 订阅消息授权结果:', res)
        
        // 返回授权结果
        // 格式: { [templateId]: 'accept' | 'reject' | 'ban' }
        resolve(res)
      },
      fail: (err) => {
        console.error('❌ 订阅消息授权失败:', err)
        
        // 即使授权失败，也不应该阻断业务流程
        // 返回空对象，让业务继续
        console.warn('⚠️ 订阅消息授权失败，继续业务流程')
        resolve({})
      }
    })
    // #endif
    
    // #ifndef MP-WEIXIN
    // 非微信小程序环境，模拟用户同意授权
    console.warn('⚠️ 非微信小程序环境，模拟授权成功')
    const mockResult = {}
    templateIds.forEach(id => {
      mockResult[id] = 'accept'
    })
    resolve(mockResult)
    // #endif
  })
}

/**
 * 完整的订阅消息流程
 * 
 * ⚠️ 必须在按钮点击事件的第一层调用
 * 
 * 使用示例：
 * ```javascript
 * // 在按钮点击事件中
 * const handleSubmit = async () => {
 *   try {
 *     const result = await subscribeWithAuth({
 *       templateIds: ['模板ID1', '模板ID2'],
 *       businessData: { appointmentId: 123 }
 *     })
 *     
 *     if (result.success) {
 *       // 继续业务流程（如创建预约）
 *     }
 *   } catch (error) {
 *     // 处理错误
 *   }
 * }
 * ```
 * 
 * @param {Object} params - 参数对象
 * @param {Array<string>} params.templateIds - 模板ID数组
 * @param {Object} params.businessData - 业务数据（可选），会一并提交到后端
 * @returns {Promise<Object>} 返回 { success: boolean, code: string, authResult: Object }
 */
export const subscribeWithAuth = async ({ templateIds, businessData = {} }) => {
  try {
    console.log('🚀 开始订阅消息流程...')
    
    // 步骤1: 请求用户授权（必须在点击事件第一层同步调用）
    console.log('📝 请求用户授权订阅消息...')
    const authResult = await requestSubscribeMessage(templateIds)
    
    // 步骤2: 获取微信code（在授权回调中异步调用）
    console.log('🔑 获取微信登录code...')
    const code = await getWxCode()
    
    // 返回code和授权结果，由调用方提交到后端
    console.log('✅ 订阅消息流程完成')
    return {
      success: true,
      code,
      authResult,
      businessData
    }
    
  } catch (error) {
    console.error('❌ 订阅消息流程失败:', error)
    
    // 即使失败也返回基本信息，让业务流程继续
    return {
      success: false,
      code: null,
      authResult: {},
      businessData,
      error: error.message
    }
  }
}

/**
 * 订阅消息模板ID配置
 * 
 * 🔧 使用前需要在微信小程序后台申请对应的模板
 * 路径: 微信小程序后台 > 功能 > 订阅消息
 */
export const SUBSCRIBE_TEMPLATE_IDS = {
  // 预约成功通知
  APPOINTMENT_SUCCESS: 'YOUR_TEMPLATE_ID_1',
  
  // 就诊提醒通知
  APPOINTMENT_REMINDER: 'YOUR_TEMPLATE_ID_2',
  
  // 候补成功通知
  WAITLIST_SUCCESS: 'YOUR_TEMPLATE_ID_3',
  
  // 候补转预约通知
  WAITLIST_TO_APPOINTMENT: 'YOUR_TEMPLATE_ID_4',
  
  // 改约成功通知
  RESCHEDULE_SUCCESS: 'YOUR_TEMPLATE_ID_5',
  
  // 取消预约通知
  CANCEL_APPOINTMENT: 'YOUR_TEMPLATE_ID_6',
}

/**
 * 根据业务场景获取需要的模板ID列表
 * @param {string} scene - 业务场景
 * @returns {Array<string>} 模板ID数组
 */
export const getTemplateIdsByScene = (scene) => {
  const scenes = {
    // 预约挂号场景：需要预约成功通知 + 就诊提醒通知
    'appointment': [
      SUBSCRIBE_TEMPLATE_IDS.APPOINTMENT_SUCCESS,
      SUBSCRIBE_TEMPLATE_IDS.APPOINTMENT_REMINDER
    ],
    
    // 候补场景：需要候补成功通知 + 候补转预约通知
    'waitlist': [
      SUBSCRIBE_TEMPLATE_IDS.WAITLIST_SUCCESS,
      SUBSCRIBE_TEMPLATE_IDS.WAITLIST_TO_APPOINTMENT
    ],
    
    // 改约场景：需要改约成功通知 + 就诊提醒通知
    'reschedule': [
      SUBSCRIBE_TEMPLATE_IDS.RESCHEDULE_SUCCESS,
      SUBSCRIBE_TEMPLATE_IDS.APPOINTMENT_REMINDER
    ],
    
    // 取消预约场景
    'cancel': [
      SUBSCRIBE_TEMPLATE_IDS.CANCEL_APPOINTMENT
    ]
  }
  
  return scenes[scene] || []
}
