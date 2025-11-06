/**
 * 请求Hook - 统一处理loading、错误等状态
 */
import { ref } from 'vue'

/**
 * 通用请求Hook
 * @param {Function} requestFn - 请求函数
 * @param {Object} options - 配置选项
 * @returns {Object} { loading, error, data, execute, reset }
 */
export function useRequest(requestFn, options = {}) {
  const {
    immediate = false,           // 是否立即执行
    onSuccess = null,            // 成功回调
    onError = null,              // 错误回调
    successMessage = null,       // 成功提示
    errorMessage = '请求失败',    // 错误提示
    showLoading = false,         // 是否显示loading
    loadingText = '加载中...'    // loading文本
  } = options

  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  /**
   * 执行请求
   */
  const execute = async (...args) => {
    loading.value = true
    error.value = null

    // 显示loading
    if (showLoading) {
      uni.showLoading({
        title: loadingText,
        mask: true
      })
    }

    try {
      const result = await requestFn(...args)
      data.value = result

      // 成功回调
      if (onSuccess) {
        onSuccess(result)
      }

      // 成功提示
      if (successMessage) {
        uni.showToast({
          title: successMessage,
          icon: 'success'
        })
      }

      return result
    } catch (err) {
      error.value = err

      // 错误回调
      if (onError) {
        onError(err)
      } else {
        // 默认错误处理
        uni.showToast({
          title: err.message || errorMessage,
          icon: 'none'
        })
      }

      throw err
    } finally {
      loading.value = false
      if (showLoading) {
        uni.hideLoading()
      }
    }
  }

  /**
   * 重置状态
   */
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  // 立即执行
  if (immediate) {
    execute()
  }

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}

/**
 * 列表请求Hook - 支持分页、刷新、加载更多
 * @param {Function} requestFn - 请求函数
 * @param {Object} options - 配置选项
 */
export function useListRequest(requestFn, options = {}) {
  const {
    immediate = true,
    pageSize = 10,
    onSuccess = null,
    onError = null
  } = options

  const loading = ref(false)
  const refreshing = ref(false)
  const loadingMore = ref(false)
  const finished = ref(false)
  const error = ref(null)
  const list = ref([])
  const page = ref(1)
  const total = ref(0)

  /**
   * 加载数据
   */
  const loadData = async (isRefresh = false, isLoadMore = false) => {
    if (loading.value) return
    if (isLoadMore && finished.value) return

    try {
      loading.value = true
      if (isRefresh) refreshing.value = true
      if (isLoadMore) loadingMore.value = true

      const currentPage = isRefresh ? 1 : page.value
      const result = await requestFn({
        page: currentPage,
        pageSize
      })

      const newList = result.data || result.list || []
      const newTotal = result.total || 0

      // 更新列表
      if (isRefresh) {
        list.value = newList
        page.value = 1
      } else {
        list.value = [...list.value, ...newList]
      }

      total.value = newTotal
      page.value = currentPage + 1

      // 判断是否加载完成
      finished.value = list.value.length >= newTotal || newList.length < pageSize

      if (onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      error.value = err
      if (onError) {
        onError(err)
      } else {
        uni.showToast({
          title: err.message || '加载失败',
          icon: 'none'
        })
      }
    } finally {
      loading.value = false
      refreshing.value = false
      loadingMore.value = false
    }
  }

  /**
   * 刷新
   */
  const refresh = () => {
    finished.value = false
    return loadData(true, false)
  }

  /**
   * 加载更多
   */
  const loadMore = () => {
    return loadData(false, true)
  }

  // 立即加载
  if (immediate) {
    loadData()
  }

  return {
    loading,
    refreshing,
    loadingMore,
    finished,
    error,
    list,
    page,
    total,
    refresh,
    loadMore
  }
}

