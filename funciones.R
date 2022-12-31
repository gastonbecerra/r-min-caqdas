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

x <- c()
for (i in 1:5) {
  x[i] = strrep(paste("document" , i , " " ), 5)
}
for (i in 6:10) {
  x[i] = strrep(paste("papiro" , i , " " ), 5)
}
x
rm(i)


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

# merge jsons
merge_jsons <- function( x , y ) {
    # documents = x.documents.concat(y.documents)
    # codes = x.codes.concat(y.codes)
    # z <- list(
    #     documents = documents,
    #     codes = codes,
    #     documents_annotations = x.documents_annotations.concat(y.documents_annotations),
    #     fragments_annotations = x.fragments_annotations.concat(y.fragments_annotations)
    # )

    documents = as.character();
    for( i in 1:length(x$documents) ) {
        x$documents <- c(x$documents , y$documents[i])
    }

    return(z)
}

x <- jsonlite::fromJSON(txt = './jsons/test-merge1.json')
y <- jsonlite::fromJSON(txt = './jsons/test-merge2.json')
xy <- merge_jsons(x = x , y = y)
xy

# a lo cabeza
z <- list()
z$documents <- c(x$documents , y$documents)
z$codes <- c(x$codes , y$codes)
z$documents_annotations <- rbind(x$documents_annotations , y$documents_annotations)
z$fragments_annotations <- rbind(x$fragments_annotations , y$fragments_annotations)

# sin reemplazar, pero ajustnado los indices
x <- jsonlite::fromJSON(txt = './jsons/test-merge1.json')
y <- jsonlite::fromJSON(txt = './jsons/test-merge2.json')
base_doc = length(x$documents)
base_codes = length(x$codes)
mas_indice <- function(indice , base) { return(indice+base) }
y_documents_annotations <- cbind(document = lapply(X = y$documents_annotations$document , FUN = mas_indice, base=base_doc ), 
      codes = lapply(X = y$documents_annotations$codes , FUN = mas_indice, base=base_codes ), 
      memo = y$documents_annotations$memo, 
      annotation_update = y$documents_annotations$annotation_update, 
      annotation_user = y$documents_annotations$annotation_user)
y_fragments_annotations <- cbind( 
      id = y$fragments_annotations$id, 
      document = vapply(X = y$fragments_annotations$document , FUN = mas_indice, base=base_doc , FUN.VALUE = numeric(1) ), 
      text = y$fragments_annotations$text,
      start = y$fragments_annotations$start,
      end = y$fragments_annotations$end, 
      codes = lapply(X = y$fragments_annotations$codes , FUN = mas_indice, base=base_codes ), 
      memo = y$fragments_annotations$memo, 
      annotation_update = y$fragments_annotations$annotation_update, 
      annotation_user = y$fragments_annotations$annotation_user) %>% 
  as.data.frame() %>%
  mutate(document = as.integer(document) , 
         id = as.character(id) , 
         text = as.character(text) , 
         start = as.integer(start) , 
         end = as.integer(end) , 
         memo = as.character(memo) ,
         annotation_update = as.character(annotation_update) ,
         annotation_user = as.character(annotation_user) )

z <- list()
z <- x
z$documents <- c(z$documents , y$documents)
z$codes <- c(z$codes , y$codes)
z$documents_annotations <- rbind(z$documents_annotations , y_documents_annotations)
z$fragments_annotations <- rbind(z$fragments_annotations , y_fragments_annotations)
rm(base_codes,base_doc,mas_indice,y_documents_annotations,y_fragments_annotations)

x$fragments_annotations %>% glimpse()
z$fragments_annotations %>% glimpse()

z %>% jsonlite::write_json(path = './jsons/test-merge3.json')






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
