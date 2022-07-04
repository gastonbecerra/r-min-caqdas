function arrancar() {
  var elem = document.getElementById('content'); 
  elem.innerHTML = "<p>hola</p>"
}


function demojs() {
  var elem = document.getElementById('sampleanimation'); 
  var position = 0;
  var id = setInterval(frame, 10);
  function frame() {
    if (position == 350) {
      clearInterval(id);
    } else {
      position++;
      elem.style.top = position + 'px';
      elem.style.left = position + 'px';
    }

  }

}
