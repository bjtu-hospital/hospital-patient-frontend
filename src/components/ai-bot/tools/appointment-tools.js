/**
 * 预约查询工具 - DeepSeek Tool Calls
 * 
 * 提供预约记录查询和就诊提醒功能
 */

import request from '@/api/request.js';

// ==================== 状态映射 ====================

const STATUS_MAP = {
  pending: '待支付',
  confirmed: '已确认',
  completed: '已完成',
  cancelled: '已取消',
  timeout: '已超时',
  waitlist: '候补中'
};

const TIME_PERIOD_MAP = {
  '上午': '上午 (8:00-12:00)',
  '下午': '下午 (13:30-17:30)'
};

// ==================== 工具定义 ====================

/**
 * 查询预约记录工具定义
 */
export const QUERY_APPOINTMENTS_TOOL = {
  type: "function",
  function: {
    name: "queryAppointments",
    description: "查询当前用户的预约挂号记录。可以按状态筛选（待支付、已确认、已完成、已取消等）。当用户询问自己的预约、挂号记录、看病预约时调用此函数。",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "confirmed", "completed", "cancelled", "timeout", "waitlist", "all"],
          description: "按状态筛选：pending-待支付，confirmed-已确认，completed-已完成，cancelled-已取消，timeout-已超时，waitlist-候补中，all-全部。默认返回全部。"
        },
        limit: {
          type: "number",
          description: "返回记录数量限制，默认返回最近10条"
        }
      },
      required: []
    }
  }
};

/**
 * 获取待就诊提醒工具定义
 */
export const GET_UPCOMING_APPOINTMENTS_TOOL = {
  type: "function",
  function: {
    name: "getUpcomingAppointments",
    description: "获取用户即将到来的就诊预约，用于提醒患者及时就诊。返回未来7天内需要就诊的预约（已确认或待支付状态）。当用户询问'我什么时候要去看病'、'提醒我就诊'、'最近有什么预约'时调用此函数。",
    parameters: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "查询未来多少天内的预约，默认7天"
        }
      },
      required: []
    }
  }
};

/**
 * 获取预约统计工具定义
 */
export const GET_APPOINTMENT_STATS_TOOL = {
  type: "function",
  function: {
    name: "getAppointmentStats",
    description: "获取用户的预约统计信息，包括各状态预约数量、常去的科室、常看的医生等。当用户询问'我预约了多少次'、'我的预约情况'、'我常看哪个科'时调用此函数。",
    parameters: {
      type: "object",
      properties: {},
      required: []
    }
  }
};

// ==================== API 调用函数 ====================

/**
 * 从后端获取预约列表
 * @returns {Promise<Object>} 预约列表数据
 */
async function fetchAppointments() {
  try {
    const res = await request.get('/patient/appointments', {
      page: 1,
      pageSize: 1000
    });
    return res;
  } catch (error) {
    console.error('获取预约列表失败:', error);
    throw error;
  }
}

/**
 * 格式化单个预约记录（精简字段）
 * @param {Object} appointment - 原始预约数据
 * @returns {Object} 精简后的预约数据
 */
function formatAppointment(appointment) {
  return {
    id: appointment.id,
    医院: appointment.hospitalName,
    科室: appointment.departmentName,
    医生: appointment.doctorName,
    职称: appointment.doctorTitle,
    就诊人: appointment.patientName,
    预约日期: appointment.appointmentDate,
    时段: TIME_PERIOD_MAP[appointment.appointmentTime] || appointment.appointmentTime,
    状态: STATUS_MAP[appointment.status] || appointment.status,
    来源: appointment.sourceType === 'waitlist' ? '候补转正' : '普通预约',
    可取消: appointment.canCancel ? '是' : '否',
    可改约: appointment.canReschedule ? '是' : '否'
  };
}

/**
 * 计算距离就诊日期的天数
 * @param {string} dateStr - 日期字符串 YYYY-MM-DD
 * @returns {number} 天数差（正数表示未来，负数表示过去）
 */
function getDaysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 获取就诊紧急程度提示
 * @param {number} daysUntil - 距离就诊的天数
 * @returns {string} 紧急程度提示
 */
function getUrgencyHint(daysUntil) {
  if (daysUntil < 0) return '⚠️ 已过期';
  if (daysUntil === 0) return '🔴 今天就诊';
  if (daysUntil === 1) return '🟠 明天就诊';
  if (daysUntil <= 3) return '🟡 即将就诊';
  return '🟢 正常';
}

// ==================== 工具处理函数 ====================

/**
 * 查询预约记录
 * @param {Object} args - 查询参数
 * @param {string} [args.status] - 状态筛选
 * @param {number} [args.limit] - 数量限制
 * @returns {Promise<string>} JSON格式的预约记录
 */
export async function queryAppointments(args = {}) {
  try {
    const data = await fetchAppointments();
    let appointments = data.list || [];
    
    const { status = 'all', limit = 10 } = args;

    // 按状态筛选
    if (status && status !== 'all') {
      appointments = appointments.filter(a => a.status === status);
    }

    // 限制返回数量
    appointments = appointments.slice(0, limit);

    // 格式化记录
    const formattedAppointments = appointments.map(formatAppointment);

    // 构建筛选条件描述
    const statusDesc = status === 'all' ? '全部' : (STATUS_MAP[status] || status);

    return JSON.stringify({
      success: true,
      筛选条件: `状态: ${statusDesc}`,
      记录数量: formattedAppointments.length,
      总记录数: data.total,
      预约记录: formattedAppointments
    }, null, 2);

  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error.message || '查询预约记录失败'
    });
  }
}

/**
 * 获取待就诊提醒
 * @param {Object} args - 查询参数
 * @param {number} [args.days] - 查询未来多少天
 * @returns {Promise<string>} JSON格式的就诊提醒
 */
export async function getUpcomingAppointments(args = {}) {
  try {
    const data = await fetchAppointments();
    const appointments = data.list || [];
    
    const { days = 7 } = args;

    // 筛选未来N天内需要就诊的预约（已确认或待支付）
    const activeStatuses = ['pending', 'confirmed'];
    const upcomingAppointments = appointments
      .filter(a => {
        if (!activeStatuses.includes(a.status)) return false;
        const daysUntil = getDaysUntil(a.appointmentDate);
        return daysUntil >= 0 && daysUntil <= days;
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    // 格式化并添加提醒信息
    const reminders = upcomingAppointments.map(appointment => {
      const daysUntil = getDaysUntil(appointment.appointmentDate);
      return {
        紧急程度: getUrgencyHint(daysUntil),
        距离就诊: daysUntil === 0 ? '今天' : (daysUntil === 1 ? '明天' : `${daysUntil}天后`),
        预约日期: appointment.appointmentDate,
        时段: TIME_PERIOD_MAP[appointment.appointmentTime] || appointment.appointmentTime,
        医院: appointment.hospitalName,
        科室: appointment.departmentName,
        医生: `${appointment.doctorName}（${appointment.doctorTitle}）`,
        就诊人: appointment.patientName,
        状态: STATUS_MAP[appointment.status],
        需要操作: appointment.status === 'pending' ? '⚠️ 请尽快完成支付' : '准时就诊即可'
      };
    });

    // 生成提醒摘要
    const todayCount = reminders.filter(r => r.距离就诊 === '今天').length;
    const tomorrowCount = reminders.filter(r => r.距离就诊 === '明天').length;
    const pendingPayCount = upcomingAppointments.filter(a => a.status === 'pending').length;

    const summary = {
      查询范围: `未来${days}天`,
      待就诊总数: reminders.length,
      今天就诊: todayCount,
      明天就诊: tomorrowCount,
      待支付: pendingPayCount
    };

    // 生成提醒建议
    const suggestions = [];
    if (todayCount > 0) {
      suggestions.push('🔴 您今天有预约，请准时前往医院就诊！');
    }
    if (tomorrowCount > 0) {
      suggestions.push('🟠 您明天有预约，请提前做好准备。');
    }
    if (pendingPayCount > 0) {
      suggestions.push('⚠️ 您有待支付的预约，请尽快完成支付以确保预约有效。');
    }
    if (reminders.length === 0) {
      suggestions.push('✅ 未来一周内没有待就诊的预约。');
    }

    return JSON.stringify({
      success: true,
      摘要: summary,
      提醒建议: suggestions,
      就诊安排: reminders
    }, null, 2);

  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error.message || '获取就诊提醒失败'
    });
  }
}

/**
 * 获取预约统计
 * @returns {Promise<string>} JSON格式的预约统计
 */
export async function getAppointmentStats() {
  try {
    const data = await fetchAppointments();
    const appointments = data.list || [];

    // 统计各状态数量
    const statusStats = {};
    appointments.forEach(a => {
      const status = STATUS_MAP[a.status] || a.status;
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    // 统计常去科室
    const deptStats = {};
    appointments.forEach(a => {
      deptStats[a.departmentName] = (deptStats[a.departmentName] || 0) + 1;
    });
    const topDepartments = Object.entries(deptStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ 科室: name, 次数: count }));

    // 统计常看医生
    const doctorStats = {};
    appointments.forEach(a => {
      const key = `${a.doctorName}（${a.doctorTitle}）`;
      doctorStats[key] = (doctorStats[key] || 0) + 1;
    });
    const topDoctors = Object.entries(doctorStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ 医生: name, 次数: count }));

    // 统计常去医院
    const hospitalStats = {};
    appointments.forEach(a => {
      hospitalStats[a.hospitalName] = (hospitalStats[a.hospitalName] || 0) + 1;
    });
    const topHospitals = Object.entries(hospitalStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ 医院: name, 次数: count }));

    // 计算完成率
    const completedCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length;
    const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
    const completionRate = appointments.length > 0 
      ? Math.round((completedCount / appointments.length) * 100) 
      : 0;

    return JSON.stringify({
      success: true,
      总体统计: {
        总预约次数: appointments.length,
        完成率: `${completionRate}%`,
        已完成或确认: completedCount,
        已取消: cancelledCount
      },
      各状态分布: statusStats,
      常去科室TOP5: topDepartments,
      常看医生TOP5: topDoctors,
      常去医院: topHospitals
    }, null, 2);

  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error.message || '获取预约统计失败'
    });
  }
}
