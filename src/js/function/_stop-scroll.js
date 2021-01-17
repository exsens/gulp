export const disableScroll = () => {
	let header = document.querySelector('.header');
	let paddingOffset = window.innerWidth - document.body.offsetWidth + 'px';
	let paddingOffsetHead = window.innerWidth - header.offsetWidth + 'px';
	header.style.paddingRight = paddingOffsetHead;
	document.body.style.paddingRight = paddingOffset;

	let pagePosition = window.scrollY;
	document.body.classList.add('disable-scroll');
	document.body.dataset.position = pagePosition;
	document.body.style.top = -pagePosition + 'px';
}

export const enableScroll = () => {
	let header = document.querySelector('.header');
	let pagePosition = parseInt(document.body.dataset.position, 10);
	document.body.style.top = 'auto';
  document.body.classList.remove('disable-scroll');
  header.style.paddingRight = '0px';
  document.body.style.paddingRight = '0px';
	window.scroll({top: pagePosition, left: 0});
	document.body.removeAttribute('data-position');
}
