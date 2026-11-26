<template>
  <div class="about-page">
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">
          <span class="title-prefix">//</span> {{ t('about.title') }}
        </h1>
        <p class="page-desc">{{ t('about.desc') }}</p>
      </div>
    </section>

    <section class="about-content">
      <div class="container">
        <div class="about-grid">
          <div class="profile-card">
            <div class="avatar-wrapper">
              <div class="avatar">
                <img :src="avatarImg" alt="七岁" class="avatar-img" />
              </div>
              <div class="status-dot online"></div>
            </div>
            <h2 class="name">{{ t('about.titleHighlight', '七岁') }}</h2>
            <p class="role">{{ t('about.role') }}</p>
            <p class="location">{{ t('about.location') }}</p>
            <div class="social-links">
              <a href="https://github.com/xiaoxinL1" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              <WeChatPopover qr-code-url="/images/wechat-qrcode.jpg">
                <a href="#" class="social-link wechat-trigger" aria-label="WeChat">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.49.49 0 0 1 .176-.553C23.638 18.135 24 16.466 24 14.756c0-3.37-3.15-6.165-7.062-6.898zm-2.746 2.44c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                </a>
              </WeChatPopover>

              <a href="mailto:mlluxiaoxin@163.com" class="social-link" aria-label="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </a>
            </div>
          </div>

          <div class="info-sections">
            <div class="info-card">
              <h3 class="card-title">
                <span class="icon">$</span> {{ t('about.intro') }}
              </h3>
              <div class="card-body">
                <p>{{ t('about.introP1') }}</p>
                <p style="margin-top: 1rem;">{{ t('about.introP2') }}</p>
              </div>
            </div>

            <div class="info-card">
              <h3 class="card-title">
                <span class="icon">&gt;</span> {{ t('about.skills') }}
              </h3>
              <div class="skills-grid">
                <div class="skill-group">
                  <h4>{{ t('about.frontend') }}</h4>
                  <div class="skill-tags">
                    <span v-for="s in ['Vue', 'Uniapp','TypeScript', 'TailwindCSS', 'Element Plus', 'Ant Design Vue', 'Echarts']"
                      :key="s">{{ s }}</span>
                  </div>
                </div>
                <div class="skill-group" >
                  <h4>{{ t('about.backend') }}</h4>
                  <div class="skill-tags">
                    <span v-for="s in ['Node.js', 'SQL', 'Nginx']" :key="s">{{ s }}</span>
                  </div>
                </div>
               
                <div class="skill-group full-width">
                  <h4>{{ t('about.tools') }}</h4>
                  <div class="skill-tags">
                    <span v-for="s in ['Git','MCP Server', 'Agent Skills', 'Vim', 'VS Code', 'Figma', 'Linux']" :key="s">{{ s }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-card">
              <h3 class="card-title">
                <span class="icon">#</span> {{ t('about.experience') }}
              </h3>
              <div class="timeline">
                <div class="timeline-item" v-for="(exp, i) in experiences" :key="i">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <h4>{{ exp.role }}</h4>
                      <span class="timeline-date">{{ exp.period }}</span>
                    </div>
                    <p class="timeline-company">{{ exp.company }}</p>
                    <p class="timeline-desc">{{ exp.desc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import avatarImg from '../images/avatar.webp'
import WeChatPopover from '../components/WeChatPopover.vue'

const { t } = useI18n()

const experiences = [
  {
    role: '前端开发工程师',
    company: '烽华（黑龙江）数字科技有限公司',
    period: '2023.09 - 2026.02',
    desc: '基于 Vue3 + TypeScript + Vite 从 0 搭建统一前端开发体系，覆盖 10+ 业务项目；抽象动态表单、权限控制、数据展示等通用组件库，整体复用率提升约 40%；建立前端工程化规范（ESLint + Prettier + Git Hooks + CI），上线低级 bug 减少约 60%；主导性能优化专项，核心业务页面首屏加载提升 30%+；牵头制定前后端接口规范与联调流程，联调周期缩短约 30X%。'
  },
  {
    role: '前端开发工程师',
    company: '华泽数码科技有限公司',
    period: '2022.10 - 2023.06',
    desc: '独立负责后台管理系统核心模块（数据看板 / 权限管理 / 业务流程），支撑 4 个业务部门日常使用，单日活跃用户 100+；设计并实现动态表单引擎与数据驱动表格组件，支持 3 种业务场景配置化生成，将新表单需求交付周期从 5 天缩短至 2 天；从 Vue2 平滑迁移至 Vue3，完成 10+ 核心模块升级，迁移过程零故障上线；搭建前端异常监控体系，线上问题平均定位时间从 1 小时缩短至 15 分钟。'
  },
  {
    role: 'uniapp开发工程师',
    company: '新旅程科技技术有限公司',
    period: '2021.03 - 2022.8',
    desc: '作为小程序外包公司核心开发人员，独立完成 15+ 商城、预约、展示类小程序项目交付；基于微信小程序原生框架和 Uni-app 跨平台方案，实现多端适配；优化小程序加载性能，首屏渲染时间平均降低 40%；建立组件库和开发规范，团队开发效率提升 35%；与客户深度沟通需求，项目按时交付率达 98%，客户满意度评分 4.8/5。'
  }
]
</script>

<style scoped>
.about-page {
  padding-top: 80px;
}

.page-header {
  padding: 5rem 0 3rem;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-family: var(--font-mono);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.title-prefix {
  color: var(--accent-cyan);
}

.page-desc {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.about-content {
  padding: 4rem 0 6rem;
}

.about-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 3rem;
}

.profile-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  text-align: center;
  position: sticky;
  top: 100px;
  height: fit-content;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid transparent;
  background-clip: padding-box;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.status-dot {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid var(--bg-card);
}

.status-dot.online {
  background: var(--accent-green);
  box-shadow: 0 0 10px rgba(var(--accent-green-rgb), 0.3);
}

.name {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.role {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--accent-cyan);
  margin-bottom: 0.5rem;
}

.location {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-link {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  transition: var(--transition-fast);
}

.social-link:hover {
  background: var(--accent-cyan);
  color: var(--bg-primary);
  transform: translateY(-2px);
}

.wechat-trigger {
  cursor: pointer;
}

.info-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.card-title {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  padding: 1.25rem 1.5rem;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-title .icon {
  color: var(--accent-cyan);
  font-weight: bold;
}

.card-body {
  padding: 1.5rem;
  line-height: 1.8;
  color: var(--text-secondary);
}

.skills-grid {
  padding: 1.5rem;
  display: grid;
  /* grid-template-columns: repeat(2, 1fr); */
  gap: 1.5rem;
}

.skill-group h4 {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tags span {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  padding: 0.35rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  transition: var(--transition-fast);
}

.skill-tags span:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.full-width {
  width: 100%;
}

.timeline {
  padding: 1.5rem;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-color);
}

.timeline-item {
  position: relative;
  padding-left: 2.5rem;
  padding-bottom: 2rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: 4px;
  top: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 3px solid var(--accent-cyan);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.timeline-header h4 {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 600;
}

.timeline-date {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--accent-cyan);
}

.timeline-company {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.timeline-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

@media (max-width: 900px) {
  .about-grid {
    grid-template-columns: 1fr;
  }

  .profile-card {
    position: static;
  }

  .skills-grid {
    grid-template-columns: 1fr;
  }
}
</style>
