const SideMenuDirective = () => {

  return {
    restrict: 'A',
    link(scope, element, attrs) {
      /* handle sidebar hiding */
      const body = $('body');
      const content = $('.page-content');

      $('.menu-open-close').on('click', () => {
        body.toggleClass('menu-toggled');
        if (body.hasClass('menu-toggled')) {
          content.prepend('<div id="content-toggled">');
        } else {
          $('#content-toggled').remove();
        }
      });

      $(window).resize(() => {
        if (window.innerWidth >= 1100 && body.hasClass('menu-toggled')) {
          body.toggleClass('menu-toggled', false);
          $('#content-toggled').remove();
        }
      });
      content.on('click', '#content-toggled', () => {
        body.toggleClass('menu-toggled', false);
        $('#content-toggled').remove();
      });
    }
  };
};

export default SideMenuDirective;
