const express = require("express")
const app = express()

app.use(express.json())
app.use(require("cors")())
app.use(require("express-fileupload")({ createParentPath: true }))

app.use("/", require("./Routes/GoogleDriveRoutes"))

app.listen(3001, () => {
    console.log(`Server is runing on 3001 port`)
})