import { searchDepartments, searchDoctors, getMyAppointments } from './tools/consultation-tools.js';
import { reactive } from 'vue';

const API_KEY = 'sk-febff98177ba4c4fbecd2b015b2d52e2'; // In production, this should be in env variables
const API_URL = 'https://api.deepseek.com/chat/completions';

const SYSTEM_PROMPT = `你是一个医院的智能助手，专门帮助患者解答问题。你的职责包括：
1. 帮助患者查询科室信息
2. 帮助患者查找医生
3. 帮助患者查看自己的预约

重要规则：
- 当你调用工具获取数据后，必须根据工具返回的结果，用友好、清晰的中文向用户解释结果
- 如果工具返回了科室列表，请列出科室名称供用户选择
- 如果工具返回了医生列表，请列出医生姓名、职称、科室等信息
- 如果工具返回了预约信息，请清晰地告诉用户预约的时间、医生、科室等
- 如果用户想要预约某个医生，请提供导航链接，格式为：[NAVIGATE:/pages/home/appointment/select-schedule?doctorId=医生ID]
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
