/**
 * 智能预约导航工具 - DeepSeek Tool Calls
 * 
 * 提供根据医院名称和科室名称直接跳转到预约页面的能力
 * 自动查询医院ID和科室ID，设置store，并跳转到对应页面
 */

import { getHospitals, getDepartments, getMajorDepartments } from '@/api/appointment.js';
import { useAppointmentStore } from '@/stores/appointment.js';

// ==================== API 调用函数 ====================

/**
 * 获取医院/院区列表（使用API映射后的格式）
 * @returns {Promise<Array>} 医院列表
 */
async function fetchHospitals() {
  try {
    const res = await getHospitals();
    return res || [];
  } catch (error) {
    console.error('获取医院列表失败:', error);
    return [];
  }
}

/**
 * 获取科室列表（小科室，使用API格式）
 * @returns {Promise<Array>} 科室列表
 */
async function fetchDepartments() {
  try {
    // 获取所有小科室
    const res = await getDepartments(null, null);
    // 映射字段格式，与页面使用的格式一致
    return (res || []).map(dept => ({
      id: dept.minor_dept_id,           // 小科室ID
      name: dept.name,                   // 科室名称
      category: dept.major_dept_id,      // 所属大科室ID
      majorDeptName: dept.major_dept_name, // 大科室名称
      description: dept.description      // 描述
    }));
  } catch (error) {
    console.error('获取科室列表失败:', error);
    return [];
  }
}

/**
 * 模糊匹配名称
 * @param {string} input - 用户输入
 * @param {string} target - 目标名称
 * @returns {boolean} 是否匹配
 */
function fuzzyMatch(input, target) {
  if (!input || !target) return false;
  const lowerInput = input.toLowerCase().trim();
  const lowerTarget = target.toLowerCase().trim();
  
  // 完全匹配
  if (lowerTarget === lowerInput) return true;
  
  // 包含匹配
  if (lowerTarget.includes(lowerInput) || lowerInput.includes(lowerTarget)) return true;
  
  // 去掉常见后缀后匹配
  const suffixes = ['医院', '本部', '院区', '分院', '科', '门诊'];
  let cleanInput = lowerInput;
  let cleanTarget = lowerTarget;
  
  suffixes.forEach(suffix => {
    cleanInput = cleanInput.replace(suffix, '');
    cleanTarget = cleanTarget.replace(suffix, '');
  });
  
  if (cleanTarget.includes(cleanInput) || cleanInput.includes(cleanTarget)) return true;
  
  return false;
}

/**
 * 查找最匹配的医院
 * @param {string} hospitalName - 医院名称
 * @param {Array} hospitals - 医院列表
 * @returns {Object|null} 匹配的医院
 */
function findBestMatchHospital(hospitalName, hospitals) {
  if (!hospitalName || !hospitals.length) return null;
  
  // 先尝试精确匹配
  const exactMatch = hospitals.find(h => h.name === hospitalName);
  if (exactMatch) return exactMatch;
  
  // 再尝试模糊匹配
  const fuzzyMatches = hospitals.filter(h => fuzzyMatch(hospitalName, h.name));
  
  // 返回最短名称的匹配（通常更精确）
  if (fuzzyMatches.length > 0) {
    fuzzyMatches.sort((a, b) => a.name.length - b.name.length);
    return fuzzyMatches[0];
  }
  
  return null;
}

/**
 * 查找最匹配的科室
 * @param {string} departmentName - 科室名称
 * @param {Array} departments - 科室列表
 * @returns {Object|null} 匹配的科室
 */
function findBestMatchDepartment(departmentName, departments) {
  if (!departmentName || !departments.length) return null;
  
  // 先尝试精确匹配
  const exactMatch = departments.find(d => d.name === departmentName);
  if (exactMatch) return exactMatch;
  
  // 再尝试模糊匹配
  const fuzzyMatches = departments.filter(d => fuzzyMatch(departmentName, d.name));
  
  // 返回最短名称的匹配
  if (fuzzyMatches.length > 0) {
    fuzzyMatches.sort((a, b) => a.name.length - b.name.length);
    return fuzzyMatches[0];
  }
  
  return null;
}

// ==================== 工具定义 ====================

/**
 * 智能预约导航工具定义
 */
export const NAVIGATE_TO_APPOINTMENT_TOOL = {
  type: "function",
  function: {
    name: "navigateToAppointment",
    description: `智能跳转到预约挂号页面。可以根据医院名称和科室名称直接跳转到对应的预约页面。

使用场景：
- 用户说"我要去北京大学第三医院挂心血管内科" → 跳转到该医院该科室的医生选择页面
- 用户说"帮我预约本部的骨科" → 跳转到本部骨科的医生选择页面
- 用户说"去内分泌科挂号" → 跳转到选择医院页面（因为没指定医院）
- 用户说"预约北医三院" → 跳转到该医院的科室选择页面

跳转规则：
1. 只提供医院名称：跳转到该医院的科室选择页面
2. 只提供科室名称：跳转到医院选择页面（提示用户选择医院）
3. 同时提供医院和科室：跳转到医生选择页面`,
    parameters: {
      type: "object",
      properties: {
        hospitalName: {
          type: "string",
          description: "医院/院区名称，如'北京大学第三医院本部'、'海淀北部院区'等"
        },
        departmentName: {
          type: "string",
          description: "科室名称，如'心血管内科'、'骨科'、'皮肤科'等"
        }
      },
      required: []
    }
  }
};

// ==================== 工具处理函数 ====================

/**
 * 智能导航到预约页面
 * @param {Object} args - 参数
 * @param {string} [args.hospitalName] - 医院名称
 * @param {string} [args.departmentName] - 科室名称
 * @returns {Promise<string>} JSON格式的导航结果
 */
export async function navigateToAppointment(args = {}) {
  const { hospitalName, departmentName } = args;
  
  console.log('🚀 智能预约导航:', { hospitalName, departmentName });
  
  try {
    const appointmentStore = useAppointmentStore();
    
    // 清除之前的预约数据
    appointmentStore.clearAppointmentData();
    
    let matchedHospital = null;
    let matchedDepartment = null;
    let targetPage = '';
    let message = '';
    
    // 获取医院和科室列表（使用封装好的API函数）
    const [hospitals, departments] = await Promise.all([
      fetchHospitals(),
      fetchDepartments()
    ]);
    
    // 匹配医院
    if (hospitalName) {
      matchedHospital = findBestMatchHospital(hospitalName, hospitals);
      if (!matchedHospital) {
        // 返回可用的医院列表供用户选择
        const availableHospitals = hospitals.map(h => h.name).join('、');
        return JSON.stringify({
          success: false,
          error: `未找到名为"${hospitalName}"的医院`,
          suggestion: `可选的医院有：${availableHospitals}`,
          availableHospitals: hospitals.map(h => ({ id: h.id, name: h.name }))
        });
      }
    }
    
    // 匹配科室
    if (departmentName) {
      matchedDepartment = findBestMatchDepartment(departmentName, departments);
      if (!matchedDepartment) {
        // 返回相似的科室供用户选择
        const lowerDept = departmentName.toLowerCase();
        const similarDepts = departments
          .filter(d => d.name.toLowerCase().includes(lowerDept.charAt(0)))
          .slice(0, 10)
          .map(d => d.name);
        
        return JSON.stringify({
          success: false,
          error: `未找到名为"${departmentName}"的科室`,
          suggestion: similarDepts.length > 0 
            ? `您是否要找：${similarDepts.join('、')}？` 
            : '请提供正确的科室名称'
        });
      }
    }
    
    // 根据匹配结果决定跳转页面
    if (matchedHospital && matchedDepartment) {
      // 同时有医院和科室，跳转到医生选择页面
      // 注意：matchedHospital 已经是 getHospitals API 映射后的格式 (id, name, address)
      appointmentStore.setSelectedHospital({
        id: matchedHospital.id,
        name: matchedHospital.name,
        address: matchedHospital.address,
        image: matchedHospital.image
      });
      
      // 注意：matchedDepartment 已经是 fetchDepartments 映射后的格式 (id, name, category)
      appointmentStore.setSelectedDepartment({
        id: matchedDepartment.id,
        name: matchedDepartment.name,
        category: matchedDepartment.category
      });
      
      targetPage = '/pages/home/appointment/select-doctor';
      message = `正在跳转到「${matchedHospital.name}」-「${matchedDepartment.name}」的医生选择页面`;
      
    } else if (matchedHospital) {
      // 只有医院，跳转到科室选择页面
      appointmentStore.setSelectedHospital({
        id: matchedHospital.id,
        name: matchedHospital.name,
        address: matchedHospital.address,
        image: matchedHospital.image
      });
      
      targetPage = '/pages/home/appointment/select-department';
      message = `正在跳转到「${matchedHospital.name}」的科室选择页面，请选择要挂号的科室`;
      
    } else if (matchedDepartment) {
      // 只有科室，跳转到医院选择页面并提示
      targetPage = '/pages/home/appointment/select-hospital';
      message = `您想挂「${matchedDepartment.name}」，请先选择就诊的医院`;
      
    } else {
      // 都没有，跳转到医院选择页面
      targetPage = '/pages/home/appointment/select-hospital';
      message = '正在跳转到预约挂号页面，请选择医院';
    }
    
    // 执行页面跳转
    uni.navigateTo({
      url: targetPage,
      fail: (err) => {
        console.error('页面跳转失败:', err);
      }
    });
    
    return JSON.stringify({
      success: true,
      message: message,
      matchedHospital: matchedHospital ? {
        id: matchedHospital.id,
        name: matchedHospital.name
      } : null,
      matchedDepartment: matchedDepartment ? {
        id: matchedDepartment.id,
        name: matchedDepartment.name
      } : null,
      targetPage: targetPage
    });
    
  } catch (error) {
    console.error('智能预约导航失败:', error);
    return JSON.stringify({
      success: false,
      error: '导航失败: ' + error.message
    });
  }
}

/**
 * 处理工具调用
 * @param {Object} args - AI传递的参数
 * @returns {Promise<string>} JSON格式的结果
 */
export async function handleNavigateToAppointmentToolCall(args) {
  return await navigateToAppointment(args);
}
