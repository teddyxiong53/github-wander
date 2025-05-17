// 存储已经展示过的项目，避免重复
let shownProjects = new Set();

// GitHub API的搜索查询参数
const searchQueries = [
    'stars:>1000',
    'stars:>5000',
    'stars:>10000',
    'stars:>50000'
];

// 编程语言列表
const languages = [
    'JavaScript',
    'Python',
    'Java',
    'Go',
    'TypeScript',
    'Rust',
    'C++',
    'PHP',
    'Ruby',
    'Swift'
];

// 获取随机项目
async function getRandomProjects() {
    const loading = document.querySelector('.loading');
    const container = document.getElementById('projectsContainer');
    
    try {
        loading.style.display = 'block';
        container.innerHTML = '';

        // 随机选择搜索条件和语言
        const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
        const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
        
        // 构建搜索URL，添加随机页码以获取不同结果
        const page = Math.floor(Math.random() * 10) + 1;
        const url = `https://api.github.com/search/repositories?q=${randomQuery}+language:${randomLanguage}&sort=stars&order=desc&page=${page}&per_page=10`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('GitHub API请求失败');
        }

        const data = await response.json();
        const projects = data.items.filter(project => !shownProjects.has(project.id));

        // 更新已显示项目集合
        projects.forEach(project => shownProjects.add(project.id));

        // 如果已显示项目太多，清空集合
        if (shownProjects.size > 1000) {
            shownProjects.clear();
        }

        // 创建项目卡片
        projects.forEach(project => {
            const card = createProjectCard(project);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('获取项目失败:', error);
        container.innerHTML = `<div style="text-align: center; color: #cb2431;">获取项目失败，请稍后重试</div>`;
    } finally {
        loading.style.display = 'none';
    }
}

// 创建项目卡片
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'card';
    
    // 格式化数字
    const formatNumber = (num) => {
        return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
    };

    // 截断描述文本
    const description = project.description
        ? project.description.length > 100
            ? project.description.substring(0, 100) + '...'
            : project.description
        : '暂无描述';

    card.innerHTML = `
        <h3>
            <a href="${project.html_url}" target="_blank" style="color: #0366d6; text-decoration: none;">
                ${project.full_name}
            </a>
        </h3>
        <p>${description}</p>
        <div class="card-footer">
            <span>
                <svg aria-label="star" height="16" viewBox="0 0 16 16" width="16" fill="#586069">
                    <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path>
                </svg>
                ${formatNumber(project.stargazers_count)}
            </span>
            <span>
                <svg aria-label="fork" height="16" viewBox="0 0 16 16" width="16" fill="#586069">
                    <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                </svg>
                ${formatNumber(project.forks_count)}
            </span>
            <span style="color: ${project.language ? '#24292e' : '#586069'}">
                ${project.language || '未知语言'}
            </span>
        </div>
    `;

    return card;
}

// 刷新按钮点击事件处理函数
function refreshProjects() {
    getRandomProjects();
}

// 页面加载完成后自动获取项目
document.addEventListener('DOMContentLoaded', getRandomProjects);