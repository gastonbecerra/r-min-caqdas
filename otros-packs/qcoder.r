install.packages("remotes")
remotes::install_github("ropenscilabs/qcoder")
library(qcoder)
create_qcoder_project("my_qcoder_project", sample = TRUE)
import_project_data(project = "my_qcoder_project")
qcode()
