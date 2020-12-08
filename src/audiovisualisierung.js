/*
 * Audiovisualization using the html canvas element.
 * ©2017, Dominik Hofacker
 * https://www.behance.net/dominikhofacker
 * Please consider supporting this project on behance:
 * https://www.behance.net/gallery/49260123/Web-Audio-Visualization
 */

"use strict";

var rafID = null;
var analyser = null;
var c = null;
var cDraw = null;
var ctx = null;
var microphone = null;
var ctxDraw = null;

var filename;
var fileChosen = false;
var hasSetupUserMedia = false;

//handle different prefix of the audio context
var AudioContext = AudioContext || webkitAudioContext;
//create the context.
var context = new AudioContext();

//using requestAnimationFrame instead of timeout...
if (!window.requestAnimationFrame)
  window.requestAnimationFrame = window.webkitRequestAnimationFrame;

let { innerWidth, innerHeight } = window;

if (document.readyState === "interactive") {
  initBinCanvas();
} else {
  document.addEventListener("readystatechange", () => {
    if (document.readyState === "interactive") {
      initBinCanvas();
    }
  });
}

function useMic() {
  "use strict";
  if (!navigator.mediaDevices.getUserMedia) {
    alert("Your browser does not support microphone input!");
    console.log("Your browser does not support microphone input!");
    return;
  }

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(function (stream) {
      hasSetupUserMedia = true;
      //convert audio stream to mediaStreamSource (node)
      microphone = context.createMediaStreamSource(stream);
      //create analyser
      if (analyser === null) analyser = context.createAnalyser();
      //connect microphone to analyser
      microphone.connect(analyser);
      //start updating
      rafID = window.requestAnimationFrame(updateVisualization);

      onWindowResize();
      document.querySelectorAll("#freq, body").forEach((el) => {
        el.classList.add("animateHue");
      });

      document.querySelector("#useMicButton").style.display = "none";
    })
    .catch(function (err) {
      /* handle the error */
      alert(
        "Capturing microphone data failed! (currently only supported in Chrome & Firefox)"
      );
      console.log("capturing microphone data failed!");
      console.log(err);
    });
}

function initBinCanvas() {
  //add new canvas
  "use strict";
  c = document.getElementById("freq");
  c.width = innerWidth;
  c.height = innerHeight;
  //get context from canvas for drawing
  ctx = c.getContext("2d");

  ctx.canvas.width = innerWidth;
  ctx.canvas.height = innerHeight;

  window.addEventListener("resize", onWindowResize, false);

  //create gradient for the bins
  var gradient = ctx.createLinearGradient(
    0,
    c.height - 300,
    0,
    innerHeight - 25
  );
  gradient.addColorStop(1, "#00f"); //black
  gradient.addColorStop(0.75, "#f00"); //red
  gradient.addColorStop(0.25, "#f00"); //yellow
  gradient.addColorStop(0, "#ffff00"); //white

  ctx.fillStyle = "#9c0001";
}

function onWindowResize() {
  innerWidth = window.innerWidth;
  innerHeight = window.innerHeight;
  ctx.canvas.width = innerWidth;
  ctx.canvas.height = innerHeight;

  const container = document.querySelector("#song_info_wrapper");
  var containerHeight = container.getBoundingClientRect().height;
  var topVal = innerHeight / 2 - containerHeight / 2;
  container.style.top = topVal;
  console.log(topVal);
}

function reset() {
  if (typeof microphone !== "undefined") {
    microphone = null;
  }
}

function updateVisualization() {
  // get the average, bincount is fftsize / 2
  if (fileChosen || hasSetupUserMedia) {
    var array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    drawBars(array);
  }
  // setTextAnimation(array);

  rafID = window.requestAnimationFrame(updateVisualization);
}

function drawBars(array) {
  //just show bins with a value over the treshold
  var threshold = 0;
  // clear the current state
  ctx.clearRect(0, 0, c.width, c.height);
  //the max count of bins for the visualization
  var maxBinCount = array.length;

  ctx.save();

  ctx.globalCompositeOperation = "source-over";

  //console.log(maxBinCount); //--> 1024
  ctx.scale(0.5, 0.5);
  ctx.translate(innerWidth, innerHeight);
  ctx.fillStyle = "#fff";

  const windowWidth = innerWidth;
  var bass = Math.floor(array[1]); //1Hz Frequenz
  var radius =
    0.45 * windowWidth <= 450
      ? -(bass * 0.25 + 0.45 * windowWidth)
      : -(bass * 0.25 + 450);

  var bar_length_factor = 1;
  if (windowWidth >= 785) {
    bar_length_factor = 1.0;
  } else if (windowWidth < 785) {
    bar_length_factor = 1.5;
  } else if (windowWidth < 500) {
    bar_length_factor = 20.0;
  }
  // console.log(windowWidth);

  //go over each bin
  for (var i = 0; i < maxBinCount; i++) {
    var value = array[i];
    if (value >= threshold) {
      //draw bin
      //ctx.fillRect(0 + i * space, c.height - value, 2 , c.height);
      //ctx.fillRect(i * space, c.height, 2, -value);
      ctx.fillRect(
        0,
        radius,
        windowWidth <= 450 ? 2 : 3,
        -value / bar_length_factor
      );
      ctx.rotate(((180 / 128) * Math.PI) / 180);
    }
  }

  for (var i = 0; i < maxBinCount; i++) {
    var value = array[i];
    if (value >= threshold) {
      //draw bin
      //ctx.fillRect(0 + i * space, c.height - value, 2 , c.height);
      //ctx.fillRect(i * space, c.height, 2, -value);
      ctx.rotate((-(180 / 128) * Math.PI) / 180);
      ctx.fillRect(
        0,
        radius,
        windowWidth <= 450 ? 2 : 3,
        -value / bar_length_factor
      );
    }
  }

  for (var i = 0; i < maxBinCount; i++) {
    var value = array[i];
    if (value >= threshold) {
      //draw bin
      //ctx.fillRect(0 + i * space, c.height - value, 2 , c.height);
      //ctx.fillRect(i * space, c.height, 2, -value);
      ctx.rotate(((180 / 128) * Math.PI) / 180);
      ctx.fillRect(
        0,
        radius,
        windowWidth <= 450 ? 2 : 3,
        -value / bar_length_factor
      );
    }
  }

  ctx.restore();
}
