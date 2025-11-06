# 北京交通大学校医院预约系统 - 患者端

## 项目结构

```
src/
├── api/                    # API 接口管理
│   ├── request.js         # 统一请求封装
│   ├── auth.js            # 认证接口
│   ├── appointment.js     # 预约接口
│   ├── user.js            # 用户接口
│   ├── message.js         # 消息接口
│   └── index.js           # 统一导出
│
├── stores/                 # Pinia 状态管理
│   ├── index.js           # store 入口
│   ├── user.js            # 用户状态
│   └── appointment.js     # 预约状态
│
├── utils/                  # 工具函数
│   ├── validate.js        # 表单验证
│   ├── format.js          # 格式化工具
│   ├── auth.js            # 认证工具
│   └── index.js           # 统一导出
│
├── components/             # 公共组件
│   └── EmptyState.vue     # 空状态组件
│
├── config/                 # 配置文件
│   └── index.js           # 全局配置
│
├── constants/              # 常量定义
│   └── index.js           # 业务常量
│
├── pages/                  # 页面
│   ├── auth/              # 认证模块
│   ├── home/              # 首页和预约
│   ├── profile/           # 个人中心
│   ├── message/           # 消息中心
│   └── features/          # 功能页面
│
├── static/                 # 静态资源
├── App.vue                 # 应用入口
├── main.js                 # 主入口文件
├── pages.json              # 页面配置
└── uni.scss                # 全局样式
```

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
# 微信小程序
npm run dev:mp-weixin

# H5
npm run dev:h5
```

## 构建发布

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5
```

## 技术栈

- Vue 3
- uni-app
- Pinia (状态管理)
- uni-ui (组件库)
- SCSS (样式预处理)

## 开发规范

### API 调用

```javascript
// 使用封装好的 API
import { login } from '@/api/auth'

const handleLogin = async () => {
  const data = await login({ username, password })
}
```

### 状态管理

```javascript
// 使用 Pinia store
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
userStore.login(data)
```

### 工具函数

```javascript
// 使用工具函数
import { isValidPhone, formatDate } from '@/utils'

if (isValidPhone(phone)) {
  // ...
}
```

## 注意事项

1. 所有 API 请求统一使用 `src/api/request.js` 封装的方法
2. 登录状态使用 Pinia 管理，避免直接操作 localStorage
3. 表单验证使用 `src/utils/validate.js` 中的验证函数
4. 日期格式化使用 `src/utils/format.js` 中的工具函数
