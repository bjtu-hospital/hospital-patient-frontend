# 改约功能 - API接口文档

> **模块**: 改约功能  
> **更新日期**: 2025-11-22  
> **接口规范**: 统一返回格式 `{ code: 0, message: {} }` 或 `{ code: 非0, message: "错误信息" }`

---

## 📋 接口列表

1. [改约预约](#1-改约预约)

---

## 📖 接口详情

### 1. 改约预约

修改已有预约的时间，只能改约到同科室的其他时段。

- **接口地址**: `PUT /patient/appointments/{appointmentId}/reschedule`
- **请求方式**: `PUT`
- **是否需要登录**: 是

**路径参数**:
- `appointmentId` (string, required): 预约ID

**请求参数**:
```json
{
  "scheduleId": "schedule_002",
  "hospitalId": "hospital_001",
  "departmentId": "dept_005",
  "slotId": "schedule_002_slot_001",
  "appointmentDate": "2025-11-22",
  "appointmentTime": "下午 14:00-17:00",
  "doctorName": "王医生",
  "doctorTitle": "主治医师",
  "price": 50,
  "patientId": "patient_001",
  "patientName": "张三"
}
```

**参数说明**:
- `scheduleId` (string, required): 新排班ID
- `hospitalId` (string, required): 医院ID
- `departmentId` (string, required): 科室ID（必须与原预约相同）
- `slotId` (string, optional): 具体时段ID
- `appointmentDate` (string, required): 新就诊日期
- `appointmentTime` (string, required): 新就诊时间段
- `doctorName` (string, required): 医生姓名
- `doctorTitle` (string, optional): 医生职称
- `price` (number, required): 挂号费
- `patientId` (string, required): 就诊人ID
- `patientName` (string, required): 就诊人姓名

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "id": "appointment_001",
    "appointmentDate": "2025-11-22",
    "appointmentTime": "下午 14:00-17:00",
    "queueNumber": 10,
    "doctorName": "王医生",
    "price": 50,
    "priceDiff": 0
  }
}
```

**字段说明**:
- `priceDiff`: 价格差异
  - `> 0`: 需要补交差价
  - `< 0`: 多余金额将原路退回
  - `= 0`: 价格相同，无需操作

---

## 📌 改约规则

### 1. 前置条件
- ✅ 预约状态必须是 `pending`（待就诊）
- ✅ 必须在可改约时间内
- ✅ 不能改约到已约满的时段
- ✅ 不能改约到当前预约的同一时段

### 2. 科室限制
- ✅ 只能改约到**同科室**的其他排班
- ❌ 不支持跨科室改约

### 3. 号源操作
改约成功后：
- 原时段号源 +1（释放）
- 新时段号源 -1（占用）

### 4. 支付处理

#### 价格相同
- 无需任何操作
- 保持原支付状态

#### 新价格更高
- 生成补差价订单
- 需要用户补交差价

#### 新价格更低
- 生成退款订单
- 多余金额原路返回（1-3个工作日到账）

### 5. 原预约处理
- 改约成功后，原预约状态自动变更为 `cancelled`
- 原预约记录保留，便于追溯

### 6. 候补队列
- 原时段释放号源后，自动通知候补队列第一位用户

---

## 📊 改约流程

```
用户点击"改约" 
    ↓
验证是否可改约（状态、时间等）
    ↓
选择同科室的新时段
    ↓
确认改约信息
    ↓
提交改约请求
    ↓
后端处理：
  - 验证科室是否相同
  - 验证新时段是否有号
  - 释放原号源
  - 占用新号源
  - 处理价格差异
  - 更新预约记录
    ↓
返回改约结果
    ↓
（如有差价）用户完成补差价支付
    ↓
改约完成
```

---

## ⚠️ 错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 0 | 成功 | - |
| 400 | 参数错误 | 检查请求参数 |
| 401 | 未登录或token过期 | 跳转到登录页 |
| 1001 | 新时段号源已满 | 提示选择其他时段 |
| 1002 | 不能改约到当前时段 | 提示选择不同时间 |
| 1012 | 跨科室改约不支持 | 提示只能改约同科室 |
| 1013 | 预约状态不允许改约 | 提示当前状态不可改约 |

---

## 📝 调用示例

```javascript
import { rescheduleAppointment } from '@/api/appointment'

// 改约
const result = await rescheduleAppointment('appointment_001', {
  scheduleId: 'schedule_002',
  hospitalId: 'hospital_001',
  departmentId: 'dept_005',
  slotId: 'schedule_002_slot_001',
  appointmentDate: '2025-11-22',
  appointmentTime: '下午 14:00-17:00',
  doctorName: '王医生',
  doctorTitle: '主治医师',
  price: 50,
  patientId: 'patient_001',
  patientName: '张三'
})

// 成功：result = {id: '...', appointmentDate: '...', priceDiff: 0, ...}
// 错误已由request.js统一Toast提示
```

---

## 🔄 前端实现要点

### 1. 数据流
```
appointments.vue (发起改约)
    ↓ setRescheduleContext()
reschedule/select-schedule.vue (选择新时段)
    ↓ setRescheduleSelectedSchedule()
reschedule/confirm.vue (确认改约)
    ↓ rescheduleAppointment()
appointments.vue (返回列表)
```

### 2. Store管理
```javascript
// 存储改约上下文
appointmentStore.setRescheduleContext({
  appointmentId,
  hospitalId,
  departmentId,
  // ... 其他信息
})

// 存储选择的新时段
appointmentStore.setRescheduleSelectedSchedule(newSchedule)

// 清除改约数据
appointmentStore.clearRescheduleData()
```

### 3. 本地存储
- `rescheduleContext` - 改约上下文（localStorage持久化）
- `rescheduleSelectedSchedule` - 选择的新时段（localStorage持久化）

---

**文档维护**: 前端开发团队  
**最后更新**: 2025-11-22
