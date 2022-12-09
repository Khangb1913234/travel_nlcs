const express = require("express")
const path = require("path")
const { engine } = require("express-handlebars")
const cors = require('cors')
const methodOverride = require('method-override')
const app = express()
const PORT = 3000
const setupHomePageRoutes = require("./routes/home_page.route")
const setupDestinationRoutes = require("./routes/destinations.route")
const setupMeRoutes = require("./routes/me.route")
const setupAccountRoutes = require("./routes/account.route")
const setupVillageRoutes = require("./routes/village.route")
//const setupCommentRoutes = require("./routes/comment.route")
const setupTourRoutes = require("./routes/tour.route")
const setupRatingRoutes = require("./routes/rating.route")
const setupTypeRoutes = require("./routes/type.route")
const setupServiceRoutes = require("./routes/service.route")
const setupApprovalRoutes = require("./routes/approval.route")
const db = require("./config/db")
const cookieParser = require('cookie-parser')
const sortMiddleware = require("./app/middlewares/sort.middleware")
const pagingMiddleware = require("./app/middlewares/paging.middleware")
db.connect()

app.engine("hbs", engine({
    extname: "hbs",
    helpers: {
        sum: function(a, b){
            return a+ b
        },
        sumPage: function(a, b, c){
            var n = parseInt(a)
            if(n < 1 || Number.isNaN(n))
                n = 1
            else if(n > c - 1)
                n = c - 1
            return n+b
        },
        exceptPage: function(a, b){
            var n = parseInt(a)
            if(n < 2 || Number.isNaN(n))
                n = 2
            return n-b
        },
        sort: function(field, _sort){
            const icons = {
                default: "oi oi-elevator",
                asc: "oi oi-sort-ascending",
                desc: "oi oi-sort-descending"
            }
            const types = {
                default: "desc",
                asc: "desc",
                desc: "asc"
            }
            const preventAgain = field === _sort.column ? _sort.type : "default"
            const typeIcon = icons[preventAgain]
            const typeSort = types[preventAgain]
            return `<a href="?_sort&column=${field}&type=${typeSort}"><span class="${typeIcon}"></span></a>`
        },
        displayPage: function(pageNumber, total, href){
            if(total == 1 || total == 2)
                return ''
            var n = parseInt(pageNumber)
                if(n){
                    if (n < total - 1)
                        return `<li class="page-item"><a class="page-link" href="${href}=${n + 1}">${n + 1}</a></li>`
                    else if(n == total - 1){
                        if(n != 0)
                            return `<li class="page-item"><a class="page-link" href="${href}=${n}">${n}</a></li>`
                        else    
                            return `<li class="page-item"><a class="page-link" href="${href}=${n}">${n+3}</a></li>`
                    }
                    else
                        return `<li class="page-item"><a class="page-link" href="${href}=${n-1}">${n-1}</a></li>`
                }
            
        },
        khang: function(a){
            var i
            var length = a.length
            return a.name
        }   
    }
}));
app.set("view engine", 'hbs');
app.set("views", path.join(__dirname, "resources/views"))

app.use(cookieParser())
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))
app.use(methodOverride('_method'))
app.use(sortMiddleware)
app.use(pagingMiddleware)

setupHomePageRoutes(app)
setupApprovalRoutes(app)
setupDestinationRoutes(app)
setupMeRoutes(app)
setupAccountRoutes(app)
setupVillageRoutes(app)
setupTourRoutes(app)
setupRatingRoutes(app)
setupTypeRoutes(app)
setupServiceRoutes(app)

app.listen(PORT, function(){
    console.log(`Runing at: http://localhost:${PORT}/login`)
})