export function anchor() {

  let btnTop = document.querySelector('.anchor');

  window.addEventListener('DOMContentLoaded', function () {

    //to head

    btnTop.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector('.header').scrollIntoView({ behavior: 'smooth' });

    });

    window.onscroll = function () {
      if (window.pageYOffset > 450) {
        btnTop.classList.remove('anchor--hidden')
      }

      else {
        btnTop.classList.add('anchor--hidden')
      }
    }
  });


}

