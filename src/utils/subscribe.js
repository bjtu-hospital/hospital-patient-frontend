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
    console.log('📝 准备请求订阅消息授权，模板IDs:', templateIds)
    
    uni.requestSubscribeMessage({
      tmplIds: templateIds,
      success: (res) => {
        console.log('✅ 订阅消息授权原始结果:', res)
        
        // 过滤掉 errMsg 等字段，只保留模板ID的授权结果
        // res 格式: { errMsg: "...", "template_id_1": "accept", ... }
        const authResult = {}
        templateIds.forEach(templateId => {
          if (res[templateId]) {
            authResult[templateId] = res[templateId]
          }
        })
        
        console.log('✅ 过滤后的授权结果:', authResult)
        
        // 🔍 检查是否有任何授权结果
        const hasAnyAuth = Object.keys(authResult).length > 0
        if (!hasAnyAuth) {
          console.warn('⚠️ 没有收到任何授权结果，可能原因：')
          console.warn('   1. 所有模板都已授权过（微信会记住用户的选择）')
          console.warn('   2. 模板已被用户永久拒绝')
          console.warn('💡 如需重新授权，请：')
          console.warn('   方法1: 在微信中长按小程序 > 删除 > 重新搜索进入')
          console.warn('   方法2: 微信设置 > 小程序 > 找到本小程序 > 删除')
        }
        
        // 返回授权结果
        // 格式: { [templateId]: 'accept' | 'reject' | 'ban' }
        resolve(authResult)
      },
      fail: (err) => {
        console.error('❌ 订阅消息授权失败:', err)
        console.error('   错误码:', err.errCode)
        console.error('   错误信息:', err.errMsg)
        
        // 特殊错误处理
        if (err.errMsg && err.errMsg.includes('not in user scope')) {
          console.error('⛔ 该API必须在用户点击事件的第一层同步调用！')
        }
        
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
export const subscribeWithAuth = ({ templateIds, businessData = {} }) => {
  // ⚠️ 关键修改：移除 async，改为返回 Promise
  // 这样 requestSubscribeMessage 会在同步代码中立即执行
  
  console.log('🚀 开始订阅消息流程...')
  
  // 🔑 关键：立即同步调用 requestSubscribeMessage（不使用 await）
  console.log('📝 请求用户授权订阅消息...')
  const authPromise = requestSubscribeMessage(templateIds)
  
  // 然后异步处理后续流程
  return authPromise.then(authResult => {
    // 步骤2: 获取微信code（在授权回调中异步调用）
    console.log('🔑 获取微信登录code...')
    return getWxCode().then(code => {
      // 返回code和授权结果，由调用方提交到后端
      console.log('✅ 订阅消息流程完成')
      return {
        success: true,
        code,
        authResult,
        businessData
      }
    })
  }).catch(error => {
    console.error('❌ 订阅消息流程失败:', error)
    
    // 即使失败也返回基本信息，让业务流程继续
    return {
      success: false,
      code: null,
      authResult: {},
      businessData,
      error: error.message
    }
  })
}

/**
 * 订阅消息模板ID配置
 * 
 * 📋 已从微信小程序后台申请的模板（2025-12-17）
 * 
 * 路径: 微信小程序后台 > 功能 > 订阅消息
 */

export const SUBSCRIBE_TEMPLATE_IDS = {
  // 预约成功通知 - 模板编号461（预约通知）
  // 字段：就诊人、就诊时间、预约地点、预约医师、预约状态
  APPOINTMENT_SUCCESS: 'RFZQNIC-vGQC_mkDcqAneHMamQUhmWIn82L2FwsiC5A',
  
  // 就诊提醒通知 - 模板编号461（预约通知）
  // 字段：就诊人、就诊时间、体检地点、温馨提示
  APPOINTMENT_REMINDER: 'RFZQNIC-vGQC_mkDcqAneFF3OluydoAJXHEjh1pY64k',
  
  // 候补转预约通知 - 复用预约成功模板（461号）
  // 说明：候补转预约本质上就是预约成功，使用同一个模板
  // 字段：就诊人、就诊时间、预约地点、预约医师、预约状态
  // 流程：用户加入候补时授权 → 后端自动转预约时发送消息
  WAITLIST_TO_APPOINTMENT: 'Z9do65Ix2ZWmooA-1rfUsatqUyMv99ESnk-spq7ikn4',
  
  // 改约成功通知 - 模板编号6410（预约修改通知）
  // 字段：预约人、原预约时间、现预约时间、活动名称、修改原因
  RESCHEDULE_SUCCESS: 'RLysg1picC6gOuopUswKqA_nKdDrTNlgKI7K8SBN5OQ',
  
  // 取消预约通知 - 模板编号461（预约通知）
  // 字段：就诊人、就诊时间、预约医师、取消原因、订单状态
  CANCEL_APPOINTMENT: 'RFZQNIC-vGQC_mkDcqAneBgEbozeik6zHMBrfiNfUgs',
  
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
    
    // 候补场景：用户加入候补时授权，后端自动转预约时发送消息
    // 使用预约成功模板（因为候补转预约本质上就是预约成功）
    'waitlist': [
      SUBSCRIBE_TEMPLATE_IDS.WAITLIST_TO_APPOINTMENT
    ],
    
    // 候补转预约场景（等同于候补场景）
    'waitlist-to-appointment': [
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
