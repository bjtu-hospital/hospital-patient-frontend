# 预约挂号功能 - API接口文档

> **文档版本**: v1.0  
> **更新日期**: 2025-11-21  
> **适用范围**: 北京交通大学校医院患者端预约挂号系统

---

## 📋 目录

- [1. 接口规范](#1-接口规范)
- [2. 预约流程概览](#2-预约流程概览)
- [3. 医院与科室接口](#3-医院与科室接口)
- [4. 医生排班接口](#4-医生排班接口)
- [5. 预约管理接口](#5-预约管理接口)
- [6. 候补功能接口](#6-候补功能接口)
- [7. 支付相关接口](#7-支付相关接口)
- [8. 数据模型](#8-数据模型)
- [9. 错误码说明](#9-错误码说明)

---

## 1. 接口规范

### 1.1 基础信息

- **Base URL**: `http://localhost:8000` (开发环境)
- **生产环境**: `https://api.bjtu-hospital.com`
- **请求头**: 
  ```
  Content-Type: application/json
  Authorization: Bearer {token}
  ```

### 1.2 统一响应格式

```json
{
  "code": 0,           // 0表示成功,其他表示错误
  "message": "操作成功",
  "data": {}           // 具体数据
}
```

### 1.3 分页格式

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,      // 总记录数
    "page": 1,         // 当前页
    "pageSize": 10,    // 每页条数
    "list": []         // 数据列表
  }
}
```

---

## 2. 预约流程概览

### 2.1 正常预约流程

```
用户选择医院
    ↓
用户选择科室
    ↓
用户选择医生排班(有号)
    ↓
用户选择就诊人
    ↓
确认预约信息
    ↓
创建预约订单
    ↓
创建支付订单
    ↓
支付
    ↓
预约成功
```

### 2.2 候补预约流程

```
用户选择医院
    ↓
用户选择科室
    ↓
用户选择医生排班(无号)
    ↓
加入候补队列
    ↓
等待候补成功
    ↓
(候补成功后)转为正常预约
```

---

## 3. 医院与科室接口

### 3.1 获取医院列表

**接口**: `GET /patient/hospitals`  
**说明**: 获取可预约的医院列表  
**是否需要登录**: 否

**请求参数**: 无

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "hospital_001",
      "name": "北京交通大学校医院(本部)",
      "level": "三甲",
      "type": "综合医院",
      "address": "北京市西城区西直门南大街11号",
      "image": "/static/hospital-1.png",
      "distance": 1.2,
      "isOpen": true,
      "departmentCount": 15,
      "doctorCount": 48,
      "availableSlots": 126
    }
  ]
}
```

### 3.2 获取科室列表

**接口**: `GET /patient/hospitals/{hospitalId}/departments`  
**说明**: 获取指定医院的科室列表  
**是否需要登录**: 否

**路径参数**:
- `hospitalId` (string, required): 医院ID

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "dept_001",
      "hospitalId": "hospital_001",
      "name": "呼吸与危重症医学科门诊",
      "category": "internal",
      "todaySlots": 8,
      "tomorrowSlots": 10,
      "priceRange": "¥15-50",
      "description": "擅长治疗呼吸系统疾病、睡眠呼吸障碍等"
    }
  ]
}
```

**科室分类(category)**:
- `internal` - 内科
- `surgical` - 外科
- `gynecology` - 妇产科
- `pediatrics` - 儿科
- `ent` - 五官科
- `tcm` - 中医科
- `dermatology` - 皮科
- `other` - 其他科
- `preop` - 术前管理中心
- `international` - 国际医疗部

---

## 4. 医生排班接口

### 4.1 获取医生排班列表

**接口**: `GET /patient/schedules`  
**说明**: 获取医生排班信息(支持按医院、科室、日期筛选)  
**是否需要登录**: 否

**查询参数**:
- `hospitalId` (string, optional): 医院ID
- `departmentId` (string, required): 科室ID
- `date` (string, optional): 日期(格式: YYYY-MM-DD), 不传则返回未来7天
- `type` (string, optional): 门诊类型 (`normal`/`expert`/`special`)

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "schedule_001",
      "hospitalId": "hospital_001",
      "departmentId": "dept_005",
      "doctorId": "doctor_001",
      "doctorName": "刘靖",
      "doctorTitle": "主治医师",
      "date": "2025-11-21",
      "period": "上午",
      "startTime": "08:00",
      "endTime": "12:00",
      "appointmentType": "普通",
      "type": "normal",
      "price": 50,
      "availableSlots": 20,
      "totalSlots": 25
    }
  ]
}
```

**字段说明**:
- `type`: 门诊类型
  - `normal` - 普通门诊
  - `expert` - 专家/特需门诊
  - `special` - 专病门诊
- `period`: 时段 (`上午`/`下午`/`晚上`)
- `availableSlots`: 可预约数量, **0表示已约满,需要候补**
- `totalSlots`: 总号源数

---

## 5. 预约管理接口

### 5.1 创建预约

**接口**: `POST /patient/appointments`  
**说明**: 创建预约订单  
**是否需要登录**: 是

**请求参数**:
```json
{
  "scheduleId": "schedule_001",
  "hospitalId": "hospital_001",
  "departmentId": "dept_005",
  "slotId": "schedule_001_slot_001",
  "patientId": "patient_001",
  "symptoms": "头痛、发热"
}
```

**参数说明**:
- `scheduleId` (string, required): 排班ID
- `hospitalId` (string, required): 医院院区ID
- `departmentId` (string, required): 科室ID
- `slotId` (string, required): 具体时段ID
- `patientId` (string, required): 就诊人ID
- `symptoms` (string, optional): 症状描述

**响应数据**:
```json
{
  "code": 0,
  "message": "预约成功",
  "data": {
    "id": "appointment_001",
    "orderNo": "202411210001",
    "queueNumber": 15,
    "needPay": true,
    "payAmount": 50,
    "appointmentDate": "2025-11-21",
    "appointmentTime": "上午 08:00-08:30",
    "status": "pending",
    "paymentStatus": "pending"
  }
}
```

**状态说明**:
- `status`: 预约状态
  - `pending` - 待就诊
  - `completed` - 已完成
  - `cancelled` - 已取消
  - `expired` - 已过期
- `paymentStatus`: 支付状态
  - `pending` - 待支付
  - `paid` - 已支付
  - `refunded` - 已退款

### 5.2 获取我的预约列表

**接口**: `GET /patient/appointments`  
**说明**: 获取当前用户的预约列表  
**是否需要登录**: 是

**查询参数**:
- `status` (string, optional): 预约状态 (`all`/`pending`/`completed`/`cancelled`)
- `page` (int, optional): 页码,默认1
- `pageSize` (int, optional): 每页条数,默认10

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 25,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": "appointment_001",
        "orderNo": "202411210001",
        "hospitalId": "hospital_001",
        "hospitalName": "北京交通大学校医院(本部)",
        "departmentId": "dept_005",
        "departmentName": "心内科门诊",
        "doctorName": "刘靖",
        "doctorTitle": "主治医师",
        "scheduleId": "schedule_001",
        "appointmentDate": "2025-11-21",
        "appointmentTime": "上午 08:00-12:00",
        "patientName": "张三",
        "patientId": "patient_001",
        "queueNumber": 15,
        "price": 50,
        "status": "pending",
        "paymentStatus": "paid",
        "canCancel": true,
        "canReschedule": true,
        "createdAt": "2025-11-20 10:30:00"
      }
    ]
  }
}
```

### 5.3 取消预约

**接口**: `PUT /patient/appointments/{appointmentId}/cancel`  
**说明**: 取消预约  
**是否需要登录**: 是

**路径参数**:
- `appointmentId` (string, required): 预约ID

**响应数据**:
```json
{
  "code": 0,
  "message": "取消成功",
  "data": {
    "success": true,
    "refundAmount": 50
  }
}
```

**取消规则**:
- 上午号: 最晚于就诊日当天 **8:00前** 取消
- 下午号: 最晚于就诊日当天 **13:00前** 取消
- 超过时间需到医院挂号窗口办理

### 5.4 改约

**接口**: `PUT /patient/appointments/{appointmentId}/reschedule`  
**说明**: 修改预约时间  
**是否需要登录**: 是

**路径参数**:
- `appointmentId` (string, required): 预约ID

**请求参数**:
```json
{
  "scheduleId": "schedule_002",
  "slotId": "schedule_002_slot_001",
  "reason": "临时有事"
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "改约成功",
  "data": {
    "id": "appointment_001",
    "appointmentDate": "2025-11-22",
    "appointmentTime": "下午 14:00-14:30",
    "queueNumber": 10
  }
}
```

---

## 6. 候补功能接口

### 6.1 加入候补

**接口**: `POST /patient/waitlist`  
**说明**: 当号源已满时,加入候补队列  
**是否需要登录**: 是

**请求参数**:
```json
{
  "scheduleId": "schedule_001",
  "patientId": "patient_001"
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "加入候补成功",
  "data": {
    "waitlistId": "waitlist_001",
    "position": 3,
    "expiryDate": "2025-11-20 18:00:00"
  }
}
```

**字段说明**:
- `position`: 当前候补位置
- `expiryDate`: 候补截止时间(就诊前一日18:00)

**候补规则**:
1. 同一候补需求不能重复提交
2. 同时最多可提交 **3个候补订单**
3. 候补截止时间为 **就诊前一日18:00**
4. 候补成功后需在 **8小时内** 完成缴费(自费/公费患者)
5. 医保患者需在 **就诊日前1天18:00前** 缴费

### 6.2 获取候补列表

**接口**: `GET /patient/waitlist`  
**说明**: 获取我的候补记录  
**是否需要登录**: 是

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "waitlist_001",
      "scheduleId": "schedule_001",
      "patientId": "patient_001",
      "patientName": "张三",
      "hospitalName": "北京交通大学校医院(本部)",
      "departmentName": "心内科门诊",
      "doctorName": "刘靖",
      "doctorTitle": "主治医师",
      "appointmentDate": "2025-11-24",
      "appointmentTime": "上午 08:00-12:00",
      "period": "上午",
      "appointmentType": "普通门诊",
      "price": 50,
      "position": 3,
      "status": "waiting",
      "expiryDate": "2025-11-23 18:00:00",
      "createdAt": "2025-11-21 10:00:00",
      "appointmentId": null
    }
  ]
}
```

**候补状态(status)**:
- `waiting` - 候补中
- `success` - 候补成功(已转为预约)
- `expired` - 已过期
- `cancelled` - 已取消

### 6.3 取消候补

**接口**: `DELETE /patient/waitlist/{waitlistId}`  
**说明**: 取消候补  
**是否需要登录**: 是

**路径参数**:
- `waitlistId` (string, required): 候补ID

**响应数据**:
```json
{
  "code": 0,
  "message": "取消成功",
  "data": {
    "success": true
  }
}
```

### 6.4 候补转预约(后端自动触发)

**说明**: 当有人取消预约释放号源时,后端自动将候补队列第一位转为正式预约

**转换流程**:
1. 检测到号源释放
2. 查询该排班的候补队列(按创建时间排序)
3. 取第一位候补记录
4. 自动创建预约订单
5. 发送通知给患者
6. 更新候补状态为 `success`
7. 更新候补记录的 `appointmentId`

---

## 7. 支付相关接口

### 7.1 创建支付订单

**接口**: `POST /patient/payment/orders`  
**说明**: 预约成功后创建支付订单  
**是否需要登录**: 是

**请求参数**:
```json
{
  "appointmentId": "appointment_001",
  "orderNo": "202411210001",
  "amount": 50,
  "description": "北京交通大学校医院(本部)-心内科门诊",
  "patientName": "张三"
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "pay_order_001",
    "amount": 50,
    "status": "pending",
    "expiryTime": "2025-11-21 11:00:00",
    "paymentMethods": [
      {
        "id": "wechat",
        "name": "微信支付",
        "icon": "/static/payment-icon/wechat.png",
        "description": "推荐使用"
      },
      {
        "id": "alipay",
        "name": "支付宝",
        "icon": "/static/payment-icon/alipay.png",
        "description": "快捷支付"
      },
      {
        "id": "bank",
        "name": "银行卡",
        "icon": "/static/payment-icon/bank.png",
        "description": "储蓄卡/信用卡"
      }
    ]
  }
}
```

**字段说明**:
- `expiryTime`: 支付超时时间(30分钟)
- 超时未支付自动取消预约

### 7.2 执行支付

**接口**: `POST /patient/payment/pay`  
**说明**: 执行支付操作  
**是否需要登录**: 是

**请求参数**:
```json
{
  "orderId": "pay_order_001",
  "paymentMethod": "wechat",
  "paymentData": {
    "authCode": "xxx"
  }
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "支付成功",
  "data": {
    "orderId": "pay_order_001",
    "transactionId": "wx_txn_001",
    "paidAt": "2025-11-21 10:35:00",
    "amount": 50
  }
}
```

### 7.3 查询支付状态

**接口**: `GET /patient/payment/orders/{orderId}/status`  
**说明**: 查询支付订单状态  
**是否需要登录**: 是

**路径参数**:
- `orderId` (string, required): 支付订单ID

**响应数据**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": "pay_order_001",
    "status": "paid",
    "amount": 50,
    "paidAt": "2025-11-21 10:35:00"
  }
}
```

**支付状态**:
- `pending` - 待支付
- `paying` - 支付中
- `paid` - 已支付
- `failed` - 支付失败
- `cancelled` - 已取消
- `refunded` - 已退款

---

## 8. 数据模型

### 8.1 医院(Hospital)

```typescript
interface Hospital {
  id: string              // 医院ID
  name: string            // 医院名称
  level: string           // 医院等级(三甲/二甲等)
  type: string            // 医院类型(综合医院/专科医院)
  address: string         // 详细地址
  image: string           // 医院图片
  distance: number        // 距离(km)
  isOpen: boolean         // 是否开放预约
  departmentCount: number // 科室数量
  doctorCount: number     // 医生数量
  availableSlots: number  // 可预约号源数
}
```

### 8.2 科室(Department)

```typescript
interface Department {
  id: string              // 科室ID
  hospitalId: string      // 所属医院ID
  name: string            // 科室名称
  category: string        // 科室分类
  todaySlots: number      // 今天可约数
  tomorrowSlots: number   // 明天可约数
  priceRange: string      // 价格区间
  description: string     // 科室简介
}
```

### 8.3 医生排班(Schedule)

```typescript
interface Schedule {
  id: string              // 排班ID
  hospitalId: string      // 医院ID
  departmentId: string    // 科室ID
  doctorId: string        // 医生ID
  doctorName: string      // 医生姓名
  doctorTitle: string     // 医生职称
  date: string            // 日期(YYYY-MM-DD)
  period: string          // 时段(上午/下午/晚上)
  startTime: string       // 开始时间(HH:mm)
  endTime: string         // 结束时间(HH:mm)
  appointmentType: string // 门诊类型文本
  type: string            // 门诊类型代码(normal/expert/special)
  price: number           // 挂号费(元)
  availableSlots: number  // 可预约数
  totalSlots: number      // 总号源数
}
```

### 8.4 预约(Appointment)

```typescript
interface Appointment {
  id: string              // 预约ID
  orderNo: string         // 预约单号
  hospitalId: string      // 医院ID
  hospitalName: string    // 医院名称
  departmentId: string    // 科室ID
  departmentName: string  // 科室名称
  doctorName: string      // 医生姓名
  doctorTitle: string     // 医生职称
  scheduleId: string      // 排班ID
  appointmentDate: string // 就诊日期
  appointmentTime: string // 就诊时间段
  patientName: string     // 就诊人姓名
  patientId: string       // 就诊人ID
  queueNumber: number     // 排队号
  price: number           // 费用
  status: string          // 预约状态
  paymentStatus: string   // 支付状态
  canCancel: boolean      // 是否可取消
  canReschedule: boolean  // 是否可改约
  createdAt: string       // 创建时间
}
```

### 8.5 候补(Waitlist)

```typescript
interface Waitlist {
  id: string              // 候补ID
  scheduleId: string      // 排班ID
  patientId: string       // 就诊人ID
  patientName: string     // 就诊人姓名
  hospitalName: string    // 医院名称
  departmentName: string  // 科室名称
  doctorName: string      // 医生姓名
  doctorTitle: string     // 医生职称
  appointmentDate: string // 就诊日期
  appointmentTime: string // 就诊时间段
  period: string          // 时段
  appointmentType: string // 门诊类型
  price: number           // 费用
  position: number        // 候补位置
  status: string          // 候补状态
  expiryDate: string      // 截止时间
  createdAt: string       // 创建时间
  appointmentId: string   // 转换后的预约ID(候补成功后)
}
```

---

## 9. 错误码说明

### 9.1 通用错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 0 | 成功 | - |
| 400 | 参数错误 | 检查请求参数 |
| 401 | 未登录或token过期 | 跳转到登录页 |
| 403 | 无权限 | 提示无权限 |
| 404 | 资源不存在 | 提示资源不存在 |
| 500 | 服务器错误 | 提示服务器错误,稍后重试 |

### 9.2 业务错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 1001 | 号源已满 | 提示用户加入候补 |
| 1002 | 预约冲突 | 提示该时段已有预约 |
| 1003 | 超过预约限制 | 提示预约数量限制 |
| 1004 | 不在可预约时间 | 提示预约时间规则 |
| 1005 | 就诊人信息不完整 | 提示完善就诊人信息 |
| 1006 | 超过取消时间 | 提示需到医院窗口办理 |
| 1007 | 已取消过,不能再取消 | 提示预约已取消 |
| 1008 | 候补队列已满 | 提示候补人数过多 |
| 1009 | 重复候补 | 提示已在候补队列中 |
| 1010 | 支付超时 | 提示重新预约 |
| 1011 | 爽约记录过多 | 提示暂停预约权限 |

### 9.3 错误响应示例

```json
{
  "code": 1001,
  "message": "号源已满,您可以选择加入候补队列",
  "data": {
    "waitlistAvailable": true,
    "currentPosition": 5
  }
}
```

---

## 10. 附录

### 10.1 预约规则

1. **预约限制**:
   - 同一患者同一诊疗单元内,最多可挂 **同一科室同一类别各1个号**
   - 同一就诊人 **8天内最多可挂10个号**

2. **取号规则**:
   - 西直门院区/白塔寺院区: 上午号 **11:30前**,下午号 **16:30前**
   - 通州院区: 上午号 **11:30前**,下午号 **16:00前**
   - 已缴费患者可直接报到就诊

3. **爽约规则**:
   - 诊疗单元结束后仍未就诊,记录为 **爽约1次**
   - **30天内爽约3次**,暂停预约挂号权限 **90天**

4. **取消规则**:
   - 上午号: 最晚于就诊日当天 **8:00前** 取消
   - 下午号: 最晚于就诊日当天 **13:00前** 取消
   - 其他时间须到医院挂号窗口办理

### 10.2 候补规则

1. **候补限制**:
   - 同一候补需求不能重复提交
   - 同时最多可提交 **3个候补订单**

2. **候补时效**:
   - 候补截止时间为 **就诊前一日18:00**
   - 超过截止时间自动结束候补

3. **候补转预约**:
   - 候补成功后,自费/公费患者需在 **8小时内** 缴费
   - 医保患者需在 **就诊日前1天18:00前** 缴费
   - 超时自动取消

### 10.3 支付规则

1. **支付时限**:
   - 预约成功后 **30分钟内** 完成支付
   - 超时自动取消预约

2. **退款规则**:
   - 符合取消时间规则的预约,取消后 **全额退款**
   - 退款原路返回,**1-3个工作日** 到账

3. **发票**:
   - 支持开具电子发票
   - 可在"我的-发票管理"中申请

---

## 📝 变更日志

### v1.0 (2025-11-21)
- 初始版本
- 完整的预约流程接口
- 候补功能接口
- 支付相关接口

---

## 🔗 相关文档

- [患者端完整API文档](./API接口文档-患者端.md)
- [候补转预约功能-后端实现指南](./src/pages/home/appointment/候补转预约功能-后端实现指南.md)
- [支付流程集成指南](./src/pages/home/appointment/支付流程集成指南.md)

---

**文档维护**: 开发团队  
**技术支持**: dev@bjtu-hospital.com
