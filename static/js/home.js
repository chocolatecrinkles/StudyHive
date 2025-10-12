function toggleSidebar(){
  const side = document.getElementById('sideNav');
  const burger = document.querySelector('.burger-menu');
  const backdrop = document.getElementById('backdrop');
  const active = side.classList.toggle('active');
  burger.classList.toggle('active', active);
  backdrop.classList.toggle('active', active);
}
