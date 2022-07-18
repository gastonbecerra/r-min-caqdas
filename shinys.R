# aca van los protos de los GUIs

# https://www.listendata.com/2018/12/javascript-shiny-r.html
# https://unleash-shiny.rinterface.com/shiny-intro.html#shiny-intro

#la onda es hacer 2 GUIs
#- codificar documentos
#- seleccionar fragmentos y codificarlos

# PREPARO DATOS ---------------------------------------------------------------------------

library(tidyverse)
docs <- readtext::readtext("./data/text/*.txt")
sentences <- tidytext::unnest_tokens(tbl = docs , output = sentence, input = text, token = "sentences")
sentences2 <- readr::read_csv(file = './data/csv/oraciones_cortadas_2022.csv')

# Code = label x token ---------

codes <- c("definicion", "promesa", "premisa", "riesgo", "algoritmos")
codes2 <- c("Positivo", "Negativo", "Neutral")

tokens_codes <- tibble::tibble(
  token = sentences2$oraciones[5],
  code = codes2[2]
) # byval clasificacion

tokens_codes

tokens_codes <- tibble::tibble(
  token = sentences2$oraciones[5],
  code = tibble(
    code1 = codes[4],
    code2 = codes[5]
  )
) # byval codificacion

tokens_codes

documentos_selector <- sentences2 %>% 
  select(-link) %>%
  mutate(oraciones = utf8::utf8_encode(oraciones)) %>%
  mutate(oraciones2 = paste(row_number(), " | ", str_sub(oraciones, 1, 50), "..." , sep = " ")) %>%
  pull(oraciones2) %>%
  head(100)



# GUI ---------------------------------------------------------------------------

library(tidyverse)
library(shiny)
library(shinydashboard)
library(shinyjs)
library(stringi)

devolver_numero_documento <- function( selector_documento ) {
  return( sub("\\|.*", "", selector_documento) %>% as.integer(.) )
}

ui <- fluidPage(
  useShinyjs(),
  tags$head( includeScript("script.js"), includeCSS("style.css") ),
  titlePanel("GUI for 1-Code-1-Document"),
  fluidRow(selectInput("documento", "Pick a document:", documentos_selector, width = "100%")),
  fluidRow(textOutput("documentText")),
  fluidRow(tags$div(id="front_wrapper")),
  textOutput("documentIndex")
)

server <- function(input, output, session) {
  output$documentText <- renderText({ 
    sentences2$oraciones[input$documento %>% devolver_numero_documento()]
  })
  output$documentIndex <- renderText({ 
    input$documento %>% devolver_numero_documento()
  })
  runjs( 
    paste0(
      "start_front( 
        codes = " , jsonlite::toJSON( codes2 ), " 
        );" ))
}

runApp(list(ui = ui, server = server), launch.browser =F)