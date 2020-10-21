export function brgMenu() {
  let brg = document.querySelector('.burger');
  window.addEventListener('DOMContentLoaded', function () {
    brg.addEventListener('click', function (e) {
      e.preventDefault();
      this.classList.toggle('close');
    });
  });
}