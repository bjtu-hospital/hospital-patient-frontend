/**
 * 页面路由跳转工具
 * 
 * 此文件为 AI 助手提供页面导航能力，供 DeepSeek Tool Calls 模式使用。
 * 
 * @description
 * 该工具允许 AI 根据用户意图，自动跳转到医院预约系统的各个功能页面。
 * AI 可以根据用户的自然语言描述，智能匹配并导航到相应的页面。
 * 
 * @example
 * 用户说："我想预约挂号" → AI 调用 navigateToPage({ pageName: "select-hospital" })
 * 用户说："查看我的预约" → AI 调用 navigateToPage({ pageName: "appointments" })
 */

// ============================================================================
// 页面路由配置表
// ============================================================================

/**
 * 所有可用页面的路由配置
 * 
 * @typedef {Object} PageRoute
 * @property {string} path - 页面路径（不含前导斜杠）
 * @property {string} title - 页面标题（导航栏显示）
 * @property {string} description - 页面功能描述，供 AI 理解页面用途
 * @property {string[]} keywords - 触发关键词，帮助 AI 匹配用户意图
 * @property {boolean} isTabBar - 是否为 TabBar 页面（需使用 switchTab 跳转）
 * @property {string[]} [requiredParams] - 必需的 URL 参数（可选）
 * @property {string[]} [optionalParams] - 可选的 URL 参数（可选）
 */

/**
 * 完整的页面路由配置列表
 * @type {PageRoute[]}
 */
export const PAGE_ROUTES = [
  // ==================== 认证相关页面 ====================
  {
    path: "pages/auth/login",
    title: "登录",
    description: "用户登录页面，使用手机号和密码登录系统",
    keywords: ["登录", "登陆", "sign in", "login"],
    isTabBar: false
  },
  {
    path: "pages/auth/register",
    title: "注册",
    description: "新用户注册页面，创建新账号",
    keywords: ["注册", "注冊", "sign up", "register", "新用户"],
    isTabBar: false
  },

  // ==================== 首页（TabBar） ====================
  {
    path: "pages/home/index",
    title: "首页",
    description: "应用首页，展示主要功能入口和快捷操作",
    keywords: ["首页", "主页", "home", "回首页", "返回首页"],
    isTabBar: true
  },

  // ==================== 预约挂号流程 ====================
  {
    path: "pages/home/appointment/select-hospital",
    title: "选择院区",
    description: "预约挂号第一步：选择就诊的院区/医院",
    keywords: ["预约", "挂号", "选择医院", "选择院区", "预约挂号", "我要预约", "我想挂号", "看病"],
    isTabBar: false,
    optionalParams: ["hospitalId"]
  },
  {
    path: "pages/home/appointment/select-department",
    title: "选择科室",
    description: "预约挂号第二步：选择就诊的科室",
    keywords: ["选择科室", "选科室", "哪个科室", "什么科"],
    isTabBar: false,
    requiredParams: ["hospitalId"],
    optionalParams: ["departmentId"]
  },
  {
    path: "pages/home/appointment/select-doctor",
    title: "选择医生",
    description: "预约挂号第三步：选择就诊的医生和时间段",
    keywords: ["选择医生", "选医生", "哪个医生", "找医生", "看哪个医生"],
    isTabBar: false,
    requiredParams: ["hospitalId", "departmentId"],
    optionalParams: ["doctorId", "date"]
  },
  {
    path: "pages/home/appointment/confirm",
    title: "确认预约",
    description: "预约挂号第四步：确认预约信息，选择就诊人",
    keywords: ["确认预约", "确认挂号", "提交预约"],
    isTabBar: false,
    requiredParams: ["scheduleId"]
  },
  {
    path: "pages/home/appointment/payment",
    title: "支付",
    description: "预约挂号第五步：支付挂号费用",
    keywords: ["支付", "付款", "缴费", "付费"],
    isTabBar: false,
    requiredParams: ["appointmentId"]
  },
  {
    path: "pages/home/appointment/success",
    title: "预约成功",
    description: "预约成功页面，显示预约单详情",
    keywords: ["预约成功", "预约详情", "预约单"],
    isTabBar: false,
    requiredParams: ["appointmentId"]
  },

  // ==================== 候补功能 ====================
  {
    path: "pages/home/waitlist/confirm-waitlist",
    title: "候补号源",
    description: "当没有可用号源时，可以申请候补排队",
    keywords: ["候补", "候补挂号", "排队等号", "没号了", "候补号源"],
    isTabBar: false,
    requiredParams: ["doctorId", "date"]
  },
  {
    path: "pages/home/waitlist/waitlist-success",
    title: "候补成功",
    description: "候补申请成功页面，显示候补单详情",
    keywords: ["候补成功", "候补详情", "候补单"],
    isTabBar: false,
    requiredParams: ["waitlistId"]
  },

  // ==================== 改约功能 ====================
  {
    path: "pages/home/reschedule/select-schedule",
    title: "选择新的就诊时间",
    description: "改约第一步：选择新的就诊日期和时间段",
    keywords: ["改约", "改时间", "改预约", "更改预约", "换时间", "重新预约时间"],
    isTabBar: false,
    requiredParams: ["appointmentId"]
  },
  {
    path: "pages/home/reschedule/confirm",
    title: "确认改约",
    description: "改约第二步：确认新的预约信息",
    keywords: ["确认改约", "确认更改"],
    isTabBar: false,
    requiredParams: ["appointmentId", "newScheduleId"]
  },

  // ==================== 个人中心（TabBar） ====================
  {
    path: "pages/profile/index",
    title: "个人中心",
    description: "个人中心页面，管理个人信息和查看各类记录",
    keywords: ["个人中心", "我的", "个人", "用户中心", "profile"],
    isTabBar: true
  },

  // ==================== 我的预约和候补 ====================
  {
    path: "pages/profile/appointments",
    title: "我的预约",
    description: "查看和管理我的所有预约记录",
    keywords: ["我的预约", "预约记录", "预约列表", "查看预约", "预约历史", "挂号记录"],
    isTabBar: false
  },
  {
    path: "pages/profile/waitlist",
    title: "我的候补",
    description: "查看和管理我的所有候补记录",
    keywords: ["我的候补", "候补记录", "候补列表", "查看候补"],
    isTabBar: false
  },

  // ==================== 就诊人管理 ====================
  {
    path: "pages/profile/patients",
    title: "就诊人管理",
    description: "添加、编辑和管理就诊人信息（可为家人预约）",
    keywords: ["就诊人", "就诊人管理", "添加就诊人", "家人", "患者管理", "绑定就诊人"],
    isTabBar: false
  },

  // ==================== 健康档案 ====================
  {
    path: "pages/profile/health/index",
    title: "健康档案",
    description: "查看个人健康档案，包括基本信息、病历和就诊记录",
    keywords: ["健康档案", "健康记录", "我的档案", "健康信息", "体检记录"],
    isTabBar: false
  },
  {
    path: "pages/profile/health/basic-info",
    title: "编辑基本信息",
    description: "编辑个人健康基本信息，如身高、体重、血型等",
    keywords: ["编辑基本信息", "修改信息", "健康信息编辑"],
    isTabBar: false
  },
  {
    path: "pages/profile/health/medical-record/detail",
    title: "病历详情",
    description: "查看某次就诊的详细病历记录",
    keywords: ["病历详情", "病历", "就诊记录详情", "看病记录"],
    isTabBar: false,
    requiredParams: ["recordId"]
  },

  // ==================== 身份认证 ====================
  {
    path: "pages/profile/verify-identity",
    title: "校内身份认证",
    description: "进行校内身份认证，绑定学号/工号",
    keywords: ["身份认证", "实名认证", "校内认证", "认证", "绑定学号", "验证身份"],
    isTabBar: false
  },

  // ==================== 账号设置 ====================
  {
    path: "pages/profile/settings",
    title: "账号设置",
    description: "账号设置页面，修改密码、退出登录等",
    keywords: ["设置", "账号设置", "修改密码", "账户设置", "系统设置"],
    isTabBar: false
  },

  // ==================== 消息中心（TabBar） ====================
  {
    path: "pages/message/index",
    title: "消息中心",
    description: "查看系统消息、预约提醒、候补通知等",
    keywords: ["消息", "消息中心", "通知", "提醒", "消息列表"],
    isTabBar: true
  },

  // ==================== 其他功能 ====================
  {
    path: "pages/features/doctors",
    title: "科室专家",
    description: "浏览和搜索所有科室的专家医生",
    keywords: ["科室专家", "专家", "医生列表", "找专家", "所有医生", "专家介绍"],
    isTabBar: false
  },
  {
    path: "pages/features/ai-assistant",
    title: "AI就医助手",
    description: "AI智能助手，帮助解答就医相关问题",
    keywords: ["AI助手", "智能助手", "就医助手", "AI", "人工智能", "智能问诊"],
    isTabBar: false
  },
  {
    path: "pages/features/feedback",
    title: "意见反馈",
    description: "提交意见和建议，反馈问题",
    keywords: ["意见反馈", "反馈", "建议", "投诉", "问题反馈", "提意见"],
    isTabBar: false
  }
];

// ============================================================================
// DeepSeek Tool 定义
// ============================================================================

/**
 * 供 DeepSeek API 使用的 Tool 定义
 * 
 * 此定义遵循 DeepSeek Tool Calls 规范，可直接添加到 tools 数组中。
 * 
 * @example
 * const TOOLS = [
 *   ...otherTools,
 *   NAVIGATE_TO_PAGE_TOOL
 * ];
 */
export const NAVIGATE_TO_PAGE_TOOL = {
  type: "function",
  function: {
    name: "navigateToPage",
    description: `导航到医院预约系统的指定页面。根据用户的意图，跳转到相应的功能页面。

可用页面及其用途:
【预约挂号流程】
- "select-hospital": 开始预约挂号，选择院区
- "select-department": 选择就诊科室
- "select-doctor": 选择医生和时间
- "confirm-appointment": 确认预约信息
- "payment": 支付挂号费
- "appointment-success": 查看预约成功详情

【候补功能】
- "confirm-waitlist": 申请候补号源
- "waitlist-success": 查看候补成功详情

【改约功能】
- "reschedule-select": 选择新的就诊时间
- "reschedule-confirm": 确认改约

【个人中心】
- "home": 返回首页
- "profile": 个人中心
- "appointments": 查看我的预约记录
- "waitlist": 查看我的候补记录
- "patients": 就诊人管理
- "health": 健康档案
- "settings": 账号设置
- "verify-identity": 身份认证

【消息和其他】
- "messages": 消息中心
- "doctors": 浏览科室专家
- "feedback": 意见反馈
- "login": 登录页面
- "register": 注册页面`,
    parameters: {
      type: "object",
      properties: {
        pageName: {
          type: "string",
          description: "目标页面的名称标识符",
          enum: [
            "home",
            "login",
            "register",
            "select-hospital",
            "select-department",
            "select-doctor",
            "confirm-appointment",
            "payment",
            "appointment-success",
            "confirm-waitlist",
            "waitlist-success",
            "reschedule-select",
            "reschedule-confirm",
            "profile",
            "appointments",
            "waitlist",
            "patients",
            "health",
            "health-basic-info",
            "medical-record-detail",
            "verify-identity",
            "settings",
            "messages",
            "doctors",
            "ai-assistant",
            "feedback"
          ]
        },
        params: {
          type: "object",
          description: "传递给目标页面的参数（键值对形式）。例如：{\"doctorId\": \"123\", \"date\": \"2024-01-15\"}",
          properties: {
            hospitalId: {
              type: "string",
              description: "医院/院区ID"
            },
            departmentId: {
              type: "string",
              description: "科室ID"
            },
            doctorId: {
              type: "string",
              description: "医生ID"
            },
            scheduleId: {
              type: "string",
              description: "排班ID"
            },
            appointmentId: {
              type: "string",
              description: "预约ID"
            },
            waitlistId: {
              type: "string",
              description: "候补ID"
            },
            recordId: {
              type: "string",
              description: "病历记录ID"
            },
            date: {
              type: "string",
              description: "日期，格式：YYYY-MM-DD"
            }
          }
        }
      },
      required: ["pageName"],
      additionalProperties: false
    }
  }
};

/**
 * 严格模式下的 Tool 定义（Beta功能）
 * 
 * 使用 strict 模式时，模型输出会严格遵循 JSON Schema 格式。
 * 需要设置 base_url="https://api.deepseek.com/beta" 来启用。
 */
export const NAVIGATE_TO_PAGE_TOOL_STRICT = {
  type: "function",
  function: {
    name: "navigateToPage",
    strict: true,
    description: NAVIGATE_TO_PAGE_TOOL.function.description,
    parameters: {
      type: "object",
      properties: {
        pageName: {
          type: "string",
          description: "目标页面的名称标识符",
          enum: NAVIGATE_TO_PAGE_TOOL.function.parameters.properties.pageName.enum
        },
        params: {
          type: "object",
          description: "传递给目标页面的参数",
          properties: {
            hospitalId: { type: "string", description: "医院/院区ID" },
            departmentId: { type: "string", description: "科室ID" },
            doctorId: { type: "string", description: "医生ID" },
            scheduleId: { type: "string", description: "排班ID" },
            appointmentId: { type: "string", description: "预约ID" },
            waitlistId: { type: "string", description: "候补ID" },
            recordId: { type: "string", description: "病历记录ID" },
            date: { type: "string", description: "日期，格式：YYYY-MM-DD" }
          },
          required: [],
          additionalProperties: false
        }
      },
      required: ["pageName", "params"],
      additionalProperties: false
    }
  }
};

// ============================================================================
// 页面名称到路径的映射
// ============================================================================

/**
 * 页面名称标识符到路由配置的映射表
 * @type {Object.<string, {path: string, isTabBar: boolean}>}
 */
const PAGE_NAME_MAP = {
  // 首页和认证
  "home": { path: "pages/home/index", isTabBar: true },
  "login": { path: "pages/auth/login", isTabBar: false },
  "register": { path: "pages/auth/register", isTabBar: false },
  
  // 预约挂号流程
  "select-hospital": { path: "pages/home/appointment/select-hospital", isTabBar: false },
  "select-department": { path: "pages/home/appointment/select-department", isTabBar: false },
  "select-doctor": { path: "pages/home/appointment/select-doctor", isTabBar: false },
  "confirm-appointment": { path: "pages/home/appointment/confirm", isTabBar: false },
  "payment": { path: "pages/home/appointment/payment", isTabBar: false },
  "appointment-success": { path: "pages/home/appointment/success", isTabBar: false },
  
  // 候补功能
  "confirm-waitlist": { path: "pages/home/waitlist/confirm-waitlist", isTabBar: false },
  "waitlist-success": { path: "pages/home/waitlist/waitlist-success", isTabBar: false },
  
  // 改约功能
  "reschedule-select": { path: "pages/home/reschedule/select-schedule", isTabBar: false },
  "reschedule-confirm": { path: "pages/home/reschedule/confirm", isTabBar: false },
  
  // 个人中心
  "profile": { path: "pages/profile/index", isTabBar: true },
  "appointments": { path: "pages/profile/appointments", isTabBar: false },
  "waitlist": { path: "pages/profile/waitlist", isTabBar: false },
  "patients": { path: "pages/profile/patients", isTabBar: false },
  "health": { path: "pages/profile/health/index", isTabBar: false },
  "health-basic-info": { path: "pages/profile/health/basic-info", isTabBar: false },
  "medical-record-detail": { path: "pages/profile/health/medical-record/detail", isTabBar: false },
  "verify-identity": { path: "pages/profile/verify-identity", isTabBar: false },
  "settings": { path: "pages/profile/settings", isTabBar: false },
  
  // 消息中心
  "messages": { path: "pages/message/index", isTabBar: true },
  
  // 其他功能
  "doctors": { path: "pages/features/doctors", isTabBar: false },
  "ai-assistant": { path: "pages/features/ai-assistant", isTabBar: false },
  "feedback": { path: "pages/features/feedback", isTabBar: false }
};

// ============================================================================
// 导航函数
// ============================================================================

/**
 * 构建带查询参数的 URL
 * @param {string} basePath - 基础路径
 * @param {Object} params - 查询参数对象
 * @returns {string} 完整的 URL 路径
 */
function buildUrl(basePath, params = {}) {
  const queryString = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  
  return queryString ? `/${basePath}?${queryString}` : `/${basePath}`;
}

/**
 * 执行页面导航
 * 
 * 根据页面类型自动选择正确的导航方式：
 * - TabBar 页面使用 uni.switchTab
 * - 普通页面使用 uni.navigateTo
 * 
 * @param {string} pageName - 页面名称标识符
 * @param {Object} params - 页面参数
 * @returns {Promise<{success: boolean, message: string, url?: string}>}
 */
export async function navigateToPage(pageName, params = {}) {
  const pageConfig = PAGE_NAME_MAP[pageName];
  
  if (!pageConfig) {
    return {
      success: false,
      message: `未知的页面: "${pageName}"。请使用有效的页面名称。`,
      availablePages: Object.keys(PAGE_NAME_MAP)
    };
  }
  
  const { path, isTabBar } = pageConfig;
  const url = buildUrl(path, params);
  
  return new Promise((resolve) => {
    if (isTabBar) {
      // TabBar 页面不支持传参，使用 switchTab
      uni.switchTab({
        url: `/${path}`,
        success: () => {
          resolve({
            success: true,
            message: `已跳转到${getPageTitle(pageName)}`,
            url: `/${path}`
          });
        },
        fail: (err) => {
          console.error('页面跳转失败:', err);
          resolve({
            success: false,
            message: `跳转失败: ${err.errMsg || '未知错误'}`
          });
        }
      });
    } else {
      // 普通页面使用 navigateTo
      uni.navigateTo({
        url: url,
        success: () => {
          resolve({
            success: true,
            message: `已跳转到${getPageTitle(pageName)}`,
            url: url
          });
        },
        fail: (err) => {
          console.error('页面跳转失败:', err);
          // 尝试使用 redirectTo
          uni.redirectTo({
            url: url,
            success: () => {
              resolve({
                success: true,
                message: `已跳转到${getPageTitle(pageName)}`,
                url: url
              });
            },
            fail: (err2) => {
              resolve({
                success: false,
                message: `跳转失败: ${err2.errMsg || err.errMsg || '未知错误'}`
              });
            }
          });
        }
      });
    }
  });
}

/**
 * 获取页面标题
 * @param {string} pageName - 页面名称标识符
 * @returns {string} 页面标题
 */
function getPageTitle(pageName) {
  const titleMap = {
    "home": "首页",
    "login": "登录",
    "register": "注册",
    "select-hospital": "选择院区",
    "select-department": "选择科室",
    "select-doctor": "选择医生",
    "confirm-appointment": "确认预约",
    "payment": "支付",
    "appointment-success": "预约成功",
    "confirm-waitlist": "候补号源",
    "waitlist-success": "候补成功",
    "reschedule-select": "选择新的就诊时间",
    "reschedule-confirm": "确认改约",
    "profile": "个人中心",
    "appointments": "我的预约",
    "waitlist": "我的候补",
    "patients": "就诊人管理",
    "health": "健康档案",
    "health-basic-info": "编辑基本信息",
    "medical-record-detail": "病历详情",
    "verify-identity": "校内身份认证",
    "settings": "账号设置",
    "messages": "消息中心",
    "doctors": "科室专家",
    "ai-assistant": "AI就医助手",
    "feedback": "意见反馈"
  };
  
  return titleMap[pageName] || pageName;
}

/**
 * 供 AI Tool Call 使用的导航函数
 * 
 * 此函数将被 context-manager.js 调用，用于处理 AI 的导航请求。
 * 
 * @param {Object} args - AI 传递的参数
 * @param {string} args.pageName - 目标页面名称
 * @param {Object} [args.params] - 页面参数
 * @returns {Promise<string>} JSON 格式的执行结果
 * 
 * @example
 * // AI 调用示例
 * const result = await handleNavigateToolCall({
 *   pageName: "appointments",
 *   params: {}
 * });
 * // 返回: {"success": true, "message": "已跳转到我的预约"}
 */
export async function handleNavigateToolCall(args) {
  const { pageName, params = {} } = args;
  
  console.log(`🧭 导航工具调用: pageName=${pageName}, params=`, params);
  
  const result = await navigateToPage(pageName, params);
  
  console.log(`🧭 导航结果:`, result);
  
  return JSON.stringify(result);
}

// ============================================================================
// 辅助函数 - 用于 AI 智能匹配
// ============================================================================

/**
 * 根据用户意图智能匹配最合适的页面
 * 
 * 此函数可用于预处理用户输入，帮助 AI 更准确地选择目标页面。
 * 
 * @param {string} userIntent - 用户意图描述
 * @returns {Object|null} 匹配到的页面信息，或 null
 * 
 * @example
 * matchPageByIntent("我想预约挂号")
 * // 返回: { pageName: "select-hospital", confidence: 0.9, ... }
 */
export function matchPageByIntent(userIntent) {
  if (!userIntent) return null;
  
  const lowerIntent = userIntent.toLowerCase();
  
  for (const route of PAGE_ROUTES) {
    for (const keyword of route.keywords) {
      if (lowerIntent.includes(keyword.toLowerCase())) {
        return {
          pageName: getPageNameFromPath(route.path),
          path: route.path,
          title: route.title,
          description: route.description,
          matchedKeyword: keyword
        };
      }
    }
  }
  
  return null;
}

/**
 * 从路径获取页面名称
 * @param {string} path - 页面路径
 * @returns {string|null} 页面名称
 */
function getPageNameFromPath(path) {
  for (const [name, config] of Object.entries(PAGE_NAME_MAP)) {
    if (config.path === path) {
      return name;
    }
  }
  return null;
}

/**
 * 获取所有可用页面的简要列表
 * 供 AI 查询可用页面时使用
 * 
 * @returns {string} JSON 格式的页面列表
 */
export function getAvailablePages() {
  const pages = Object.entries(PAGE_NAME_MAP).map(([name, config]) => ({
    name,
    title: getPageTitle(name),
    isTabBar: config.isTabBar
  }));
  
  return JSON.stringify({
    message: "可用页面列表",
    pages
  });
}

// ============================================================================
// 导出默认对象
// ============================================================================

export default {
  // Tool 定义
  NAVIGATE_TO_PAGE_TOOL,
  NAVIGATE_TO_PAGE_TOOL_STRICT,
  
  // 路由配置
  PAGE_ROUTES,
  
  // 核心函数
  navigateToPage,
  handleNavigateToolCall,
  
  // 辅助函数
  matchPageByIntent,
  getAvailablePages
};

