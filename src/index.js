import Two from 'two.js';

const createGrid = (size = 30) => {
  const two = new Two({
    type: Two.Types.canvas,
    width: size,
    height: size
  });

  two.makeLine(0, 0, two.width, 0);
  two.makeLine(0, 0, 0, two.height);
  // two.makeLine(0, 0, two.width, two.height);
  // two.makeLine(0, two.height, two.height, 0);

  two.update();

  window.requestAnimationFrame(() => {
    document.body.style.background =
      'url(' + two.renderer.domElement.toDataURL('image/png') + ') 0 0 repeat';
    document.body.style.backgroundSize = size + 'px ' + size + 'px';
  });
};

/**
 * @param gs [Number] - Gridsize
 * @param pos [Object] - Position
 * @returns {*}
 */
const snapToGrid = (gs, { x, y }) => {
  const ox = x % gs; // offsetX
  const oy = y % gs; // offsetY

  const rx = x - ox; // x - offset
  const ry = y - oy; // y - offset

  const rox = ox / gs; // relative offset x
  const roy = oy / gs; // relative offset y

  // console.log(rox, roy);
  // console.log(rox - roy);
  // console.log(rox + roy);

  if (rox > roy) {
    if (rox + roy < 1) {
      return {
        x: rx + gs / 2,
        y: ry,
      }
    } else {
      return {
        x: rx + gs,
        y: ry + gs / 2,
      }
    }
  } else {
    if (rox + roy < 1) {
      return {
        x: rx,
        y: ry + gs / 2,
      }
    } else {
      return {
        x: rx + gs / 2,
        y: ry + gs,
      }
    }
  }
};

const calcFactor = (gs, p1, p2) => {
  const diff = Math.abs(p1 - p2) / gs;
  const mul = diff * gs / 2;
  return mul;
};

const calcControl = (gs, last, current) => {
  const { x: x1, y: y1 } = last;
  const { x: x2, y: y2 } = current;

  const fx = calcFactor(gs, x1, x2);
  const fy = calcFactor(gs, y1, y2);

  if (last.dir === 'x') {
    last.controls.right.y = 0;
    last.controls.right.x = x1 < x2 ? fx : -fx;
  } else {
    last.controls.right.x = 0;
    last.controls.right.y = y1 < y2 ? fy : -fy;
  }

  if (current.dir === 'x') {
    current.controls.left.y = 0;
    current.controls.left.x = x1 > x2 ? fx : -fx;
  } else {
    current.controls.left.x = 0;
    current.controls.left.y = y1 > y2 ? fy : -fy;
  }
};

export const render = () => {
  const two = new Two({
    type: Two.Types.webgl,
    fullscreen: true,
    autostart: true
  }).appendTo(document.getElementById('app'));

  const gridSize = 32;
  createGrid(gridSize);

  const canvas = two.renderer.domElement;

  let mousePos = { x: 0, y: 0 };

  const anchors = [];

  let path = new Two.Path(anchors, false, false, true);
  path.fill = 'none';
  path.linewidth = 5;
  two.add(path);
  window.path = path;

  let lastAnchor = null;
  canvas.addEventListener('click', () => {
    const { x, y } = mousePos;
    const anchor = new Two.Anchor(x, y, 0, 0, 0, 0);
    anchor.command = Two.Commands.curve;
    if (lastAnchor) {
      if (x % gridSize === 0) {
        anchor.dir = 'x';
      } else {
        anchor.dir = 'y';
      }
      calcControl(gridSize, lastAnchor, anchor);
    } else {
      anchor.command = Two.Commands.move
    }
    lastAnchor = anchor;
    anchors.push(anchor);
    path.vertices = anchors;
  });
  canvas.addEventListener('mousemove', e => {
    let { clientX: x, clientY: y } = e;
    mousePos = snapToGrid(gridSize, { x, y });
    // console.log(x, y);
  });

  const circle = two.makeCircle(0, 0, 5);
  circle.fill = 'green';
  two.bind('update', () => {
    circle.translation.x = mousePos.x;
    circle.translation.y = mousePos.y;
  });

  return two;
};
