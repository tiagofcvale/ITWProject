(() => {
    'use strict'

    const getStoredTheme = () => localStorage.getItem('theme')
    const setStoredTheme = theme => localStorage.setItem('theme', theme)

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme()
        if (storedTheme) {
            return storedTheme
        }

        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    const setTheme = theme => {
        if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-bs-theme', 'dark')
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme)
        }
    }

    setTheme(getPreferredTheme())

    const showActiveTheme = (theme, focus = false) => {
        const themeSwitcher = document.querySelector('#bd-theme')

        if (!themeSwitcher) {
            return
        }

        const themeSwitcherText = document.querySelector('#bd-theme-text')
        const activeThemeIcon = document.querySelector('.theme-icon-active')
        const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`)

        document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
            element.classList.add('opacity-50');
            element.setAttribute('aria-pressed', 'false');
        })

        btnToActive.setAttribute('aria-pressed', 'true');
        btnToActive.classList.remove('opacity-50')

        if (focus) {
            themeSwitcher.focus()
        }
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme()
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
            setTheme(getPreferredTheme())
        }
    })

    window.addEventListener('DOMContentLoaded', () => {
        showActiveTheme(getPreferredTheme())

        document.querySelectorAll('[data-bs-theme-value]')
            .forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const theme = toggle.getAttribute('data-bs-theme-value')
                    setStoredTheme(theme)
                    setTheme(theme)
                    showActiveTheme(theme, true)
                })
            })
    })
    function setInitialBackground() {
        const container = document.querySelector('.theme-container');
        
        if (document.body.classList.contains('dark-mode')) {
            container.classList.add('bg-dark');
            container.classList.remove('bg-light');
        } else {
            container.classList.add('bg-light');
            container.classList.remove('bg-dark');
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-container').classList.add('bg-dark');
            document.querySelector('.theme-container').classList.remove('bg-light');
        } else {
            document.body.classList.remove('dark-mode');
            document.querySelector('.theme-container').classList.add('bg-light');
            document.querySelector('.theme-container').classList.remove('bg-dark');
        }
    
        setInitialBackground();
    });
    
    document.getElementById('theme-light').addEventListener('click', function() {
        const container = document.querySelector('.theme-container');
        container.classList.add('bg-light');
        container.classList.remove('bg-dark');
        document.body.classList.remove('dark-mode');
    
        localStorage.setItem('theme', 'light');
    });
    
    document.getElementById('theme-dark').addEventListener('click', function() {
        const container = document.querySelector('.theme-container');
        container.classList.add('bg-dark');
        container.classList.remove('bg-light');
        document.body.classList.add('dark-mode');
    
        localStorage.setItem('theme', 'dark');
    });
})()

function setInitialBackground() {
    const container = document.querySelector('.theme-container');
    if (document.body.classList.contains('dark-mode')) {
        container.classList.add('bg-dark');
        container.classList.remove('bg-light');
    } else {
        container.classList.add('bg-light');
        container.classList.remove('bg-dark');
    }
}

document.getElementById('theme-light').addEventListener('click', function() {
    const container = document.querySelector('.theme-container');
    container.classList.add('bg-light');
    container.classList.remove('bg-dark');
    document.body.classList.remove('dark-mode');
});

document.getElementById('theme-dark').addEventListener('click', function() {
    const container = document.querySelector('.theme-container');
    container.classList.add('bg-dark');
    container.classList.remove('bg-light');
    document.body.classList.add('dark-mode');
});


document.addEventListener('DOMContentLoaded', setInitialBackground);