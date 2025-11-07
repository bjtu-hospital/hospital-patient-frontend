# 🎭 Mock 数据使用指南（简化版）

## 🎯 项目目标

实现 **Mock 数据与真实接口的灵活切换**，让前端可以独立开发，不依赖后端环境。

---

## ✨ 项目结构

### 1. **Mock 数据文件**

```
src/mock/
├── index.js              # Mock 配置中心（✨切换开关在这里）
├── appointment.js        # 预约相关 Mock 数据（医院、科室、排班）
└── user.js              # 用户相关 Mock 数据（就诊人、预约记录等）
```

### 2. **API 接口层**（已内置 Mock 判断逻辑）

```
src/api/
├── request.js           # 请求封装
├── appointment.js       # 预约接口 ✨ 已内置 Mock 切换逻辑
└── user.js             # 用户接口
```

### 3. **页面层**

```
src/pages/
└── home/appointment/
    ├── select-hospital.vue    # ✅ 已支持 Mock
    ├── select-department.vue  # ✅ 已支持 Mock
    └── select-doctor.vue      # ✅ 已支持 Mock
```

---

## 🔄 如何切换 Mock / 真实接口？

### 只需修改一个文件！

```javascript
// src/mock/index.js

export const mockConfig = {
  // 🎭 true = 使用 Mock 数据（前端独立开发）
  enabled: true,     // ← 只改这一行！
  
  // 🔌 false = 使用真实接口（对接后端）
  // enabled: false,
  
  delay: 500  // Mock 延迟时间（毫秒）
}
```

**就这么简单！** 一行代码，全局切换！

---

## 📊 架构图

```
┌─────────────┐
│  页面组件    │
│ (Vue页面)   │
└──────┬──────┘
       │ 调用 getHospitals()
       ↓
┌─────────────────────┐
│   API 接口层        │
│ api/appointment.js  │
└──────┬──────────────┘
       │ 判断 mockConfig.enabled
       │
       ├─ true ──→ ┌──────────────┐
       │           │  Mock 数据   │
       │           │ mock/       │
       │           └──────────────┘
       │
       └─ false ─→ ┌──────────────┐
                   │  真实接口    │
                   │ request.js  │
                   └──────────────┘
```

---

## 🚀 使用示例

### 在页面中使用

```vue
<template>
  <view class="page">
    <!-- 显示医院列表 -->
    <view v-for="hospital in hospitals" :key="hospital.id">
      {{ hospital.name }}
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHospitals } from '@/api/appointment'  // ✨ 导入 API

const hospitals = ref([])
const loading = ref(false)

// 加载医院数据
const loadHospitals = async () => {
  try {
    loading.value = true
    // 自动判断使用 Mock 还是真实接口
    const data = await getHospitals()
    hospitals.value = data
    console.log('医院列表:', data)
  } catch (error) {
    console.error('加载失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHospitals()
})
</script>
```

---

## 📋 Mock 数据清单

### 预约相关（src/mock/appointment.js）

| 数据类型 | 变量名 | 说明 | 数量 |
|---------|--------|------|------|
| 医院列表 | `mockHospitals` | 4个院区 | 4 条 |
| 科室列表 | `mockDepartments` | 覆盖10个大类 | 27 条 |
| 医生排班 | `mockSchedules` | 包含普通/专家/专病门诊 | 11 条 |
| 医生信息 | `mockDoctors` | 医生详细信息 | 3 条 |

### 用户相关（src/mock/user.js）

| 数据类型 | 变量名 | 说明 |
|---------|--------|------|
| 就诊人列表 | `mockPatients` | 3个就诊人 |
| 用户信息 | `mockUserInfo` | 当前用户信息 |
| 预约记录 | `mockAppointments` | 3条预约记录 |
| 健康档案 | `mockHealthRecords` | 健康档案数据 |
| 消息列表 | `mockMessages` | 3条消息 |

---

## 🎓 完整的预约流程

```
用户操作                   API 调用                     Mock/真实接口
────────                  ──────────                  ─────────────
                          
1. 点击"预约挂号"
   ↓
2. 进入选择医院页面
   ↓                      
                          getHospitals()  ──→  mockHospitals / 真实API
   ↓                                            (4个院区)
   显示医院列表
   ↓
3. 选择"本部院区"
   ↓
4. 进入选择科室页面
   ↓
                          getDepartments()  ──→  mockDepartments / 真实API
   ↓                                             (27个科室)
   显示科室列表
   ↓
5. 选择"心内科"
   ↓
6. 进入选择医生页面
   ↓
                          getDoctorSchedules()  ──→  mockSchedules / 真实API
   ↓                                                  (11个排班)
   显示医生排班
   ↓
7. 选择"张医生 上午"
   ↓
8. 进入确认预约页面
   ↓
9. 点击"确认预约"
   ↓
                          createAppointment()  ──→  模拟创建 / 真实API
   ↓
   预约成功！
```

---

## 💡 开发建议

### 阶段 1：前端独立开发（使用 Mock）

```javascript
// src/mock/index.js
export const mockConfig = {
  enabled: true,   // ← 开启 Mock
  delay: 300       // 快速响应
}
```

**优势：**
- ✅ 不依赖后端，快速开发
- ✅ 数据稳定，便于调试
- ✅ 可以模拟各种场景

### 阶段 2：对接后端（切换真实接口）

```javascript
// src/mock/index.js
export const mockConfig = {
  enabled: false,  // ← 关闭 Mock
  delay: 300
}
```

**验证：**
- ✅ 接口是否正常
- ✅ 数据格式是否匹配
- ✅ 错误处理是否完善

### 阶段 3：灵活切换（测试 / 演示）

```javascript
// 需要演示或测试时，随时切换
mockConfig.enabled = true   // Mock 数据
mockConfig.enabled = false  // 真实接口
```

---

## 🔍 控制台日志

API 层会自动打印日志，方便调试：

```javascript
// 使用 Mock 数据时
[Mock] 使用 Mock 医院数据
[Mock] 使用 Mock 科室数据, hospitalId: hospital_001
[Mock] 使用 Mock 排班数据, params: {...}

// 使用真实接口时
[API] 调用真实接口获取医院列表
[API] 调用真实接口获取科室列表
[API] 调用真实接口获取医生排班
```

---

## 📁 关键文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| **Mock 配置** | `src/mock/index.js` | ✨ 切换开关在这里 |
| **Mock 数据** | `src/mock/appointment.js` | 预约相关数据 |
| **Mock 数据** | `src/mock/user.js` | 用户相关数据 |
| **API 接口** | `src/api/appointment.js` | ✨ 已内置 Mock 判断 |

---

## ✅ 检查清单

在使用前，请确认：

- [ ] 已创建 `src/mock/` 文件夹和相关文件
- [ ] `src/api/appointment.js` 已导入 Mock 数据
- [ ] 页面使用 `import { xxx } from '@/api/appointment'`
- [ ] 在 `src/mock/index.js` 中配置了 `mockConfig.enabled`
- [ ] 控制台能看到 `[Mock]` 或 `[API]` 日志

---

## 🎉 总结

通过 **API 层内置 Mock 判断** 的简化架构：

1. ✅ Mock 数据集中管理在 `src/mock/`
2. ✅ 一行代码切换 Mock / 真实接口
3. ✅ 前后端可以并行开发
4. ✅ 结构简单，易于理解
5. ✅ 便于测试和演示

**现在，您只需要修改 `src/mock/index.js` 中的一个配置项，就能在 Mock 和真实接口之间自由切换！** 🚀

---

## ❓ 常见问题

### Q: 如何添加新的 Mock 数据？

A: 在 `src/mock/appointment.js` 或 `src/mock/user.js` 中添加即可：

```javascript
// src/mock/appointment.js

// 添加新的医院
export const mockHospitals = [
  // ... 现有数据
  {
    id: 'hospital_005',
    name: '新增医院',
    // ... 其他字段
  }
]
```

### Q: 如何在 API 中使用 Mock 数据？

A: 参考 `src/api/appointment.js` 的写法：

```javascript
import { mockConfig, mockDelay, mockXXX } from '@/mock'

export const getXXX = async () => {
  if (mockConfig.enabled) {
    console.log('[Mock] 使用 Mock 数据')
    await mockDelay()
    return mockXXX
  }
  
  console.log('[API] 调用真实接口')
  return request.get('/xxx')
}
```

### Q: Mock 数据能否支持分页、搜索？

A: 可以！在 API 层实现即可：

```javascript
export const getHospitals = async (params) => {
  if (mockConfig.enabled) {
    let data = mockHospitals
    
    // 支持搜索
    if (params.keyword) {
      data = data.filter(h => h.name.includes(params.keyword))
    }
    
    // 支持分页
    const start = (params.page - 1) * params.pageSize
    const end = start + params.pageSize
    
    return {
      total: data.length,
      list: data.slice(start, end)
    }
  }
  
  return request.get('/patient/hospitals', params)
}
```

---

祝您开发顺利！💪
