var code_document_json = []

function update_code_document_json(index, code, document, update_viewer = true) {
  index = Number(index);
  code_document_json.push({
    index: index,
    code: code,
    document: document
  });
  if (update_viewer) {
    refresh_code_document_json_viewer();
  }
}

function insert_code_buttons(arr , buttons_wrapper) {  
  for (var i = 0; i < arr.length; i++) {
    var codeBtn = document.createElement('input');
    codeBtn.setAttribute('type', 'button');
    codeBtn.setAttribute('class', 'btn btn-primary');    
    codeBtn.value = arr[i];
    codeBtn.onclick = function () {
      var documentText = document.getElementById('documentText').innerText;
      var documentIndex = document.getElementById('documentIndex').innerText;
      update_code_document_json(
        index = documentIndex, 
        code = arr[i],
        document = documentText);   
    };
    buttons_wrapper.appendChild(codeBtn);
  }
}
  
function refresh_code_document_json_viewer() {
  var code_document_json_viewer = document.getElementById('code_document_json_viewer');
  code_document_json_viewer.innerHTML = JSON.stringify(this.code_document_json);
}

function start_front( codes ) {
  console.log("starting front");
  
  /* front markup */
  var front_wrapper = document.getElementById('front_wrapper');

  /* insert code buttons */
  var buttons_wrapper = document.createElement('div')
  buttons_wrapper.setAttribute('id', 'code_buttons_wrapper');
  front_wrapper.appendChild(buttons_wrapper);
  insert_code_buttons( arr = codes , placeholder = buttons_wrapper ) 

  /* insert code_document_json viewer */
  var code_document_json_viewer = document.createElement('div');
  code_document_json_viewer.setAttribute('id', 'code_document_json_viewer');
  front_wrapper.appendChild(code_document_json_viewer);
  refresh_code_document_json_viewer();
}