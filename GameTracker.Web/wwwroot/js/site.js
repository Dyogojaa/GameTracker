window.themeManager = {
    setTheme: function (theme) {
        document.body.setAttribute('data-theme', theme);
    },
    getTheme: function () {
        return document.body.getAttribute('data-theme') || 'light';
    },
    saveTheme: function (theme) {
        localStorage.setItem('tema', theme);
    },
    loadTheme: function () {
        return localStorage.getItem('tema') || 'light';
    }
};
