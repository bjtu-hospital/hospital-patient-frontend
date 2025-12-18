/**
 * 科室查询和推荐工具
 * 
 * 此文件为 AI 助手提供科室查询和智能推荐能力，供 DeepSeek Tool Calls 模式使用。
 * 
 * @description
 * 该工具允许 AI 根据用户症状、需求等，查询科室信息并推荐合适的科室。
 * 支持按大科室分类查询、按关键词搜索、按症状推荐等功能。
 */

import request from '@/api/request.js';

// ============================================================================
// 症状-科室映射表（用于智能推荐）
// ============================================================================

/**
 * 症状关键词到科室的映射
 * 用于根据用户描述的症状推荐合适的科室
 */
const SYMPTOM_DEPARTMENT_MAP = {
  // 内科相关
  '头痛': ['神经内科', '内科'],
  '头晕': ['神经内科', '心血管内科', '耳鼻喉科'],
  '发烧': ['感染疾病科', '急诊科', '儿科'],
  '发热': ['感染疾病科', '急诊科', '儿科'],
  '感冒': ['呼吸与危重医学科', '急诊科', '全科医学'],
  '咳嗽': ['呼吸与危重医学科', '儿科'],
  '胸闷': ['心血管内科', '呼吸与危重医学科'],
  '心悸': ['心血管内科'],
  '高血压': ['心血管内科'],
  '糖尿病': ['内分泌科'],
  '甲亢': ['内分泌科'],
  '甲减': ['内分泌科'],
  '甲状腺': ['内分泌科', '普通外科'],
  '胃痛': ['消化科'],
  '胃炎': ['消化科'],
  '腹痛': ['消化科', '普通外科', '急诊科'],
  '腹泻': ['消化科', '感染疾病科'],
  '便秘': ['消化科'],
  '肝病': ['消化科', '感染疾病科'],
  '肾病': ['肾内科'],
  '尿血': ['肾内科', '泌尿外科'],
  '贫血': ['血液内科'],
  '白血病': ['血液内科'],
  '风湿': ['风湿免疫科'],
  '关节痛': ['风湿免疫科', '骨科'],
  '红斑狼疮': ['风湿免疫科'],
  '失眠': ['神经内科', '中医科'],
  '中风': ['神经内科'],
  '癫痫': ['神经内科'],
  '帕金森': ['神经内科'],
  '老年病': ['老年内科'],
  
  // 外科相关
  '骨折': ['骨科', '急诊科'],
  '腰痛': ['骨科', '康复医学科'],
  '颈椎': ['骨科', '康复医学科'],
  '腰椎': ['骨科'],
  '关节': ['骨科', '运动医学科'],
  '肿瘤': ['肿瘤放疗科', '肿瘤化疗与放射病科', '普通外科'],
  '癌症': ['肿瘤放疗科', '肿瘤化疗与放射病科'],
  '乳腺': ['普通外科'],
  '阑尾炎': ['普通外科'],
  '疝气': ['普通外科'],
  '结石': ['泌尿外科'],
  '前列腺': ['泌尿外科'],
  '肺癌': ['胸外科', '肿瘤放疗科'],
  '心脏手术': ['心脏外科'],
  '脑瘤': ['神经外科'],
  '整形': ['成形科(整形外科)'],
  '血管': ['介入血管科'],
  '运动损伤': ['运动医学科'],
  '康复': ['康复医学科'],
  
  // 妇产科
  '怀孕': ['妇产科'],
  '月经': ['妇产科'],
  '妇科': ['妇产科'],
  '不孕': ['生殖医学中心'],
  '试管婴儿': ['生殖医学中心'],
  
  // 五官科
  '眼睛': ['眼科'],
  '近视': ['眼科'],
  '白内障': ['眼科'],
  '青光眼': ['眼科'],
  '耳朵': ['耳鼻喉科'],
  '耳鸣': ['耳鼻喉科'],
  '鼻炎': ['耳鼻喉科'],
  '咽喉': ['耳鼻喉科'],
  '牙痛': ['口腔科'],
  '牙齿': ['口腔科'],
  '口腔': ['口腔科'],
  
  // 皮肤科
  '皮肤': ['皮肤科'],
  '湿疹': ['皮肤科'],
  '痤疮': ['皮肤科'],
  '痘痘': ['皮肤科'],
  '脱发': ['皮肤科'],
  '过敏': ['皮肤科', '风湿免疫科'],
  
  // 儿科
  '小孩': ['儿科'],
  '儿童': ['儿科'],
  '宝宝': ['儿科'],
  '婴儿': ['儿科'],
  
  // 中医
  '中医': ['中医科'],
  '针灸': ['中医科'],
  '推拿': ['中医科'],
  '调理': ['中医科'],
  
  // 其他
  '体检': ['体检中心'],
  '疼痛': ['疼痛医学中心'],
  '营养': ['临床营养科'],
  '职业病': ['职业病科']
};

// ============================================================================
// API 调用函数
// ============================================================================

/**
 * 获取所有大科室列表
 * @returns {Promise<Array>} 大科室列表
 */
export async function getMajorDepartments() {
  try {
    const res = await request.get('/patient/major-departments');
    console.log('🏥 getMajorDepartments 响应:', res);
    
    const departments = res?.departments || res || [];
    return Array.isArray(departments) ? departments : [];
  } catch (error) {
    console.error('❌ 获取大科室列表失败:', error);
    throw error;
  }
}

/**
 * 获取小科室列表
 * @param {number|null} majorDeptId - 大科室ID，可选，用于过滤
 * @param {number} page - 页码，默认1
 * @param {number} pageSize - 每页数量，默认50
 * @returns {Promise<Object>} 包含 total, departments 的对象
 */
export async function getMinorDepartments(majorDeptId = null, page = 1, pageSize = 50) {
  try {
    const params = { page, page_size: pageSize };
    if (majorDeptId) {
      params.major_dept_id = majorDeptId;
    }
    
    const res = await request.get('/patient/minor-departments', { params });
    console.log('🏥 getMinorDepartments 响应:', res);
    
    // 响应拦截器已提取 message 字段
    return {
      total: res?.total || 0,
      page: res?.page || page,
      pageSize: res?.page_size || pageSize,
      departments: res?.departments || []
    };
  } catch (error) {
    console.error('❌ 获取小科室列表失败:', error);
    throw error;
  }
}

/**
 * 获取院区列表
 * @param {number|null} areaId - 院区ID，可选
 * @returns {Promise<Array>} 院区列表
 */
export async function getHospitals(areaId = null) {
  try {
    const params = areaId ? { area_id: areaId } : {};
    const res = await request.get('/patient/hospitals', { params });
    console.log('🏥 getHospitals 响应:', res);
    
    const areas = res?.areas || res || [];
    return Array.isArray(areas) ? areas : [];
  } catch (error) {
    console.error('❌ 获取院区列表失败:', error);
    throw error;
  }
}

// ============================================================================
// AI Tool Call 处理函数
// ============================================================================

/**
 * 查询科室信息
 * 支持按大科室ID过滤、按关键词搜索
 * 
 * @param {Object} args - 查询参数
 * @param {string} [args.keyword] - 搜索关键词
 * @param {number} [args.majorDeptId] - 大科室ID
 * @param {string} [args.type] - 查询类型：'major'(大科室), 'minor'(小科室), 'all'(全部)
 * @returns {Promise<string>} JSON 格式的查询结果
 */
export async function queryDepartments(args = {}) {
  const { keyword = '', majorDeptId = null, type = 'all' } = args;
  
  console.log('🔍 queryDepartments 调用:', args);
  
  try {
    // 只查询大科室
    if (type === 'major') {
      const majorDepts = await getMajorDepartments();
      const formatted = majorDepts.map(d => ({
        id: d.major_dept_id,
        name: d.name,
        type: '大科室',
        description: d.description || ''
      }));
      
      return JSON.stringify({
        success: true,
        type: '大科室列表',
        total: formatted.length,
        departments: formatted
      });
    }
    
    // 只查询小科室（可按大科室过滤）
    if (type === 'minor' || majorDeptId) {
      const result = await getMinorDepartments(majorDeptId);
      let departments = result.departments;
      
      // 如果有关键词，进行过滤
      if (keyword && keyword.trim()) {
        const lowerKeyword = keyword.toLowerCase();
        departments = departments.filter(d =>
          d.name.toLowerCase().includes(lowerKeyword) ||
          (d.description && d.description.toLowerCase().includes(lowerKeyword))
        );
      }
      
      const formatted = departments.map(d => ({
        id: d.minor_dept_id,
        name: d.name,
        type: '小科室',
        majorDeptId: d.major_dept_id,
        description: d.description || '',
        priceNormal: d.default_price_normal,
        priceExpert: d.default_price_expert,
        priceSpecial: d.default_price_special
      }));
      
      return JSON.stringify({
        success: true,
        type: majorDeptId ? `大科室[${majorDeptId}]下的小科室` : '小科室列表',
        total: formatted.length,
        departments: formatted.slice(0, 15) // 限制返回数量
      });
    }
    
    // 查询全部科室
    const [majorDepts, minorResult] = await Promise.all([
      getMajorDepartments(),
      getMinorDepartments()
    ]);
    
    let minorDepts = minorResult.departments;
    
    // 格式化大科室
    const formattedMajor = majorDepts.map(d => ({
      id: d.major_dept_id,
      name: d.name,
      type: '大科室',
      description: d.description || ''
    }));
    
    // 格式化小科室
    let formattedMinor = minorDepts.map(d => ({
      id: d.minor_dept_id,
      name: d.name,
      type: '小科室',
      majorDeptId: d.major_dept_id,
      description: d.description || '',
      priceNormal: d.default_price_normal
    }));
    
    // 如果有关键词，进行过滤
    if (keyword && keyword.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      
      const filteredMajor = formattedMajor.filter(d =>
        d.name.toLowerCase().includes(lowerKeyword) ||
        d.description.toLowerCase().includes(lowerKeyword)
      );
      
      formattedMinor = formattedMinor.filter(d =>
        d.name.toLowerCase().includes(lowerKeyword) ||
        d.description.toLowerCase().includes(lowerKeyword)
      );
      
      if (filteredMajor.length === 0 && formattedMinor.length === 0) {
        return JSON.stringify({
          success: true,
          message: `未找到包含"${keyword}"的科室`,
          suggestion: '您可以尝试描述您的症状，我来为您推荐合适的科室'
        });
      }
      
      return JSON.stringify({
        success: true,
        type: '搜索结果',
        keyword: keyword,
        majorDepartments: filteredMajor,
        minorDepartments: formattedMinor.slice(0, 10)
      });
    }
    
    return JSON.stringify({
      success: true,
      type: '全部科室',
      majorDepartments: formattedMajor,
      minorDepartments: formattedMinor.slice(0, 10) // 限制数量
    });
    
  } catch (error) {
    console.error('❌ queryDepartments 错误:', error);
    return JSON.stringify({
      success: false,
      error: '查询科室失败: ' + error.message
    });
  }
}

/**
 * 根据症状推荐科室
 * 
 * @param {Object} args - 参数
 * @param {string} args.symptoms - 症状描述
 * @returns {Promise<string>} JSON 格式的推荐结果
 */
export async function recommendDepartmentBySymptom(args = {}) {
  const { symptoms = '' } = args;
  
  console.log('🩺 recommendDepartmentBySymptom 调用:', args);
  
  if (!symptoms || !symptoms.trim()) {
    return JSON.stringify({
      success: false,
      error: '请描述您的症状，以便为您推荐合适的科室'
    });
  }
  
  try {
    // 从症状映射表中匹配
    const lowerSymptoms = symptoms.toLowerCase();
    const matchedDepts = new Set();
    const matchedSymptoms = [];
    
    for (const [symptom, depts] of Object.entries(SYMPTOM_DEPARTMENT_MAP)) {
      if (lowerSymptoms.includes(symptom.toLowerCase())) {
        matchedSymptoms.push(symptom);
        depts.forEach(d => matchedDepts.add(d));
      }
    }
    
    // 获取所有小科室用于匹配
    const minorResult = await getMinorDepartments();
    const allDepts = minorResult.departments;
    
    // 找到匹配的科室详情
    const recommendations = [];
    for (const deptName of matchedDepts) {
      const found = allDepts.find(d => d.name.includes(deptName) || deptName.includes(d.name));
      if (found) {
        recommendations.push({
          id: found.minor_dept_id,
          name: found.name,
          description: found.description,
          priceNormal: found.default_price_normal,
          priceExpert: found.default_price_expert,
          matchReason: `与症状"${matchedSymptoms.join('、')}"相关`
        });
      }
    }
    
    // 如果没有匹配到，进行模糊搜索
    if (recommendations.length === 0) {
      const fuzzyMatched = allDepts.filter(d =>
        d.name.toLowerCase().includes(lowerSymptoms) ||
        (d.description && d.description.toLowerCase().includes(lowerSymptoms))
      );
      
      if (fuzzyMatched.length > 0) {
        fuzzyMatched.slice(0, 5).forEach(d => {
          recommendations.push({
            id: d.minor_dept_id,
            name: d.name,
            description: d.description,
            priceNormal: d.default_price_normal,
            matchReason: '根据描述模糊匹配'
          });
        });
      }
    }
    
    if (recommendations.length === 0) {
      return JSON.stringify({
        success: true,
        message: `未能根据"${symptoms}"找到精确匹配的科室`,
        suggestion: '建议您先挂全科医学或急诊科进行初步诊断，医生会根据情况为您转诊',
        fallbackDepartments: ['全科医学', '急诊科']
      });
    }
    
    return JSON.stringify({
      success: true,
      symptoms: symptoms,
      matchedSymptoms: matchedSymptoms,
      recommendations: recommendations.slice(0, 5),
      tip: '以上是根据您的症状推荐的科室，建议优先选择排在前面的科室就诊'
    });
    
  } catch (error) {
    console.error('❌ recommendDepartmentBySymptom 错误:', error);
    return JSON.stringify({
      success: false,
      error: '推荐科室失败: ' + error.message
    });
  }
}

/**
 * 查询院区信息
 * 
 * @param {Object} args - 参数
 * @param {number} [args.areaId] - 院区ID
 * @param {string} [args.keyword] - 搜索关键词
 * @returns {Promise<string>} JSON 格式的院区列表
 */
export async function queryHospitals(args = {}) {
  const { areaId = null, keyword = '' } = args;
  
  console.log('🏥 queryHospitals 调用:', args);
  
  try {
    let hospitals = await getHospitals(areaId);
    
    // 格式化
    let formatted = hospitals.map(h => ({
      id: h.area_id,
      name: h.name,
      address: h.destination,
      createTime: h.create_time
    }));
    
    // 关键词过滤
    if (keyword && keyword.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      formatted = formatted.filter(h =>
        h.name.toLowerCase().includes(lowerKeyword) ||
        (h.address && h.address.toLowerCase().includes(lowerKeyword))
      );
    }
    
    return JSON.stringify({
      success: true,
      total: formatted.length,
      hospitals: formatted
    });
    
  } catch (error) {
    console.error('❌ queryHospitals 错误:', error);
    return JSON.stringify({
      success: false,
      error: '查询院区失败: ' + error.message
    });
  }
}

// ============================================================================
// DeepSeek Tool 定义
// ============================================================================

/**
 * 查询科室工具定义
 */
export const QUERY_DEPARTMENTS_TOOL = {
  type: "function",
  function: {
    name: "queryDepartments",
    description: `查询医院科室信息。可以查询大科室、小科室，支持按关键词搜索。

使用场景：
- 用户询问"有哪些科室"、"科室列表"
- 用户想了解某个具体科室的信息
- 用户按关键词搜索科室，如"内科"、"外科"

返回信息包括：科室ID、名称、描述、价格等`,
    parameters: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "搜索关键词，如'内科'、'骨科'、'心血管'等"
        },
        majorDeptId: {
          type: "integer",
          description: "大科室ID，用于查询某个大科室下的所有小科室。1=内科系统, 2=医技科室, 3=外科系统"
        },
        type: {
          type: "string",
          description: "查询类型",
          enum: ["major", "minor", "all"]
        }
      },
      required: []
    }
  }
};

/**
 * 症状推荐科室工具定义
 */
export const RECOMMEND_DEPARTMENT_TOOL = {
  type: "function",
  function: {
    name: "recommendDepartmentBySymptom",
    description: `根据用户描述的症状，智能推荐合适的就诊科室。

使用场景：
- 用户描述症状但不知道该挂什么科，如"我头痛应该挂什么科"
- 用户有多种症状想知道去哪个科室
- 用户问"XX症状看什么科"

会根据症状匹配相关科室并给出推荐理由`,
    parameters: {
      type: "object",
      properties: {
        symptoms: {
          type: "string",
          description: "用户描述的症状，如'头痛头晕'、'咳嗽发烧'、'腰痛'等"
        }
      },
      required: ["symptoms"]
    }
  }
};

/**
 * 查询院区工具定义
 */
export const QUERY_HOSPITALS_TOOL = {
  type: "function",
  function: {
    name: "queryHospitals",
    description: `查询医院院区信息。

使用场景：
- 用户询问"有哪些院区"、"医院地址"
- 用户想了解某个具体院区的信息
- 用户按位置搜索院区

返回信息包括：院区ID、名称、地址等`,
    parameters: {
      type: "object",
      properties: {
        areaId: {
          type: "integer",
          description: "院区ID，查询特定院区信息"
        },
        keyword: {
          type: "string",
          description: "搜索关键词，如'海淀'、'朝阳'等"
        }
      },
      required: []
    }
  }
};

// ============================================================================
// 导出
// ============================================================================

export default {
  // API 函数
  getMajorDepartments,
  getMinorDepartments,
  getHospitals,
  
  // Tool Call 处理函数
  queryDepartments,
  recommendDepartmentBySymptom,
  queryHospitals,
  
  // Tool 定义
  QUERY_DEPARTMENTS_TOOL,
  RECOMMEND_DEPARTMENT_TOOL,
  QUERY_HOSPITALS_TOOL,
  
  // 症状映射表
  SYMPTOM_DEPARTMENT_MAP
};
