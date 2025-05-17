// GitHub OAuth配置
const config = {
    client_id: 'your_client_id_here', // 需要替换为实际的GitHub OAuth App client ID
    redirect_uri: window.location.origin,
    scope: 'read:user'
};

// 存储用户认证信息和语言设置
let authToken = localStorage.getItem('github_token');
let currentLanguage = localStorage.getItem('preferred_language') || 'en';

// 存储已经展示过的项目，避免重复
let shownProjects = new Set();

// 编程语言列表
const languages = [
    'JavaScript', 'Python', 'Java', 'Go', 'TypeScript',
    'Rust', 'C++', 'PHP', 'Ruby', 'Swift', 'Kotlin',
    'Dart', 'C#', 'Vue', 'React', 'Angular'
];

// 多语言支持
const translations = {
    en: {
        title: 'GitHub Project Explorer',
        refresh: 'Refresh',
        loading: 'Loading...',
        noDescription: 'No description available',
        languageLabel: 'Programming Language:',
        starsLabel: 'Minimum Stars:',
        sortLabel: 'Sort By:',
        allLanguages: 'All Languages',
        loginButton: 'Sign in with GitHub',
        logoutButton: 'Sign out',
        error: 'Failed to fetch projects. Please try again later.',
        rateLimitError: 'API rate limit exceeded. Please sign in with GitHub to increase the limit.',
        stars: 'Stars',
        forks: 'Forks',
        language: 'Language',
        sortOptions: {
            stars: 'Stars',
            updated: 'Recently Updated',
            created: 'Recently Created'
        }
    },
    zh: {
        title: 'GitHub项目推荐',
        refresh: '刷新推荐',
        loading: '加载中...',
        noDescription: '暂无描述',
        languageLabel: '编程语言：',
        starsLabel: '最少星标数：',
        sortLabel: '排序方式：',
        allLanguages: '所有语言',
        loginButton: '使用GitHub登录',
        logoutButton: '退出登录',
        error: '获取项目失败，请稍后重试',
        rateLimitError: 'API调用次数已达上限，请登录GitHub以提高限制',
        stars: '星标',
        forks: '分支',
        language: '语言',
        sortOptions: {
            stars: '星标数',
            updated: '最近更新',
            created: '最近创建'
        }
    }
};

// 初始化页面
function initializePage() {
    populateLanguageSelect();
    setupLanguageSwitch();
    checkAuthStatus();
    updateUIText();
    getRandomProjects();
}

// 填充语言选择下拉框
function populateLanguageSelect() {
    const select = document.getElementById('languageSelect');
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        select.appendChild(option);
    });
}

// 设置语言切换
function setupLanguageSwitch() {
    const buttons = document.querySelectorAll('.language-btn');
    buttons.forEach(button => {
        if (button.dataset.lang === currentLanguage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentLanguage = button.dataset.lang;
            localStorage.setItem('preferred_language', currentLanguage);
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateUIText();
        });
    });
}

// 更新UI文本
function updateUIText() {
    const texts = translations[currentLanguage];
    document.querySelector('.title').textContent = texts.title;
    document.querySelector('.refresh-btn').textContent = texts.refresh;
    document.querySelector('.loading').textContent = texts.loading;
    document.querySelector('.language-label').textContent = texts.languageLabel;
    document.querySelector('.stars-label').textContent = texts.starsLabel;
    document.querySelector('.sort-label').textContent = texts.sortLabel;
    document.querySelector('.login-text').textContent = authToken ? texts.logoutButton : texts.loginButton;
    
    const allLangOption = document.querySelector('#languageSelect option[value=""]');
    if (allLangOption) {
        allLangOption.textContent = texts.allLanguages;
    }

    const sortSelect = document.getElementById('sortSelect');
    Array.from(sortSelect.options).forEach(option => {
        option.textContent = texts.sortOptions[option.value];
    });
}

// 处理GitHub登录
function handleLogin() {
    if (authToken) {
        authToken = null;
        localStorage.removeItem('github_token');
        updateAuthUI(false);
        return;
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&scope=${config.scope}`;
    window.location.href = authUrl;
}

// 检查认证状态
async function checkAuthStatus() {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        try {
            // 注意：在实际应用中，这里应该通过后端服务器来交换访问令牌
            // 为了演示，我们假设已经获得了令牌
            authToken = 'demo_token';
            localStorage.setItem('github_token', authToken);
            window.history.replaceState({}, document.title, window.location.pathname);
            updateAuthUI(true);
        } catch (error) {
            console.error('Failed to exchange code for token:', error);
            showError(translations[currentLanguage].error);
        }
    } else if (authToken) {
        updateAuthUI(true);
    }
}

// 更新认证UI
async function updateAuthUI(isAuthenticated) {
    const authSection = document.querySelector('.auth-section');
    const userInfo = document.querySelector('.user-info');
    const loginButton = document.querySelector('.github-login-btn');

    if (isAuthenticated && authToken) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${authToken}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                document.getElementById('userAvatar').src = userData.avatar_url;
                document.getElementById('userName').textContent = userData.login;
                authSection.style.display = 'none';
                userInfo.style.display = 'flex';
                loginButton.querySelector('.login-text').textContent = 
                    translations[currentLanguage].logoutButton;
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            showError(translations[currentLanguage].error);
        }
    } else {
        authSection.style.display = 'block';
        userInfo.style.display = 'none';
        loginButton.querySelector('.login-text').textContent = 
            translations[currentLanguage].loginButton;
    }
}

// 显示错误信息
function showError(message) {
    const errorElement = document.querySelector('.error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// 更新API速率限制信息
function updateRateLimitInfo(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const limit = response.headers.get('X-RateLimit-Limit');
    if (remaining && limit) {
        const rateLimitInfo = document.querySelector('.rate-limit-info');
        rateLimitInfo.textContent = `API Calls: ${remaining}/${limit}`;
    }
}

// 获取筛选条件
function getFilters() {
    return {
        language: document.getElementById('languageSelect').value,
        stars: document.getElementById('starsSelect').value,
        sort: document.getElementById('sortSelect').value
    };
}

// 获取项目
async function getRandomProjects() {
    const loading = document.querySelector('.loading');
    const container = document.getElementById('projectsContainer');
    const filters = getFilters();
    
    try {
        loading.style.display = 'block';
        container.innerHTML = '';
        document.querySelector('.error-message').style.display = 'none';

        const page = Math.floor(Math.random() * 10) + 1;
        let url = `https://api.github.com/search/repositories?q=stars:>${filters.stars}`;
        
        if (filters.language) {
            url += `+language:${filters.language}`;
        }
        
        url += `&sort=${filters.sort}&order=desc&page=${page}&per_page=10`;

        const headers = {};
        if (authToken) {
            headers['Authorization'] = `token ${authToken}`;
        }

        const response = await fetch(url, { headers });
        updateRateLimitInfo(response);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(translations[currentLanguage].rateLimitError);
            }
            throw new Error(translations[currentLanguage].error);
        }

        const data = await response.json();
        const projects = data.items.filter(project => !shownProjects.has(project.id));

        if (shownProjects.size > 1000) {
            shownProjects.clear();
        }

        projects.forEach(project => {
            shownProjects.add(project.id);
            const card = createProjectCard(project);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        showError(error.message);
    } finally {
        loading.style.display = 'none';
    }
}

// 创建项目卡片
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3>
            <a href="${project.html_url}" target="_blank" rel="noopener noreferrer">
                ${project.name}
            </a>
        </h3>
        <p>${project.description || translations[currentLanguage].noDescription}</p>
        <div class="card-footer">
            <span title="${translations[currentLanguage].stars}">
                <svg height="16" viewBox="0 0 16 16" width="16" fill="#586069">
                    <path fill-rule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path>
                </svg>
                ${project.stargazers_count.toLocaleString()}
            </span>
            <span title="${translations[currentLanguage].forks}">
                <svg height="16" viewBox="0 0 16 16" width="16" fill="#586069">
                    <path fill-rule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"></path>
                </svg>
                ${project.forks_count.toLocaleString()}
            </span>
            ${project.language ? `
                <span title="${translations[currentLanguage].language}">
                    <svg height="16" viewBox="0 0 16 16" width="16" fill="#586069">
                        <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8z"></path>
                    </svg>
                    ${project.language}
                </span>
            ` : ''}
        </div>
    `;
    return card;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);