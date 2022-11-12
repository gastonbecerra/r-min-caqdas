library(tidyverse)
library(jsonlite)

json <- jsonlite::fromJSON(txt = './mincoder_202211121746.json')

json$documents
json$codes

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



# manage codes -----
# Merging codes
# Grouping codes
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