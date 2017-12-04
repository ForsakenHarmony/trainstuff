const {render} = require('./index');

const elem = document.getElementById('app');

let two = render(elem);

module.hot.accept('./index.js', () => {
  two.pause();
  two.renderer.domElement.remove();

  const {render} = require('./index');

  two = render(elem);
});

