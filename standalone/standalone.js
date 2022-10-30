var data = {

    "documents": [
        "document-1",
        "document-2",
        "document-3",
    ],

    "codes": [
        "code-1",
        "code-2",
        "code-3",
    ],

    "document_codes": [
        {
            "document": "document-1",
            "codes": [
                "code-1",
                "code-2",
            ],
            "document_memo": "Este documento...",
            "document_selected_tokens": [],        
            "document_codification_date_time": "2019-01-01",
            "document_codification_user": "GDB",                
        }
    ],

    "fragments" : [
        {
            "document": "document-1",
            "fragment_text": "xxx xxx",
            "fragment_codes": ["Positivo"],
            "fragment_memo": "Raro todo...",
            "fragment_codification_date_time": "2019-01-01",
            "fragment_codification_user": "GDB"
        }
    ]
};



function read_data() {
    // read json and store it in a variable called "data"
    // var data = JSON.parse(fs.readFileSync('formato-final.json', 'utf8'));
    console.log(data);
}

function start_front() {
    console.log("starting front");
}  