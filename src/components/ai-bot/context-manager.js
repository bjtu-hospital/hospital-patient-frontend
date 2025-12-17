import { searchDepartments, searchDoctors, getMyAppointments } from './tools/consultation-tools.js';
import { handleNavigateToolCall, NAVIGATE_TO_PAGE_TOOL } from './tools/router-tool.js';
import { 
  queryDepartments, 
  recommendDepartmentBySymptom, 
  queryHospitals,
  QUERY_DEPARTMENTS_TOOL,
  RECOMMEND_DEPARTMENT_TOOL,
  QUERY_HOSPITALS_TOOL
} from './tools/department-tools.js';
import {
  queryDoctors,
  recommendDoctors,
  getDoctorDetail,
  QUERY_DOCTORS_TOOL,
  RECOMMEND_DOCTORS_TOOL,
  GET_DOCTOR_DETAIL_TOOL
} from './tools/doctor-tools.js';
import {
  getHealthRecord,
  summarizeHealth,
  queryConsultationRecords,
  GET_HEALTH_RECORD_TOOL,
  SUMMARIZE_HEALTH_TOOL,
  QUERY_CONSULTATION_RECORDS_TOOL
} from './tools/health-tools.js';
import {
  queryAppointments,
  getUpcomingAppointments,
  getAppointmentStats,
  QUERY_APPOINTMENTS_TOOL,
  GET_UPCOMING_APPOINTMENTS_TOOL,
  GET_APPOINTMENT_STATS_TOOL
} from './tools/appointment-tools.js';
import {
  navigateToAppointment,
  NAVIGATE_TO_APPOINTMENT_TOOL
} from './tools/smart-appointment-tool.js';
import { reactive } from 'vue';

const API_KEY = 'sk-febff98177ba4c4fbecd2b015b2d52e2'; // In production, this should be in env variables
const API_URL = 'https://api.deepseek.com/chat/completions';

const SYSTEM_PROMPT = `你是一个医院的智能助手，专门帮助患者解答问题。你的职责包括：
1. 帮助患者查询科室信息（大科室、小科室）
2. 根据患者症状推荐合适的就诊科室
3. 帮助患者查找和推荐医生
4. 帮助患者查看和管理预约记录
5. 帮助患者查询院区信息
6. 帮助患者导航到系统的各个功能页面
7. 帮助患者查询自己的健康档案和病历信息
8. 总结患者的健康状况和就诊记录
9. 提醒患者及时就诊，查看即将到来的预约
10. 智能导航到指定医院和科室的预约挂号页面

重要规则：
- 当用户说“我要去 XX医院挂 XX科”、“帮我预约 XX医院的 XX科”时，使用 navigateToAppointment 工具智能跳转
- 当用户询问自己的预约记录、挂号情况时，使用 queryAppointments 工具查询
- 当用户询问'我什么时候要去看病'、'提醒我就诊'、'最近有什么预约'时，使用 getUpcomingAppointments 工具获取就诊提醒
- 当用户询问预约统计、常看哪个科室/医生时，使用 getAppointmentStats 工具
- 当用户询问自己的健康档案、病历、病史信息时，使用 getHealthRecord 工具获取
- 当用户想要了解自己的整体健康状况或需要健康总结时，使用 summarizeHealth 工具
- 当用户询问自己的就诊记录、看病历史时，使用 queryConsultationRecords 工具查询
- 当用户描述症状想找医生时，使用 recommendDoctors 工具推荐医生
- 当用户询问医生列表或搜索医生时，使用 queryDoctors 工具查询
- 当用户想了解某个医生详情时，使用 getDoctorDetail 工具
- 当用户描述症状想知道看什么科时，使用 recommendDepartmentBySymptom 工具推荐科室
- 当用户询问科室列表时，使用 queryDepartments 工具查询
- 当用户询问院区/医院时，使用 queryHospitals 工具查询
- 当你调用工具获取数据后，必须根据工具返回的结果，用友好、清晰的中文向用户解释结果
- 如果工具返回了科室列表，请列出科室名称供用户选择
- 如果工具返回了医生列表，请列出医生姓名、职称、科室等信息
- 如果工具返回了预约信息，请清晰地告诉用户预约的时间、医生、科室等
- 当用户想要进行某项操作时（如预约、查看预约、管理就诊人等），使用 navigateToPage 工具帮助用户跳转到对应页面
- 导航成功后，告诉用户已为其跳转到相应页面
- 始终使用中文回复
- 保持回复简洁友好`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "searchDepartments",
      description: "获取医院科室列表。当用户询问有哪些科室、大科室、小科室时调用此函数。如果用户想查看所有科室，keyword传空字符串即可。",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "搜索关键词，如'内科'、'外科'等。如果用户想查看所有科室，传空字符串''。",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "searchDoctors",
      description: "搜索医生信息。当用户询问有哪些医生、想找某个医生时调用此函数。",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "医生姓名或专业关键词。如果用户想查看所有医生，传空字符串''。",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getMyAppointments",
      description: "获取当前用户的预约信息。当用户询问自己的预约、挂号记录时调用此函数。",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  // 添加页面导航工具
  NAVIGATE_TO_PAGE_TOOL,
  // 添加科室查询工具
  QUERY_DEPARTMENTS_TOOL,
  // 添加症状推荐科室工具
  RECOMMEND_DEPARTMENT_TOOL,
  // 添加院区查询工具
  QUERY_HOSPITALS_TOOL,
  // 添加医生查询工具
  QUERY_DOCTORS_TOOL,
  // 添加医生推荐工具
  RECOMMEND_DOCTORS_TOOL,
  // 添加医生详情工具
  GET_DOCTOR_DETAIL_TOOL,
  // 添加健康档案工具
  GET_HEALTH_RECORD_TOOL,
  // 添加健康状况总结工具
  SUMMARIZE_HEALTH_TOOL,
  // 添加就诊记录查询工具
  QUERY_CONSULTATION_RECORDS_TOOL,
  // 添加预约查询工具
  QUERY_APPOINTMENTS_TOOL,
  // 添加就诊提醒工具
  GET_UPCOMING_APPOINTMENTS_TOOL,
  // 添加预约统计工具
  GET_APPOINTMENT_STATS_TOOL,
  // 添加智能预约导航工具
  NAVIGATE_TO_APPOINTMENT_TOOL
];

class ContextManager {
  constructor() {
    this.messages = reactive([
      { role: "system", content: SYSTEM_PROMPT }
    ]);
  }

  /**
   * Send a message to the AI and get a response.
   * @param {string} userContent - The user's message.
   * @returns {Promise<string>} - The AI's response.
   */
  async sendMessage(userContent) {
    this.messages.push({ role: "user", content: userContent });

    try {
      let response = await this._callDeepSeek();
      let message = response.choices[0].message;

      // 处理可能的多轮工具调用
      let maxIterations = 5; // 防止无限循环
      let iteration = 0;

      while (message.tool_calls && iteration < maxIterations) {
        iteration++;
        
        // 添加助手消息（包含 tool_calls）
        this.messages.push({
          role: "assistant",
          content: message.content || "",
          tool_calls: message.tool_calls
        });

        // 处理所有工具调用
        for (const toolCall of message.tool_calls) {
          const functionName = toolCall.function.name;
          let args = {};
          try {
            args = JSON.parse(toolCall.function.arguments || '{}');
          } catch (e) {
            console.warn('Failed to parse tool arguments:', e);
          }
          
          let result;
          console.log(`🔧 调用工具: ${functionName}`, args);

          if (functionName === 'searchDepartments') {
            result = await searchDepartments(args.keyword || '');
          } else if (functionName === 'searchDoctors') {
            result = await searchDoctors(args.keyword || '');
          } else if (functionName === 'getMyAppointments') {
            result = await getMyAppointments();
          } else if (functionName === 'navigateToPage') {
            result = await handleNavigateToolCall(args);
          } else if (functionName === 'queryDepartments') {
            result = await queryDepartments(args);
          } else if (functionName === 'recommendDepartmentBySymptom') {
            result = await recommendDepartmentBySymptom(args);
          } else if (functionName === 'queryHospitals') {
            result = await queryHospitals(args);
          } else if (functionName === 'queryDoctors') {
            result = await queryDoctors(args);
          } else if (functionName === 'recommendDoctors') {
            result = await recommendDoctors(args);
          } else if (functionName === 'getDoctorDetail') {
            result = await getDoctorDetail(args);
          } else if (functionName === 'getHealthRecord') {
            result = await getHealthRecord();
          } else if (functionName === 'summarizeHealth') {
            result = await summarizeHealth(args);
          } else if (functionName === 'queryConsultationRecords') {
            result = await queryConsultationRecords(args);
          } else if (functionName === 'queryAppointments') {
            result = await queryAppointments(args);
          } else if (functionName === 'getUpcomingAppointments') {
            result = await getUpcomingAppointments(args);
          } else if (functionName === 'getAppointmentStats') {
            result = await getAppointmentStats();
          } else if (functionName === 'navigateToAppointment') {
            result = await navigateToAppointment(args);
          } else {
            result = JSON.stringify({ error: `Unknown function: ${functionName}` });
          }

          console.log(`📋 工具结果:`, result);

          this.messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: typeof result === 'string' ? result : JSON.stringify(result)
          });
        }

        // 再次调用 AI，让它根据工具结果生成回复
        response = await this._callDeepSeek();
        message = response.choices[0].message;
      }

      // 添加最终的助手回复
      const finalContent = message.content || '抱歉，我无法处理您的请求。';
      this.messages.push({ role: "assistant", content: finalContent });
      return finalContent;
      
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg = '抱歉，处理您的请求时遇到了错误，请稍后再试。';
      this.messages.push({ role: "assistant", content: errorMsg });
      return errorMsg;
    }
  }

  async _callDeepSeek() {
    return new Promise((resolve, reject) => {
      uni.request({
        url: API_URL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        data: {
          model: "deepseek-chat",
          messages: this.messages,
          tools: TOOLS,
          tool_choice: "auto"
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`API Error: ${res.statusCode} ${JSON.stringify(res.data)}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  clearContext() {
    this.messages.splice(0, this.messages.length, 
      { role: "system", content: SYSTEM_PROMPT }
    );
  }
}

export default new ContextManager();
