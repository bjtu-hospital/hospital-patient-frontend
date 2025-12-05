# 健康档案模块 API 接口文档

## 接口列表

| 接口 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/patient/health-record` | GET | 获取我的健康档案（完整数据） | ⚠️ 待实现 |
| `/common/visit-record/{visitId}` | GET | 获取就诊记录详情 | ✅ 已实现 |
| `/common/medical-record/{visitId}/pdf` | POST | 生成病历单PDF | ✅ 已实现 |
| `/common/medical-record/{visitId}/download` | GET | 下载病历单PDF | ✅ 已实现 |

**说明**: 
- 医生端使用 `GET /patient/{patientId}` 查询指定患者
- 患者端使用 `GET /patient/health-record` 查询自己（通过token识别）
- 两个接口返回相同的数据结构

---

## 1. 获取我的健康档案

- **接口**: `GET /patient/health-record`
- **说明**: 获取当前登录患者的完整健康档案（基本信息、病史、就诊记录列表）
- **状态**: ⚠️ 待实现
- **对应医生端**: `GET /patient/{patientId}`

**响应示例**:
```json
{
  "code": 0,
  "message": {
    "patientId": "123456",
    "basicInfo": {
      "name": "张三",
      "gender": "男",
      "age": 35,
      "height": 175,
      "phone": "138****5678",
      "idCard": "110101********1234",
      "address": "北京市海淀区学院路37号北京交通大学"
    },
    "medicalHistory": {
      "pastHistory": [
        "2020年患急性阑尾炎，已手术治疗",
        "2018年患轻度高血压，正在药物控制中"
      ],
      "allergyHistory": [
        "青霉素过敏",
        "海鲜过敏（虾、蟹）"
      ],
      "familyHistory": [
        "父亲患有高血压",
        "母亲患有糖尿病"
      ]
    },
    "consultationRecords": [
      {
        "id": "1",
        "outpatientNo": "061651734",
        "visitDate": "2025-07-05 09:04",
        "department": "全科医学科(综合内科)门诊",
        "doctorName": "姜岚",
        "chiefComplaint": "胆红素代谢紊乱史",
        "presentIllness": "胆红素代谢紊乱史，来诊复查化验",
        "auxiliaryExam": "2025-04-25 13:07，常规生化，肝功4白蛋白/球蛋白 2.56；*直接胆红素 8.7*umol/L；",
        "diagnosis": "胆红素代谢紊乱",
        "prescription": "1.全血细胞计数+5分类\n2.凝血分析\n3.生化23",
        "status": "completed"
      }
    ]
  }
}
```

**字段说明**:

basicInfo:
- `name`: 患者姓名
- `gender`: 性别
- `age`: 年龄
- `height`: 身高（cm）
- `phone`: 联系电话（已脱敏）
- `idCard`: 身份证号（已脱敏）
- `address`: 居住地址

medicalHistory:
- `pastHistory`: 既往病史列表
- `allergyHistory`: 过敏史列表
- `familyHistory`: 家族病史列表

consultationRecords（就诊记录列表）:
- `id`: 就诊记录ID
- `outpatientNo`: 门诊号
- `visitDate`: 就诊时间
- `department`: 科室
- `doctorName`: 医生
- `chiefComplaint`: 主诉
- `presentIllness`: 现病史
- `auxiliaryExam`: 辅助检查
- `diagnosis`: 诊断
- `prescription`: 处方
- `status`: 状态（completed/ongoing/cancelled）

---

## 2. 获取就诊记录详情 ✅

- **接口**: `GET /common/visit-record/{visitId}`
- **说明**: 获取指定就诊记录的完整信息（医生端和患者端通用）
- **状态**: ✅ 后端已实现，可直接使用

**响应示例**:
```json
{
  "code": 0,
  "message": {
    "basicInfo": {
      "patientName": "张三",
      "gender": "男",
      "age": 35,
      "outpatientNo": "061651734",
      "visitDate": "2025-07-05 09:04",
      "department": "全科医学科(综合内科)门诊",
      "doctorName": "姜岚"
    },
    "recordData": {
      "chiefComplaint": "胆红素代谢紊乱史",
      "presentIllness": "胆红素代谢紊乱史，来诊复查化验",
      "auxiliaryExam": "2025-04-25 13:07，常规生化...",
      "diagnosis": "胆红素代谢紊乱",
      "prescription": "1.全血细胞计数+5分类\n2.凝血分析\n3.生化23"
    }
  }
}
```

---

## 3. 生成病历单PDF ✅

- **接口**: `POST /common/medical-record/{visitId}/pdf`
- **说明**: 生成病历单PDF并返回下载链接
- **状态**: ✅ 后端已实现，可直接使用

**响应示例**:
```json
{
  "code": 0,
  "message": {
    "url": "https://example.com/medical-records/pdf/12345.pdf",
    "fileName": "病历单_张三_2025-07-05.pdf",
    "expireTime": "2025-07-06T09:04:00Z"
  }
}
```

**字段说明**:
- `url`: PDF下载地址
- `fileName`: 建议的文件名
- `expireTime`: 链接过期时间

---

## 4. 下载病历单PDF ✅

- **接口**: `GET /common/medical-record/{visitId}/download`
- **说明**: 直接下载PDF文件流
- **状态**: ✅ 后端已实现，可直接使用

**响应**: PDF文件流（Content-Type: application/pdf）

---

## 前端使用

### Mock开关

在 `src/api/health.js` 中控制：

```javascript
const USE_MOCK = true  // true: Mock数据, false: 真实接口
```

### 调用示例

```javascript
import { getMyHealthRecord, getMedicalRecordDetail, downloadMedicalRecordPDF } from '@/api/health'

// 1. 获取完整健康档案（包含就诊记录列表）
const healthData = await getMyHealthRecord()
// 返回: { patientId, basicInfo, medicalHistory, consultationRecords }

// 2. 查看某条就诊记录的详情
const detail = await getMedicalRecordDetail(visitId)

// 3. 下载PDF（复制链接到剪贴板）
const pdfUrl = await downloadMedicalRecordPDF(visitId)
uni.setClipboardData({ data: pdfUrl })
```

---

## 接口状态说明

### ✅ 已实现（可直接使用）

以下接口后端已完成，前端可直接调用：

1. **GET `/common/visit-record/{visitId}`** - 就诊记录详情
2. **POST `/common/medical-record/{visitId}/pdf`** - 生成PDF
3. **GET `/common/medical-record/{visitId}/download`** - 下载PDF

### ⚠️ 待实现

**GET `/patient/health-record`** - 获取我的健康档案（完整数据）

此接口需要后端实现，参考医生端的 `GET /patient/{patientId}` 接口，返回相同数据结构，区别是：
- 医生端：通过路径参数 `patientId` 查询指定患者
- 患者端：通过 token 自动识别当前登录患者

前端暂时使用Mock数据。

---

## 更新记录

| 版本 | 日期 | 修改内容 |
|------|------|----------|
| v1.0 | 2025-12-01 | 初始版本 |
| v1.1 | 2025-12-01 | 简化文档，标注接口实现状态 |
