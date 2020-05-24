var abspath = function(href) {
  var link = document.createElement("a");
  link.href = href;
  return link.href;
};
console.log("URL Fix active");
function patch(sel, prop) {
  let elems = document.getElementsByTagName(sel);
  console.log("Got " + elems.length + " elements querying selector " + sel);
  for (var i = 0; i < elems.length; i++) {
    let url = elems[i][prop];
    let urlobj = false;
    try {
      urlobj = new URL(url);
    } catch (ex) {}
    console.log("Patching " + url);
    if (
      (!urlobj || !urlobj.pathname.startsWith("/cors")) &&
      !url.includes("/cors/") &&
      !url.includes(window.location.host) && !(
        url.startsWith("data:") || url.startsWith("javascript:") || url.startsWith("blob:")
      )
    ) {
      url = "/cors/" + abspath(url);
      elems[i][prop] = url;
    }
  }
}
function patchall() {
  patch("img", "src");
  patch("video", "src");
  patch("script", "src");
  patch("a", "href");
  patch("link", "href");
}
patchall();
window.addEventListener("load", patchall);
document.addEventListener("load", patchall);
document.body.addEventListener("load", patchall);
if(!networkPatched){
  var networkPatched = true;
  
}