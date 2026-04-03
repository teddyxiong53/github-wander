const config = {
    client_id: 'Ov23lidVEwyOPpzljyVm',
    redirect_uri: window.location.href.split('?')[0],
    scope: 'read:user'
};

let authToken = localStorage.getItem('github_token');
let clientSecret = localStorage.getItem('github_client_secret') || '';
let shownProjects = new Set();
let currentTheme = localStorage.getItem('theme') || 'light';

const languages = [
    'JavaScript', 'Python', 'Java', 'Go', 'TypeScript',
    'Rust', 'C++', 'C', 'C#', 'PHP', 'Ruby', 'Swift', 
    'Kotlin', 'Dart', 'Scala', 'Haskell', 'Elixir', 
    'Erlang', 'Lua', 'Perl', 'R', 'MATLAB', 'Julia',
    'Shell', 'PowerShell', 'Vim script', 'Emacs Lisp',
    'HTML', 'CSS', 'SCSS', 'Sass', 'Less',
    'Vue', 'React', 'Angular', 'Svelte', 'Solid',
    'Node.js', 'Deno', 'Bun', 'NestJS', 'Express',
    'FastAPI', 'Django', 'Flask', 'Spring', 'Rails',
    'Laravel', 'WordPress', 'Ghost', 'Hexo', 'Jekyll',
    'TensorFlow', 'PyTorch', 'Keras', 'OpenCV', 'Pillow',
    'NumPy', 'Pandas', 'SciPy', 'Matplotlib', 'Plotly',
    'Unity', 'Unreal', 'Godot', 'Three.js', 'Babylon.js',
    'React Native', 'Flutter', 'Ionic', 'Cordova', 'Xamarin',
    'Electron', 'Tauri', 'NW.js', 'Atom', 'VS Code',
    'Kubernetes', 'Docker', 'Terraform', 'Ansible', 'Puppet',
    'Prometheus', 'Grafana', 'ELK', 'Redis', 'MongoDB',
    'PostgreSQL', 'MySQL', 'SQLite', 'MariaDB', 'Oracle',
    'GraphQL', 'gRPC', 'gRPC-Web', 'Apache Kafka', 'RabbitMQ',
    'Nginx', 'Apache', 'Caddy', 'Traefik', 'HAProxy',
    'AWS', 'GCP', 'Azure', 'DigitalOcean', 'Heroku',
    'Vim', 'Emacs', 'VS Code', 'IntelliJ', 'PyCharm',
    'WebAssembly', 'Wasm', 'Rust', 'Zig', 'Nim', 'V',
    'Assembly', 'LLVM', 'GCC', 'Clang', 'CMake',
    'Make', 'Gradle', 'Maven', 'NPM', 'Yarn',
    'Pip', 'Cargo', 'Go modules', 'NuGet', 'Composer',
    'APT', 'DNF', 'Homebrew', 'Chocolatey', 'Scoop',
    'Git', 'Mercurial', 'SVN', 'Perforce', 'Fossil',
    'GitHub', 'GitLab', 'Bitbucket', 'Gitea', 'Gogs',
    'CircleCI', 'Travis CI', 'Jenkins', 'GitHub Actions',
    'GitLab CI', 'Drone', 'Argo CD', 'Flux', 'Tekton'
];

const translations = {
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
    loggedInAs: 'Logged in as',
    error: 'Failed to fetch projects. Please try again later.',
    rateLimitError: 'API rate limit exceeded. Please sign in with GitHub to increase the limit.',
    stars: 'Stars',
    forks: 'Forks',
    language: 'Language',
    sortOptions: {
        stars: 'Stars',
        updated: 'Recently Updated',
        created: 'Recently Created'
    },
    clientSecretLabel: 'GitHub OAuth Client Secret (optional):',
    clientSecretPlaceholder: 'Your OAuth client_secret (increases rate limit)',
    settingsSaved: 'Settings saved',
    clearSettings: 'Clear Settings',
    enterClientSecret: 'Enter your GitHub OAuth client_secret'
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
}

function initializePage() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    populateLanguageSelect();
    checkAuthStatus();
    updateUIText();
    getRandomProjects();
}

function populateLanguageSelect() {
    const select = document.getElementById('languageSelect');
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = lang;
        select.appendChild(option);
    });
}

function updateUIText() {
    document.querySelector('.title').textContent = translations.title;
    document.querySelector('.refresh-btn').textContent = translations.refresh;
    document.querySelector('.loading').textContent = translations.loading;
    document.querySelector('.language-label').textContent = translations.languageLabel;
    document.querySelector('.stars-label').textContent = translations.starsLabel;
    document.querySelector('.sort-label').textContent = translations.sortLabel;
    document.querySelector('.login-text').textContent = authToken ? translations.logoutButton : translations.loginButton;
    
    const allLangOption = document.querySelector('#languageSelect option[value=""]');
    if (allLangOption) {
        allLangOption.textContent = translations.allLanguages;
    }

    const sortSelect = document.getElementById('sortSelect');
    Array.from(sortSelect.options).forEach(option => {
        option.textContent = translations.sortOptions[option.value];
    });
}

function handleLogin() {
    const clientSecretInput = document.getElementById('clientSecretInput').value.trim();
    if (clientSecretInput) {
        clientSecret = clientSecretInput;
        localStorage.setItem('github_client_secret', clientSecret);
        showMessage(translations.settingsSaved, 'success');
    }
    
    if (authToken) {
        authToken = null;
        localStorage.removeItem('github_token');
        updateAuthUI(false);
        return;
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${config.client_id}&redirect_uri=${encodeURIComponent(config.redirect_uri)}&scope=${config.scope}`;
    window.location.href = authUrl;
}

function showMessage(message, type = 'error') {
    const msgEl = document.querySelector('.message');
    msgEl.textContent = message;
    msgEl.className = `message ${type}`;
    msgEl.style.display = 'block';
    setTimeout(() => {
        msgEl.style.display = 'none';
    }, 3000);
}

async function checkAuthStatus() {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        try {
            if (!clientSecret) {
                showMessage(translations.enterClientSecret, 'info');
                updateAuthUI(false);
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            const response = await fetch(`https://github.com/login/oauth/access_token`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: config.client_id,
                    client_secret: clientSecret,
                    code: code
                })
            });
            
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error_description);
            }
            
            authToken = data.access_token;
            localStorage.setItem('github_token', authToken);
            window.history.replaceState({}, document.title, window.location.pathname);
            updateAuthUI(true);
            getRandomProjects();
        } catch (error) {
            console.error('Failed to exchange code for token:', error);
            showMessage(translations.error);
        }
    } else if (authToken) {
        updateAuthUI(true);
    }
}

async function updateAuthUI(isAuthenticated) {
    const loginButton = document.querySelector('.github-login-btn');
    const userInfo = document.querySelector('.user-info');
    const clientSecretGroup = document.querySelector('.client-secret-group');

    if (clientSecret) {
        document.getElementById('clientSecretInput').value = clientSecret;
    }

    if (isAuthenticated && authToken) {
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${authToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (response.ok) {
                const userData = await response.json();
                document.getElementById('userAvatar').src = userData.avatar_url;
                document.getElementById('userName').textContent = userData.login;
                loginButton.querySelector('.login-text').textContent = translations.logoutButton;
                userInfo.style.display = 'flex';
                clientSecretGroup.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            showMessage(translations.error);
        }
    } else {
        loginButton.querySelector('.login-text').textContent = translations.loginButton;
        userInfo.style.display = 'none';
        clientSecretGroup.style.display = 'block';
    }
}

function clearSettings() {
    clientSecret = '';
    localStorage.removeItem('github_client_secret');
    authToken = null;
    localStorage.removeItem('github_token');
    document.getElementById('clientSecretInput').value = '';
    updateAuthUI(false);
    showMessage(translations.clearSettings, 'success');
}

async function getRandomProjects() {
    const loading = document.querySelector('.loading');
    const container = document.getElementById('projectsContainer');
    const filters = getFilters();
    
    try {
        loading.style.display = 'block';
        container.innerHTML = '';
        document.querySelector('.message').style.display = 'none';

        const page = Math.floor(Math.random() * 10) + 1;
        let url = `https://api.github.com/search/repositories?q=stars:>${filters.stars}`;
        
        if (filters.language) {
            url += `+language:${encodeURIComponent(filters.language)}`;
        }
        
        url += `&sort=${filters.sort}&order=desc&page=${page}&per_page=12`;

        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        if (authToken) {
            headers['Authorization'] = `token ${authToken}`;
        }

        const response = await fetch(url, { headers });
        updateRateLimitInfo(response);

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error(translations.rateLimitError);
            }
            throw new Error(translations.error);
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

        if (projects.length === 0) {
            showMessage('No more projects to show. Try different filters.', 'info');
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
        showMessage(error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function getFilters() {
    return {
        language: document.getElementById('languageSelect').value,
        stars: document.getElementById('starsSelect').value,
        sort: document.getElementById('sortSelect').value
    };
}

function updateRateLimitInfo(response) {
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const limit = response.headers.get('X-RateLimit-Limit');
    if (remaining !== null && limit !== null) {
        const rateLimitInfo = document.querySelector('.rate-limit-info');
        rateLimitInfo.textContent = `API: ${remaining}/${limit}`;
        rateLimitInfo.style.display = 'block';
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3>
            <a href="${project.html_url}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(project.name)}
            </a>
        </h3>
        <p>${escapeHtml(project.description || translations.noDescription)}</p>
        <div class="card-footer">
            <span class="stat" title="${translations.stars}">
                <svg height="16" viewBox="0 0 16 16" fill="#586069"><path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/></svg>
                ${project.stargazers_count.toLocaleString()}
            </span>
            <span class="stat" title="${translations.forks}">
                <svg height="16" viewBox="0 0 16 16" fill="#586069"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
                ${project.forks_count.toLocaleString()}
            </span>
            ${project.language ? `
                <span class="stat language" title="${translations.language}">
                    <svg height="16" viewBox="0 0 16 16" fill="#586069"><path d="M8 4a4 4 0 100 8 4 4 0 000-8z"/></svg>
                    ${escapeHtml(project.language)}
                </span>
            ` : ''}
        </div>
    `;
    return card;
}

document.addEventListener('DOMContentLoaded', initializePage);