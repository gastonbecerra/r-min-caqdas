library(tidyverse)
library(jsonlite)
library(shiny)
library(shinyjs)
# library(tidytext)
# library(stringi)


# create jsons

zizi1996 <- function() {
  # "Moderator: What was the first time you thought about being a father, and what did you think it would be like? Did you have any models or reference points?"
  quotes <- c(
    "L: Actually the first time I thought about becoming a father was very early in my life. Probably I, I guess because of my upbringing—as I was brought up in Church and it was always a serious matter to me. I never went out with a girl without thinking that this is the girl I could possibly marry. Therefore, I always had it in my mind what it would be like. Well, I did not have strong views of what I would be like, what I had was knowing that I would be good toward the people I’d be dealing with. I did not know how I’d be that first time but I knew I would be a loving father. I did not have a picture of how I was going to be but I just knew I was going to be good toward the people . . . So . . ." ,
    "AG: To me I would say it is very different. When I left my country and I came here in 1983, I was scared to become a father. As a Christian I was afraid not to meet the proper woman to become my wife in order to become a father. When I met my wife and realized that she was a Christian and looking behind at how my father raised us, I decided to become a father at that time. Fortunately, I had my father as an example I would say. He has been with my mother since I was little, and I would say he is still an example for me." ,
    "L: Mine would have been a combination of people. My father would definitely be one of those people because my father was a very good father. He is a guy who has justice; you cannot make him tremble in front of situations. He sits, analyzes, and comes to a conclusion. There are several pastors in my life I have come to admire, in the way some of them were. They also play a part, in that it is going to be a combina? tion of people. My father was the strongest role model, but he was not the only person who played the role." ,
    "J: I thought it was going to be an innovative experience. If I could say that, something you actually have the power to influence your personality in a very young mind to do some good. So I think it would be like being from a military background, creating a human being for the profit of society.",
    "C: I could say the moment I met my wife, I thought about being a father. As my first girl friend, I thought eventually I would be married to her. To me it became obvious that I would be a father as a married person. I thought it was going to be a difficult job, a 24-hour job because there is no such thing as part-time fatherhood. I think it takes your whole being mentally and physically. Your presence in the house, in the home is very necessary at all times. My kids—they have it, God bless them they have it. I thought it was going to be a unique experience—you do not learn it in college or anywhere else.",
    "C: Yes, yes when I think about the days of my youth I can see my father and his dedication. The love that he has shown, and his hard-working style and his honesty. All that left a serious imprint on me. My dream was to look like my father. Everybody saw in him a model. His credibility was something that everybody I would say envies, that type of person he was. They love him—people would give him money to save because they knew he would not spend it. So, I always thought that it would be in my best in? terest to be like him."
  )
  message("Source: Zizi, 1996, p. 170, 221. (Haitian Father Data). Quoted and analyzed in Auerbach, C., & Silverstein, L. B. (2003). Qualitative data: an introduction to coding and analysis. New York University Press. p. 49-53");
  return(quotes)
}
docs <- zizi1996()

zizi1996analyzed <- function() {
  # 2do: zizi1996 totalmente analizado, seria un sample database que hay que cargar como archivo externo /sample
  json <- jsonlite::fromJSON(txt = "./jsons/zizi1996analyzed.json")
  return(json)
}

analizado <- zizi1996analyzed()

blank_input_list <- function () {
  return(
    list(
      documents = as.character(),
      codes = as.character(),
      documents_annotations = data.frame(),
      fragments_annotations = data.frame()
    )
  )
}

blank_list <- blank_input_list()
blank_list








# GUI start ----



start_gui <- function( input = FALSE, docs = FALSE, codes = FALSE, show_monitor = FALSE, annotation_user = 'default_user') {

    json_input <- blank_input_list()
    
    if (is.list(input)) { 
      # se dio un json
      # 2do: unificar terminologia json/list
      if ( is.character(input$documents) && is.vector(input$documents)) { json_input$documents = input$documents } 
      if ( is.character(input$codes) && is.vector(input$codes)) { json_input$codes = input$codes }
      if ( is.data.frame(input$documents_annotations)) { json_input$documents_annotations = input$documents_annotations }
      if ( is.data.frame(input$fragments_annotations)) { json_input$fragments_annotations = input$fragments_annotations }
      json_input <- jsonlite::toJSON(json_input)
    } 
  
    if (is.logical(input) && (!input)) {
      # si no se dio una lista (json) pero si se pusieron los inputs como vectores
      if ( is.character(docs) && is.vector(docs)) { json_input$documents = docs } 
      if ( is.character(codes) && is.vector(codes)) { json_input$codes = codes } 
      json_input <- jsonlite::toJSON(json_input)
    }

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
                /* console.log(data_from_R); */
                read_input_data(data_from_R);
                set_variables( show_monitor = false , annotation_user = '" , annotation_user , "' );
                draw_front();
            });"))
    }
    runApp(list(ui = ui, server = server), launch.browser =T)
}




start_gui( input = analizado )
start_gui( docs = docs )
json <- jsonlite::fromJSON(txt = "./jsons/test-merge1.json")
json <- jsonlite::fromJSON(txt = "./jsons/mincoder_202301020215.json")
start_gui( input = json )
start_gui( docs = docs , codes = c("xxx","yyy") )
start_gui();


# 2do: arrancar sin parametros, para tomar desde json
# includeCSS("https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css")












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
  # sin reemplazar, pero ajustnado los indices
  # com reemplazo, habría que mergear comentarios
  base_doc = length(x$documents)
  base_codes = length(x$codes)
  mas_indice <- function(indice , base) { return(indice+base) }
  y_documents_annotations <- cbind(document = lapply(X = y$documents_annotations$document , FUN = mas_indice, base=base_doc ), 
                                   codes = lapply(X = y$documents_annotations$codes , FUN = mas_indice, base=base_codes ), 
                                   memo = y$documents_annotations$memo, 
                                   annotation_update = y$documents_annotations$annotation_update, 
                                   annotation_user = y$documents_annotations$annotation_user) %>%
    as.data.frame() %>%
    mutate(document = as.integer(document) , 
           memo = as.character(memo) ,
           annotation_update = as.character(annotation_update) ,
           annotation_user = as.character(annotation_user) )
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
  return(z)
  
}

x <- jsonlite::fromJSON(txt = './jsons/test-merge1.json')
y <- jsonlite::fromJSON(txt = './jsons/test-merge2.json')
xy <- merge_jsons(x = x , y = y)
xy
x$documents_annotations %>% glimpse()
xy$documents_annotations %>% glimpse()
xy %>% jsonlite::write_json(path = './jsons/test-merge3.json')














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
