<template>
  <view class="container">
    <!-- 导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @tap="goBack">
        <text class="back-icon">‹</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">{{ navTitle }}</text>
      <view class="nav-right"></view>
    </view>

    <!-- 院区选择 -->
    <view v-if="step === 'hospital'" class="page-content">
      <view class="page-header">
        <text class="title">选择院区</text>
        <text class="subtitle">请选择就诊院区，或直接搜索医生</text>
      </view>
      
      <view class="search-box">
        <input 
          placeholder="请输入医生姓名关键字"
          v-model="hospitalKeyword"
          class="search-input"
          @confirm="handleGlobalSearch"
        />
        <view class="search-btn" @tap="handleGlobalSearch">搜索</view>
      </view>
      
      <view class="list-header">
        <text class="section-title">医院列表</text>
      </view>
      
      <view class="hospital-list">
        <view 
          class="hospital-card" 
          v-for="hospital in filteredHospitals" 
          :key="hospital.area_id"
          @tap="selectHospital(hospital)"
        >
          <view class="card-header">
            <text class="hospital-name">{{ hospital.name }}</text>
            <view class="level-tag">{{ hospital.level }}</view>
          </view>
          <view class="hospital-details">
            <text class="detail-item">类型：{{ hospital.type }}</text>
            <text class="detail-item">地址：{{ hospital.destination }}</text>
          </view>
        </view>
      </view>
      
      <view v-if="filteredHospitals.length === 0" class="empty-state">
        <text class="empty-title">未找到相关医院</text>
      </view>
    </view>

    <!-- 科室选择 -->
    <view v-if="step === 'department'" class="page-content">
      <view class="page-header">
        <text class="title">选择科室</text>
        <text class="subtitle">内号源，每日早7点开始可挂第8日号源</text>
      </view>
      
      <view class="search-box">
        <input 
          placeholder="请输入科室名" 
          v-model="deptKeyword" 
          class="search-input"
          @confirm="handleDeptSearch"
        />
        <view class="search-btn" @tap="handleDeptSearch">搜索</view>
      </view>
      
      <view class="current-hospital" @tap="viewHospitalIntro">
        <text class="hospital-name">{{ selectedHospital?.name }}</text>
        <view class="hospital-info">
          <text class="hospital-level">{{ selectedHospital?.level }}</text>
          <text class="intro-link">查看简介</text>
        </view>
      </view>
      
      <view v-if="deptKeyword.trim()" class="department-section">
        <view class="list-header">
          <text class="section-title">搜索结果</text>
          <text class="count-text">{{ filteredDepartments.length }}个科室</text>
        </view>
        
        <view class="department-list">
          <view 
            class="dept-card" 
            v-for="dept in filteredDepartments" 
            :key="dept.minor_dept_id"
            @tap="selectDepartment(dept)"
          >
            <view class="dept-info">
              <text class="dept-name">{{ dept.name }}</text>
              <text class="dept-description" v-if="dept.description">{{ dept.description }}</text>
            </view>
            <text class="arrow-icon">›</text>
          </view>
        </view>
        
        <view v-if="filteredDepartments.length === 0" class="empty-state">
          <text class="empty-title">未找到相关科室</text>
        </view>
      </view>
      
      <view v-else>
        <view class="categories">
          <view 
            class="category-card" 
            v-for="category in departmentCategories" 
            :key="category.major_dept_id"
            :class="{ active: selectedCategory === category.major_dept_id }"
            @tap="selectCategory(category.major_dept_id)"
          >
            <text class="category-name">{{ category.name }}</text>
          </view>
        </view>
        
        <view v-if="selectedCategory" class="department-section">
          <view class="list-header">
            <text class="section-title">科室列表</text>
            <text class="count-text">{{ categoryDepartments.length }}个科室</text>
          </view>
          
          <view class="department-list">
            <view 
              class="dept-card" 
              v-for="dept in categoryDepartments" 
              :key="dept.minor_dept_id"
              @tap="selectDepartment(dept)"
            >
              <view class="dept-info">
                <text class="dept-name">{{ dept.name }}</text>
                <text class="dept-description" v-if="dept.description">{{ dept.description }}</text>
              </view>
              <text class="arrow-icon">›</text>
            </view>
          </view>
          
          <view v-if="categoryDepartments.length === 0" class="empty-state">
            <text class="empty-title">当前分类暂无科室</text>
          </view>
        </view>
        
        <view v-if="!selectedCategory" class="selection-prompt">
          <text class="prompt-title">请选择科室分类</text>
        </view>
      </view>
    </view>

    <!-- 医生列表 -->
    <view v-if="step === 'doctors' && !showDoctorDetail" class="page-content">
      <view class="path-nav">
        <text class="path-item" @tap="goToHospital">{{ selectedHospital?.name || '全部医院' }}</text>
        <text class="separator">/</text>
        <text class="path-item current" @tap="goToDepartment">{{ selectedDepartment?.name || '全部科室' }}</text>
        <text v-if="isGlobalSearch" class="search-tag">搜索结果</text>
      </view>
      
      <view class="dept-info-card" v-if="selectedDepartment && !isGlobalSearch">
        <view class="dept-info-header">
          <text class="dept-name">{{ selectedDepartment.name }}</text>
        </view>
        <view class="dept-info-content" v-if="selectedDepartment.description">
          <text class="info-text">{{ selectedDepartment.description }}</text>
        </view>
      </view>
      
      <view v-if="isGlobalSearch" class="global-search-info">
        <text class="search-keyword">搜索关键词：{{ globalSearchKeyword }}</text>
        <text class="search-result">找到 {{ filteredDoctors.length }} 个相关医生</text>
      </view>
      
      <view class="search-box">
        <input 
          placeholder="搜索医生姓名或专长..."
          v-model="searchKeyword" 
          class="search-input"
          @confirm="searchDoctors"
        />
        <view class="search-btn" @tap="searchDoctors">搜索</view>
      </view>

      <!-- 筛选区域 -->
      <view class="filter-section">
        <view class="filter-group">
          <text class="filter-label">职称筛选：</text>
         <view class="filter-tags">
          <view 
            class="filter-tag" 
            :class="{ active: filterTitle === 'all' }" 
            @tap="filterTitle = 'all'"
          >
            全部
          </view>
          <view 
            class="filter-tag" 
            :class="{ active: filterTitle === '主任医师' }" 
            @tap="filterTitle = '主任医师'"
          >
            主任医师
          </view>
          <view 
            class="filter-tag" 
            :class="{ active: filterTitle === '副主任医师' }" 
            @tap="filterTitle = '副主任医师'"
          >
            副主任医师
          </view>
          <view 
            class="filter-tag" 
            :class="{ active: filterTitle === '其他职称' }" 
            @tap="filterTitle = '其他职称'"
          >
            其他职称
          </view>
        </view>
        </view>

        <view v-if="isGlobalSearch && availableDepartments.length > 0" class="filter-group">
          <text class="filter-label">科室筛选：</text>
          <view class="filter-tags">
            <view class="filter-tag" :class="{ active: filterDepartment === 'all' }" @tap="filterDepartment = 'all'">全部科室</view>
            <view 
              class="filter-tag" 
              v-for="dept in availableDepartments" 
              :key="dept.minor_dept_id"
              :class="{ active: filterDepartment === dept.minor_dept_id.toString() }"
              @tap="filterDepartment = dept.minor_dept_id.toString()"
            >
              {{ dept.name }}
            </view>
          </view>
        </view>

        <view v-if="hasActiveFilters" class="filter-actions">
          <text class="filter-count">已选：{{ activeFilterCount }}个条件</text>
          <button class="clear-btn" @tap="clearFilters">重置筛选</button>
        </view>
      </view>

      <!-- 医生列表 -->
      <view class="doctors-section">
        <view class="doctors-header">
          <text class="section-title">{{ isGlobalSearch ? '搜索结果' : '医生列表' }}</text>
          <text class="count-text">{{ filteredDoctors.length }}位医生</text>
        </view>
        
        <view class="doctors-list">
          <view class="doctor-card" v-for="doctor in filteredDoctors" :key="doctor.doctor_id">
            <view class="doctor-header">
              <image 
                v-if="doctor.avatar"
                :src="doctor.avatar" 
                class="avatar"
                mode="aspectFill"
              />
              <view v-else class="avatar placeholder">
                {{ doctor.name.charAt(0) }}
              </view>
              <view class="doctor-info">
                <view class="name-row">
                  <text class="doctor-name">{{ doctor.name }}</text>
                  <view class="title-tag">{{ doctor.title }}</view>
                </view>
                <text class="doctor-dept">{{ doctor.department_name }}</text>
              </view>
            </view>
            
            <view class="doctor-specialty">
              <text class="specialty-text">{{ doctor.specialty }}</text>
            </view>
            <view class="doctor-footer">
              <view class="view-detail" @tap="viewDoctorDetail(doctor)">查看详情</view>
            </view>
          </view>
          
          <view v-if="filteredDoctors.length === 0" class="empty-state">
            <text class="empty-title">未找到相关医生</text>
            <view class="action-buttons">
              <button class="action-btn" @tap="clearFilters">清除筛选</button>
              <button class="action-btn primary" @tap="!isGlobalSearch ? goToDepartment() : goToHospital()">
                {{ !isGlobalSearch ? '返回科室' : '返回院区' }}
              </button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 医生详情页 -->
    <view v-if="showDoctorDetail && selectedDoctor" class="page-content">
      <view class="doctor-detail-container">
        <view class="doctor-basic">
          <view class="avatar-section">
            <image 
              v-if="selectedDoctor.avatar"
              :src="selectedDoctor.avatar" 
              class="doctor-avatar"
              mode="aspectFill"
            />
            <view v-else class="doctor-avatar placeholder">
              {{ selectedDoctor.name.charAt(0) }}
            </view>
          </view>
          
          <view class="info-section">
            <view class="name-row">
              <text class="doctor-name">{{ selectedDoctor.name }}</text>
              <view class="title-badge">{{ selectedDoctor.title }}</view>
            </view>
            <text class="hospital-info">{{ selectedDoctor.department_name }}</text>
          </view>
        </view>

        <view class="info-card">
          <view class="info-header">
            <text class="info-title">专业信息</text>
          </view>
          <view class="info-content">
            <view class="info-item">
              <text class="item-label">专业特长</text>
              <text class="item-value">{{ selectedDoctor.specialty }}</text>
            </view>
          </view>
        </view>

        <view class="info-card">
          <view class="info-header">
            <text class="info-title">详细介绍</text>
          </view>
          <view class="info-content">
            <text class="intro-text">{{ selectedDoctor.introduction }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { useDoctorsStore } from '@/api/doctors.js'

const store = useDoctorsStore()

const {
  step,
  searchKeyword,
  deptKeyword,
  hospitalKeyword,
  filterTitle,
  filterDepartment,
  selectedCategory,
  selectedHospital,
  selectedDepartment,
  isGlobalSearch,
  globalSearchKeyword,
  selectedDoctor,
  showDoctorDetail,
  hospitals,
  departmentCategories,
  departments,
  doctors,
  navTitle,
  filteredHospitals,
  filteredDepartments,
  categoryDepartments,
  availableDepartments,
  activeFilterCount,
  hasActiveFilters,
  filteredDoctors,
  init,
  goBack,
  goToHospital,
  goToDepartment,
  selectHospital,
  handleDeptSearch,
  handleGlobalSearch,
  searchDoctors,
  viewHospitalIntro,
  selectCategory,
  selectDepartment,
  clearFilters,
  viewDoctorDetail
} = store

onLoad(async () => {
  await init()
})
</script>

<style lang="scss" scoped>
.container {
  background: #f8fafc;
  min-height: 100vh;
  padding-top: 88rpx;
}

.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #e2e8f0;
  z-index: 1000;
  
  .nav-back {
    display: flex;
    align-items: center;
    padding: 16rpx;
    .back-icon {
      font-size: 36rpx;
      color: #0f172a;
      margin-right: 8rpx;
    }
    .back-text {
      font-size: 28rpx;
      color: #0f172a;
    }
  }
  
  .nav-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #0f172a;
  }
  
  .nav-right {
    width: 100rpx;
  }
}

.page-content {
  padding: 0 24rpx 40rpx;
}

.page-header {
  padding: 24rpx 0;
  .title {
    font-size: 36rpx;
    font-weight: 700;
    color: #0f172a;
    display: block;
    margin-bottom: 8rpx;
  }
  .subtitle {
    font-size: 24rpx;
    color: #64748b;
    line-height: 1.4;
  }
}

.search-box {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  border: 1rpx solid #e2e8f0;
  margin-bottom: 24rpx;
  
  .search-input {
    flex: 1;
    font-size: 28rpx;
    color: #0f172a;
    height: 40rpx;
    border: none;
    outline: none;
    
    &::placeholder {
      color: #94a3b8;
    }
  }
  
  .search-btn {
    margin-left: 16rpx;
    background: #00BFCC;
    color: white;
    padding: 12rpx 24rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    font-weight: 500;
  }
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24rpx 0 16rpx;
  
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #0f172a;
  }
  
  .count-text {
    font-size: 24rpx;
    color: #64748b;
  }
}

.hospital-list {
  .hospital-card {
    background: white;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;
    border: 1rpx solid #e2e8f0;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .hospital-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #0f172a;
      }
      
      .level-tag {
        padding: 6rpx 16rpx;
        background: #00BFCC;
        color: white;
        border-radius: 6rpx;
        font-size: 22rpx;
      }
    }
    
    .hospital-details {
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .detail-item {
        font-size: 24rpx;
        color: #64748b;
      }
    }
  }
}

.categories {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.category-card {
  background: white;
  border-radius: 12rpx;
  padding: 36rpx 24rpx;
  text-align: center;
  border: 2rpx solid #e2e8f0;
  
  &.active {
    border-color: #00BFCC;
    background: #00BFCC;
    .category-name { color: white; }
  }
  
  .category-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #0f172a;
  }
}

.department-list {
  background: white;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #e2e8f0;
  
  .dept-card {
    padding: 28rpx 24rpx;
    border-bottom: 1rpx solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .dept-info {
      flex: 1;
      .dept-name {
        font-size: 28rpx;
        color: #0f172a;
        font-weight: 500;
        display: block;
        margin-bottom: 8rpx;
      }
      .dept-description {
        font-size: 24rpx;
        color: #64748b;
        line-height: 1.4;
      }
    }
    
    .arrow-icon {
      font-size: 36rpx;
      color: #94a3b8;
    }
  }
}

.current-hospital {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  
  .hospital-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #0f172a;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .hospital-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .hospital-level {
      font-size: 24rpx;
      color: #00BFCC;
      background: #f0f9ff;
      padding: 4rpx 12rpx;
      border-radius: 6rpx;
    }
    
    .intro-link {
      font-size: 24rpx;
      color: #00BFCC;
    }
  }
}

.path-nav {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
  
  .path-item {
    font-size: 26rpx;
    color: #00BFCC;
    font-weight: 500;
    padding: 4rpx 0;
    &.current { color: #0f172a; }
  }
  
  .separator {
    margin: 0 12rpx;
    color: #cbd5e1;
  }
  
  .search-tag {
    margin-left: 16rpx;
    padding: 4rpx 12rpx;
    background: #f0f9ff;
    color: #00BFCC;
    border-radius: 6rpx;
    font-size: 22rpx;
  }
}

.dept-info-card, .global-search-info {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  
  .dept-name, .search-keyword {
    font-size: 28rpx;
    font-weight: 600;
    color: #0f172a;
    display: block;
    margin-bottom: 8rpx;
  }
  
  .info-text, .search-result {
    font-size: 24rpx;
    color: #0f172a;
    line-height: 1.4;
  }
}

.filter-section {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  
  .filter-group {
    margin-bottom: 24rpx;
    .filter-label {
      font-size: 26rpx;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16rpx;
      display: block;
    }
  }
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  
  .filter-tag {
    padding: 16rpx 28rpx;
    background: #f8fafc;
    border: 1rpx solid #e2e8f0;
    border-radius: 8rpx;
    font-size: 26rpx;
    color: #64748b;
    font-weight: 500;
    
    &.active {
      background: #00BFCC;
      color: white;
      border-color: #00BFCC;
    }
  }
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f1f5f9;
  
  .filter-count {
    font-size: 24rpx;
    color: #64748b;
  }
  
  .clear-btn {
    background: #f8fafc;
    border: 1rpx solid #e2e8f0;
    border-radius: 8rpx;
    padding: 12rpx 24rpx;
    font-size: 24rpx;
    color: #64748b;
  }
}

.doctor-card {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #e2e8f0;
  
  .doctor-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      
      &.placeholder {
        background: #00BFCC;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 32rpx;
        font-weight: 600;
      }
    }
    
    .doctor-info {
      flex: 1;
      
      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 8rpx;
        
        .doctor-name {
          font-size: 28rpx;
          font-weight: 700;
          color: #0f172a;
          margin-right: 16rpx;
        }
        
        .title-tag {
          padding: 6rpx 16rpx;
          background: #00BFCC;
          color: white;
          border-radius: 6rpx;
          font-size: 22rpx;
          font-weight: 500;
        }
      }
      
      .doctor-dept {
        font-size: 24rpx;
        color: #00BFCC;
        font-weight: 500;
        display: block;
        margin-bottom: 4rpx;
      }
    }
  }
  
  .doctor-specialty {
    margin-bottom: 16rpx;
    
    .specialty-text {
      font-size: 24rpx;
      color: #374151;
      line-height: 1.4;
    }
  }
  
  .doctor-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #f1f5f9;
    
    .view-detail {
      padding: 12rpx 24rpx;
      background: #00BFCC;
      color: white;
      border-radius: 8rpx;
      font-size: 24rpx;
      font-weight: 500;
    }
  }
}

.empty-state, .selection-prompt {
  text-align: center;
  padding: 80rpx 40rpx;
  background: white;
  border-radius: 12rpx;
  border: 1rpx solid #e2e8f0;
  margin-top: 24rpx;
  
  .empty-title, .prompt-title {
    font-size: 28rpx;
    color: #0f172a;
    display: block;
    margin-bottom: 16rpx;
    font-weight: 600;
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 20rpx;
    
    .action-btn {
      padding: 16rpx 32rpx;
      background: #f8fafc;
      border: 1rpx solid #e2e8f0;
      border-radius: 8rpx;
      font-size: 24rpx;
      color: #64748b;
      font-weight: 500;
      
      &.primary {
        background: #00BFCC;
        color: white;
        border: none;
      }
    }
  }
}

.doctor-detail-container {
  .doctor-basic {
    background: white;
    border-radius: 12rpx;
    padding: 32rpx 24rpx;
    margin-bottom: 24rpx;
    border: 1rpx solid #e2e8f0;
    display: flex;
    align-items: center;
    
    .avatar-section {
      margin-right: 32rpx;
      
      .doctor-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        
        &.placeholder {
          background: #00BFCC;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 48rpx;
          font-weight: 600;
        }
      }
    }
    
    .info-section {
      flex: 1;
      
      .name-row {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;
        
        .doctor-name {
          font-size: 32rpx;
          font-weight: 700;
          color: #0f172a;
          margin-right: 16rpx;
        }
        
        .title-badge {
          padding: 6rpx 16rpx;
          background: #00BFCC;
          color: white;
          border-radius: 6rpx;
          font-size: 22rpx;
          font-weight: 500;
        }
      }
      
      .hospital-info {
        font-size: 24rpx;
        color: #64748b;
        display: block;
      }
    }
  }

  .info-card {
    background: white;
    border-radius: 12rpx;
    margin-bottom: 24rpx;
    border: 1rpx solid #e2e8f0;
    overflow: hidden;
    
    .info-header {
      padding: 24rpx;
      border-bottom: 1rpx solid #f1f5f9;
      
      .info-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #0f172a;
      }
    }
    
    .info-content {
      padding: 24rpx;
      
      .info-item {
        margin-bottom: 20rpx;
        
        .item-label {
          font-size: 24rpx;
          color: #64748b;
          font-weight: 500;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .item-value {
          font-size: 26rpx;
          color: #0f172a;
          line-height: 1.4;
        }
      }
      
      .intro-text {
        font-size: 24rpx;
        color: #374151;
        line-height: 1.6;
      }
    }
  }
}
</style>