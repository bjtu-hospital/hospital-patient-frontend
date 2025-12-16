ai-bot
- ai-bot.vue   # 一个小组件
- context-manager.js    # 用来发送请求,管理上下文的, 当账户退出的时候自动清空这个上下文, 用户登录期间应该保留上下文
- tools
    - func1
    - func2
    - func3

关于UI, 这个应该是一个悬浮的小球. 点击会出现这个悬浮的对话的页面. 当点击关闭的时候, 页面会收回小球. 仍然保存对话的记录. 再次点击应该是有对话记录的. 悬浮页面可以选择是否清空对话记录. 在小球折叠的情况下, 长按小球可以选择关闭小球.

下面的任务中, 关于tools函数的相关定义描述,如果不清楚,可以标记留白

**Task:** Implement core "Medical Consultation" tools for the AI Assistant (`ai-bot`) in the `bjtu-hospital/hospital-patient-frontend` repository.

**Context:**
We are building a chatbot for patients to ask about doctors, departments, and their own appointments. The bot resides in `src/components/ai-bot/`. It needs to interact with the backend APIs via `src/components/ai-bot/context-manager.js` and new tool functions in `src/components/ai-bot/tools/`.

**Requirements:**

1.  **Create Tool Functions:**
    Create a new file `src/components/ai-bot/tools/consultation-tools.js`. Inside, implement the following three functions. Each function must return a formatted string or JSON object suitable for the LLM to read and summarize for the user.

    *   `searchDepartments(keyword)`:
        *   **Goal:** Help patients find a department.
        *   **Logic:** Fetch the list of major and minor departments (API: `/patient/major-departments` and `/patient/minor-departments`). Filter them client-side based on the `keyword`.
        *   **Output:** Return a list of matching departments with their names and IDs.

    *   `searchDoctors(keyword)`:
        *   **Goal:** Help patients find a specific doctor.
        *   **Logic:** Use the Global Search API (`/patient/search/global`) with `type='doctor'` and the `keyword`.
        *   **Output:** Return a list of doctors including their Name, Title, Department, and ID.

    *   `getMyAppointments()`:
        *   **Goal:** Let patients check their upcoming schedules.
        *   **Logic:** Fetch the user's appointments (API: `/patient/appointments`). Filter for status "PENDING" or "PAID".
        *   **Output:** Return a summary of upcoming appointments (Time, Doctor, Department, Status).

2.  **Integrate with Context Manager:**
    Update `src/components/ai-bot/context-manager.js`:
    *   Import the functions from `consultation-tools.js`.
    *   Register them in the tool definition list (or `toolsMap`) so the AI agent knows they exist and how to call them.
    *   Ensure the `request` utility (from `@/api/request` or `@/utils/request`) is used for API calls to handle authentication tokens automatically.

3.  **UI Feedback (Optional but recommended):**
    *   If the user asks to "book" a specific doctor found via search, the bot should return a special link/action string (e.g., `[NAVIGATE:/pages/home/appointment/select-schedule?doctorId=123]`) that the frontend `ai-bot.vue` can parse to redirect the user to the booking page.

**Technical Constraints:**

*   Use the existing project structure.
*   Reuse existing API definitions in `src/api/` if they exist; otherwise, use `src/utils/request.js` directly.
*   Code must be compatible with UniApp/Vue.

**Plan:**

1.  Explore `src/components/ai-bot/context-manager.js` to understand how tools are currently registered.
2.  Create `src/components/ai-bot/tools/consultation-tools.js` with the 3 defined functions.
3.  Modify `context-manager.js` to register these new tools.

Please start by exploring the context manager file.



-----------------

你将使用deepseek模型作. 
并且问答应该分为两种模式.  根据用户的意图. 来进行判断. 用户可能只是想聊天, 那么就不应调用函数,但是如果用户希望获取默写信息, 则自主判断是否应该调用函数. 



```
import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: sk-febff98177ba4c4fbecd2b015b2d52e2,
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();
```








