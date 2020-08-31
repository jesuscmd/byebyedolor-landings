var rtime = "";
var timeout = false;
var delta = 200;
// SELECTORES
var $clasification = $(".clasification");
var $clasificationParallax = $(".clasification-parallax");
var $reasons = $(".reasons .col-md-6");
var $reasonsImg = $(".reasons-img");

var windowWidth = window.innerWidth;

//INTRO PARALLAX
var controller = new ScrollMagic.Controller();
var sceneClasification = null;
var sceneReasons = null;
var isReasonsSceneEnabled = false;

var updateSizes = function () {
  windowWidth = window.innerWidth;
  clasificationCurrent =
    $clasification.height() - $clasificationParallax.height();
  isReasonsSceneEnabled = sceneReasons.enabled();

  if (windowWidth > 767) {
    if (!isReasonsSceneEnabled) {
      sceneReasons.enabled(true);
      sceneReasons.setPin(".reasons-img");
    }
  } else {
    if (isReasonsSceneEnabled) {
      sceneReasons.enabled(false);
      sceneReasons.removePin(true);
    }
  }
  if (isReasonsSceneEnabled) {
    if ($reasons.height() - 18 < $reasonsImg.height()) {
      $reasonsImg.height($reasons.height() - 18)
      $reasonsImg.css({ maxHeight: $reasonsImg.height + "px" })
    } else {
      $reasonsImg.height("auto")
      $reasonsImg.css({ maxHeight: $reasonsImg.height + "px" })
    }
    reasonsCurrent = $reasons.height() - $reasonsImg.height();
    if ($reasons.height() > $reasonsImg.height() - 18) {
      sceneReasons.duration(reasonsCurrent > 0 ? reasonsCurrent - 18 : 1);
    }
  }

  sceneClasification.duration(
    clasificationCurrent > 0 ? clasificationCurrent : 0
  );
};

$(window).resize(function () {
  rtime = new Date();
  if (timeout === false) {
    timeout = true;
    setTimeout(resizeend, delta);
  }
});

function resizeend() {
  if (new Date() - rtime < delta) {
    setTimeout(resizeend, delta);
  } else {
    timeout = false;
    updateSizes();
  }
}

$(document).ready(function () {
  new ScrollMagic.Scene({
    triggerElement: ".intro-parallax",
    triggerHook: "onEnter",
    duration: "200%",
  })
    .setTween(".intro-parallax-img", { y: "80%", ease: Linear.easeNone })
    .addTo(controller);

  sceneReasons = new ScrollMagic.Scene({
    triggerHook: "onLeave",
    triggerElement: ".reasons .col-md-6",
  })
    .setPin(".reasons-img")
    .addTo(controller);

  sceneClasification = new ScrollMagic.Scene({
    triggerHook: "onLeave",
    triggerElement: ".clasification",
  })
    .setPin(".clasification-parallax")
    .addTo(controller);

  updateSizes();
});

// TWIITER CODE
window.twttr = (function (d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0],
    t = window.twttr || {};
  if (d.getElementById(id)) return t;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js, fjs);

  t._e = [];
  t.ready = function (f) {
    t._e.push(f);
  };
  return t;
})(document, "script", "twitter-wjs");

