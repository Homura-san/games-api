const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const connection = require('./database/database')

const Game = require('./games/Game')

// Body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

var DB = {
    games: [
        {
            id: 23,
            title: "call of duty MW",
            year: 2019,
            price: 60
        },
        {
            id: 65,
            title: "Sea of Thieves",
            year: 2018,
            price: 40
        },
        {
            id: 2,
            title: "Minecraft",
            year: 2012,
            price: 20
        }
    ]
}

app.get('/games', (req, res) => {
    res.statusCode = 200;
    res.json(DB.games)
})

app.get('/game/:id', (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id)

        var game = DB.games.find(g => g.id == id)

        if(game != undefined){
            res.statusCode = 200;
            res.json(game)
        }else{
            res.sendStatus(404);
        }
    }    
})

// Atualizado pro sequelize
app.post('/game', (req, res) => {
    // Precisa de verificação
    var {title, year, price} = req.body;

    if(title !== undefined && year !== undefined && price !== undefined){
        Game.create({
            title,
            year,
            price
        }).then(() => {
            res.sendStatus(200)
        }).catch(err => {
            res.sendStatus(500)
        })
    
    }else{
        res.sendStatus(400)
    }

    

})

app.delete('/game/:id', (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id)
        var index = DB.games.findIndex(g => g.id == id)
        
        if(index == -1){
            res.sendStatus(404)
        }else{
            DB.games.splice(index, 1)
            res.sendStatus(200)
        }
    } 
})

app.put('/game/:id', (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id)

        var game = DB.games.find(g => g.id == id)

        if(game != undefined){
            // Não possui verificação porque alguns campos podem vir nulos
            var {title, year, price} = req.body;

            if(title !== undefined){
                game.title = title;
            }

            if(year !== undefined){
                game.year = year;
            }

            if(price !== undefined){
                if(isNaN(price)){
                    res.sendStatus(400)
                }else{
                    game.price = price;
                }
            }

            res.sendStatus(200)
        }else{
            res.sendStatus(404);
        }
    }
})

app.listen(45678, () => {
    console.log('API rodando!');
})