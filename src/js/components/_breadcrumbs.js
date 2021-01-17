export function breadcrumbs() {

  const breadcrumbsLink = document.querySelectorAll('.breadcrumbs__item a');
  const lastLink = breadcrumbsLink[breadcrumbsLink.length - 1];
  
  const deleteLink = () => {
    lastLink.removeAttribute('href');
  };
  deleteLink();
}
