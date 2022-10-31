// ------------------------------------------------------------------------------------------------------
// vars and default values
// all these should be monitored in dump_output!!!
// ------------------------------------------------------------------------------------------------------

var output = [];
var current_document_i = false; 
var last_used_code = false;
var show_monitor = true; //2do: deberia arrancar apagado
var codification_user = false;  //2do: esto deberia venir de R

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

function set_new_code( code ) {
    output.codes.push(code);
}

function get_documents() {
    var docs = [];
    for (var i = 0; i < output.documents.length; i++) {
        docs.push(output.documents[i]);
    }
    return docs;
}

function set_document_annotations( document_i , code_i = false , memo = false , selected_tokens = false ) {

    // console.log("set_document_annotations: " + document_i + " " + code_i + " " + memo + " " + selected_tokens);

    document_i = parseInt(document_i);
    var is_new_document = true;
    
    for (var i = 0; i < output.document_annotations.length; i++) {
        if (output.document_annotations[i].document == document_i) {
            is_new_document = false;
            
            if (code_i) {
                code_i = parseInt(code_i);    
                if ( output.document_annotations[i].codes.indexOf( code_i ) === -1 ) {
                    output.document_annotations[i].codes.push( code_i );
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
        if (code_i) { code_i = [ parseInt(code_i) ] } else { code_i = []; } 
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

function read_input_data( input ) {
    output = input;
}

function dump_output() {
    if (!show_monitor) { $("#dump_output").hide(); }
    $("#dump_output").html( 
        "current_document_i: " + current_document_i + "<br>" +
        "last_used_code: " + last_used_code + "<br>" +
        "show_monitor: " + show_monitor + "<br>" +
        "codification_user: " + codification_user + "<br>" +
        "<pre>" + JSON.stringify(output, null, '\t') + "</pre>" 
     );
}

// ------------------------------------------------------------------------------------------------------
// GUI drawing fns
// ------------------------------------------------------------------------------------------------------

function start_front() {
  
    // front markup
    $("#posta").append( '<div id="container"></div>' );
    
    // insert document navigation
    $("#container").append( '<div id="documents"></div>' );
    document_navigation( $("#documents")); 
    
    // insert document viewer
    $("#container").append( '<div id="document_viewer">(select a document from the <strong>Document navigation pane</strong>)</div>' );

    // annotate on documents
    $("#container").append( '<div id="annotate_document"></div>' );
    document_annotation_panel(); 
       
    // insert dump output
    $("#container").append( '<div id="dump"><a href="#" id="toggle_dump">[Toggle monitor]</a><br/><div id="dump_output"></div></div>' );

    dump_output();
}  

function document_navigation( document_navigation ) {
    documents = get_documents();
    for (var i = 0; i < documents.length; i++) {
        document_navigation.append( '<div class="document_navigation_item" document_i="' + i + '">' + 
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

        annotate_doc_panel.append('<p><strong>Assign codes to this document</strong></p>');
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
            '<div class="document_code_item_automatic" code_behaviour="open">Open coding</div>' +
            '<div class="document_code_item_automatic" code_behaviour="in vivo">Invivo coding</div>' +
            '</div>' );

        //2do: insert open code button
        //2do: insert in vivo code button
        //2do: insert last used code button

        annotate_doc_panel.append('<textarea id="document_memo" placeholder="Include memos to this document...">' + get_document_memo(current_document_i) + '</textarea>');

    }
}

function view_document_content( document_i ) {
    var document_viewer = $("#document_viewer");
    document_viewer.html( output.documents[document_i] );
}

// ------------------------------------------------------------------------------------------------------
// GUI reactions fns
// ------------------------------------------------------------------------------------------------------

$(document).on('click', '.document_navigation_item', function() {
    var document_i = $(this).attr("document_i");
    current_document_i = document_i;
    view_document_content( document_i );
    document_annotation_panel(); 
    dump_output();
});

$(document).on('click', '.document_code_item', function() {
    if (current_document_i === false) {
        alert('Select a document first');
    } else {
        var code_i = $(this).attr("code_i"); 
        set_document_annotations( current_document_i , code = code_i );
        last_used_code = code_i;
        document_annotation_panel(); 
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
            // set_new_code( last_used_code );
            set_document_annotations( current_document_i , code = last_used_code ); //2do: esto en el ultimo lo borra --- error
        }
        document_annotation_panel(); 
    }
    dump_output();
});

$(document).on('change', '#document_memo', function() {
    //2do: no anda si borro el texto (limpiar memo)
    var memo = $(this).val();
    set_document_annotations( current_document_i, code = false, memo = memo );
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
