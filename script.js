
var code_document_json = []

function update_code_document_json(code, document, update_viewer = true) {
  code_document_json.push({
    code: code,
    document: document
  });
  if (update_viewer) {
    refresh_code_document_json_viewer();
  }
  console.log(code_document_json);
}

function insert_code_buttons(arr , buttons_wrapper) {  
  for (var i = 0; i < arr.length; i++) {
    var codeBtn = document.createElement('input');
    codeBtn.setAttribute('type', 'button');
    codeBtn.setAttribute('class', 'btn btn-primary');    
    codeBtn.value = arr[i];
    codeBtn.onclick = function (evt) {
      var documentText = document.getElementById('document_viewer').innerText;
      update_code_document_json(
        code = evt.target.value,
        document = documentText);   
    };
    buttons_wrapper.appendChild(codeBtn);
  }
}

function insert_document_navigation(document_contents , document_navigation) {
  for (var i = 0; i < document_contents.length; i++) {
    var document_navigation_item = document.createElement('span');
    document_navigation_item.setAttribute('class', 'document_navigation_item');
    document_navigation_item.innerText = i + ' ' + document_contents[i].substring(0, 15) + '...'; // arma los botones con un cachito de contenido
    document_navigation_item.setAttribute('content_i', i);// guardo el iterador
    document_navigation_item.setAttribute('content_value', document_contents[i]); // guardo el contenido, por las dudas en una propiedad del boton
    document_navigation_item.onclick = function (evt) {
      var content_value = evt.target.getAttribute('content_value');
      view_document_content(content_value);
    };
    document_navigation.appendChild(document_navigation_item);
  }
}

function view_document_content(document_content) {
  var document_viewer = document.getElementById('document_viewer');
  document_viewer.innerText = document_content;
}
  
function refresh_code_document_json_viewer() {
  var code_document_json_viewer = document.getElementById('code_document_json_viewer');
  code_document_json_viewer.innerText = JSON.stringify(this.code_document_json);
}

function start_front( codes , documents, gui_type = "document-x-1-code",  ) {
  console.log("starting front");
  console.log(codes);
  console.log(documents);

  /* front markup */
  var front_wrapper = document.getElementById('front_wrapper');

  /* insert title and documentation for GUI type */
  var title = document.createElement('h1');
  title.innerText = gui_type;
  front_wrapper.appendChild(title);

  /* insert document navigation */
  var document_navigation = document.createElement('div');
  document_navigation.setAttribute('id', 'document_navigation');
  front_wrapper.appendChild(document_navigation);
  insert_document_navigation(documents , document_navigation);

  /* insert document viewer */
  var document_viewer = document.createElement('div');
  document_viewer.setAttribute('id', 'document_viewer');
  front_wrapper.appendChild(document_viewer);

  /* insert code buttons */
  var buttons_wrapper = document.createElement('div')
  buttons_wrapper.setAttribute('id', 'code_buttons_wrapper');
  front_wrapper.appendChild(buttons_wrapper);
  insert_code_buttons( codes , buttons_wrapper ) 

  /* insert code_document_json viewer */
  var code_document_json_viewer = document.createElement('div');
  code_document_json_viewer.setAttribute('id', 'code_document_json_viewer');
  front_wrapper.appendChild(code_document_json_viewer);
  refresh_code_document_json_viewer();
    
  /* insert export json button to download data*/
  const download_export_json_button = document.createElement('a');
  download_export_json_button.setAttribute('id', 'download_export_json_button');
  download_export_json_button.innerText = 'export json';
  download_export_json_button.onclick = function (evt) {
    var data = JSON.stringify(code_document_json);
    var blob = new Blob([data], {type: "text/json;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    download_export_json_button.href = url;
    download_export_json_button.download = "code_document_json.json";
  }
  front_wrapper.appendChild(download_export_json_button);
}

/* trigger alert on windown close */
window.onbeforeunload = function(e) {
  return 'Please make sure to save your work before leaving this page.';
};