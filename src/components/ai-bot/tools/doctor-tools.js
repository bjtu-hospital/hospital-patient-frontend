/**
 * 医生查询工具
 * 
 * 此文件为 AI 助手提供医生查询和推荐能力，供 DeepSeek Tool Calls 模式使用。
 * 
 * @description
 * 该工具允许 AI 根据用户需求查询医生信息，支持按科室、姓名、职称、专长等条件搜索。
 */

import request from '@/api/request.js';

// ============================================================================
// API 调用函数
// ============================================================================

/**
 * 获取医生列表
 * @param {Object} options - 查询参数
 * @param {number} [options.deptId] - 科室ID
 * @param {string} [options.keyword] - 搜索关键词（姓名、专长等）
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.pageSize=50] - 每页数量
 * @returns {Promise<Object>} 包含 total, doctors 的对象
 */
export async function getDoctors(options = {}) {
  const { deptId = null, keyword = '', page = 1, pageSize = 50 } = options;
  
  try {
    const params = { page, page_size: pageSize };
    if (deptId) {
      params.dept_id = deptId;
    }
    
    const res = await request.get('/patient/doctors', { params });
    console.log('👨‍⚕️ getDoctors 响应:', res);
    
    // 响应拦截器已提取 message 字段
    let doctors = res?.doctors || [];
    
    // 如果有关键词，进行本地过滤
    if (keyword && keyword.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      doctors = doctors.filter(doc =>
        (doc.name && doc.name.toLowerCase().includes(lowerKeyword)) ||
        (doc.title && doc.title.toLowerCase().includes(lowerKeyword)) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(lowerKeyword))
      );
    }
    
    return {
      total: res?.total || doctors.length,
      page: res?.page || page,
      pageSize: res?.page_size || pageSize,
      doctors: doctors
    };
  } catch (error) {
    console.error('❌ 获取医生列表失败:', error);
    throw error;
  }
}

/**
 * 根据医生ID获取医生详情
 * @param {number} doctorId - 医生ID
 * @returns {Promise<Object|null>} 医生详情或null
 */
export async function getDoctorById(doctorId) {
  try {
    // 注意：如果后端有单独的医生详情接口，可以直接调用
    // 这里暂时通过列表接口获取
    const result = await getDoctors();
    const doctor = result.doctors.find(d => d.doctor_id === doctorId);
    return doctor || null;
  } catch (error) {
    console.error('❌ 获取医生详情失败:', error);
    throw error;
  }
}

// ============================================================================
// 职称等级映射（用于排序和推荐）
// ============================================================================

/**
 * 医生职称等级映射
 * 数字越大，职称越高
 */
const TITLE_LEVEL_MAP = {
  '教授': 10,
  '主任医师': 9,
  '博士生导师': 8,
  '硕士生导师': 7,
  '副教授': 6,
  '副主任医师': 5,
  '研究员': 5,
  '副研究员': 4,
  '主治医师': 3,
  '住院医师': 2,
  '医师': 1
};

/**
 * 计算医生职称等级
 * @param {string} title - 医生职称
 * @returns {number} 职称等级分数
 */
function calculateTitleLevel(title) {
  if (!title) return 0;
  
  let maxLevel = 0;
  for (const [key, level] of Object.entries(TITLE_LEVEL_MAP)) {
    if (title.includes(key) && level > maxLevel) {
      maxLevel = level;
    }
  }
  return maxLevel;
}

// ============================================================================
// AI Tool Call 处理函数
// ============================================================================

/**
 * 查询医生信息
 * 
 * @param {Object} args - 查询参数
 * @param {string} [args.keyword] - 搜索关键词（姓名、专长等）
 * @param {number} [args.deptId] - 科室ID
 * @param {string} [args.deptName] - 科室名称（会尝试匹配科室ID）
 * @param {string} [args.title] - 职称筛选
 * @param {string} [args.specialty] - 专长筛选
 * @returns {Promise<string>} JSON 格式的查询结果
 */
export async function queryDoctors(args = {}) {
  const { keyword = '', deptId = null, deptName = '', title = '', specialty = '' } = args;
  
  console.log('🔍 queryDoctors 调用:', args);
  
  try {
    // 获取医生列表
    const result = await getDoctors({ deptId, keyword, pageSize: 100 });
    let doctors = result.doctors;
    
    // 按职称筛选
    if (title && title.trim()) {
      const lowerTitle = title.toLowerCase();
      doctors = doctors.filter(doc =>
        doc.title && doc.title.toLowerCase().includes(lowerTitle)
      );
    }
    
    // 按专长筛选
    if (specialty && specialty.trim()) {
      const lowerSpecialty = specialty.toLowerCase();
      doctors = doctors.filter(doc =>
        doc.specialty && doc.specialty.toLowerCase().includes(lowerSpecialty)
      );
    }
    
    // 按科室名称筛选（模糊匹配）
    if (deptName && deptName.trim()) {
      // 这里可以进一步优化：先查询科室ID再筛选
      // 暂时通过 dept_id 关联（需要科室信息）
    }
    
    // 按职称等级排序（高职称优先）
    doctors.sort((a, b) => {
      const levelA = calculateTitleLevel(a.title);
      const levelB = calculateTitleLevel(b.title);
      return levelB - levelA;
    });
    
    // 格式化输出
    const formatted = doctors.slice(0, 15).map(doc => ({
      id: doc.doctor_id,
      name: doc.name,
      title: doc.title || '医师',
      deptId: doc.dept_id,
      specialty: doc.specialty ? (doc.specialty.length > 100 ? doc.specialty.substring(0, 100) + '...' : doc.specialty) : '',
      photoPath: doc.photo_path
    }));
    
    if (formatted.length === 0) {
      return JSON.stringify({
        success: true,
        message: keyword ? `未找到包含"${keyword}"的医生` : '暂无医生信息',
        suggestion: '您可以尝试其他搜索条件，或直接浏览科室专家页面'
      });
    }
    
    return JSON.stringify({
      success: true,
      total: result.total,
      displayCount: formatted.length,
      doctors: formatted,
      tip: formatted.length < result.total ? `共${result.total}位医生，这里显示前${formatted.length}位` : undefined
    });
    
  } catch (error) {
    console.error('❌ queryDoctors 错误:', error);
    return JSON.stringify({
      success: false,
      error: '查询医生失败: ' + error.message
    });
  }
}

/**
 * 根据症状或需求推荐医生
 * 
 * @param {Object} args - 参数
 * @param {string} args.symptoms - 症状描述或需求
 * @param {number} [args.deptId] - 指定科室ID
 * @returns {Promise<string>} JSON 格式的推荐结果
 */
export async function recommendDoctors(args = {}) {
  const { symptoms = '', deptId = null } = args;
  
  console.log('🩺 recommendDoctors 调用:', args);
  
  if (!symptoms && !deptId) {
    return JSON.stringify({
      success: false,
      error: '请描述您的症状或需求，以便为您推荐合适的医生'
    });
  }
  
  try {
    // 获取医生列表
    const result = await getDoctors({ deptId, pageSize: 100 });
    let doctors = result.doctors;
    
    // 按症状匹配专长
    if (symptoms && symptoms.trim()) {
      const lowerSymptoms = symptoms.toLowerCase();
      const keywords = lowerSymptoms.split(/[，,、\s]+/).filter(k => k.length > 0);
      
      // 计算每个医生的匹配分数
      doctors = doctors.map(doc => {
        let matchScore = 0;
        const specialty = (doc.specialty || '').toLowerCase();
        
        for (const keyword of keywords) {
          if (specialty.includes(keyword)) {
            matchScore += 2;
          }
          if (doc.name && doc.name.includes(keyword)) {
            matchScore += 3;
          }
        }
        
        // 职称加分
        matchScore += calculateTitleLevel(doc.title) * 0.5;
        
        return { ...doc, matchScore };
      });
      
      // 按匹配分数排序
      doctors.sort((a, b) => b.matchScore - a.matchScore);
      
      // 过滤掉完全没有匹配的（除非总数太少）
      const matched = doctors.filter(d => d.matchScore > 0);
      if (matched.length >= 3) {
        doctors = matched;
      }
    } else {
      // 没有症状描述，按职称排序
      doctors.sort((a, b) => calculateTitleLevel(b.title) - calculateTitleLevel(a.title));
    }
    
    // 格式化输出
    const recommendations = doctors.slice(0, 8).map(doc => ({
      id: doc.doctor_id,
      name: doc.name,
      title: doc.title || '医师',
      deptId: doc.dept_id,
      specialty: doc.specialty ? (doc.specialty.length > 80 ? doc.specialty.substring(0, 80) + '...' : doc.specialty) : '',
      matchReason: doc.matchScore > 0 ? `匹配度: ${Math.round(doc.matchScore)}分` : '按职称推荐'
    }));
    
    if (recommendations.length === 0) {
      return JSON.stringify({
        success: true,
        message: '暂未找到匹配的医生',
        suggestion: '建议您先选择科室，再选择医生进行预约'
      });
    }
    
    return JSON.stringify({
      success: true,
      symptoms: symptoms,
      recommendations: recommendations,
      tip: '以上医生根据专长匹配度和职称等级推荐，建议您根据实际情况选择'
    });
    
  } catch (error) {
    console.error('❌ recommendDoctors 错误:', error);
    return JSON.stringify({
      success: false,
      error: '推荐医生失败: ' + error.message
    });
  }
}

/**
 * 获取医生详细信息
 * 
 * @param {Object} args - 参数
 * @param {number} args.doctorId - 医生ID
 * @param {string} [args.doctorName] - 医生姓名（用于模糊查找）
 * @returns {Promise<string>} JSON 格式的医生详情
 */
export async function getDoctorDetail(args = {}) {
  const { doctorId = null, doctorName = '' } = args;
  
  console.log('👨‍⚕️ getDoctorDetail 调用:', args);
  
  if (!doctorId && !doctorName) {
    return JSON.stringify({
      success: false,
      error: '请提供医生ID或医生姓名'
    });
  }
  
  try {
    const result = await getDoctors({ pageSize: 200 });
    let doctor = null;
    
    if (doctorId) {
      doctor = result.doctors.find(d => d.doctor_id === doctorId);
    } else if (doctorName) {
      // 按姓名精确匹配
      doctor = result.doctors.find(d => d.name === doctorName);
      // 如果没找到，尝试模糊匹配
      if (!doctor) {
        doctor = result.doctors.find(d => d.name && d.name.includes(doctorName));
      }
    }
    
    if (!doctor) {
      return JSON.stringify({
        success: false,
        message: doctorId ? `未找到ID为${doctorId}的医生` : `未找到名为"${doctorName}"的医生`,
        suggestion: '请确认医生信息是否正确，或尝试搜索医生列表'
      });
    }
    
    return JSON.stringify({
      success: true,
      doctor: {
        id: doctor.doctor_id,
        name: doctor.name,
        title: doctor.title || '医师',
        deptId: doctor.dept_id,
        specialty: doctor.specialty || '暂无专长介绍',
        photoPath: doctor.photo_path
      }
    });
    
  } catch (error) {
    console.error('❌ getDoctorDetail 错误:', error);
    return JSON.stringify({
      success: false,
      error: '获取医生详情失败: ' + error.message
    });
  }
}

// ============================================================================
// DeepSeek Tool 定义
// ============================================================================

/**
 * 查询医生工具定义
 */
export const QUERY_DOCTORS_TOOL = {
  type: "function",
  function: {
    name: "queryDoctors",
    description: `查询医生信息。可以按姓名、科室、职称、专长等条件搜索医生。

使用场景：
- 用户询问"有哪些医生"、"医生列表"
- 用户想找某个特定医生，如"找张医生"
- 用户按条件搜索医生，如"心内科有哪些专家"、"擅长高血压的医生"

返回信息包括：医生ID、姓名、职称、科室、专长等`,
    parameters: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description: "搜索关键词，如医生姓名'张'、专长'高血压'等"
        },
        deptId: {
          type: "integer",
          description: "科室ID，用于查询某个科室的医生"
        },
        title: {
          type: "string",
          description: "职称筛选，如'主任医师'、'教授'等"
        },
        specialty: {
          type: "string",
          description: "专长筛选，如'冠心病'、'心力衰竭'等"
        }
      },
      required: []
    }
  }
};

/**
 * 推荐医生工具定义
 */
export const RECOMMEND_DOCTORS_TOOL = {
  type: "function",
  function: {
    name: "recommendDoctors",
    description: `根据用户症状或需求推荐合适的医生。

使用场景：
- 用户描述症状想找医生，如"我高血压，推荐个医生"
- 用户有特定需求，如"想找擅长心脏介入的医生"
- 用户问"哪个医生比较好"

会根据症状匹配医生专长，并按职称等级排序推荐`,
    parameters: {
      type: "object",
      properties: {
        symptoms: {
          type: "string",
          description: "用户的症状描述或需求，如'高血压、冠心病'、'心脏不舒服'等"
        },
        deptId: {
          type: "integer",
          description: "指定科室ID，在该科室内推荐医生"
        }
      },
      required: []
    }
  }
};

/**
 * 获取医生详情工具定义
 */
export const GET_DOCTOR_DETAIL_TOOL = {
  type: "function",
  function: {
    name: "getDoctorDetail",
    description: `获取特定医生的详细信息。

使用场景：
- 用户想了解某个医生的详细信息
- 用户询问"张医生擅长什么"
- 用户问某个医生的职称、专长等

返回医生的完整信息，包括职称、专长介绍等`,
    parameters: {
      type: "object",
      properties: {
        doctorId: {
          type: "integer",
          description: "医生ID"
        },
        doctorName: {
          type: "string",
          description: "医生姓名，如'张三'、'李医生'等"
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
  getDoctors,
  getDoctorById,
  
  // Tool Call 处理函数
  queryDoctors,
  recommendDoctors,
  getDoctorDetail,
  
  // Tool 定义
  QUERY_DOCTORS_TOOL,
  RECOMMEND_DOCTORS_TOOL,
  GET_DOCTOR_DETAIL_TOOL,
  
  // 工具函数
  calculateTitleLevel,
  TITLE_LEVEL_MAP
};
