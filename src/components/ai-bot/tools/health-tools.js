/**
 * 健康档案工具 - DeepSeek Tool Calls
 * 
 * 提供健康档案查询和病历总结功能
 */

import request from '@/api/request.js';

// ==================== 工具定义 ====================

/**
 * 获取健康档案工具定义
 */
export const GET_HEALTH_RECORD_TOOL = {
  type: "function",
  function: {
    name: "getHealthRecord",
    description: "获取当前用户的健康档案信息。包括基本信息（姓名、性别、年龄、身高、电话、地址）、病史信息（既往病史、过敏史、家族病史）以及就诊记录列表。当用户询问自己的健康状况、病历、就诊记录、过敏史、病史等信息时调用此函数。",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
};

/**
 * 总结健康状况工具定义
 */
export const SUMMARIZE_HEALTH_TOOL = {
  type: "function",
  function: {
    name: "summarizeHealth",
    description: "获取并总结当前用户的健康状况。会获取用户的完整健康档案，并生成一份健康状况摘要，包括基本信息、病史概况、近期就诊情况等。当用户想要了解自己的整体健康状况、需要健康报告摘要时调用此函数。",
    parameters: {
      type: "object",
      properties: {
        focusArea: {
          type: "string",
          description: "用户关注的重点领域，如'过敏'、'心血管'、'最近就诊'等。可选参数，不传则返回全面总结。"
        }
      },
      required: []
    }
  }
};

/**
 * 查询就诊记录工具定义
 */
export const QUERY_CONSULTATION_RECORDS_TOOL = {
  type: "function",
  function: {
    name: "queryConsultationRecords",
    description: "查询当前用户的就诊记录。可以按科室、医生、诊断、状态等条件筛选。当用户询问自己的看病记录、某次就诊详情、在某科室的就诊情况时调用此函数。",
    parameters: {
      type: "object",
      properties: {
        department: {
          type: "string",
          description: "按科室筛选，如'心血管内科'、'皮肤科'等"
        },
        doctorName: {
          type: "string",
          description: "按医生姓名筛选"
        },
        status: {
          type: "string",
          enum: ["ongoing", "completed"],
          description: "按状态筛选：ongoing-进行中，completed-已完成"
        },
        limit: {
          type: "number",
          description: "返回记录数量限制，默认返回全部"
        }
      },
      required: []
    }
  }
};

// ==================== API 调用函数 ====================

/**
 * 从后端获取健康档案数据
 * @returns {Promise<Object>} 健康档案数据
 */
async function fetchHealthRecord() {
  try {
    // request.get 在 code === 0 时直接返回 data.message
    const res = await request.get('/patient/health-record');
    // res 就是健康档案数据，直接返回
    return res;
  } catch (error) {
    console.error('获取健康档案失败:', error);
    throw error;
  }
}

// ==================== 工具处理函数 ====================

/**
 * 获取健康档案
 * @returns {Promise<string>} JSON格式的健康档案信息
 */
export async function getHealthRecord() {
  try {
    const data = await fetchHealthRecord();
    
    // 格式化基本信息
    const basicInfo = data.basicInfo || {};
    const formattedBasicInfo = {
      姓名: basicInfo.name || '未设置',
      性别: basicInfo.gender || '未设置',
      年龄: basicInfo.age ? `${basicInfo.age}岁` : '未设置',
      身高: basicInfo.height ? `${basicInfo.height}cm` : '未设置',
      电话: basicInfo.phone || '未设置',
      证件号: basicInfo.idCard || '未设置',
      地址: basicInfo.address || '未设置'
    };

    // 格式化病史信息
    const medicalHistory = data.medicalHistory || {};
    const formattedMedicalHistory = {
      既往病史: medicalHistory.pastHistory?.length > 0 
        ? medicalHistory.pastHistory.join('、') 
        : '无',
      过敏史: medicalHistory.allergyHistory?.length > 0 
        ? medicalHistory.allergyHistory.join('、') 
        : '无',
      家族病史: medicalHistory.familyHistory?.length > 0 
        ? medicalHistory.familyHistory.join('、') 
        : '无'
    };

    // 格式化就诊记录
    const consultationRecords = (data.consultationRecords || []).map(record => ({
      就诊日期: record.visitDate,
      科室: record.department,
      医生: record.doctorName,
      诊断: record.diagnosis || '暂无',
      处方: record.prescription || '暂无',
      状态: record.status === 'completed' ? '已完成' : '进行中'
    }));

    return JSON.stringify({
      success: true,
      data: {
        patientId: data.patientId,
        基本信息: formattedBasicInfo,
        病史信息: formattedMedicalHistory,
        就诊记录: consultationRecords,
        就诊记录数量: consultationRecords.length
      }
    }, null, 2);

  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error.message || '获取健康档案失败'
    });
  }
}

/**
 * 总结健康状况
 * @param {Object} args - 参数
 * @param {string} [args.focusArea] - 关注的重点领域
 * @returns {Promise<string>} JSON格式的健康状况总结
 */
export async function summarizeHealth(args = {}) {
  try {
    const data = await fetchHealthRecord();
    const { focusArea } = args;
    
    const basicInfo = data.basicInfo || {};
    const medicalHistory = data.medicalHistory || {};
    const records = data.consultationRecords || [];

    // 构建健康状况总结
    const summary = {
      用户概况: {
        姓名: basicInfo.name || '未知',
        性别: basicInfo.gender || '未知',
        年龄: basicInfo.age ? `${basicInfo.age}岁` : '未知'
      },
      病史概况: {
        有既往病史: medicalHistory.pastHistory?.length > 0,
        既往病史详情: medicalHistory.pastHistory?.join('、') || '无',
        有过敏史: medicalHistory.allergyHistory?.length > 0,
        过敏史详情: medicalHistory.allergyHistory?.join('、') || '无',
        有家族病史: medicalHistory.familyHistory?.length > 0,
        家族病史详情: medicalHistory.familyHistory?.join('、') || '无'
      },
      就诊统计: {
        总就诊次数: records.length,
        进行中的治疗: records.filter(r => r.status === 'ongoing').length,
        已完成的治疗: records.filter(r => r.status === 'completed').length
      }
    };

    // 分析就诊科室分布
    const departmentStats = {};
    records.forEach(record => {
      const dept = record.department || '未知科室';
      departmentStats[dept] = (departmentStats[dept] || 0) + 1;
    });
    summary.就诊科室分布 = departmentStats;

    // 收集所有诊断
    const diagnoses = records
      .filter(r => r.diagnosis)
      .map(r => r.diagnosis);
    summary.历史诊断 = diagnoses.length > 0 ? diagnoses : ['暂无诊断记录'];

    // 最近一次就诊
    if (records.length > 0) {
      const latestRecord = records[0]; // 假设按时间倒序
      summary.最近就诊 = {
        日期: latestRecord.visitDate,
        科室: latestRecord.department,
        医生: latestRecord.doctorName,
        诊断: latestRecord.diagnosis || '暂无',
        状态: latestRecord.status === 'completed' ? '已完成' : '进行中'
      };
    }

    // 进行中的治疗详情
    const ongoingTreatments = records
      .filter(r => r.status === 'ongoing')
      .map(r => ({
        科室: r.department,
        医生: r.doctorName,
        诊断: r.diagnosis,
        处方: r.prescription
      }));
    
    if (ongoingTreatments.length > 0) {
      summary.进行中的治疗详情 = ongoingTreatments;
    }

    // 如果有特定关注领域，添加相关提示
    if (focusArea) {
      summary.关注领域 = focusArea;
      
      // 查找相关记录
      const relatedRecords = records.filter(r => 
        r.department?.includes(focusArea) || 
        r.diagnosis?.includes(focusArea) ||
        r.prescription?.includes(focusArea)
      );
      
      if (relatedRecords.length > 0) {
        summary.相关就诊记录 = relatedRecords.map(r => ({
          日期: r.visitDate,
          科室: r.department,
          诊断: r.diagnosis,
          处方: r.prescription
        }));
      } else {
        summary.相关就诊记录 = '未找到与该领域相关的就诊记录';
      }
    }

    return JSON.stringify({
      success: true,
      summary: summary,
      提示: '以上是您的健康状况总结，如需了解更多详情，可以询问具体的就诊记录或病史信息。'
    }, null, 2);

  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error.message || '获取健康状况总结失败'
    });
  }
}

/**
 * 查询就诊记录
 * @param {Object} args - 查询参数
 * @param {string} [args.department] - 科室筛选
 * @param {string} [args.doctorName] - 医生姓名筛选
 * @param {string} [args.status] - 状态筛选
 * @param {number} [args.limit] - 返回数量限制
 * @returns {Promise<string>} JSON格式的就诊记录
 */
export async function queryConsultationRecords(args = {}) {
  try {
    const data = await fetchHealthRecord();
    let records = data.consultationRecords || [];
    
    const { department, doctorName, status, limit } = args;

    // 按科室筛选
    if (department) {
      records = records.filter(r => 
        r.department && r.department.includes(department)
      );
    }

    // 按医生姓名筛选
    if (doctorName) {
      records = records.filter(r => 
        r.doctorName && r.doctorName.includes(doctorName)
      );
    }

    // 按状态筛选
    if (status) {
      records = records.filter(r => r.status === status);
    }

    // 限制返回数量
    if (limit && limit > 0) {
      records = records.slice(0, limit);
    }

    // 格式化记录
    const formattedRecords = records.map(record => ({
      id: record.id,
      就诊日期: record.visitDate,
      科室: record.department,
      医生: record.doctorName,
      主诉: record.chiefComplaint || '无',
      诊断: record.diagnosis || '暂无诊断',
      处方: record.prescription || '暂无处方',
      状态: record.status === 'completed' ? '已完成' : '进行中'
    }));

    // 构建筛选条件描述
    const filters = [];
    if (department) filters.push(`科室: ${department}`);
    if (doctorName) filters.push(`医生: ${doctorName}`);
    if (status) filters.push(`状态: ${status === 'completed' ? '已完成' : '进行中'}`);

    return JSON.stringify({
      success: true,
      筛选条件: filters.length > 0 ? filters.join('，') : '无',
      记录数量: formattedRecords.length,
      就诊记录: formattedRecords
    }, null, 2);

  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error.message || '查询就诊记录失败'
    });
  }
}
