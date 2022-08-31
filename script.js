var code_document_json = []
var configurations_gui = {}
var last_used_code = null;

function update_code_document_json(code, document, update_viewer = true) {
  code_document_json.push({
    code: code,
    document: document
  });
  last_used_code = code;
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
    document_navigation_item.innerText = i + '. ' + document_contents[i].substring(0, 50) + '...'; // arma los botones con un cachito de contenido
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
  var mcr_gui_main = document.getElementById('mcr_gui_main');
  var mcr_gui_sidebar = document.getElementById('mcr_gui_sidebar');

  /* insert title and documentation for GUI type */
  // var title = document.createElement('h1');
  // title.innerText = gui_type;
  // mcr_gui_main.appendChild(title);

  /* insert configurations div */
  var configurations_gui_div = document.createElement('div');
  configurations_gui_div.setAttribute('id', 'configurations_gui_div');
  mcr_gui_main.appendChild(configurations_gui_div);

  /* insert document navigation */
  document_navigation = document.createElement('div');
  document_navigation.setAttribute('id', 'document_navigation');
  mcr_gui_sidebar.appendChild(document_navigation);
  insert_document_navigation(documents , document_navigation);

  /* insert memos div */
  var memos_div = document.createElement('div');
  memos_div.setAttribute('id', 'memos_div');
  mcr_gui_main.appendChild(memos_div);
  memos_div.textContent = "Memos";

  /* insert document properties div */
  var document_properties_div = document.createElement('div');
  document_properties_div.setAttribute('id', 'document_properties_div');
  mcr_gui_main.appendChild(document_properties_div);
  document_properties_div.textContent = "Document properties / links for doc navigation";
  
  /* insert document viewer */
  var document_viewer = document.createElement('div');
  document_viewer.setAttribute('id', 'document_viewer');
  mcr_gui_main.appendChild(document_viewer);

  /* insert code buttons */
  var buttons_wrapper = document.createElement('div')
  buttons_wrapper.setAttribute('id', 'code_buttons_wrapper');
  mcr_gui_main.appendChild(buttons_wrapper);
  insert_code_buttons( codes , buttons_wrapper );

  /* insert in vivo code button */
  var in_vivo_code_button = document.createElement('input');
  in_vivo_code_button.setAttribute('type', 'button');
  in_vivo_code_button.setAttribute('class', 'btn btn-primary');
  in_vivo_code_button.value = "In vivo code";
  in_vivo_code_button.onclick = function (evt) {
  var documentText = document.getElementById('document_viewer').innerText;
  if (document.getSelection) {
    update_code_document_json(
      code = document.getSelection().toString(),
      document = documentText);
      codes.push(document.getSelection().toString());
      insert_code_buttons( codes , buttons_wrapper );
  }
  };
  buttons_wrapper.appendChild(in_vivo_code_button);

  /* insert open code button */
  var open_code_button = document.createElement('input');
  open_code_button.setAttribute('type', 'button');
  open_code_button.setAttribute('class', 'btn btn-primary');
  open_code_button.value = "Open code";
  var documentText = document.getElementById('document_viewer').innerText;
  open_code_button.onclick = function (evt) {
    var code = prompt("Please enter your code", "");
    if (code != null) {
      update_code_document_json(
        code = code,
        document = documentText);
        codes.push(code);
        insert_code_buttons( codes , buttons_wrapper );
    }
  };
  buttons_wrapper.appendChild(open_code_button);

  /* insert last used codes button */
  var last_used_codes_button = document.createElement('input');
  last_used_codes_button.setAttribute('type', 'button');
  last_used_codes_button.setAttribute('class', 'btn btn-primary');
  last_used_codes_button.value = "Last used code";
  last_used_codes_button.onclick = function (evt) {
  if (last_used_code != null) {
    update_code_document_json(
      code = last_used_code,
      document = documentText);
  }
  };
  buttons_wrapper.appendChild(last_used_codes_button);
  
  /* insert code_document_json viewer */
  var code_document_json_viewer = document.createElement('div');
  code_document_json_viewer.setAttribute('id', 'code_document_json_viewer');
  mcr_gui_main.appendChild(code_document_json_viewer);
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
  mcr_gui_main.appendChild(download_export_json_button);
}

/* trigger alert on windown close */
window.onbeforeunload = function(e) {
  return 'Please make sure to save your work before leaving this page.';
};

/* document selected, toggle class and change color */
$('.document_navigation_item').click(function() {
  $('.document_navigation_item').removeClass('document_active');
  /*
  // get element class document_navigation_item with content_i = i
  var i = $(this).attr('content_i');
  var document_active = $('.document_navigation_item[content_i="' + i + '"]');
  document_active.addClass('document_active');
  */
});


/* keyloger */

/* GUIs 2do */

// keyboard shortcuts for labels (with configuration button to activate/deactivate)

/*
document.addEventListener('keyup', function (event) {
  console.log(event.key);
});
document.addEventListener('keyup', function (event) {
  if (event.ctrlKey && event.key === 'b') {
      var element = document.getElementById('document_viewer');
      element.style.display = 'block';
      element.style.backgroundColor = 'red';
  }
});
*/
