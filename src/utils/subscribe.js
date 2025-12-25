/**
 * 微信小程序订阅消息工具函数
 * 
 * 功能：
 * 1. 获取微信登录code
 * 2. 请求用户授权订阅消息
 * 3. 提交授权结果到后端
 * 
 * 支持场景：预约成功、取消预约、改约成功
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
          console.warn('💡 如需重新授权，请删除小程序后重新进入')
        }
        
        resolve(authResult)
      },
      fail: (err) => {
        console.error('❌ 订阅消息授权失败:', err)
        console.error('   错误码:', err.errCode)
        console.error('   错误信息:', err.errMsg)
        
        if (err.errMsg && err.errMsg.includes('not in user scope')) {
          console.error('⛔ 该API必须在用户点击事件的第一层同步调用！')
        }
        
        // 即使授权失败，也不应该阻断业务流程
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
 * 订阅消息模板ID配置
 * 
 * 📋 核心三个场景：预约成功、取消预约、改约成功
 * 
 * 路径: 微信小程序后台 > 功能 > 订阅消息
 */
export const SUBSCRIBE_TEMPLATE_IDS = {
  // 预约成功通知 - 模板编号461（预约通知）
  // 字段：就诊人、就诊时间、预约地点、预约医师、预约状态
  APPOINTMENT_SUCCESS: 'RFZQNIC-vGQC_mkDcqAneHMamQUhmWIn82L2FwsiC5A',
  
  // 取消预约通知 - 模板编号461（预约通知）
  // 字段：就诊人、就诊时间、预约医师、取消原因、订单状态
  CANCEL_APPOINTMENT: 'RFZQNIC-vGQC_mkDcqAneBgEbozeik6zHMBrfiNfUgs',
  
  // 改约成功通知 - 模板编号6410（预约修改通知）
  // 字段：预约人、原预约时间、现预约时间、活动名称、修改原因
  RESCHEDULE_SUCCESS: 'RLysg1picC6gOuopUswKqA_nKdDrTNlgKI7K8SBN5OQ',
}

/**w
 * 获取所有订阅消息模板ID
 * @returns {Array<string>} 所有模板ID数组
 */
export const getAllTemplateIds = () => {
  return Object.values(SUBSCRIBE_TEMPLATE_IDS)
}

/**
 * 首页统一授权流程
 * 
 * ⚠️ 必须在用户点击事件中调用（微信API限制）
 * 
 * @param {Object} templateChecked - 用户选择的模板开关状态
 * @returns {Promise<Object>} 返回 { success, code, authResult }
 */
export const homeSubscribeAuth = (templateChecked = null) => {
  console.log('🏠 首页统一授权流程开始...')
  
  // 微信限制：一次最多只能请求3个模板授权
  // 核心三个场景：预约成功、取消预约、改约成功
  let priorityTemplateIds = []
  
  // 如果传入了用户的选择，根据用户选择的开关来决定
  if (templateChecked) {
    if (templateChecked.appointment) {
      priorityTemplateIds.push(SUBSCRIBE_TEMPLATE_IDS.APPOINTMENT_SUCCESS)
    }
    if (templateChecked.cancel) {
      priorityTemplateIds.push(SUBSCRIBE_TEMPLATE_IDS.CANCEL_APPOINTMENT)
    }
    if (templateChecked.reschedule) {
      priorityTemplateIds.push(SUBSCRIBE_TEMPLATE_IDS.RESCHEDULE_SUCCESS)
    }
  } else {
    // 默认授权三个核心模板
    priorityTemplateIds = [
      SUBSCRIBE_TEMPLATE_IDS.APPOINTMENT_SUCCESS,
      SUBSCRIBE_TEMPLATE_IDS.CANCEL_APPOINTMENT,
      SUBSCRIBE_TEMPLATE_IDS.RESCHEDULE_SUCCESS
    ]
  }
  
  console.log('📝 请求授权的模板:', priorityTemplateIds)
  
  // 如果没有选择任何模板，直接返回
  if (priorityTemplateIds.length === 0) {
    return Promise.resolve({
      success: false,
      code: null,
      authResult: {},
      error: '未选择任何通知模板'
    })
  }
  
  // 先请求订阅消息授权（必须在点击事件第一层同步调用）
  const authPromise = requestSubscribeMessage(priorityTemplateIds)
  
  return authPromise.then(authResult => {
    console.log('🔑 获取微信登录code...')
    return getWxCode().then(code => {
      console.log('✅ 首页授权流程完成')
      return {
        success: true,
        code,
        authResult
      }
    })
  }).catch(error => {
    console.error('❌ 首页授权流程失败:', error)
    return {
      success: false,
      code: null,
      authResult: {},
      error: error.message
    }
  })
}

/**
 * 根据业务场景获取需要的模板ID列表
 * @param {string} scene - 业务场景: appointment | cancel | reschedule
 * @returns {Array<string>} 模板ID数组
 */
export const getTemplateIdsByScene = (scene) => {
  const scenes = {
    // 预约挂号场景
    'appointment': [
      SUBSCRIBE_TEMPLATE_IDS.APPOINTMENT_SUCCESS
    ],
    
    // 取消预约场景
    'cancel': [
      SUBSCRIBE_TEMPLATE_IDS.CANCEL_APPOINTMENT
    ],
    
    // 改约场景
    'reschedule': [
      SUBSCRIBE_TEMPLATE_IDS.RESCHEDULE_SUCCESS
    ]
  }
  
  return scenes[scene] || []
}

/**
 * 按场景封装的一步式授权，返回 { code, authResult }
 * @param {string|Array<string>} sceneOrTemplates - 场景名 (appointment/cancel/reschedule) 或模板ID数组
 * @returns {Promise<{code: string|null, authResult: Object}>}
 */
export const subscribeWithAuth = async (sceneOrTemplates) => {
  // 允许直接传模板ID数组
  const templateIds = Array.isArray(sceneOrTemplates)
    ? sceneOrTemplates
    : getTemplateIdsByScene(sceneOrTemplates)

  if (!templateIds || templateIds.length === 0) {
    return { code: null, authResult: {} }
  }

  // 1. 请求订阅授权（必须在用户点击事件中调用）
  const authResult = await requestSubscribeMessage(templateIds)

  // 2. 获取微信 code
  let code = null
  try {
    code = await getWxCode()
  } catch (err) {
    console.warn('获取微信code失败，但继续返回授权结果', err)
  }

  return { code, authResult }
}
