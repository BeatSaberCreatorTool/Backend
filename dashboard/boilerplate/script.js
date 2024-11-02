// Constants
const API_URL = '/api/user/get';
const DASHBOARD_PATH = '/dashboard/';
const USER_AVATAR_BASE_URL = 'https://cdn.discordapp.com/avatars/';

// Utility function to get an element by ID
function getById(id) {
    return document.getElementById(id);
}

// Utility function to update user info on the page
function updateUserInfo(user) {
    const avatarUrl = `${USER_AVATAR_BASE_URL}${user.id}/${user.avatar}.png`;
    getById('user-avatar').src = avatarUrl;
    getById('user-name').textContent = user.global_name;
}

// Load user data
async function loadUser() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to load user data');
        
        const user = await response.json();
        updateUserInfo(user);
    } catch (error) {
        console.error(error.message);
        alert('Error loading user data. Please try again later.');
    }
}

// Utility to toggle visibility of elements
function toggleVisibility(element, isVisible) {
    if (isVisible) {
        element.classList.remove('invisible');
    } else {
        element.classList.add('invisible');
    }
}

// Load content based on URL hash
async function loadContent() {
    const path = window.location.hash.substring(1);
    const indexClass = getById('index-class');
    const contentClass = getById('content-class');

    if (!path) {
        handleEmptyPath(indexClass, contentClass);
        return;
    }

    toggleVisibility(indexClass, false);
    toggleVisibility(contentClass, true);
    contentClass.innerHTML = '<h1>Loading...</h1>';

    updateNavLinks(path);

    try {
        const response = await fetchContent(path);
        if (response) {
            renderContent(response, contentClass);
        } else {
            showError(contentClass, 'Content not found');
        }
    } catch (error) {
        console.error(error.message);
        showError(contentClass, 'Failed to load content');
    }
}

// Handles empty hash path for the initial view
function handleEmptyPath(indexClass, contentClass) {
    toggleVisibility(indexClass, true);
    toggleVisibility(contentClass, false);

    document.querySelector('.nav-box a').classList.add('nav-current');
    document.querySelectorAll('.nav-box a').forEach(link => {
        if (link.hash.substring(1) !== '') link.classList.remove('nav-current');
    });
}

// Updates navigation link states based on the current path
function updateNavLinks(path) {
    document.querySelectorAll('.nav-box a').forEach(link => {
        if (link.hash.substring(1) === path) {
            link.classList.add('nav-current');
        } else {
            link.classList.remove('nav-current');
        }
    });
}

// Fetch HTML content based on path
async function fetchContent(path) {
    try {
        let response = await fetch(`${DASHBOARD_PATH}${path}.html`);
        if (!response.ok) {
            response = await fetch(`${DASHBOARD_PATH}${path}/index.html`);
        }
        return response.ok ? response.text() : null;
    } catch {
        throw new Error(`Error fetching content for path: ${path}`);
    }
}

// Renders content from fetched HTML
function renderContent(htmlString, contentContainer) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const template = doc.querySelector('template');
    const script = doc.querySelector('script');

    if (!template) {
        showError(contentContainer, 'Template not found');
        return;
    }

    contentContainer.innerHTML = ''; // Clear existing content
    contentContainer.appendChild(template.content);

    if (script) {
        executeScript(contentContainer, script);
    }
}

// Executes embedded script content and calls `module_init` if available
function executeScript(contentContainer, script) {
    const scriptElement = document.createElement('script');
    scriptElement.textContent = script.textContent;
    contentContainer.appendChild(scriptElement);

    if (typeof module_init === 'function') {
        module_init();
    }
}

// Display error message within the content area
function showError(contentContainer, message) {
    contentContainer.innerHTML = `<h1>Error</h1><p>${message}</p>`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    loadContent();
});

window.addEventListener('hashchange', () => {
    loadContent();
});

document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.querySelector('.nav-list').classList.toggle('active');
});
