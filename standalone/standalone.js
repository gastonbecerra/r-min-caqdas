// ------------------------------------------------------------------------------------------------------
// vars and default values
// ------------------------------------------------------------------------------------------------------

//2do: all these should be monitored; and on changes, show in dump_output

var output = [];
var current_document_i = false; 
var last_used_code = false;
var last_coded_document_i = false;
var selected_text = false;
var current_fragment = false;

var show_monitor = true; //2do: deberia arrancar apagado
var codification_user = false;  //2do: esto deberia venir de R

function dump_output() {
    if (!show_monitor) { $("#dump_output").hide(); }
    $("#dump_output").html( 
        "current_document_i: " + current_document_i + "<br>" +
        "last_used_code: " + last_used_code + "<br>" +
        "last_coded_document_i: " + last_coded_document_i + "<br>" +
        "selected_text: " + selected_text + "<br>" +
        "current_fragment: " + current_fragment + "<br>" +

        "show_monitor: " + show_monitor + "<br>" +
        "codification_user: " + codification_user + "<br>" +
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

function set_document_annotations( document_i , code_i = false , memo = false , selected_tokens = false ) {
    document_i = parseInt(document_i);
    var is_new_document = true;
    
    for (var i = 0; i < output.document_annotations.length; i++) {
        if (output.document_annotations[i].document == document_i) {
            is_new_document = false;
            
            if (code_i) {
                code_i = parseInt(code_i);    
                if ( output.document_annotations[i].codes.indexOf( code_i ) === -1 ) {
                    output.document_annotations[i].codes.push( code_i );
                    last_used_code = code_i;
                    last_coded_document_i = document_i;
                } else {
                    output.document_annotations[i].codes.splice( output.document_annotations[i].codes.indexOf( code_i ), 1 );
                }
            }
            
            if (memo) {
                output.document_annotations[i].memo = memo;
            }
            
            if (selected_tokens) {
                //2do: update tokens
            }

            output.document_annotations[i].codification_date = new Date();
            output.document_annotations[i].codification_user = codification_user; 
        }
    }

    if (is_new_document) {
        if (code_i) { 
            code_i = [ parseInt(code_i) ] ; 
            last_used_code = code_i ; 
            last_coded_document_i = document_i ; 
        } else { code_i = []; } 
        if (memo) {} else { memo = ""; }
        output.document_annotations.push({
            "document": document_i,
            "codes": code_i,
            "memo": memo,
            "selected_tokens": [],  //2do: insert selected tokens
            "codification_date": new Date(),
            "codification_user": codification_user,
        });
    } 
    dump_output();
}

function get_document_codes( document_i ) {
    document_i = parseInt(document_i);
    var codes = [];
    for (var i = 0; i < output.document_annotations.length; i++) {
        if (output.document_annotations[i].document == document_i) { 
            codes = output.document_annotations[i].codes;
        }
    }
    return codes;
}

function get_document_memo( document_i ) {
    document_i = parseInt(document_i);
    var memo = "";
    for (var i = 0; i < output.document_annotations.length; i++) {
        if (output.document_annotations[i].document == document_i) {
            memo = output.document_annotations[i].memo;
        }
    }
    return memo;
}

function set_fragment( document_i , fragment_text ) {
    document_i = parseInt(document_i);
    output.fragment_annotations.push({
        "document": document_i,
        "text": fragment_text,
        "start": null,  //2do: se puede tomar? o llegado el caso se puede ampliar la seleccion programaticamente?
        "end": null,    //2do: se puede tomar?
        "codes": [],
        "memo": "",
        "codification_date": new Date(),
        "codification_user": codification_user
    });
}

function delete_fragment( document_i , fragment_text ) {
    document_i = parseInt(document_i);
    for (var i = 0; i < output.fragment_annotations.length; i++) {
        if (output.fragment_annotations[i].document == document_i && output.fragment_annotations[i].text == fragment_text) {
            output.fragment_annotations.splice(i, 1);
        }
    }
}

function set_fragment_annotations( document_i, fragment_text = false , code_i = false , memo = false ) {

    // console.log("set_fragment_annotations: " + document_i + " " + fragment_text + " " + code_i + " " + memo);
    document_i = parseInt(document_i);

    for (var i = 0; i < output.fragment_annotations.length; i++) {
        if (output.fragment_annotations[i].document == document_i && output.fragment_annotations[i].text == fragment_text) {
            
            if (code_i) {
                code_i = parseInt(code_i);    
                if ( output.fragment_annotations[i].codes.indexOf( code_i ) === -1 ) {
                    output.fragment_annotations[i].codes.push( code_i );
                    last_used_code = code_i;
                    last_coded_document_i = document_i;
                } else {
                    output.fragment_annotations[i].codes.splice( output.fragment_annotations[i].codes.indexOf( code_i ), 1 );
                }
            }

            if (memo) {
                output.fragment_annotations[i].memo = memo;
            }
            
            output.fragment_annotations[i].codification_date = new Date();
            output.fragment_annotations[i].codification_user = codification_user; 

        }
    }

    dump_output();

}

function get_fragments( document_i ) {
    var fragments = [];
    for (var i = 0; i < output.fragment_annotations.length; i++) {
        if (output.fragment_annotations[i].document == document_i) {
            fragments.push(output.fragment_annotations[i]);
        }
    }
    return fragments;
}

function get_fragment_codes( document_i , fragment_text ) {
    var fragment_codes = [];
    for (var i = 0; i < output.fragment_annotations.length; i++) {
        if (output.fragment_annotations[i].document == document_i && output.fragment_annotations[i].text == fragment_text) {
            fragment_codes.push(output.fragment_annotations[i].codes);
        }
    }
    return fragment_codes;
}

function get_fragment_memo( document_i , fragment_text ) {
    var fragment_memo = "";
    for (var i = 0; i < output.fragment_annotations.length; i++) {
        if (output.fragment_annotations[i].document == document_i && output.fragment_annotations[i].text == fragment_text) {
            fragment_memo = output.fragment_annotations[i].memo;
        }
    }
    return fragment_memo;
}

function read_input_data( input ) {
    output = input;
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

    document_panel.append('<p><strong>Documment Navigation</strong></p>');

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
            '<div class="document_code_item_automatic" code_behaviour="invivo">Invivo code</div>' +
            // '<div class="document_code_item_automatic" style="background-color: red">Select tokens/features</div>' +   //2do: que se pueda seleccionar palabras, para feature engeenering
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
        for (var i = 0; i < fragments.length; i++) {    //2do: al final voy a usar frament_i? o conviene usar un hash?
            if (current_fragment && fragments[i].text == current_fragment) {
                var fragment_class = "selected_item_fragment";
            } else {
                var fragment_class = "unselected_item";
            }
            fragments_navigation.append( '<div class="fragment_navigation_item ' + fragment_class + '" fragment_i="' + i + '" fragment="' + fragments[i].text + '">' +
            fragments[i].text.substring(0, 25) + 
            '...</div>' );
        }

        if (current_fragment === false) {} else {
            annotate_fragment_panel.append('<div id="delete_fragment_wraper"></div>');
            var delete_fragment_wraper = $("#delete_fragment_wraper");
            delete_fragment_wraper.append('<div id="delete_fragment_button">Delete fragment</div>');
            
            annotate_fragment_panel.append('<div id="fragment_code_navigation"></div>');
            var fragment_code_navigation = $("#fragment_code_navigation");
            
            codes = get_codes();
            fragment_codes = get_fragment_codes(current_document_i, current_fragment);

            for (var i = 0; i < codes.length; i++) {
                if ( fragment_codes[0].indexOf(i) === -1 ) { var code_class = "unselected_item"; } else { var code_class = "selected_item"; } 
                fragment_code_navigation.append( '<div class="fragment_code_item ' + code_class + '" code_i="' + i + '">' + codes[i] + '</div>' );
            }
    
            annotate_fragment_panel.append( '<div id="fragment_code_item_automatics">' + 
                '<div class="fragment_code_item_automatic" code_behaviour="last">Last used code</div>' + 
                '<div class="fragment_code_item_automatic" code_behaviour="open">Open code</div>' +
                '<div class="fragment_code_item_automatic" code_behaviour="invivo">Invivo code</div>' +
                '</div>' );

            annotate_fragment_panel.append('<textarea id="fragment_memo" placeholder="Include memos for this fragment...">' + get_fragment_memo( current_document_i, current_fragment ) + '</textarea>');
        }
    }
}

function view_document_content( document_i ) {
    var document_viewer = $("#document_viewer");
    document_viewer.html( output.documents[document_i] );
}

function export_and_dump_panel() {
    var dump_panel = $("#dump");
    dump_panel.append('<p><strong>Export | Settings | Monitor </strong></p>');
    dump_panel.append('<div id="export"><a href="#" id="export">[Export]</a></div>');
    dump_panel.append('<div id="monitor"><a href="#" id="toggle_dump">[Toggle monitor]</a><br/><div id="dump_output"></div></div>');    
}

// ------------------------------------------------------------------------------------------------------
// GUI reactions fns
// ------------------------------------------------------------------------------------------------------

$(document).on('click', '.document_navigation_item', function() {
    current_fragment = false;
    var document_i = $(this).attr("document_i");
    current_document_i = document_i;
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
        set_document_annotations( current_document_i , code = code_i );
        last_used_code = code_i;    //2do: esto deberia estar dentro de set_document_annotations
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
                set_document_annotations( current_document_i , code = last_used_code ); 
            }
        }
        if (code_behaviour == "open") {
            var code = prompt("Please enter your code", "");
            if (code != null) {
                var code_i = set_new_code( code );
                set_document_annotations( current_document_i , code = code_i );
            }        
        }
        if (code_behaviour == "invivo") {   
            if ( selected_text != false && selected_text.trim() != "" ) {
                var code_i = set_new_code( selected_text.trim() );
                set_document_annotations( current_document_i , code = code_i );
                selected_text = false;
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
            if ( last_coded_document_i != current_document_i ) {
                set_fragment_annotations( current_document_i, current_fragment, code = last_used_code );
            }
        }
        if (code_behaviour == "open") {
            var code = prompt("Please enter your code", "");
            if (code != null) {
                var code_i = set_new_code( code );
                set_fragment_annotations( current_document_i, current_fragment, code = code_i );
            }        
        }
        if (code_behaviour == "invivo") {   
            if ( selected_text != false && selected_text.trim() != "" ) {   //2do: invivo deberia repetir el texto seleccionado?
                var code_i = set_new_code( selected_text.trim() );
                set_fragment_annotations( current_document_i, current_fragment, code = code_i );
                selected_text = false;
            } else {
                alert('Select some text first');
            }

        }
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
            set_fragment( 
                document_i = current_document_i,
                fragment_text = fragment
            );
            current_fragment = selected_text;
            selected_text = false;
            fragment_annotation_panel(); 
            dump_output();
        }
    }
});

$(document).on('click', '.fragment_code_item', function() {
    if (current_fragment === false) {
        alert('Select a fragment first');
    } else {
        var code_i = $(this).attr("code_i"); 
        set_fragment_annotations( document_i = current_document_i, fragment_text = current_fragment, code_i = code_i ); //2do: se loopea por fragment_i?
        last_used_code = code_i;    //2do: esto deberia estar dentro de set_document_annotations
        fragment_annotation_panel();
    }
    dump_output();
});

$(document).on('click', '.fragment_navigation_item', function() {
    var fragment = $(this).attr("fragment");
    current_fragment = fragment;
    fragment_annotation_panel();
    dump_output();
});

$(document).on('change', '#document_memo', function() {
    //2do: no anda si borro el texto (limpiar memo)
    var memo = $(this).val();
    set_document_annotations( current_document_i, code = false, memo = memo );
    dump_output();
});

$(document).on('change', '#fragment_memo', function() {
    //2do: no anda si borro el texto (limpiar memo)?
    var memo = $(this).val();
    set_fragment_annotations( document_i = current_document_i, fragment_text = current_fragment, code_i = false, memo = memo );
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

$(document).on('click', '#toggle_dump', function() {
    show_monitor = !show_monitor;
    if (show_monitor) {
        $("#dump_output").show();
    } else {
        $("#dump_output").hide();
    }
    dump_output();
});

$(document).on('click', '#export', function() { //2do: es mas o menos por aca
    var data = JSON.stringify(output);  
    var blob = new Blob([data], {type: "text/json;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    $("#export").href = url;
    $("#export").download = "output.json";
});


$(document).on('mouseup', '#document_viewer', function() {
    if (current_document_i === false) {
    } else {
        selected_text = getSelectedText();
        dump_output();
    }
});

function getSelectedText() {
    if (window.getSelection) {
        return window.getSelection().toString();
    } else if (document.selection) {
        return document.selection.createRange().text;
    }
    return '';
}

window.onbeforeunload = function(e) {   // trigger alert on windown close
//   return 'Please make sure to save your work before leaving this page.';
};