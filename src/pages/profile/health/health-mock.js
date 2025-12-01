/**
 * 健康档案 Mock 数据
 * 仅用于开发测试，不包含业务逻辑
 */

export const mockHealthData = {
  patientId: '123456',
  basicInfo: {
    name: '张三',
    gender: '男',
    age: 35,
    height: 175,
    weight: 70,
    phone: '138****5678',
    idCard: '110101********1234',
    address: '北京市海淀区学院路37号北京交通大学',
    bloodType: 'A型',
    maritalStatus: '已婚'
  },
  medicalHistory: {
    pastHistory: [
      '2020年患急性阑尾炎，已手术治疗',
      '2018年患轻度高血压，正在药物控制中'
    ],
    allergyHistory: [
      '青霉素过敏',
      '海鲜过敏（虾、蟹）'
    ],
    familyHistory: [
      '父亲患有高血压',
      '母亲患有糖尿病'
    ]
  },
  consultationRecords: [
    {
      id: '1',
      outpatientNo: '061651734',
      visitDate: '2025-07-05 09:04',
      department: '全科医学科(综合内科)门诊',
      doctorName: '姜岚',
      chiefComplaint: '胆红素代谢紊乱史',
      presentIllness: '胆红素代谢紊乱史，来诊复查化验',
      auxiliaryExam: '2025-04-25 13:07，常规生化，肝功4白蛋白/球蛋白 2.56；*直接胆红素 8.7*umol/L；',
      diagnosis: '胆红素代谢紊乱',
      prescription: '1.全血细胞计数+5分类\n2.凝血分析\n3.生化23\n4.乙肝2\n5.艾滋病联合试验(HIVcombin)\n6.甲羟戊红T不加快血凝试验(TRUST)\n7.胸部正位\n8.十二道普通心电图检查\n9.静脉采血 1次',
      status: 'completed'
    },
    {
      id: '2',
      outpatientNo: '061651735',
      visitDate: '2025-06-15 14:30',
      department: '心血管内科门诊',
      doctorName: '李医生',
      chiefComplaint: '胸闷、气短3天',
      presentIllness: '患者3天前无明显诱因出现胸闷、气短，活动后加重，休息后缓解。伴有心悸，无胸痛，无发热，无咳嗽咳痰。既往有高血压病史5年，血压控制尚可。',
      auxiliaryExam: '心电图：窦性心律，ST段轻度压低\n心脏彩超：左室舒张功能减低',
      diagnosis: '1.冠状动脉粥样硬化性心脏病\n2.高血压病2级（极高危）',
      prescription: '1.阿司匹林肠溶片 100mg po qd\n2.阿托伐他汀钙片 20mg po qn\n3.美托洛尔缓释片 47.5mg po qd\n4.氯沙坦钾片 50mg po qd',
      status: 'completed'
    },
    {
      id: '3',
      outpatientNo: '061651736',
      visitDate: '2025-05-10 10:15',
      department: '呼吸内科门诊',
      doctorName: '王医生',
      chiefComplaint: '咳嗽、咳痰1周',
      presentIllness: '患者1周前受凉后出现咳嗽、咳痰，痰白色、量中等，易咳出。伴有咽痛，无发热，无胸痛，无呼吸困难。',
      auxiliaryExam: '胸部X线：双肺纹理增粗，未见明显实变影\n血常规：白细胞 8.2×10^9/L，中性粒细胞 62%',
      diagnosis: '急性支气管炎',
      prescription: '1.头孢克肟胶囊 0.1g po bid × 5天\n2.氨溴索口服液 30ml po tid × 5天\n3.复方甘草片 3片 po tid × 5天',
      status: 'completed'
    },
    {
      id: '4',
      outpatientNo: '061651737',
      visitDate: '2025-04-20 15:45',
      department: '消化内科门诊',
      doctorName: '赵医生',
      chiefComplaint: '上腹痛2天',
      presentIllness: '患者2天前进食辛辣食物后出现上腹痛，呈持续性隐痛，无放射痛。伴有反酸、嗳气，无恶心呕吐。既往有慢性胃炎病史。',
      auxiliaryExam: '胃镜：慢性浅表性胃炎，HP(+)',
      diagnosis: '1.慢性浅表性胃炎\n2.幽门螺杆菌感染',
      prescription: '1.奥美拉唑肠溶胶囊 20mg po bid\n2.阿莫西林胶囊 1g po bid\n3.克拉霉素片 0.5g po bid\n4.枸橼酸铋钾颗粒 220mg po bid\n疗程：14天',
      status: 'completed'
    },
    {
      id: '5',
      outpatientNo: '061651738',
      visitDate: '2025-03-08 09:20',
      department: '内分泌科门诊',
      doctorName: '孙医生',
      chiefComplaint: '口渴、多饮、多尿1月',
      presentIllness: '患者1月前无明显诱因出现口渴、多饮、多尿症状，每日饮水约3000ml，夜尿4-5次。伴有乏力，体重下降约5kg。',
      auxiliaryExam: '空腹血糖：11.2 mmol/L\n糖化血红蛋白：8.5%\n尿常规：尿糖(+++)',
      diagnosis: '2型糖尿病',
      prescription: '1.二甲双胍缓释片 0.5g po bid\n2.阿卡波糖片 50mg po tid（餐前即服）\n建议：定期监测血糖，控制饮食，适量运动',
      status: 'completed'
    }
  ]
}

/**
 * 计算年龄（工具函数）
 * @param {String} birthDate - 出生日期 YYYY-MM-DD
 * @returns {Number} 年龄
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null
  
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}
