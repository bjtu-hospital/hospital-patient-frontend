# 预约挂号功能 - API接口文档

> **模块**: 预约挂号  
> **更新日期**: 2025-11-22  
> **接口规范**: 统一返回格式 `{ code: 0, message: {} }` 或 `{ code: 非0, message: "错误信息" }`

---

## 📋 接口列表

### 一、医院与科室

1. [获取医院列表](#1-获取医院列表)
2. [获取科室列表](#2-获取科室列表)

### 二、医生排班

3. [获取医生排班列表](#3-获取医生排班列表)

### 三、预约管理

4. [创建预约](#4-创建预约)
5. [获取我的预约列表](#5-获取我的预约列表)
6. [取消预约](#6-取消预约)

### 四、支付相关

7. [创建支付订单](#7-创建支付订单)
8. [执行支付](#8-执行支付)
9. [查询支付状态](#9-查询支付状态)

---

## 📖 接口详情

### 一、医院与科室

#### 1. 获取医院列表

- **接口地址**: `GET /patient/hospitals`
- **请求方式**: `GET`
- **是否需要登录**: 否

**请求参数**: 无

**返回数据**:
```json
{
  "code": 0,
  "message": [
    {
      "id": "hospital_001",
      "name": "北京交通大学校医院(本部)",
      "level": "三甲",
      "type": "综合医院",
      "address": "北京市西城区西直门南大街11号",
      "image": "http://8.130.67.12:8000/common/icon?path=hospital-1.png",
      "distance": 1.2,
      "isOpen": true,
      "departmentCount": 15,
      "doctorCount": 48,
      "availableSlots": 126
    }
  ]
}
```

---

#### 2. 获取科室列表

- **接口地址**: `GET /patient/hospitals/{hospitalId}/departments`
- **请求方式**: `GET`
- **是否需要登录**: 否

**路径参数**:
- `hospitalId` (string, required): 医院ID

**返回数据**:
```json
{
  "code": 0,
  "message": [
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

### 二、医生排班

#### 3. 获取医生排班列表

- **接口地址**: `GET /patient/schedules`
- **请求方式**: `GET`
- **是否需要登录**: 否

**查询参数**:
- `hospitalId` (string, optional): 医院ID
- `departmentId` (string, required): 科室ID
- `date` (string, optional): 日期(格式: YYYY-MM-DD), 不传则返回未来7天
- `type` (string, optional): 门诊类型 (`normal`/`expert`/`international`)

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "schedules": [
      {
        "schedule_id": 5667,
        "doctor_id": 6,
        "doctor_name": "高炜",
        "clinic_id": 56,
        "clinic_name": "心血管科门诊",
        "clinic_type": 0,
        "date": "2025-11-18",
        "week_day": 2,
        "time_section": "上午",
        "slot_type": "专家",
        "total_slots": 15,
        "remaining_slots": 15,
        "status": "正常",
        "price": 100.0
      }
    ]
  }
}
```

**字段说明**:
- `clinic_type`: 门诊类型
  - `0` - 普通门诊
  - `1` - 国疗门诊
  - `2` - 特需门诊
- `time_section`: 时段 (`上午`/`下午`/`晚上`)
- `remaining_slots`: 可预约数量, **0表示已约满,需要候补**
- `total_slots`: 总号源数

---

### 三、预约管理

#### 4. 创建预约

- **接口地址**: `POST /patient/appointments`
- **请求方式**: `POST`
- **是否需要登录**: 是

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

**返回数据**:
```json
{
  "code": 0,
  "message": {
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

**业务规则**:
1. 预约成功后立即锁定号源(remaining_slots - 1)
2. 30分钟内未支付自动取消预约并释放号源
3. 同一患者同一诊疗单元内，最多可挂同一科室同一类别各1个号
4. 同一就诊人8天内最多可挂10个号

---

#### 5. 获取我的预约列表

- **接口地址**: `GET /patient/appointments`
- **请求方式**: `GET`
- **是否需要登录**: 是

**查询参数**:
- `status` (string, optional): 预约状态 (`all`/`pending`/`completed`/`cancelled`)
- `page` (int, optional): 页码,默认1
- `pageSize` (int, optional): 每页条数,默认10

**返回数据**:
```json
{
  "code": 0,
  "message": {
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

---

#### 6. 取消预约

- **接口地址**: `PUT /patient/appointments/{appointmentId}/cancel`
- **请求方式**: `PUT`
- **是否需要登录**: 是

**路径参数**:
- `appointmentId` (string, required): 预约ID

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "success": true,
    "refundAmount": 50
  }
}
```

**取消规则**:
- 上午号: 最晚于就诊日当天 **8:00前** 取消
- 下午号: 最晚于就诊日当天 **13:00前** 取消
- 超过时间需到医院挂号窗口办理
- 取消后释放号源，候补队列第一位自动转为预约

---

### 四、支付相关

#### 7. 创建支付订单

- **接口地址**: `POST /patient/payment/orders`
- **请求方式**: `POST`
- **是否需要登录**: 是

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

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "orderId": "pay_order_001",
    "amount": 50,
    "status": "pending",
    "expiryTime": "2025-11-21 11:00:00",
    "paymentMethods": [
      {
        "id": "wechat",
        "name": "微信支付",
        "icon": "http://8.130.67.12:8000/common/icon?path=payment-icon/wechat.png",
        "description": "推荐使用"
      },
      {
        "id": "alipay",
        "name": "支付宝",
        "icon": "http://8.130.67.12:8000/common/icon?path=payment-icon/alipay.png",
        "description": "快捷支付"
      }
    ]
  }
}
```

**字段说明**:
- `expiryTime`: 支付超时时间(30分钟)
- 超时未支付自动取消预约并释放号源

---

#### 8. 执行支付

- **接口地址**: `POST /patient/payment/pay`
- **请求方式**: `POST`
- **是否需要登录**: 是

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

**返回数据**:
```json
{
  "code": 0,
  "message": {
    "orderId": "pay_order_001",
    "transactionId": "wx_txn_001",
    "paidAt": "2025-11-21 10:35:00",
    "amount": 50
  }
}
```

---

#### 9. 查询支付状态

- **接口地址**: `GET /patient/payment/orders/{orderId}/status`
- **请求方式**: `GET`
- **是否需要登录**: 是

**路径参数**:
- `orderId` (string, required): 支付订单ID

**返回数据**:
```json
{
  "code": 0,
  "message": {
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

## 📌 统一错误码

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 0 | 成功 | - |
| 400 | 参数错误 | 检查请求参数 |
| 401 | 未登录或token过期 | 跳转到登录页 |
| 403 | 无权限 | 提示无权限 |
| 404 | 资源不存在 | 提示资源不存在 |
| 500 | 服务器错误 | 提示服务器错误,稍后重试 |
| 1001 | 号源已满 | 提示用户加入候补 |
| 1002 | 预约冲突 | 提示该时段已有预约 |
| 1003 | 超过预约限制 | 提示预约数量限制 |
| 1006 | 超过取消时间 | 提示需到医院窗口办理 |
| 1010 | 支付超时 | 提示重新预约 |

---

## 📝 调用示例

```javascript
import { createAppointment } from '@/api/appointment'

// 创建预约
const result = await createAppointment({
  scheduleId: 'schedule_001',
  hospitalId: 'hospital_001',
  departmentId: 'dept_005',
  slotId: 'schedule_001_slot_001',
  patientId: 'patient_001',
  symptoms: '头痛'
})

// 成功：result = {id: '...', orderNo: '...', ...}
// 错误已由request.js统一Toast提示
```

---

**文档维护**: 前端开发团队  
**最后更新**: 2025-11-22
