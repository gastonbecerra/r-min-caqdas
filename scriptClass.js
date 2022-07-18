class GUI {  

  constructor( gui_type ) {  // 2do: esto puede ser un parametro para distintos GUIS
    this.type = 'CODE_DOCUMENT';
  }
  
  code_document_json = {}
  var self = this;
  
  insert_code_buttons(arr , buttons_wrapper) { 
    for (var i = 0; i < arr.length; i++) {
      var codeBtn = document.createElement('input');
      codeBtn.setAttribute('type', 'button');
      codeBtn.setAttribute('class', 'btn btn-primary');    
      codeBtn.value = arr[i];
      codeBtn.onclick = function () {
        // this.code_document( codeBtn.value );
        alert(this.value);
      };
      buttons_wrapper.appendChild(codeBtn);
    }
  }
  
  code_document( code ) {
    var documentText = document.getElementById('documentText').innerText;
    var documentCode = { document : documentText , code : code }
    this.code_document_json = { ...code_document_json , ...documentCode };
    console.log(code_document_json);
    refresh_code_document_json_viewer();
  }
  
  refresh_code_document_json_viewer() {
    var code_document_json_viewer = document.getElementById('code_document_json_viewer');
    code_document_json_viewer.innerHTML = JSON.stringify(code_document_json);
  }

}

function start_front( codes ) {
  console.log("starting front");
  var gui = new GUI();  

  // FRONT MARKUP
  var front_wrapper = document.getElementById('front_wrapper');

  // INSERT CODE_DOCUMENT VIEWER
  var code_document_json_viewer = document.createElement('div');
  code_document_json_viewer.setAttribute('id', 'code_document_json_viewer');
  front_wrapper.appendChild(code_document_json_viewer);

  // INSERT CODE BUTTONS
  var buttons_wrapper = document.createElement('div')
  buttons_wrapper.setAttribute('id', 'code_buttons_wrapper');
  front_wrapper.appendChild(buttons_wrapper);
  gui.insert_code_buttons( arr = codes , placeholder = buttons_wrapper ) 
}