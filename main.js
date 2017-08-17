/*** Square packing ***/

window.addEventListener("load", function() {

  var canvas = document.createElement("canvas");
  canvas.width = document.body.offsetWidth;
  canvas.height = document.body.offsetHeight;
  document.body.appendChild(canvas);

  var options = {};
  createSquareArt(canvas, options);

});


function createSquareArt(canvas, options) {
  var squareSize = options.squareSize || Math.min(canvas.width, canvas.height) * 0.15;
  var squares = [];
  packSquares(squares, canvas, squareSize);
  renderSquares(canvas, options, squares);
}

function packSquares(squares, canvas, squareSize) {
  var SHRINK = 0.8;
  var SIZE_THRESHOLD = 6;
  var PADDING = 6;
  var SHIFT = Math.floor(PADDING / 3);
  var SQUARES_THRESHOLD = 200;
  var MAX_FAILS = 1000;
  var MIN_STROKE = 1;
  var MAX_STROKE = 20;
  var pt = randomPoint(canvas);
  var fitDirection = randomFitDirection();
  var fitDirection2 = randomFitDirection2();
  var consecutiveFails = 0;

  while (true) {
    if (squares.length >= SQUARES_THRESHOLD) {
      console.log('placed all ' + SQUARES_THRESHOLD + ' squares');
      break;
    }

    var halfSize = squareSize / 2;
    if (!hitTest(pt, halfSize, squares, PADDING)) {
      consecutiveFails = 0;
      var color = getNextSquareColor();
      var filled = getNextSquareFillStyle();
      var stroke = filled ? 0 : getRandomFloat(MIN_STROKE, MAX_STROKE);
      if (stroke >= halfSize) {
        filled = true;
      }
      squares.push({
        x: pt.x,
        y: pt.y,
        size: squareSize,
        color: color,
        filled: filled,
        stroke: stroke
      });
      pt = randomPoint(canvas);
      fitDirection = randomFitDirection();
      fitDirection2 = randomFitDirection2();
      continue;
    }

    // move square and try again
    switch (fitDirection) {
      case 0:
        pt.x -= SHIFT;
        if (pt.x < -halfSize) {
          pt.x = canvas.width + halfSize;
          pt.y += SHIFT * fitDirection2;
        }
        break;
      case 1:
        pt.x += SHIFT;
        if (pt.x > canvas.width + halfSize) {
          pt.x = -halfSize;
          pt.y += SHIFT * fitDirection2;
        }
        break;
      case 2:
        pt.y -= SHIFT;
        if (pt.y < -halfSize) {
          pt.y = canvas.height + halfSize;
          pt.x += SHIFT * fitDirection2;
        }
        break;
      case 3:
        pt.y += SHIFT;
        if (pt.y > canvas.height + halfSize) {
          pt.y = -halfSize;
          pt.x += SHIFT * fitDirection2;
        }
        break;
    }

    // check for off screen
    if (pt.x <= 0 - halfSize
        || pt.x >= canvas.width + halfSize
        || pt.y <= 0 - halfSize
        || pt.y >= canvas.height + halfSize)
    {
      consecutiveFails++;
      if (squareSize <= SIZE_THRESHOLD && consecutiveFails > MAX_FAILS) {
        // console.log('squareSize:', squareSize, 'consecutiveFails:', consecutiveFails);
        break;
      }
      if (consecutiveFails > MAX_FAILS) {
        squareSize = SHRINK * squareSize;
        consecutiveFails = 0;
      }
      pt = randomPoint(canvas);
      fitDirection = randomFitDirection();
      fitDirection2 = randomFitDirection2();
    }
  }
  console.log('end');
}

function randomPoint(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  }
}

function randomFitDirection() {
  return Math.floor(Math.random() * 4);
}

function randomFitDirection2() {
  return Math.random() - 0.5 < 0 ? -1 : 1;
}

function hitTest(pt, halfSize, squares, padding) {
  for (var i=0; i < squares.length; i++) {
    var test = squares[i];
    var testHalfSize = test.size / 2 + padding;
    if (pt.x - halfSize <= test.x + testHalfSize
        && pt.x + halfSize >= test.x - testHalfSize
        && pt.y - halfSize <= test.y + testHalfSize
        && pt.y + halfSize >= test.y - testHalfSize
       ) {
      return true;
    }
  }
  return false;
}

function getNextSquareColor() {
  var r = getRandomInt(170, 190);
  var g = getRandomInt(220, 245);
  var b = getRandomInt(220, 245);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function getNextSquareFillStyle() {
  return (Math.random() - 0.5) < 0 ? true : false;
}

function getRandomFloat(min, max) {
  var diff = Math.abs(max - min);
  var realMin = Math.min(min, max);
  return Math.random() * diff + realMin;
}

function getRandomInt(min, max) {
  var diff = Math.abs(max - min);
  var realMin = Math.min(min, max);
  return Math.round(Math.random() * diff + realMin);
}

function renderSquares(canvas, options, squares) {
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  squares.forEach(function(square) {
    var halfSize = square.size / 2;
    if (square.filled) {
      ctx.fillStyle = square.color;
      ctx.fillRect(square.x - halfSize, square.y - halfSize, square.size, square.size);
    }
    else {
      var strokeOffset = square.stroke / 2;
      ctx.strokeStyle = square.color;
      ctx.lineWidth = square.stroke;
      ctx.beginPath();
      ctx.rect(square.x - halfSize + strokeOffset, square.y - halfSize + strokeOffset, square.size - square.stroke, square.size - square.stroke);
      ctx.stroke();
    }
  });
}
