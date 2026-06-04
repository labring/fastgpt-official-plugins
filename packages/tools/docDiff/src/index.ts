import { uploadFile } from '../utils/uploadFile';
import { z } from 'zod';
import {
  compareDocuments,
  compareDocumentsWithTolerance,
  type ParagraphDiff,
  type LineBreakToleranceOptions
} from './diffAlgorithm';
import { applyFullNormalization } from './textNormalizer';

export const InputType = z.object({
  originalText: z.string().min(1, '原始文档内容不能为空'),
  originalTitle: z.string().optional().default('原始文档'),
  modifiedText: z.string().min(1, '修改后文档内容不能为空'),
  modifiedTitle: z.string().optional().default('修改后文档'),
  title: z.string().optional().default('文档对比报告'),
  // 换行容差选项
  lineTolerance: z
    .object({
      enableLineBreakTolerance: z.boolean().optional().default(true),
      scanRange: z.number().optional().default(3),
      toleranceThreshold: z.number().optional().default(0.95)
    })
    .optional()
});

export const OutputType = z.object({
  htmlUrl: z.string(),
  diffs: z.array(
    z.object({
      type: z.enum(['added', 'removed', 'modified']),
      original: z.string().optional(),
      modified: z.string().optional(),
      lineNumber: z.number()
    })
  )
});

// 输入类型
export type InputType = {
  originalText: string;
  originalTitle?: string;
  modifiedText: string;
  modifiedTitle?: string;
  title?: string;
  // 换行容差选项
  lineTolerance?: LineBreakToleranceOptions;
};

// 输出类型
export type OutputType = {
  htmlUrl: string;
  diffs: {
    type: 'added' | 'removed' | 'modified';
    original?: string;
    modified?: string;
    lineNumber: number;
  }[];
};

// 生成 HTML 报告
function generateHtmlReport(
  diffs: ParagraphDiff[],
  title: string,
  originalTitle: string,
  modifiedTitle: string
): string {
  const timestamp = new Date().toLocaleString('zh-CN');

  const css = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      :root {
        --bg-primary: #ffffff;
        --bg-secondary: #f8fafc;
        --bg-tertiary: #f1f5f9;
        --border: #e2e8f0;
        --text-primary: #1e293b;
        --text-secondary: #64748b;
        --text-tertiary: #94a3b8;
        --accent: #2563eb;
        --accent-hover: #1d4ed8;
        --success: #10b981;
        --danger: #ef4444;
        --warning: #f59e0b;
        --radius: 12px;
        --radius-sm: 8px;
        --shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
        --shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.08);
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
        line-height: 1.5;
        color: var(--text-primary);
        background-color: var(--bg-primary);
        height: 100vh;
        overflow: hidden;
        font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
      }

      .container {
        display: flex;
        flex-direction: column;
        height: 100vh;
      }

      .header {
        background: var(--bg-secondary);
        padding: 20px 24px;
        flex-shrink: 0;
      }

      .header-content {
        max-width: 1200px;
      }

      .header h1 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 500;
        color: var(--text-primary);
        letter-spacing: -0.025em;
      }

      .brand {
        color: var(--text-tertiary);
        font-weight: 400;
        font-size: 0.85em;
        margin-left: 8px;
      }

      .timestamp {
        color: var(--text-tertiary);
        font-size: 13px;
        margin-bottom: 16px;
      }

      .stats {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;
      }

      .stat-card {
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 12px 16px;
        min-width: 80px;
      }

      .stat-number {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 2px;
        letter-spacing: -0.025em;
      }

      .stat-label {
        font-size: 12px;
        color: var(--text-tertiary);
        font-weight: 500;
      }

      .unchanged { color: var(--success); }
      .added { color: var(--accent); }
      .removed { color: var(--danger); }
      .modified { color: var(--warning); }

      .navigation {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 0;
      }

      .navigation:first-of-type {
        justify-content: space-between;
      }

      .nav-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .filter-tabs {
        display: flex;
        align-items: center;
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 2px;
        gap: 2px;
        width: 100%;
      }

      .filter-tab {
        background: transparent;
        border: none;
        color: var(--text-secondary);
        padding: 6px 12px;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.15s ease;
      }

      .filter-tab:hover {
        color: var(--text-primary);
      }

      .filter-tab.active {
        background: var(--bg-primary);
        color: var(--accent);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .filter-tabs .lock-btn {
        margin-left: 8px;
        border-radius: var(--radius-sm);
      }

      .stat-card.clickable {
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .stat-card.clickable:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow);
        border-color: var(--accent);
      }

      .stat-card.clickable.active {
        border-color: var(--accent);
        background: rgba(37, 99, 235, 0.04);
      }

      .lock-btn {
        min-width: 40px;
        padding: 8px;
        justify-content: center;
        height: 32px;
        font-size: 14px;
        flex-shrink: 0;
        margin-left: 12px;
      }

      .lock-btn.locked {
        background: rgba(37, 99, 235, 0.1);
        border-color: var(--accent);
        color: var(--accent);
      }

      .nav-btn {
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        color: var(--text-primary);
        border-radius: var(--radius-sm);
        padding: 8px 16px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .nav-btn:hover:not(:disabled) {
        background: var(--bg-secondary);
        border-color: var(--accent);
        transform: translateY(-1px);
        box-shadow: var(--shadow);
      }

      .nav-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .counter {
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 500;
        margin: 0 12px;
      }

      .nav-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .content-container {
        display: flex;
        height: calc(100vh - 240px);
        overflow: hidden;
        gap: 16px;
        padding: 0 24px 24px;
      }

      .column {
        flex: 1;
        overflow-y: auto;
        background: var(--bg-secondary);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }

      .column-header {
        padding: 16px 20px;
        background: var(--bg-tertiary);
        border-bottom: 1px solid var(--border);
        font-weight: 600;
        color: var(--text-primary);
        font-size: 14px;
        position: sticky;
        top: 0;
        z-index: 10;
        letter-spacing: -0.025em;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 70px;
        box-sizing: border-box;
      }

      .diff-item {
        position: relative;
        transition: all 0.15s ease;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px 20px;
      }

      .diff-item.highlight {
        background: linear-gradient(90deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%) !important;
        border-left: 3px solid var(--accent) !important;
        animation: highlight-pulse 2s ease-out forwards;
      }

      .diff-paragraph {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace;
        font-size: 14px;
        line-height: 1.5;
        color: var(--text-primary);
        white-space: pre-wrap;
        word-break: break-word;
        flex: 1;
      }

      .empty-line {
        min-height: 22px;
        color: var(--text-tertiary);
        font-style: italic;
        opacity: 0.5;
      }

      .empty-line::before {
        content: "空行";
        font-size: 12px;
      }

      .diff-item.unchanged .diff-paragraph {
        color: var(--text-secondary);
      }

      .diff-item.modified .diff-paragraph {
        color: var(--warning);
      }

      .diff-item.removed .diff-paragraph {
        color: var(--danger);
        background: rgba(239, 68, 68, 0.04);
        border-radius: var(--radius-sm);
        padding: 2px 4px;
      }

      .diff-item.added .diff-paragraph {
        color: var(--accent);
        background: rgba(37, 99, 235, 0.04);
        border-radius: var(--radius-sm);
        padding: 2px 4px;
      }

      /* 滚动条样式 */
      .column::-webkit-scrollbar {
        width: 6px;
      }

      .column::-webkit-scrollbar-track {
        background: transparent;
      }

      .column::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
        transition: background 0.2s;
      }

      .column::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      /* 动画 */
      @keyframes highlight-pulse {
        0% {
          background: linear-gradient(90deg, rgba(37, 99, 235, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%);
          border-left-color: var(--accent);
          transform: translateX(0);
        }
        50% {
          transform: translateX(1px);
        }
        100% {
          background: linear-gradient(90deg, rgba(37, 99, 235, 0.03) 0%, transparent 100%);
          border-left-color: var(--accent);
          transform: translateX(0);
        }
      }

      /* 可折叠控制面板 */
      .controls-collapse {
        display: block;
      }

      .collapse-btn {
        background: var(--bg-tertiary);
        border: 1px solid var(--border);
        color: var(--text-secondary);
        border-radius: var(--radius-sm);
        padding: 8px 12px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin: 8px 0;
      }

      .collapse-btn:hover {
        background: var(--bg-secondary);
        border-color: var(--accent);
        color: var(--text-primary);
        transform: translateY(-1px);
        box-shadow: var(--shadow);
      }

      .collapse-icon {
        transition: transform 0.2s ease;
        display: inline-block;
        font-size: 10px;
      }

      .collapsed .collapse-icon {
        transform: rotate(-90deg);
      }

      .collapsible-content {
        max-height: 500px;
        overflow: hidden;
        transition: max-height 0.3s ease, opacity 0.2s ease;
        opacity: 1;
        padding: 10px;
      }

      .collapsed .collapsible-content {
        max-height: 0;
        opacity: 0;
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .content-container {
          flex-direction: column;
          gap: 12px;
          padding: 0 16px 16px;
        }

        .header {
          padding: 16px;
        }

        .stats {
          flex-wrap: wrap;
          gap: 12px;
        }

        .stat-card {
          min-width: 70px;
          padding: 10px 12px;
        }

        .diff-item {
          padding: 12px 16px;
          gap: 10px;
        }

        .diff-paragraph {
          font-size: 13px;
        }

        /* 折叠时调整内容区域高度 */
        .container.collapsed .content-container {
          height: calc(100vh - 120px);
        }

        /* 折叠时简化导航 */
        .collapsed .navigation {
          padding: 8px 0;
        }

        .collapsed .nav-group {
          flex-wrap: wrap;
          gap: 8px;
        }

        .collapsed .filter-tabs {
          order: 2;
          width: 100%;
          margin-top: 8px;
        }

        .collapsed .nav-btn:not(.lock-btn) {
          font-size: 12px;
          padding: 6px 12px;
        }

        .collapsed .counter {
          font-size: 12px;
          margin: 0 8px;
        }
      }

      /* 超小屏幕优化 */
      @media (max-width: 480px) {
        .header {
          padding: 12px;
        }

        .header h1 {
          font-size: 18px;
        }

        .brand {
          font-size: 0.8em;
          margin-left: 6px;
        }

        .stats {
          gap: 8px;
        }

        .stat-card {
          min-width: 60px;
          padding: 8px 10px;
        }

        .stat-number {
          font-size: 16px;
        }

        .stat-label {
          font-size: 11px;
        }

        .collapsed .navigation {
          padding: 6px 0;
        }

        .collapsed .nav-btn:not(.lock-btn) {
          font-size: 11px;
          padding: 5px 10px;
        }

        .content-container {
          padding: 0 12px 12px;
          gap: 10px;
        }

        .diff-item {
          padding: 10px 12px;
          gap: 8px;
        }

        .diff-paragraph {
          font-size: 12px;
        }
      }

      @keyframes highlight-fade {
        0% {
          background-color: #bbdefb;
          box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
        }
        70% {
          background-color: #e3f2fd;
          box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2);
        }
        100% {
          background-color: transparent;
          box-shadow: none;
          border-left-color: transparent !important;
        }
      }

      .diff-paragraph.empty-line::before {
        content: "·";
        display: block;
        text-align: center;
      }


    </style>
  `;

  const js = `
    <script>
      let currentIndex = -1;
      let changes = [];
      let currentFilter = 'all';
      let isLocked = false;

      // 初始化变更列表
      function initChanges() {
        // 统计所有有变更的项
        const allItems = document.querySelectorAll('.column:first-child .diff-item');
        allItems.forEach((item, index) => {
          // 统计所有有变更的类型（删除、修改、新增）
          // 对于修改类型，左右两侧都有modified类，所以检查左侧就足够了
          if (item.classList.contains('removed') ||
              item.classList.contains('modified') ||
              item.classList.contains('added')) {
            changes.push(index);
          }
        });
        setupEventListeners();
        updateNavigation();
      }

      // 设置事件监听器
      function setupEventListeners() {
        // 统计卡片点击事件
        document.querySelectorAll('.stat-card.clickable').forEach(card => {
          card.addEventListener('click', function() {
            const type = this.dataset.type;
            setFilter(type);
          });
        });

        // 筛选标签点击事件
        document.querySelectorAll('.filter-tab').forEach(tab => {
          tab.addEventListener('click', function() {
            const filter = this.dataset.filter;
            setFilter(filter);
          });
        });

        // 滚动锁定事件
        const leftColumn = document.querySelector('.column:first-child');
        const rightColumn = document.querySelector('.column:last-child');
        let isProgrammaticScroll = false; // 标记是否为程序触发的滚动

        leftColumn.addEventListener('scroll', function() {
          if (isLocked && !isProgrammaticScroll) {
            isProgrammaticScroll = true;
            rightColumn.scrollTop = this.scrollTop;
            setTimeout(() => { isProgrammaticScroll = false; }, 50);
          }
        });

        rightColumn.addEventListener('scroll', function() {
          if (isLocked && !isProgrammaticScroll) {
            isProgrammaticScroll = true;
            leftColumn.scrollTop = this.scrollTop;
            setTimeout(() => { isProgrammaticScroll = false; }, 50);
          }
        });
      }

      // 设置筛选器
      function setFilter(filter) {
        currentFilter = filter;

        // 更新统计卡片状态
        document.querySelectorAll('.stat-card.clickable').forEach(card => {
          card.classList.remove('active');
          if (card.dataset.type === filter) {
            card.classList.add('active');
          }
        });

        // 更新筛选标签状态
        document.querySelectorAll('.filter-tab').forEach(tab => {
          tab.classList.remove('active');
          if (tab.dataset.filter === filter) {
            tab.classList.add('active');
          }
        });

        // 重置当前索引并更新导航
        currentIndex = -1;
        updateNavigation();

        // 如果有变更，导航到第一处
        if (changes.length > 0) {
          navigateToChange(0);
        }
      }

      // 获取当前筛选的变更列表
      function getFilteredChanges() {
        if (currentFilter === 'all') {
          return changes;
        }

        const filteredChanges = [];
        const allItems = document.querySelectorAll('.column:first-child .diff-item');

        allItems.forEach((item, index) => {
          let type = '';

          // 检查每个diff-item的类型
          if (item.classList.contains('removed')) {
            type = 'removed';
          } else if (item.classList.contains('modified')) {
            type = 'modified';
          } else if (item.classList.contains('added')) {
            type = 'added';
          } else if (item.classList.contains('unchanged')) {
            type = 'unchanged';
          }

          // 对于新增类型，需要检查右侧对应项
          if (currentFilter === 'added') {
            const rightItem = document.querySelector('.column:last-child').querySelectorAll('.diff-item')[index];
            if (rightItem && rightItem.classList.contains('added')) {
              type = 'added';
            }
          }

          if (type === currentFilter) {
            filteredChanges.push(index);
          }
        });

        return filteredChanges;
      }

      // 更新导航按钮状态
      function updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const counter = document.getElementById('counter');

        const filteredChanges = getFilteredChanges();

        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= filteredChanges.length - 1;

        if (filteredChanges.length === 0) {
          const filterText = currentFilter === 'all' ? '变更' :
                            currentFilter === 'added' ? '新增' :
                            currentFilter === 'removed' ? '删除' : '修改';
          counter.textContent = \`无\${filterText}\`;
          prevBtn.disabled = true;
          nextBtn.disabled = true;
        } else {
          counter.textContent = \`\${currentIndex + 1} / \${filteredChanges.length}\`;
        }
      }

      // 导航到指定变更
      function navigateToChange(index) {
        // 清除之前的高亮
        document.querySelectorAll('.diff-item.highlight').forEach(item => {
          item.classList.remove('highlight');
        });

        const filteredChanges = getFilteredChanges();

        if (index >= 0 && index < filteredChanges.length) {
          currentIndex = index;
          const targetIndex = filteredChanges[currentIndex];

          // 同时高亮左右两栏的对应项
          const leftColumnItem = document.querySelector('.column:first-child').querySelectorAll('.diff-item')[targetIndex];
          const rightColumnItem = document.querySelector('.column:last-child').querySelectorAll('.diff-item')[targetIndex];

          if (leftColumnItem && rightColumnItem) {
            leftColumnItem.classList.add('highlight');
            rightColumnItem.classList.add('highlight');

            // 根据锁定状态选择滚动方式
            if (isLocked) {
              // 锁定状态下，使用直接scrollTop设置避免循环事件
              const leftColumn = document.querySelector('.column:first-child');
              const rightColumn = document.querySelector('.column:last-child');

              // 计算目标滚动位置
              const itemRect = leftColumnItem.getBoundingClientRect();
              const containerRect = leftColumn.getBoundingClientRect();
              const targetScrollTop = leftColumn.scrollTop + (itemRect.top - containerRect.top) - (containerRect.height / 2) + (itemRect.height / 2);

              // 同时设置两个列的位置
              leftColumn.scrollTop = targetScrollTop;
              rightColumn.scrollTop = targetScrollTop;
            } else {
              // 未锁定状态下，分别滚动两列到最佳位置
              leftColumnItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              rightColumnItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // 2秒后自动移除高亮
            setTimeout(() => {
              leftColumnItem.classList.remove('highlight');
              rightColumnItem.classList.remove('highlight');
            }, 2000);
          }
        }

        updateNavigation();
      }

      // 上一处变更
      function previousChange() {
        const filteredChanges = getFilteredChanges();
        if (currentIndex > 0) {
          navigateToChange(currentIndex - 1);
        }
      }

      // 下一处变更
      function nextChange() {
        const filteredChanges = getFilteredChanges();
        if (currentIndex < filteredChanges.length - 1) {
          navigateToChange(currentIndex + 1);
        }
      }

      // 切换滚动锁定
      function toggleLock() {
        isLocked = !isLocked;
        const lockBtn = document.getElementById('lockBtn');
        const lockIcon = document.getElementById('lockIcon');

        if (isLocked) {
          lockBtn.classList.add('locked');
          lockIcon.textContent = '🔒';
          lockBtn.title = '解除左右滚动同步锁定';
        } else {
          lockBtn.classList.remove('locked');
          lockIcon.textContent = '🔓';
          lockBtn.title = '锁定左右滚动同步';
        }
      }

      // 切换控制面板显示/隐藏
      function toggleControls() {
        const header = document.getElementById('header');
        const container = document.getElementById('container');
        const collapseBtn = document.getElementById('collapseBtn');
        const collapseText = document.getElementById('collapseText');
        const collapsibleContent = document.getElementById('collapsibleContent');

        const isCollapsed = header.classList.contains('collapsed');

        if (isCollapsed) {
          // 展开控制面板
          header.classList.remove('collapsed');
          container.classList.remove('collapsed');
          collapseText.textContent = '收起筛选栏';
          collapseBtn.title = '收起筛选栏';
        } else {
          // 折叠控制面板
          header.classList.add('collapsed');
          container.classList.add('collapsed');
          collapseText.textContent = '展开筛选栏';
          collapseBtn.title = '展开筛选栏';
        }
      }

      // 页面加载完成后初始化
      document.addEventListener('DOMContentLoaded', function() {
        initChanges();

        // 如果有变更，自动导航到第一处
        if (changes.length > 0) {
          navigateToChange(0);
        }
      });

      // 键盘快捷键
      document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && !e.target.matches('input, textarea')) {
          previousChange();
        } else if (e.key === 'ArrowRight' && !e.target.matches('input, textarea')) {
          nextChange();
        }
      });
    </script>
  `;

  // 计算统计信息
  const stats = diffs.reduce(
    (acc, diff) => {
      acc[diff.type]++;
      return acc;
    },
    { unchanged: 0, added: 0, removed: 0, modified: 0 }
  );

  // 生成左侧原始内容
  const originalContent = diffs
    .map((diff, index) => {
      let content = '';
      const typeClass = diff.type;

      if (diff.type === 'added') {
        // 新增的内容在左侧显示为空占位符
        content = '<div class="diff-paragraph empty-line"></div>';
      } else {
        content = `<div class="diff-paragraph">${escapeHtml(diff.original || '')}</div>`;
      }

      return `
      <div class="diff-item ${typeClass}" data-index="${index}">
        ${content}
      </div>
    `;
    })
    .join('');

  // 生成右侧修改后内容
  const modifiedContent = diffs
    .map((diff, index) => {
      let content = '';
      const typeClass = diff.type;

      if (diff.type === 'removed') {
        // 删除的内容在右侧显示为空占位符
        content = '<div class="diff-paragraph empty-line"></div>';
      } else {
        content = `<div class="diff-paragraph">${escapeHtml(diff.modified || '')}</div>`;
      }

      return `
      <div class="diff-item ${typeClass}" data-index="${index}">
        ${content}
      </div>
    `;
    })
    .join('');

  const html = `<!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      ${css}
    </head>
    <body>
      <div class="container" id="container">
        <div class="header" id="header">
          <div class="header-content">
            <h1>${title} <span class="brand">by FastGPT</span></h1>
            <div class="timestamp">生成时间: ${timestamp}</div>

            <div class="collapsible-content" id="collapsibleContent">
              <div class="stats">
                <div class="stat-card clickable" data-type="added">
                  <div class="stat-number added">${stats.added}</div>
                  <div class="stat-label">新增</div>
                </div>
                <div class="stat-card clickable" data-type="removed">
                  <div class="stat-number removed">${stats.removed}</div>
                  <div class="stat-label">删除</div>
                </div>
                <div class="stat-card clickable" data-type="modified">
                  <div class="stat-number modified">${stats.modified}</div>
                  <div class="stat-label">修改</div>
                </div>
              </div>

              <div class="navigation">
                <div class="nav-group">
                  <div class="filter-tabs">
                    <button class="filter-tab active" data-filter="all">全部</button>
                    <button class="filter-tab" data-filter="added">新增</button>
                    <button class="filter-tab" data-filter="removed">删除</button>
                    <button class="filter-tab" data-filter="modified">修改</button>
                  </div>
                </div>
              </div>
            </div>


            <div class="navigation">
            <div class="controls-collapse">
              <button class="collapse-btn" id="collapseBtn" onclick="toggleControls()">
              <span class="collapse-icon">▲</span>
                <span id="collapseText">收起筛选栏</span>
              </button>
            </div>
              <div class="nav-group">
                <button id="prevBtn" class="nav-btn" onclick="previousChange()">
                  ← 上一处
                </button>
                <div id="counter" class="counter">0 / 0</div>
                <button id="nextBtn" class="nav-btn" onclick="nextChange()">
                  下一处 →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="content-container">
          <div class="column">
            <div class="column-header">
            📄 ${originalTitle}
            <button id="lockBtn" class="nav-btn lock-btn" onclick="toggleLock()" title="锁定左右滚动同步">
              <span id="lockIcon">🔓</span>
            </button>
            </div>
            ${originalContent}
          </div>
          <div class="column">
            <div class="column-header">
              <span>📝 ${modifiedTitle}</span>
            </div>
            ${modifiedContent}
          </div>
        </div>
      </div>

      ${js}
    </body>
    </html>
  `;

  return html;
}

// HTML 转义函数
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function tool(
  input: z.infer<typeof InputType>,
  ctx?: Parameters<typeof uploadFile>[1]
) {
  // Zod 会自动验证输入，如果验证失败会抛出错误
  const validatedInput = InputType.parse(input);

  // 1. 文本标准化预处理（使用默认配置）
  const normalizedOriginal = applyFullNormalization(validatedInput.originalText);
  const normalizedModified = applyFullNormalization(validatedInput.modifiedText);

  // 2. 根据是否启用换行容差选择比较函数
  let diffs: ParagraphDiff[];
  if (validatedInput.lineTolerance?.enableLineBreakTolerance) {
    diffs = compareDocumentsWithTolerance(
      normalizedOriginal,
      normalizedModified,
      validatedInput.lineTolerance
    );
  } else {
    diffs = compareDocuments(normalizedOriginal, normalizedModified);
  }

  const html = generateHtmlReport(
    diffs,
    validatedInput.title,
    validatedInput.originalTitle,
    validatedInput.modifiedTitle
  );

  const uploadResult = await uploadFile({
    buffer: Buffer.from(html, 'utf-8'),
    defaultFilename: 'docdiff_report.html',
    contentType: 'text/html'
  }, ctx);

  if (!uploadResult || !uploadResult.accessUrl) {
    throw new Error('文件上传失败');
  }

  // 过滤掉unchanged类型，只返回有变更的内容
  const filteredDiffs = diffs.filter((diff) => diff.type !== 'unchanged');

  return {
    htmlUrl: uploadResult.accessUrl,
    diffs: filteredDiffs
  };
}
