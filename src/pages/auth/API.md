# 患者端认证功能 - API接口文档

> **模块**: 用户认证  
> **更新日期**: 2025-11-28  
> **接口规范**: 统一返回格式 `{ code: 0, message: ... }` 或 `{ code: 非0, message: "错误信息" }`

---

## 📋 接口列表

1. [用户注册](#1-用户注册)
2. [患者登录](#2-患者登录)
3. [获取当前用户角色](#3-获取当前用户角色)
4. [退出登录](#4-退出登录)

---

## 📖 接口详情

### 1. 用户注册

新用户注册账号。

- **接口地址**: `POST /auth/register`
- **请求方式**: `POST`
- **是否需要登录**: 否

**请求参数**:
```json
{
  "phonenumber": "13800138000",
  "password": "Passw0rd!",
  "name": "张三"
}
```

**参数说明**:
- `phonenumber` (string, required): 手机号，11位数字
- `password` (string, required): 密码，至少6位
- `name` (string, required): 姓名，至少2个字符
- `email` (string, optional): 邮箱
- `gender` (string, optional): 性别 '男'|'女'|'未知'
- `birth_date` (string, optional): 出生日期 YYYY-MM-DD
- `student_id` (string, optional): 学号
- `patient_type` (string, optional): 患者类型 '学生'|'教师'|'职工'

**返回数据**:
```json
{
  "code": 0,
  "message": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**字段说明**:
- `message`: 登录凭证 token（JWT格式）

**错误返回**:
```json
{
  "code": 400,
  "message": "该手机号已被注册"
}
```

---

### 2. 患者登录

患者使用手机号和密码登录。

- **接口地址**: `POST /auth/patient/login`
- **请求方式**: `POST`
- **是否需要登录**: 否

**请求参数**:
```json
{
  "phonenumber": "13800138000",
  "password": "Passw0rd!"
}
```

**参数说明**:
- `phonenumber` (string, required): 手机号
- `password` (string, required): 密码

**返回数据**:
```json
{
  "code": 0,
  "message": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**字段说明**:
- `message`: 登录凭证 token（JWT格式）

**错误返回**:

401 - 用户不存在或密码错误:
```json
{
  "code": 401,
  "message": "手机号或密码错误"
}
```

403 - 账号被封禁:
```json
{
  "code": 403,
  "message": "您的账号已被封禁至2025-12-31，原因：违规操作"
}
```

---

### 3. 获取当前用户角色

验证token有效性并获取用户角色信息。

- **接口地址**: `GET /auth/me`
- **请求方式**: `GET`
- **是否需要登录**: 是

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**: 无

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "role": "user"
  }
}
```

**字段说明**:
- `role`: 用户角色
  - `user`: 普通患者
  - `admin`: 管理员

**错误返回**:
```json
{
  "code": 401,
  "message": "token无效或已过期"
}
```

---

### 4. 退出登录

退出当前登录状态，清理服务端token映射。

- **接口地址**: `POST /auth/logout`
- **请求方式**: `POST`
- **是否需要登录**: 是

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**: 无

**返回数据**:
```json
{
  "code": 0,
  "message": "登出成功"
}
```

---

## 📌 认证流程

### 注册流程
```
1. 用户填写注册表单（手机号、密码、姓名）
   ↓
2. 前端表单验证
   ↓
3. 调用 POST /auth/register
   ↓
4. 成功返回 token
   ↓
5. 自动调用 GET /auth/me 验证登录态
   ↓
6. 保存 token 到 localStorage
   ↓
7. 跳转到首页
```

### 登录流程
```
1. 用户输入手机号和密码
   ↓
2. 前端表单验证
   ↓
3. 调用 POST /auth/patient/login
   ↓
4. 成功返回 token
   ↓
5. 自动调用 GET /auth/me 验证登录态
   ↓
6. 保存 token 到 localStorage
   ↓
7. 跳转到首页
```

### 应用启动验证流程
```
1. App.vue onLaunch
   ↓
2. 从 localStorage 读取 token
   ↓
3. 如果有 token，调用 GET /auth/me 验证
   ↓
4. 验证成功：保持登录态
   验证失败：清理 token，跳转登录页
```

### 自动登出流程
```
1. 受保护接口返回 401
   ↓
2. 响应拦截器捕获
   ↓
3. 清理本地 token 和 userInfo
   ↓
4. Toast 提示"登录已过期"
   ↓
5. 1.5秒后自动跳转登录页
```

---

## ⚠️ 错误码

| 错误码 | 说明 | 前端处理 |
|--------|------|----------|
| 0 | 成功 | - |
| 400 | 参数错误或手机号已注册 | 显示错误信息在表单下方 |
| 401 | 用户不存在、密码错误或token无效 | 显示错误提示，token无效则自动跳登录页 |
| 403 | 账号被封禁 | 弹窗显示封禁原因和截止时间 |
| 500 | 服务器异常 | Toast提示"服务异常，请稍后再试" |

---

## 📝 Token管理

### Token存储
```javascript
// 保存token
uni.setStorageSync('token', token)

// 获取token
const token = uni.getStorageSync('token')

// 清除token
uni.removeStorageSync('token')
```

### 请求自动注入
```javascript
// request.js 请求拦截器
const token = uni.getStorageSync('token')
if (token) {
  config.header = {
    ...config.header,
    'Authorization': `Bearer ${token}`
  }
}
```

### Token过期处理
```javascript
// request.js 响应拦截器
if (statusCode === 401) {
  // 清理本地存储
  uni.removeStorageSync('token')
  uni.removeStorageSync('userInfo')
  
  // 提示并跳转
  uni.showToast({ title: '登录已过期，请重新登录' })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/auth/login' })
  }, 1500)
}
```

---

## 🔐 安全要点

### 1. 密码安全
- ✅ 前端验证：至少6位
- ✅ 后端验证：复杂度要求
- ✅ 传输加密：HTTPS
- ✅ 存储加密：bcrypt哈希

### 2. Token安全
- ✅ JWT签名验证
- ✅ Redis映射验证
- ✅ 过期时间控制（可配置）
- ✅ 单设备登录或多设备管理

### 3. 防护措施
- ✅ 接口频率限制
- ✅ 登录失败次数限制
- ✅ 账号封禁机制
- ✅ XSS/CSRF防护

---

## 💻 前端调用示例

```javascript
import { register, login, getCurrentUser, logout } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 1. 注册
const handleRegister = async () => {
  try {
    const token = await register({
      phonenumber: '13800138000',
      password: 'Passw0rd!',
      name: '张三'
    })
    
    // 自动登录
    await userStore.login(token)
    
    // 跳转首页
    uni.reLaunch({ url: '/pages/home/index' })
  } catch (error) {
    // 错误已在拦截器统一处理
    console.error('注册失败:', error)
  }
}

// 2. 登录
const handleLogin = async () => {
  try {
    const token = await login({
      phonenumber: '13800138000',
      password: 'Passw0rd!'
    })
    
    // 保存token并验证登录态
    await userStore.login(token)
    
    // 跳转首页
    uni.reLaunch({ url: '/pages/home/index' })
  } catch (error) {
    if (error.code === 403) {
      // 账号封禁特殊处理
      uni.showModal({
        title: '账号已封禁',
        content: error.message
      })
    }
  }
}

// 3. 验证登录态
const checkLoginStatus = async () => {
  try {
    const userInfo = await userStore.checkAuth()
    console.log('用户角色:', userInfo.role)
  } catch (error) {
    // 验证失败会自动跳转登录页
    console.error('登录态验证失败:', error)
  }
}

// 4. 退出登录
const handleLogout = async () => {
  try {
    await userStore.logout()
    // 会自动清理数据并跳转登录页
  } catch (error) {
    console.error('退出失败:', error)
  }
}
```

---

## 🔄 数据流

### Store管理（Pinia）
```javascript
// stores/user.js
export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)
  
  // 登录
  const login = async (tokenStr) => {
    token.value = tokenStr
    setToken(tokenStr)
    
    // 获取用户角色
    const userRoleInfo = await getCurrentUser()
    userInfo.value = userRoleInfo
    setUserInfo(userRoleInfo)
  }
  
  // 登出
  const logout = async () => {
    await authApi.logout()
    token.value = ''
    userInfo.value = null
    removeToken()
    removeUserInfo()
    uni.reLaunch({ url: '/pages/auth/login' })
  }
  
  // 验证登录态
  const checkAuth = async () => {
    const userRoleInfo = await checkAuthUtil()
    userInfo.value = userRoleInfo
    setUserInfo(userRoleInfo)
    return userRoleInfo
  }
  
  return { token, userInfo, login, logout, checkAuth }
})
```

---

## 📂 文件结构

```
src/
├── api/
│   ├── auth.js              ← 认证接口定义
│   └── request.js           ← 统一请求封装（拦截器）
├── stores/
│   └── user.js              ← 用户状态管理
├── utils/
│   └── auth.js              ← 认证工具函数
├── pages/
│   └── auth/
│       ├── login.vue        ← 登录页
│       └── register.vue     ← 注册页
└── App.vue                  ← 应用启动验证

env/
├── .env.development         ← 开发环境配置
└── .env.production          ← 生产环境配置
```

---

## 🧪 测试清单

### 注册功能
- [ ] 空表单提交 → 显示验证错误
- [ ] 手机号格式错误 → 显示"手机号格式不正确"
- [ ] 手机号重复 → 显示"该手机号已被注册"
- [ ] 密码少于6位 → 显示"密码至少6位"
- [ ] 两次密码不一致 → 显示"两次输入的密码不一致"
- [ ] 未同意协议 → 显示"请先同意用户协议"
- [ ] 成功注册 → 自动登录 → 跳转首页

### 登录功能
- [ ] 手机号格式错误 → 显示验证错误
- [ ] 错误密码 → 显示"手机号或密码错误"
- [ ] 账号封禁 → 弹窗显示封禁原因和时间
- [ ] 成功登录 → 保存token → 验证登录态 → 跳转首页

### 登录态验证
- [ ] 首次打开应用 → 无token → 可访问公开页面
- [ ] 已登录状态 → 有token → 验证成功 → 正常使用
- [ ] Token过期 → 验证失败 → 清token → 访问受保护页面时跳登录页

### 退出登录
- [ ] 点击退出 → 调用后端接口 → 清本地数据 → 跳登录页

---

**文档维护**: 前端开发团队  
**最后更新**: 2025-11-28
