(async function() {
  var package = os.runningPackages[document.currentScript.id];
  var mainWindowRaw = await package.resource("main.html");
  package.createWindow(atob(mainWindowRaw), {
    resizable: true,
    startingDemensions: [800, 600]
  });
  console.log("Injecting urlfixes");
  let elems = document.getElementsByClassName("webbrowser");
  for (var i = 0; i < elems.length; i++) {
    var iFrame = elems[i].contentWindow.document.body;
    var myscript = elems[i].contentWindow.document.createElement("script");
    myscript.type = "text/javascript";
    myscript.src = "/urlfix.js"; // Urlfix script path
    iFrame.appendChild(myscript);
    iFrame.onload = fixIframes;
  }
  console.log("Started Binding");
  let omnis = document.getElementsByClassName("omnibox");
  for (var i = 0; i < omnis.length; i++) {
    omnis[i].addEventListener("keyup", function(e) {
      browser.loadFromInputEvent(e);
    });
    omnis[i].addEventListener("keypress", function(e) {
      browser.loadFromInputEvent(e);
    });
  }
  let gobuttons = document.getElementsByClassName("gobutton");
  for (var i = 0; i < omnis.length; i++) {
    gobuttons[i].addEventListener("click", function(e) {
      browser.loadFromInputEvent(e);
    });
  }
})();
function fixIframes() {
  let elems = document.getElementsByClassName("webbrowser");
  for (var i = 0; i < elems.length; i++) {
    var iFrame = elems[i].contentWindow.document.body;
    var myscript = elems[i].contentWindow.document.createElement("script");
    myscript.type = "text/javascript";
    myscript.src = "/urlfix.js"; // replace this with your SCRIPT
    iFrame.appendChild(myscript);
    for (var j = 0; j < elems[i].parentElement.children.length; j++) {
      if (elems[i].parentElement.children[j].classList.contains("omnibox")) {
        elems[i].parentElement.children[j].value = elems[
          i
        ].contentWindow.location.href.slice(
          (window.location.href + "/cors/").length - 1
        );
      }
    }
  }
}
function getBrowserInstance(elem) {
  for (var i = 0; i < elem.parentElement.children.length; i++) {
    //console.log(elem.parentElement.children[i].classList);
    if (elem.parentElement.children[i].classList.contains("webbrowser")) {
      return elem.parentElement.children[i];
    }
  }
}
var browser = {
  forward: function(elem) {
    getBrowserInstance(elem).contentWindow.history.forward();
  },
  back: function(elem) {
    getBrowserInstance(elem).contentWindow.history.back();
  },
  loadFromInput: function(elem) {
    this.load(elem, elem.value);
  },
  loadFromInputEvent: function(event) {
    if (event.which != 13) {
      return;
    }
    this.loadFromInput(event.target);
  },
  loadFromClickEvent: function(e) {
    this.loadFromInput(e.target);
  },
  load: function(elem, url) {
    console.log("Loading " + url);
    getBrowserInstance(elem).src = "/cors/" + url;
  }
};

console.log("Web Browser loaded");
