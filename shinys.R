# aca van los protos de los GUIs

# https://www.listendata.com/2018/12/javascript-shiny-r.html
# https://unleash-shiny.rinterface.com/shiny-intro.html#shiny-intro

#la onda es hacer 2 GUIs
#- codificar documentos
#- seleccionar fragmentos y codificarlos
#la joda es: 
#- meter JS y hacerlo hablar con R (e.g., un JSON de resultados)
#- hay controles (e.g., acordeón) para mostrar frases y documentos?


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

ui <- dashboardPage(
    dashboardHeader(title = "caqdas fns"),
    dashboardSidebar(),
    dashboardBody(
      singleton(tags$head(
        includeScript("script.js"),
        includeCSS("style.css")
      )),
      fluidRow(box(inputPanel(selectInput("documento", "Documento a etiquetar:", documentos_selector)))),
      fluidRow(box(textOutput("text2"))),
      fluidRow(
        box(
          tags$body(HTML("<div id='content1'><p><button onclick='arrancar()'>A darle atomos!</button></p><div id='content2'></div></div>")), 
          height = 150
          )
      ),
      fluidRow(
        box(
          tags$body(HTML("<div id='content3'></div>")), 
          height = 150
          )
      )
))

server = function(input, output) {
  for (i in 1:length(codes2)) {
    #runjs(paste0("var x", i ," = TRUE;"))
  }
  runjs("var today = new Date(); alert(today);")
  output$text2 <- renderText({ 
    sentences2$oraciones[input$documento %>% devolver_numero_documento()]
  })
}

runApp(list(ui = ui, server = server), launch.browser =F)


# 2DO:
# - poner los botones de los codigos programaticamente
# - cuando se hace click en boton, armar un JSON con los datos de la oración y el codigo
# - bajar el JSON






ui <- fluidPage(
  useShinyjs(),  # Set up shinyjs
  tags$div(id="code_buttons"),
  tags$head(
        includeScript("script.js"),
        includeCSS("style.css")
      )  
)
server <- function(input, output, session) {
  runjs( 
    paste0(
      "insert_code_buttons( " ,
      jsonlite::toJSON( list(codes2) ),
      " );" ))
}

runApp(list(ui = ui, server = server), launch.browser =F)

















# https://shiny.rstudio.com/articles/action-buttons.html

ui <- fluidPage(
  useShinyjs(),  # Set up shinyjs
  uiOutput("col"),
  tags$div(id="content3"),
  tags$head(
        includeScript("script.js"),
        includeCSS("style.css")
      )  
)
server <- function(input, output, session) {
  col_names <- reactive(codes2)
  output$col <- renderUI({
    # map(col_names(), ~ actionButton(.x, codes))
    map(codes2, ~ actionButton(.x, .x))
  })
  output$palette <- renderText({
    #map_chr(col_names(), ~ input[[.x]] %||% "")
  })
  runjs("var today = new Date(); alert(today);")  
  print(jsonlite::toJSON( codes2 ))
  runjs( paste0("var cars = ", jsonlite::toJSON( list(codes2) ) , "; poner_botones(cars);" ))  
}

runApp(list(ui = ui, server = server), launch.browser =F)





 
ui <- fluidPage(
  useShinyjs(),  # Set up shinyjs
  actionButton("btn", "Click me")
)
server <- function(input, output) {
  observeEvent(input$btn, {
    # Run JS code that simply shows a message
    runjs("var today = new Date(); alert(today);")
  })
}
runApp(list(ui = ui, server = server), launch.browser =F)
 
 



# OTROS INTENTOS ---------------------------------------------------------------------------






ui <- fluidPage(
  tags$script(
    "$(function() {
      console.log(Shiny);
    });
    "
  )
)
server <- function(input, output, session) {}
shinyApp(ui, server, options=c("launch.browser"=FALSE))




library(httpuv)
httpuv_app <- function(delay = NULL) {
  s <- httpuv::startServer(
    "127.0.0.1",
    8080,
    list(
      call = function(req) {
        list(
          status = 200L,
          headers = list(
            'Content-Type' = 'text/html'
          ),
          body = '
            <!DOCTYPE HTML>
            <html lang="en">
              <head>
                <script language="javascript">
                  document.addEventListener("DOMContentLoaded", function(event) {
                    var gauge = document.getElementById("mygauge");
                    // Initialize client socket connection
                    var mySocket = new WebSocket("ws://127.0.0.1:8080");
                    mySocket.onopen = function (event) {
                      // do stuff
                    };
                    // update the gauge value on server message
                    mySocket.onmessage = function (event) {
                      var data = JSON.parse(event.data);
                      gauge.value = data.val;
                    };
                    var sliderWidget = document.getElementById("slider");
                    var label = document.getElementById("sliderLabel");
                    label.innerHTML = "Value:" + slider.value; // init
                    // on change
                    sliderWidget.oninput = function() {
                      var val = parseInt(this.value);
                      mySocket.send(
                        JSON.stringify({
                          value: val,
                          message: "New value for you server!"
                        })
                      );
                      label.innerHTML = "Value:" + val;
                    };
                  });
                </script>
                <title>Websocket Example</title>
              </head>
              <body>
                <div>
                  <input type="range" id="slider" name="volume" min="0" max="100">
                  <label for="slider" id ="sliderLabel"></label>
                </div>
                <br/>
                <label for="mygauge">Gauge:</label>
                <meter id="mygauge" min="0" max="100" low="33" high="66" optimum="80" value="50"></meter>
              </body>
            </html>
          '
        )
      },
      onWSOpen = function(ws) {
        # The ws object is a WebSocket object
        cat("New connection opened.\n")
        # Capture client messages
        ws$onMessage(function(binary, message) {

          # create plot
          input_message <- jsonlite::fromJSON(message)
          print(input_message)
          cat("Number of bins:", input_message$value, "\n")
          hist(rnorm(input_message$value))
          if (!is.null(delay)) Sys.sleep(delay)

          # update gauge widget
          output_message <- jsonlite::toJSON(
            list(
              val = sample(0:100, 1),
              message = "Thanks client! I updated the plot..."
            ),
            pretty = TRUE,
            auto_unbox = TRUE
          )
          ws$send(output_message)
          cat(output_message)
        })
        ws$onClose(function() {
          cat("Server connection closed.\n")
        })
      }
    )
  )
  s
}

httpuv_app()




library(shiny)
shinyApp(
  ui = fluidPage(
    selectInput(
      "variable", 
      "Variable:",
      c("Cylinders" = "cyl",
        "Transmission" = "am",
        "Gears" = "gear")
    ),
    tableOutput("data")
  ),
  server = function(input, output) {
    output$data <- renderTable({
      mtcars[, c("mpg", input$variable), drop = FALSE]
    }, rownames = TRUE)
  },
  options=c("launch.browser"=FALSE)
)