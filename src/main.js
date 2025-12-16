import {
	createSSRApp
} from "vue";
import App from "./App.vue";

// 导入 Pinia 状态管理
import pinia from './stores'

// 导入 uni-icons 组件
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

// 导入通用组件
import EmptyState from './components/EmptyState.vue'
import AppointmentCard from './components/AppointmentCard.vue'
import AiBot from './components/ai-bot/ai-bot.vue'

export function createApp() {
	const app = createSSRApp(App);
	
	// 使用 Pinia
	app.use(pinia)
	
	// 全局注册组件
	app.component('uni-icons', uniIcons)
	app.component('EmptyState', EmptyState)
	app.component('AppointmentCard', AppointmentCard)
	app.component('ai-bot', AiBot)
	
	return {
		app,
	};
}
