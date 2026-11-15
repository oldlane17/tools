/* --- fhinclude.js --- */

function loadComponent(id, url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Failed to load " + url);
            return response.text();
        })
        .then(data => {
            document.getElementById(id).innerHTML = data;
        })
        .catch(error => console.error("Error loading component:", error));
}

// NEW: Specialized loader for the message framework
function loadMessageFramework() {
    return fetch("/structure/messages.html") 
        .then(response => {
            if (!response.ok) throw new Error("Failed to load message framework");
            return response.text();
        })
        .then(html => {
            const container = document.createElement('div');
            container.innerHTML = html;
            document.body.appendChild(container);
        })
        .catch(err => console.error("Error loading message framework:", err));
}

window.addEventListener('load', () => {
    Promise.all([
        loadComponent("header-placeholder", "/structure/header.html"),
        loadComponent("footer-placeholder", "/structure/footer.html"),
        loadMessageFramework()
    ]).then(() => {
        if (typeof initSmartHeader === "function") initSmartHeader();
        updateHeaderAuth(); 
    });
});

window.updateNotificationBadge = async function() {
    const token = localStorage.getItem('chess_session');
    if (!token) return;

    try {
        const res = await fetch('/api/social/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        
        const notifications = await res.json();
        
        // In SQLite, boolean values are returned as 0 (false) or 1 (true)
        const unreadCount = notifications.filter(n => n.is_read === 0).length;

        const badgeTop = document.getElementById('notif-badge-top');
        const badgeSide = document.getElementById('notif-badge-side');

        if (unreadCount > 0) {
            const displayCount = unreadCount > 9 ? '9+' : unreadCount;
            if (badgeTop) {
                badgeTop.innerText = displayCount;
                badgeTop.classList.remove('hidden');
            }
            if (badgeSide) {
                badgeSide.innerText = displayCount;
                badgeSide.classList.remove('hidden');
            }
        } else {
            if (badgeTop) badgeTop.classList.add('hidden');
            if (badgeSide) badgeSide.classList.add('hidden');
        }
    } catch (e) {
        console.error("Failed to update notification badge", e);
    }
};


function updateHeaderAuth() {
    const token = localStorage.getItem('chess_session');
    const name = localStorage.getItem('chess_name');
    
    // Topnav Elements
    const topGuest = document.getElementById('guest-ui');
    const topUser = document.getElementById('user-ui');
    const topName = document.getElementById('nav-username');

    // Sidenav Elements
    const sideGuest = document.getElementById('side-guest-ui');
    const sideUser = document.getElementById('side-user-ui');
    const sideName = document.getElementById('side-nav-username');

    const isLoggedIn = !!(token && name);

    // Toggle Topnav
    if (topGuest && topUser) {
        topGuest.classList.toggle('hidden', isLoggedIn);
        topUser.classList.toggle('hidden', !isLoggedIn);
        if (isLoggedIn && topName) topName.innerText = name;
    }

    // Toggle Sidenav
    if (sideGuest && sideUser) {
        sideGuest.classList.toggle('hidden', isLoggedIn);
        sideUser.classList.toggle('hidden', !isLoggedIn);
        if (isLoggedIn && sideName) sideName.innerText = name;
    }

    // Trigger notification check if user is logged in
    if (isLoggedIn) {
        window.updateNotificationBadge();
    }
}

// Ensure logout is accessible globally
window.logout = function() {
    localStorage.clear();
    window.location.href = "/";
};




function initSmartHeader() {
    let lastScrollTop = 0;
    const delta = 10; 
    
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.topnav');
        const hamburger = document.querySelector('.hamburger.b-container')
        if (!navbar) return;
        if (!hamburger) return;

        let st = window.pageYOffset || document.documentElement.scrollTop;
        
        // If they haven't scrolled enough, do nothing
        if (Math.abs(lastScrollTop - st) <= delta) return;
        
        // If scrolling down AND passed the navbar area
        if (st > lastScrollTop && st > 100) {
            navbar.classList.add('nav-up');
            hamburger.classList.add('nav-up');
        } else {
            // Scrolling up
            navbar.classList.remove('nav-up');
            hamburger.classList.remove('nav-up')
        }
        
        lastScrollTop = st;
    }, { passive: true });
}