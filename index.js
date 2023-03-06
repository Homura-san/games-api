const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const connection = require('./database/database')

const Game = require('./games/Game')

app.use(cors())

// Body parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Database
connection
    .authenticate()
    .then(() => {
        console.log('Conexão feita')
    }).catch((err) => {console.log(err)})

    app.get('/games', (req, res) => {
    Game.findAll().then(game => res.json(game))
})

app.get('/game/:id', (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id)

        Game.findOne({
            where: {id}
        }).then(game => {
            if(game != undefined){
                res.statusCode = 200;
                res.json(game)
            }else{
                res.sendStatus(404);
            }
        }).catch(err => res.sendStatus(500));
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
        
        Game.destroy({where: {id: id}}).then(() => {
            res.sendStatus(200)
        }).catch(err => res.sendStatus(404));
    } 
})

app.put('/game/:id', (req, res) => {
    
    async function up(params, where) {
        try {
            await Game.update( {...params}, {where: {...where}})
            res.sendStatus(200)   
        } catch (error) {
            res.sendStatus(404)
        }
    }
    
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id)

        var {title, year, price} = req.body;
        if(title !== undefined){
            up({title: title}, {id: id});
        }

        if(year !== undefined){
            up({year: year}, {id: id});
        }

        if(price !== undefined){
            if(isNaN(price)){
                res.sendStatus(400)
            }else{
                up({price: price}, {id: id});
            }
        }
    }
})

app.listen(45678, () => {
    console.log('API rodando!');
})

// var DB = {
//     games: [
//         {
//             id: 23,
//             title: "call of duty MW",
//             year: 2019,
//             price: 60
//         },
//         {
//             id: 65,
//             title: "Sea of Thieves",
//             year: 2018,
//             price: 40
//         },
//         {
//             id: 2,
//             title: "Minecraft",
//             year: 2012,
//             price: 20
//         }
//     ]
// }