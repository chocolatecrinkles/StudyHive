function toggleSidebar() {
    const sidebar = document.getElementById('sideNav');
    const burger = document.querySelector('.burger-menu');
    sidebar.classList.toggle('active');
    burger.classList.toggle('active');
}