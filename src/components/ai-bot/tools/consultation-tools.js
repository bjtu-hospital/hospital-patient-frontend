import request from '@/api/request.js';

/**
 * Search for departments based on a keyword.
 * Fetches both major and minor departments and filters them.
 * @param {string} keyword - The search keyword.
 * @returns {Promise<string>} - JSON string of matching departments.
 */
export async function searchDepartments(keyword = '') {
  try {
    // Fetch major and minor departments in parallel
    const [majorRes, minorRes] = await Promise.all([
      request.get('/patient/major-departments'),
      request.get('/patient/minor-departments')
    ]);

    console.log('🏥 Major departments response:', majorRes);
    console.log('🏥 Minor departments response:', minorRes);

    // API返回格式: { code: 0, message: { departments: [...] } }
    // request.js拦截器返回 message 字段，所以 res = { departments: [...] }
    const majorDepts = majorRes?.departments || majorRes || [];
    const minorDepts = minorRes?.minor_departments || minorRes || [];

    // 确保是数组
    const majorList = Array.isArray(majorDepts) ? majorDepts : [];
    const minorList = Array.isArray(minorDepts) ? minorDepts : [];

    console.log('🏥 Major list:', majorList);
    console.log('🏥 Minor list:', minorList);

    // 格式化大科室
    const formattedMajor = majorList.map(d => ({
      id: d.major_dept_id || d.id,
      name: d.name,
      type: '大科室',
      description: d.description || ''
    }));

    // 格式化小科室
    const formattedMinor = minorList.map(d => ({
      id: d.minor_dept_id || d.id,
      name: d.name,
      type: '小科室',
      parentId: d.major_dept_id,
      description: d.description || ''
    }));

    // 检查是否需要按类型过滤
    const lowerKeyword = (keyword || '').toLowerCase().trim();
    
    // 如果用户问的是"大科室"，只返回大科室
    if (lowerKeyword === '大科室' || lowerKeyword === '大科' || lowerKeyword === 'major') {
      console.log('🏥 Returning major departments only');
      return JSON.stringify({ type: '大科室列表', departments: formattedMajor });
    }
    
    // 如果用户问的是"小科室"，只返回小科室
    if (lowerKeyword === '小科室' || lowerKeyword === '小科' || lowerKeyword === 'minor') {
      console.log('🏥 Returning minor departments only');
      return JSON.stringify({ type: '小科室列表', departments: formattedMinor });
    }

    // 没有关键词或空关键词，返回所有科室
    if (!lowerKeyword) {
      console.log('🏥 Returning all departments');
      return JSON.stringify({
        major_departments: formattedMajor,
        minor_departments: formattedMinor.slice(0, 10) // 限制小科室数量避免太长
      });
    }

    // 有具体关键词，进行模糊匹配
    const allDepts = [...formattedMajor, ...formattedMinor];
    const filtered = allDepts.filter(dept => 
      (dept.name && dept.name.toLowerCase().includes(lowerKeyword)) ||
      (dept.description && dept.description.toLowerCase().includes(lowerKeyword))
    );

    if (filtered.length === 0) {
      return JSON.stringify({ message: '未找到包含"' + keyword + '"的科室，以下是所有大科室', departments: formattedMajor });
    }

    return JSON.stringify({ type: '搜索结果', departments: filtered });
  } catch (error) {
    console.error('Error searching departments:', error);
    return JSON.stringify({ error: '查询科室失败: ' + error.message });
  }
}

/**
 * Search for doctors based on a keyword.
 * Uses the global search API or fetches all doctors.
 * @param {string} keyword - The search keyword.
 * @returns {Promise<string>} - JSON string of matching doctors.
 */
export async function searchDoctors(keyword) {
  try {
    // 尝试获取所有医生列表
    const res = await request.get('/patient/doctors');
    
    console.log('👨‍⚕️ Doctors response:', res);

    // 处理不同的返回格式
    let doctors = res?.doctors || res || [];
    if (!Array.isArray(doctors)) {
      doctors = [];
    }

    // 如果有关键词，进行过滤
    if (keyword && keyword.trim() !== '') {
      const lowerKeyword = keyword.toLowerCase();
      doctors = doctors.filter(doc => 
        (doc.name && doc.name.toLowerCase().includes(lowerKeyword)) ||
        (doc.title && doc.title.toLowerCase().includes(lowerKeyword)) ||
        (doc.specialty && doc.specialty.toLowerCase().includes(lowerKeyword)) ||
        (doc.department_name && doc.department_name.toLowerCase().includes(lowerKeyword))
      );
    }

    // 格式化输出
    const formatted = doctors.slice(0, 10).map(doc => ({
      id: doc.doctor_id || doc.id,
      name: doc.name,
      title: doc.title || '医生',
      department: doc.department_name || doc.departmentName || '未知科室',
      specialty: doc.specialty || ''
    }));

    return JSON.stringify(formatted);
  } catch (error) {
    console.error('Error searching doctors:', error);
    return JSON.stringify({ error: '查询医生失败: ' + error.message });
  }
}

/**
 * Get the current user's upcoming appointments.
 * Filters for PENDING or PAID status.
 * @returns {Promise<string>} - JSON string of upcoming appointments.
 */
export async function getMyAppointments() {
  try {
    const res = await request.get('/patient/appointments');
    
    console.log('📅 Appointments response:', res);

    // 处理不同的返回格式
    let appointments = res?.appointments || res || [];
    if (!Array.isArray(appointments)) {
      appointments = [];
    }

    // 过滤待就诊的预约
    const upcoming = appointments.filter(app => 
      ['PENDING', 'PAID', 'CONFIRMED'].includes(app.status)
    );

    if (upcoming.length === 0) {
      return JSON.stringify({ message: '您当前没有待就诊的预约' });
    }

    const summary = upcoming.map(app => ({
      id: app.appointment_id || app.id,
      time: app.appointment_date ? `${app.appointment_date} ${app.start_time || ''}-${app.end_time || ''}` : '未知时间',
      doctor: app.doctor_name || app.doctorName || '未知医生',
      department: app.department_name || app.departmentName || '未知科室',
      status: app.status === 'PENDING' ? '待支付' : app.status === 'PAID' ? '已支付' : app.status,
      location: app.location || app.hospital_name || '医院'
    }));

    return JSON.stringify(summary);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return JSON.stringify({ error: '获取预约信息失败，请确保您已登录: ' + error.message });
  }
}
