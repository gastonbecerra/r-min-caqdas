library(tidyverse)
library(jsonlite)
library(tidytext)
library(stringi)

json <- jsonlite::fromJSON(txt = './data/mincoder_202211121746.json')
json$documents
json$codes


# GUI start ----

docs <- readtext::readtext("./data/text/*.txt")
sentences2 <- readr::read_csv(file = './data/csv/oraciones_cortadas_2022.csv')
sentences2[1:5,"oraciones"]

library(shiny)
library(shinyjs)

start_gui <- function( docs = FALSE, codes = FALSE, show_monitor = FALSE, annotation_user = 'gaston') {

    if ( is.character(docs) && is.vector(docs)) {    
        docs <- gsub("[^A-Za-z0-9 ]","", docs)
    } else {
        docs <- vector()
    }

    if ( is.character(codes) && is.vector(codes)) {
    } else {
        codes = vector()
    }

    json_input <- list(
            documents = docs,
            codes = codes,
            documents_annotations = list(),
            fragments_annotations = list()
        ) %>% jsonlite::toJSON(.)

    ui <- fluidPage(
        useShinyjs(),
        tags$head( 
                includeScript("mincoder-gui.js"), 
                includeCSS("mincoder-gui.css"),
                includeCSS("https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css")
                ),
        fluidRow(tags$div(id="posta"))
    )
    server <- function(input, output, session) {
        runjs(paste0("$(document).ready(function() { 
                var data_from_R = " , json_input , ";
                console.log(data_from_R);
                read_input_data(data_from_R);
                set_variables( show_monitor = false , annotation_user = 'gaston' );
                draw_front();
            });"))
    }
    runApp(list(ui = ui, server = server), launch.browser =F)
}

x <- unlist(sentences2[1:20,"oraciones"] , use.names=FALSE)

start_gui( docs = x )
start_gui();




#2do: arrancar sin parametros, para tomar desde json











# info retrieval ----

# get codes as dataframe
get_codes <- function( x ) {
    y <- tibble(
        code = x$codes
    ) %>% mutate(
        code_id = row_number() - 1
    ) %>% select(code_id , code)
    return(y)
}
get_codes(x = json)

# get documents as dataframe
get_documents <- function( x ) {
    y <- tibble(
        document = x$documents
    ) %>% mutate(
        document_id = row_number() - 1
    ) %>% select(document_id , document)
    return(y)
}
get_documents(x = json)

# get fragments as dataframe
get_fragments <- function( x ) {
    y <- tibble(
        fragment_id = x$fragments_annotations[['id']],
        fragment = x$fragments_annotations[['text']]
    )
    return(y)
}
get_fragments(x = json)

# get document annotations as dataframe
get_documents_annotations <- function( x ) {
    y <- x$documents_annotations %>% unnest(cols = c(codes)) %>%
        rename(document_id = document) %>%
        rename(code_id = codes ) %>%
        left_join( get_documents(x) , by = 'document_id' ) %>% 
        left_join( get_codes(x) , by = 'code_id' ) %>%
        select( document_id , document , code_id , code , 
            memo , annotation_update , annotation_user)
    return(y)
}
get_documents_annotations(x = json)

# get fragment annotations as dataframe
get_fragments_annotations <- function( x ) {
    y <- x$fragments_annotations %>% 
        unnest(cols = c(codes)) %>%
        rename(fragment_id = id) %>%
        rename(code_id = codes ) %>%
        left_join( get_fragments(x) , by = 'fragment_id' ) %>% 
        left_join( get_codes(x) , by = 'code_id' ) %>%
        select( fragment_id , fragment , code_id , code , 
            document_id = document ,
            start, end, 
            memo , annotation_update , annotation_user)
    return(y)
}
get_fragments_annotations(x = json)

doc_annotations = get_documents_annotations(x = json)
frag_annotations = get_fragments_annotations(x = json)




# manage jsons -----

# mergin jsons
merge_jsons <- function( x , y ) {
    z <- list(
        documents = x$documents,
        codes = x$codes,
        documents_annotations = x$documents_annotations,
        fragments_annotations = x$fragments_annotations
    )
    z$documents_annotations <- c(z$documents_annotations , y$documents_annotations)
    z$fragments_annotations <- c(z$fragments_annotations , y$fragments_annotations)
    return(z)
}










# manage codes -----
# Merging codes (provide a c() of codes to merge into 1)
# Splitting codes
# Code hierarchies












# analyze codes ----

# get code frequencies
count(x = doc_annotations, code, sort = TRUE) 
count(x = frag_annotations, code, sort = TRUE)

# get code co-occurrences
# install.packages('widyr')
library(widyr)
pairwise_count( tbl = doc_annotations, item = code , feature = document_id , sort = TRUE , upper = FALSE )
pairwise_count( tbl = frag_annotations, item = code , feature = fragment_id , sort = TRUE , upper = FALSE)
pairwise_cor( tbl = doc_annotations, item = code , feature = document_id , sort = TRUE , upper = FALSE)
pairwise_cor( tbl = frag_annotations, item = code , feature = fragment_id , sort = TRUE , upper = FALSE)


# Searching a text for words or expressions and auto coding results	
# Metadata: User / Inter-coder agreement analysis	
# Comments for every entity in your project	
# funcion para sumar a un regex --> que aplique un código?

# reporte de codigos, fragmentos y documentos
