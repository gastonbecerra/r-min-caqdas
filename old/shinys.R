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




# GUI ---------------------------------------------------------------------------

library(tidyverse)
library(shiny)
library(shinyjs)

ui <- fluidPage(
  useShinyjs(),
  tags$head( includeScript("script.js"), includeCSS("style.css") ),
  titlePanel("mincodeR"),
  sidebarLayout(
    sidebarPanel(
      fluidRow(tags$div(id="mcr_gui_sidebar"))
    ),
    mainPanel(
        fluidRow(tags$div(id="mcr_gui_main"))
    )
  ),
)

server <- function(input, output, session) {
  runjs( 
    paste0(
      "start_front( 
        codes = " , jsonlite::toJSON( codes2 ), " ,
        documents = " , jsonlite::toJSON( sentences$sentence ), ", 
        gui_type = 'Document-x-1-code' 
        );" ))
}

runApp(list(ui = ui, server = server), launch.browser =F)



# # esto para intentar devolver un valor de js a R session
# # en ui:
# fluidRow(textAreaInput("return_json", label = NULL)),
# singleton(tags$script(HTML('$("#return_json").on("click", function(){
#     Shiny.onInputChange("buttonClicked", Math.random());
#   })'
# ))),
# # en server:
# observeEvent(input$buttonClicked, { # así se escuchan eventos
#   print("json clickeado")
# })
# # en js:
# var return_json = document.getElementById('return_json');
# return_json.value = JSON.stringify(this.code_document_json)
# return_json.onclick = function (evt) {
#   console.log(evt.target.value);
# }
