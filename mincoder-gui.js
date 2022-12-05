// ------------------------------------------------------------------------------------------------------
// PENDIENTES
// ------------------------------------------------------------------------------------------------------

// 2do: codes to central panel with text input filter; sorted by az and by frequency
// 2do: switch to apply to document/fragment
// 2do: show codes as labels below document viewer
// 2do: show codes as XML tags in document viewer
// 2do: include CSS for the tags in document viewer
// 2do: export to XML or https://programminghistorian.org/es/lecciones/introduccion-a-tei-1?s=08#xml-y-tei-hacia-un-est%C3%A1ndar-de-codificaci%C3%B3n-de-textos

// ------------------------------------------------------------------------------------------------------
// vars and default values
// ------------------------------------------------------------------------------------------------------

var output = [];
var current_document_i = false; 
var last_used_code = false;
var last_coded_document_i = false;
var last_coded_fragment_id = false;
var selected_text = false;
var selected_range_start = false;
var selected_range_end = false;
var current_fragment = false;
var current_fragment_id = false;
var changes_since_export = false;   //2do: no lo estoy trackeando

var show_monitor = false;
var annotation_user = false;

function dump_output() {
    if (!show_monitor) { $("#dump_output").hide(); }
    $("#dump_output").html( 
        "current_document_i: " + current_document_i + "<br>" +
        "last_used_code: " + last_used_code + "<br>" +
        "last_coded_document_i: " + last_coded_document_i + "<br>" +
        "last_coded_fragment_id: " + last_coded_fragment_id + "<br>" +
        "selected_text: " + selected_text + "<br>" +
        "selected_range_start: " + selected_range_start + "<br>" +
        "selected_range_end: " + selected_range_end + "<br>" +
        "current_fragment: " + current_fragment + "<br>" +
        "current_fragment_id: " + current_fragment_id + "<br>" +
        "changes_since_export: " + changes_since_export + "<br>" +

        "show_monitor: " + show_monitor + "<br>" +
        "annotation_user: " + annotation_user + "<br>" +
        "<pre>" + JSON.stringify(output, null, '\t') + "</pre>" 
     );
}

// ------------------------------------------------------------------------------------------------------
// data handling fns
// ------------------------------------------------------------------------------------------------------

function get_codes() {
    var codes = [];
    for (var i = 0; i < output.codes.length; i++) {
        codes.push(output.codes[i]);
    }
    return codes;
}

function get_code_i(code) {
    var codes = get_codes();
    for (var i = 0; i < codes.length; i++) {
        if (codes[i] == code) { return i; }
    }
    return false;
}

function set_new_code( code ) {

    output.codes.push(code);
    return( get_code_i(code) );
}

function get_documents() {
    var docs = [];
    for (var i = 0; i < output.documents.length; i++) {
        docs.push(output.documents[i]);
    }
    return docs;
}

function set_documents_annotations( document_i , code_i = false , memo = false , selected_tokens = false ) {
    document_i = parseInt(document_i);
    var is_new_document = true;
    
    for (var i = 0; i < output.documents_annotations.length; i++) {
        if (output.documents_annotations[i].document == document_i) {
            is_new_document = false;
            
            if (code_i) {
                code_i = parseInt(code_i);    
                if ( output.documents_annotations[i].codes.indexOf( code_i ) === -1 ) {
                    output.documents_annotations[i].codes.push( code_i );
                    last_used_code = code_i;
                    last_coded_document_i = document_i;
                } else {
                    output.documents_annotations[i].codes.splice( output.documents_annotations[i].codes.indexOf( code_i ), 1 );
                }
            }
            
            if (memo) {
                output.documents_annotations[i].memo = memo;
            }
            if (memo=="") {
                output.documents_annotations[i].memo = "";
            }
            
            if (selected_tokens) {
            }

            output.documents_annotations[i].annotation_update = new Date();
            output.documents_annotations[i].annotation_user = annotation_user; 
        }
    }

    if (is_new_document) {
        if (code_i) { 
            code_i = [ parseInt(code_i) ] ; 
            last_used_code = code_i ; 
            last_coded_document_i = document_i ; 
        } else { code_i = []; } 
        if (memo) {} else { memo = ""; }
        output.documents_annotations.push({
            "document": document_i,
            "codes": code_i,
            "memo": memo,
            // "selected_tokens": [],  //v2
            "annotation_update": new Date(),
            "annotation_user": annotation_user,
        });
    } 
    dump_output();
}

function get_document_codes( document_i ) {
    document_i = parseInt(document_i);
    var codes = [];
    for (var i = 0; i < output.documents_annotations.length; i++) {
        if (output.documents_annotations[i].document == document_i) { 
            codes = output.documents_annotations[i].codes;
        }
    }
    return codes;
}

function get_document_memo( document_i ) {
    document_i = parseInt(document_i);
    var memo = "";
    for (var i = 0; i < output.documents_annotations.length; i++) {
        if (output.documents_annotations[i].document == document_i) {
            memo = output.documents_annotations[i].memo;
        }
    }
    return memo;
}

function set_fragment( document_i , fragment_text ) {
    document_i = parseInt(document_i);
    var id = idx();
    output.fragments_annotations.push({
        "id": id,
        "document": document_i,
        "text": fragment_text,
        "start": selected_range_start,
        "end": selected_range_end,
        "codes": [],
        "memo": "",
        "annotation_update": new Date(),
        "annotation_user": annotation_user
    });
    return(id);
}

function delete_fragment( document_i , fragment_text ) {
    document_i = parseInt(document_i);
    for (var i = 0; i < output.fragments_annotations.length; i++) {
        if (output.fragments_annotations[i].document == document_i && output.fragments_annotations[i].text == fragment_text) {
            output.fragments_annotations.splice(i, 1);
        }
    }
}

function set_fragments_annotations( document_i, fragment_id = false , code_i = false , memo = false  ) {

    document_i = parseInt(document_i);

    for (var i = 0; i < output.fragments_annotations.length; i++) {
        if (output.fragments_annotations[i].document == document_i && output.fragments_annotations[i].id == fragment_id) {
           
            if (code_i) {
                code_i = parseInt(code_i);    
                if ( output.fragments_annotations[i].codes.indexOf( code_i ) === -1 ) {
                    output.fragments_annotations[i].codes.push( code_i );
                    last_used_code = code_i;
                    last_coded_document_i = document_i;
                    last_coded_fragment_id = fragment_id;
                } else {
                    output.fragments_annotations[i].codes.splice( output.fragments_annotations[i].codes.indexOf( code_i ), 1 );
                }
            }

            if (memo) {
                output.fragments_annotations[i].memo = memo;
                if (memo=="") {
                    output.documents_annotations[i].memo = "";
                }
            }
            
            output.fragments_annotations[i].annotation_update = new Date();
            output.fragments_annotations[i].annotation_user = annotation_user; 

        }
    }
    dump_output();

}

function get_fragments( document_i ) {
    var fragments = [];
    for (var i = 0; i < output.fragments_annotations.length; i++) {
        if (output.fragments_annotations[i].document == document_i) {
            fragments.push(output.fragments_annotations[i]);
        }
    }
    return fragments;
}

function get_fragment_codes( document_i , fragment_id ) {
    var fragment_codes = [];
    for (var i = 0; i < output.fragments_annotations.length; i++) {
        if (output.fragments_annotations[i].document == document_i && output.fragments_annotations[i].id == fragment_id) {
            fragment_codes.push(output.fragments_annotations[i].codes);
        }
    }
    return fragment_codes;
}

function get_fragment_memo( document_i , fragment_id ) {
    var fragment_memo = "";
    for (var i = 0; i < output.fragments_annotations.length; i++) {
        if (output.fragments_annotations[i].document == document_i && output.fragments_annotations[i].id == fragment_id) {
            fragment_memo = output.fragments_annotations[i].memo;
        }
    }
    return fragment_memo;
}

function clean_selection() {
    selected_text = false;
    selected_range_start = false;    
    selected_range_end = false;
    dump_output();
}

// ------------------------------------------------------------------------------------------------------
// GUI drawing fns
// ------------------------------------------------------------------------------------------------------

function read_input_data( input ) {
    output = input;
}

function set_variables( show_monitor = false , annotation_user = false ) {
    var show_monitor = show_monitor;
    var annotation_user = annotation_user;
    alert(annotation_user);
}

// ------------------------------------------------------------------------------------------------------
// GUI drawing fns
// ------------------------------------------------------------------------------------------------------

function draw_front() {
  
    // front markup
    $("#posta").append( '<div id="container"></div>' );

        // insert document pane
        $("#container").append( '<h1 id="title">minCAQDAS</h1>' );
    
        // insert document pane
        $("#container").append( '<div id="documents_panel"></div>' );

            $("#documents_panel").append( '<p><strong>Document Navigation Panel</strong></p>' );

            // insert document navigation
            $("#documents_panel").append( '<div id="documents"></div>' );
            document_navigation(); 
        
        // insert document viewer
        $("#container").append( '<div id="documents_viewer_panel"></div>' );

            $("#documents_viewer_panel").append( '<p><strong>Document Viewer</strong></p>' );

            // insert document viewer
            $("#documents_viewer_panel").append( '<div id="document_viewer">(select a document from the <strong>Document Navigation Panel</strong>)</div>' );

        // insert annotation panes
        $("#container").append( '<div id="annotate_panes"></div>' );

            // annotate on documents
            $("#annotate_panes").append( '<div id="annotate_document"></div>' );
            document_annotation_panel(); 

            // annotate on fragments
            $("#annotate_panes").append( '<div id="annotate_fragment"></div>' );
            fragment_annotation_panel();

        // insert dump output
        $("#container").append( '<div id="dump"></div>' );
        export_and_dump_panel();

        dump_output();
}  

function document_navigation() {
    var document_panel = $("#documents_panel");
    document_panel.html(""); // refresh

    document_panel.append('<p><strong>Document Navigation</strong></p>');

    documents = get_documents();
    for (var i = 0; i < documents.length; i++) {
        if ( current_document_i && current_document_i == i ) { selected_item = "selected_item_document"; } else { selected_item = ""; }

        document_panel.append( '<div class="document_navigation_item ' + selected_item + ' " document_i="' + i + '">' + 
            documents[i].substring(0, 50) + '...</div>' );
    }
}

function document_annotation_panel() {

    var annotate_doc_panel = $("#annotate_document");

    if (current_document_i === false) {
        annotate_doc_panel.hide();
        return;
    } else {
        annotate_doc_panel.show();
        annotate_doc_panel.html( "" ); // refresh every time

        annotate_doc_panel.append('<p><strong>Documment Annotations</strong></p>');
        annotate_doc_panel.append('<div id="document_code_navigation"></div>');

        var document_code_navigation = $("#document_code_navigation");

        codes = get_codes();
        for (var i = 0; i < codes.length; i++) {
            if ( current_document_i ) {
                if ( get_document_codes(current_document_i).indexOf(i) === -1 ) { var code_class = "unselected_item"; } else { var code_class = "selected_item"; }
            } 
            document_code_navigation.append( '<div class="document_code_item ' + code_class + '" code_i="' + i + '">' + codes[i] + '</div>' );
        }

        annotate_doc_panel.append( '<div id="document_code_item_automatics">' + 
            '<div class="document_code_item_automatic" code_behaviour="last">Last used code</div>' + 
            '<div class="document_code_item_automatic" code_behaviour="open">Open code</div>' +
            '<div class="document_code_item_automatic" code_behaviour="quote">Quote code</div>' +
            // '<div class="document_code_item_automatic" style="background-color: red">Select tokens/features</div>' +   //v2
            '</div>' );

        annotate_doc_panel.append('<textarea id="document_memo" placeholder="Include memos to this document...">' + get_document_memo(current_document_i) + '</textarea>');

    }
}

function fragment_annotation_panel() {

    var annotate_fragment_panel = $("#annotate_fragment");

    if (current_document_i === false) {
        annotate_fragment_panel.hide();
        return;
    } else {
        annotate_fragment_panel.show();
        annotate_fragment_panel.html( "" ); // refresh every time

        annotate_fragment_panel.append('<p><strong>Fragment Annotations</strong></p>');

        annotate_fragment_panel.append('<div id="create_fragment_navigation"></div>');
        var create_fragment_navigation = $("#create_fragment_navigation");
        create_fragment_navigation.append('<div id="create_fragment_button">Create Fragment</div>');
        
        annotate_fragment_panel.append('<div id="fragments_navigation"></div>');
        var fragments_navigation = $("#fragments_navigation");
        
        var fragments = get_fragments(current_document_i);

        for (var i = 0; i < fragments.length; i++) {    
            if (current_fragment_id && fragments[i].id == current_fragment_id ) { 
                var fragment_class = "selected_item_fragment";
            } else {
                var fragment_class = "unselected_item";
            }
            fragments_navigation.append( '<div class="fragment_navigation_item ' + fragment_class + 
                '" fragment_id="' + fragments[i].id +
                '" fragment="' + fragments[i].text + '">' +
            fragments[i].text.substring(0, 25) + 
            '...</div>' );
        }

        if (current_fragment_id === false) {} else { 
            annotate_fragment_panel.append('<div id="delete_fragment_wraper"></div>');
            var delete_fragment_wraper = $("#delete_fragment_wraper");
            delete_fragment_wraper.append('<div id="delete_fragment_button">Delete fragment</div>');
            
            annotate_fragment_panel.append('<div id="fragment_code_navigation"></div>');
            var fragment_code_navigation = $("#fragment_code_navigation");
            
            codes = get_codes();
            fragment_codes = get_fragment_codes(current_document_i, current_fragment_id);
            if ( codes && fragment_codes && fragment_codes.length > 0 ) {
                for (var i = 0; i < codes.length; i++) {
                    if ( fragment_codes[0].indexOf(i) === -1 ) { 
                        var code_class = "unselected_item"; 
                    } else { 
                        var code_class = "selected_item"; 
                    } 
                    fragment_code_navigation.append( '<div class="fragment_code_item ' + code_class + '" code_i="' + i + '">' + codes[i] + '</div>' );
                }
            }
    
            annotate_fragment_panel.append( '<div id="fragment_code_item_automatics">' + 
                '<div class="fragment_code_item_automatic" code_behaviour="last">Last used code</div>' + 
                '<div class="fragment_code_item_automatic" code_behaviour="open">Open code</div>' +
                '<div class="fragment_code_item_automatic" code_behaviour="quote">Quote code</div>' +
                '</div>' );

            annotate_fragment_panel.append('<textarea id="fragment_memo" placeholder="Include memos for this fragment...">' + 
                get_fragment_memo( current_document_i, current_fragment_id ) + '</textarea>');
        }
    }
}

function view_document_content( document_i , current_fragment = false ) {
    var document_viewer = $("#document_viewer");

    codes = output.codes;
    var color_brewer = [
        "rgba(255, 0, 0, .3)",
        "rgba(0, 255, 0, .3)",
        "rgba(0, 0, 255, .3)",
        "rgba(255, 255, 0, .3)",
        "rgba(255, 0, 255, .3)",
        "rgba(0, 255, 255, .3)",
        "rgba(255, 255, 255, .3)",
        "rgba(255, 128, 0, .3)",
        "rgba(255, 0, 128, .3)",
        "rgba(128, 255, 0, .3)"
    ];

    var i = 0;
    codes2 = codes.map(function(code, index) {
        if (i > color_brewer.length) {
            i=0;
        } 
        i++;
        return( color_brewer[index])
    });
    
    text = output.documents[document_i];
    character_char = text.split('');
    character_classes = Array(character_char.length).fill('');
    character_fragments = Array(character_char.length).fill('');
    fragments_annotations = get_fragments(document_i);

    for (i = 0; i < character_char.length; i++) {
        fragments_annotations.forEach(function(item, index) {

            if ( i >= item.start && i <= item.end ) {

                character_fragments[i] = item.id ;
                character_classes[i] = "";  // clases son codigos + otras cuestiones de estilo

                if (i == item.start) {
                    character_classes[i] = character_classes[i] + ' fragment_start ' ;
                }
                if (i == item.end) {
                    character_classes[i] = character_classes[i] + ' fragment_end ' ;
                }

                if (current_fragment && item.id == current_fragment) {
                    character_classes[i] = character_classes[i] + ' selected_fragment ' ;
                }

                character_char[i] = '<character_annotation fragments="' + character_fragments[i] + 
                '" class="fragment ' + character_classes[i] + '" ' +
                '" fragment_id="' + item.id + '">' +
                character_char[i] + '</character_annotation>';

                item.codes.forEach(function(code, index) {                           
                    character_char[i] = '<character_annotation fragments="' + character_fragments[i] + 
                        '" class="fragment ' + character_classes[i] + '" ' + 
                        '" code="' + code + '" ' + 
                        '" fragment_id="' + item.id + '" ' +
                        '" style="background-color:' + codes2[code] + '">' +
                        character_char[i] + '</character_annotation>';
                });
            } 

        });
    }

    var document_viewer = $("#document_viewer");
    document_viewer.html( character_char.join('') );

}

function export_and_dump_panel() {
    var dump_panel = $("#dump");
    dump_panel.append('<p><strong>Export, Settings & Monitor </strong></p>');
    dump_panel.append('<div id="dump_buttons"></div>');
    var dump_panel_buttons = $("#dump_buttons");
    dump_panel_buttons.append('<div id="export" class="export-button">Export JSON</div>');
    // dump_panel_buttons.append('<div id="export" class="export-button">Export JSON without text</a></div>'); //v2
    dump_panel_buttons.append('<div id="monitor" class="export-button monitor"><a href="#" id="">Toggle JSON monitor</a></div>');    
    dump_panel_buttons.append('<div id="import" class="export-button">Import JSON</div>');
    dump_panel_buttons.append('<input type="file" id="file-input" />');
    dump_panel.append('<div id="dump_output"></div>');    
}

// ------------------------------------------------------------------------------------------------------
// GUI reactions fns
// ------------------------------------------------------------------------------------------------------

$(document).on('click', '.document_navigation_item', function() {
    current_fragment = false;
    var document_i = $(this).attr("document_i");
    current_document_i = document_i;
    current_fragment_id = false;
    document_navigation();
    view_document_content( document_i );
    document_annotation_panel(); 
    fragment_annotation_panel();
    dump_output();
});

$(document).on('click', '.document_code_item', function() {
    if (current_document_i === false) {
        alert('Select a document first');
    } else {
        var code_i = $(this).attr("code_i"); 
        set_documents_annotations( current_document_i , code = code_i );
        last_used_code = code_i;
        document_annotation_panel(); 
        fragment_annotation_panel();
    }
    dump_output();
});

$(document).on('click', '.document_code_item_automatic', function() {
    if (current_document_i === false) {
        alert('Select a document first');
    } else {
        var code_i = $(this).attr("code_i"); 
        
        var code_behaviour = $(this).attr("code_behaviour");
        if (code_behaviour == "last") { 
            if ( last_coded_document_i != current_document_i ) {
                set_documents_annotations( current_document_i , code = last_used_code ); 
            }
        }
        if (code_behaviour == "open") {
            var code = prompt("Please enter your code", "");
            if (code != null) {
                var code_i = set_new_code( code );
                set_documents_annotations( current_document_i , code = code_i );
            }        
        }
        if (code_behaviour == "quote") {   
            if ( selected_text != false && selected_text.trim() != "" ) {
                var code_i = set_new_code( selected_text.trim() );
                set_documents_annotations( current_document_i , code = code_i );
                clean_selection();
            } else {
                alert('Select some text first');
            }

        }
        document_annotation_panel(); 
        fragment_annotation_panel();
    }
    dump_output();
});

$(document).on('click', '.fragment_code_item_automatic', function() {
    if (current_fragment === false) {
        alert('Select a fragment first');
    } else {
        var code_i = $(this).attr("code_i"); 
        
        var code_behaviour = $(this).attr("code_behaviour");
        if (code_behaviour == "last") { 
            if ( last_coded_fragment_id != current_fragment_id ) {
                set_fragments_annotations( document_i = current_document_i, fragment_id = current_fragment_id, code_i = last_used_code );
            }
        }
        if (code_behaviour == "open") {
            var code = prompt("Please enter your code", "");
            if (code != null) {
                var code_i = set_new_code( code );
                set_fragments_annotations( document_i = current_document_i, fragment_id = current_fragment_id, code_i = code_i );
            }        
        }
        if (code_behaviour == "quote") {   
            if ( selected_text != false && selected_text.trim() != "" ) { 
                var code_i = set_new_code( selected_text.trim() );
                set_fragments_annotations( document_i = current_document_i, fragment_id = current_fragment_id, code_i = code_i );
                clean_selection();
            } else {
                alert('Select some text first');
            }

        }
        view_document_content( current_document_i );
        document_annotation_panel(); 
        fragment_annotation_panel();
    }
    dump_output();
});

$(document).on('click', '#create_fragment_button', function() {
    if (selected_text === false) {
        alert('Select a fragment first by highlighting text in the document viewer');
    } else {
        var fragment = selected_text.trim();
        if (fragment != "") {
            current_fragment_id = set_fragment( 
                document_i = current_document_i,
                fragment_text = fragment
            );
            current_fragment = selected_text;
            view_document_content( current_document_i );
            clean_selection();
            fragment_annotation_panel(); 
            dump_output();
        }
    }
});

$(document).on('click', '.fragment_code_item', function() {
    if (current_fragment_id === false) {
        alert('Select a fragment first');
    } else {
        var code_i = $(this).attr("code_i"); 
        set_fragments_annotations( document_i = current_document_i, fragment_id = current_fragment_id, code_i = code_i );
        last_used_code = code_i;
        view_document_content( current_document_i );
        fragment_annotation_panel();
    }
    dump_output();
});

$(document).on('click', '.fragment_navigation_item', function() {
    var fragment = $(this).attr("fragment");
    current_fragment_id = $(this).attr("fragment_id");
    // current_fragment = fragment;
    // selected_range_start = $(this).attr("fragment_start");
    // selected_range_end = $(this).attr("fragment_end");

    // 2do: aca hay que hacer que resaltar el fragmento en el documento

    view_document_content( current_document_i , fragment_id = current_fragment_id );
    fragment_annotation_panel();
    dump_output();
});

$(document).on('change', '#document_memo', function() {
    var memo = $(this).val();
    set_documents_annotations( current_document_i, code = false, memo = memo );
    dump_output();
});

$(document).on('change', '#fragment_memo', function() {
    var memo = $(this).val();
    set_fragments_annotations( document_i = current_document_i, fragment_id = current_fragment_id, code_i = false, memo = memo );
    dump_output();
});

$(document).on('click', '#delete_fragment_button', function() {
    if (current_fragment) {
        delete_fragment( document_i = current_document_i, fragment_text = current_fragment );
        current_fragment = false;
        fragment_annotation_panel();
    }   
    dump_output();
});

$(document).on('click', '#monitor', function() {
    show_monitor = !show_monitor;
    if (show_monitor) {
        $("#dump_output").show();
    } else {
        $("#dump_output").hide();
    }
    dump_output();
});

$(document).on('mouseup', '#document_viewer', function() {
    if (current_document_i === false) {
    } else {
        selected_text = window.getSelection().toString();   // https://developer.mozilla.org/en-US/docs/Web/API/Selection
        var range = window.getSelection().getRangeAt(0);
        var sel_start = range.startOffset;
        var sel_end = range.endOffset;      
        var container = $('#document_viewer')[0];
        var charsBeforeStart = getCharactersCountUntilNode(range.startContainer, container);
        var charsBeforeEnd = getCharactersCountUntilNode(range.endContainer, container);
        if(charsBeforeStart < 0 || charsBeforeEnd < 0) {
          console.warn('out of range');
          return;
        }
        var start_index = charsBeforeStart + sel_start;
        var end_index = charsBeforeEnd + sel_end -1 ;
        // console.log('start index', start_index);
        // console.log('end index', end_index);
        // console.log(container.textContent.slice(start_index, end_index));
        selected_range_end = end_index;
        selected_range_start = start_index;
        dump_output();
    }
});

$(document).on('click', '#export', function() { 
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hh = String(today.getHours()).padStart(2, '0');
    var min = String(today.getMinutes()).padStart(2, '0');
    var filename = 'mincoder_' + yyyy + mm + dd + hh + min + '.json';
    exportToJsonFile(output, filename); //2do: revisar! lo llama dos veces?
});

$(document).on('click', '#import', function() { 
    $('#file-input').click();
    $('#file-input').change(handleFileSelect);
});

function handleFileSelect (e) {
    var files = e.target.files;
    if (files.length < 1) {
        alert('select a JSON file...');
        return;
    }
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener("load", function () {
        var json = JSON.parse(reader.result);
        console.log(json);
        output = json;
        // document_navigation_panel();
        document_navigation();
        dump_output();
    });

}

function exportToJsonFile(jsonData , filename) {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    let exportFileDefaultName = filename;
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

window.onbeforeunload = function(e) {   // trigger alert on windown close
//   return 'Please make sure to save your work before leaving this page.';
};

// ------------------------------------------------------------------------------------------------------
// aux fns
// ------------------------------------------------------------------------------------------------------

const idx = function() {
    return Math.random()
      .toString(36)
      .substr(2, 8);
};

function getCharactersCountUntilNode(node, parent) {
    // https://stackoverflow.com/questions/50843340/window-getselection-getrange0-does-not-work-when-text-is-wrapped-by-mark
    var walker = document.createTreeWalker(
      parent || document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    var found = false;
    var chars = 0;
    while (walker.nextNode()) {
      if(walker.currentNode === node) {
        found = true;
        break;
      }
      chars += walker.currentNode.textContent.length;
    }
    if(found) {
      return chars;
    }
    else return -1;
  }
  