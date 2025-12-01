# 用户信息接口文档

> **模块**: 病人用户信息管理  
> **更新日期**: 2025-11-30  
> **接口规范**: 统一返回格式 `{ code: 0, message: {} }` 或 `{ code: 非0, message: "错误信息" }`

---

## 📋 接口列表

1. [获取用户信息](#1-获取用户信息)
2. [更新用户信息](#2-更新用户信息)

---

## 📖 接口详情

### 1. 获取用户信息

获取当前登录用户的完整个人信息。

- **接口地址**: `POST /auth/user-info`
- **请求方式**: `POST`
- **是否需要登录**: 是

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**: 无（POST 请求，但不需要请求体）

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "patient": {
      "id": "3",
      "phonenumber": "18993856575",
      "realName": "张三",
      "studentId": "23301087",
      "idCard": "110101199001011234",
      "email": "zhangsan@bjtu.edu.cn",
      "gender": "男",
      "birthDate": "1990-01-01",
      "patientType": "学生",
      "avatar": null,
      "verified": false,
      "createdAt": "2025-11-13 00:00:00",
      "updatedAt": null,
      "maskedInfo": {
        "phone": "189****6575",
        "idCard": "1101********1234"
      },
      "age": 35
    },
    "doctor": null
  }
}
```

**⚠️ 重要说明**:
- 这是多角色通用接口，返回 `{ patient: {...}, doctor: {...} }` 结构
- 患者端只使用 `patient` 字段
- 医生端会同时返回 `doctor` 字段
- 前端 API 会自动提取 `patient` 部分

**字段说明**:
- `id` (string): 患者唯一ID
- `phonenumber` (string): 手机号（登录账号）
- `realName` (string): 真实姓名
- `studentId` (string, optional): 学号（学生才有）
- `idCard` (string, optional): 身份证号
- `email` (string, optional): 邮箱
- `gender` (string, optional): 性别 '男'|'女'|'未知'
- `birthDate` (string, optional): 出生日期 YYYY-MM-DD
- `patientType` (string, optional): 患者类型 '学生'|'教师'|'职工'
- `avatar` (string, optional): 头像URL
- `verified` (boolean): 是否实名认证
- `createdAt` (string): 创建时间
- `updatedAt` (string, optional): 更新时间
- `maskedInfo` (object): 脱敏信息（用于显示）
- `age` (number): 年龄（根据出生日期计算）

**错误返回**:

401 - 未登录或token无效:
```json
{
  "code": 401,
  "message": "token无效或已过期"
}
```

---

### 2. 更新用户信息

更新当前登录用户的个人信息。

- **接口地址**: `PUT /patient/profile`
- **请求方式**: `PUT`
- **是否需要登录**: 是

**请求头**:
```
Authorization: Bearer <token>
```

**请求参数**:
```json
{
  "realName": "李四",
  "email": "lisi@bjtu.edu.cn",
  "gender": "女",
  "birthDate": "1995-06-15"
}
```

**参数说明**:
- `realName` (string, optional): 真实姓名
- `email` (string, optional): 邮箱
- `gender` (string, optional): 性别
- `birthDate` (string, optional): 出生日期

**返回数据**:
```json
{
  "code": 0,
  "message": "更新成功"
}
```

**错误返回**:

400 - 参数错误:
```json
{
  "code": 400,
  "message": "邮箱格式不正确"
}
```

401 - 未登录:
```json
{
  "code": 401,
  "message": "token无效或已过期"
}
```

---

## 🔄 前端调用流程

### 登录时自动获取用户信息

```javascript
// 1. 登录获取 token
const token = await login({ phonenumber, password })

// 2. 保存 token 并获取用户信息（Store 自动处理）
await userStore.login(token)
// userStore.login() 内部会：
//   - 保存 token
//   - 调用 /auth/me 获取角色
//   - 调用 /patient/profile 获取完整信息
//   - 合并并保存用户信息

// 3. 使用用户信息
console.log(userStore.userInfo.realName)  // "张三"
console.log(userStore.userInfo.role)      // "user"
```

### 个人中心页面加载用户信息

```javascript
// 从 API 获取最新的用户信息
import { getUserInfo } from '@/api/user'

const loadUserInfo = async () => {
  try {
    const userInfo = await getUserInfo()
    // 展示用户信息
    console.log(userInfo.realName)
    console.log(userInfo.phonenumber)
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}
```

---

## ✅ 测试清单

- [ ] 登录后能正确获取用户信息
- [ ] 个人中心显示真实用户姓名和手机号
- [ ] 用户头像显示姓名首字符
- [ ] 退出登录后清除用户信息
- [ ] token过期时自动跳转登录页

---

## 🚨 注意事项

1. **必填字段**：后端必须返回 `phonenumber` 和 `realName`
2. **可选字段**：其他字段可以为空或不返回
3. **数据同步**：用户修改信息后需要刷新个人中心
4. **隐私保护**：身份证号、手机号等敏感信息需脱敏显示
