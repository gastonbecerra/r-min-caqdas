# Import and tokenize ---------

library(tidyverse)
library(tidytext)
library(readtext)

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

# Hacer interfaz ---------

## en html ---------
## con js ---------
## interaccion por consola ---------

interactive()
readline(prompt = "Enter any number : ")

menu( graphics = TRUE, choices = c("Yes", "No"), title="Do you want this?")
menu( choices = c("Yes", "No"), title="Do you want this?")
askYesNo("Do you want to use askYesNo?")

## interaccion con shiny -------


# shiny con js

# https://shiny.rstudio.com/articles/communicating-with-js.html
# https://unleash-shiny.rinterface.com/survival-kit-javascript.html
# https://engineering-shiny.org/using-javascript.html#using-javascript
# https://stackoverflow.com/questions/63882575/sending-javascript-in-shiny
# https://appsilon.com/super-solutions-for-shiny-architecture-2-javascript-is-your-friend/
