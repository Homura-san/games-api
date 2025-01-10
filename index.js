require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const connection = require('./database/database');

const Game = require('./games/Game');
const User = require('./users/User');

app.use(cors());

// Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// JWT
const JWTsecret = process.env.JWTSECRET;

// Database
connection
    .authenticate()
    .then(() => {
        console.log('Conexão feita')
    }).catch((err) => {console.log(err)})


    // Requisitar todos os dados da tabela games
    app.get('/games', (req, res) => {
    Game.findAll().then(game => res.json(game))
})

// Requisitar dado por id
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

// Criar novo game
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

// Deletar game por id
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

// editar dados do game
app.put('/game/:id', async (req, res) => {
    if (isNaN(req.params.id)) {
        return res.sendStatus(400); // Retorna se o ID não for um número
    }

    const id = parseInt(req.params.id);
    const { title, year, price } = req.body;

    try {
        // Array para armazenar as atualizações
        const updates = [];

        // Adiciona as atualizações de acordo com os parâmetros enviados
        if (title !== undefined) {
            updates.push(Game.update({ title }, { where: { id } }));
        }
        if (year !== undefined) {
            updates.push(Game.update({ year }, { where: { id } }));
        }
        if (price !== undefined) {
            if (isNaN(price)) {
                return res.sendStatus(400); // Retorna se o preço não for um número
            }
            updates.push(Game.update({ price }, { where: { id } }));
        }

        // Aguarda todas as atualizações serem concluídas
        await Promise.all(updates);

        res.sendStatus(200); // Envia uma única resposta de sucesso
    } catch (error) {
        console.error(error); // Loga o erro para depuração
        res.sendStatus(404); // Envia uma resposta de erro
    }
});


// Autenticação da API - Requer implementar JWT
app.post("/auth", async(req, res) => {
    var {email, password} = req.body

    if(email != undefined){
        user = await User.findOne({
            where: {email: email}
        })
        if (user != undefined){

            if (user.password == password){
                jwt.sign({id: user.id, email: user.email}, JWTsecret, {expiresIn: '48h'}, (err, token) => {
                    if(err){
                        res.status = 400;
                        res.json({err: "Falha interna"})
                    }else{
                        res.status = 200;
                        res.json({token: token})
                    }
                })
            }else{ 
                res.status = 401;
                res.json({err: "Credenciais inválidas."})
            }

        }else{
            res.status = 404;
            res.json({err: "O E-mail enviado não existe na base de dados!"})    
        }
    }else{
        res.status = 400;
        res.json({err: "O Email enviado é inválido."})
    }
})

// Cadastro de usuários - Implementar
app.post('/user', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        // Se algum campo estiver ausente, retorna um erro 400
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Cria o usuário no banco de dados
        await User.create({
            name,
            email,
            password
        });

        // Retorna sucesso
        res.sendStatus(201); // 201 é o status correto para criação de recursos
    } catch (err) {
        console.error(err); // Loga o erro para depuração
        res.status(500).json({ error: 'Erro no servidor ao criar o usuário.' }); // Envia um erro mais informativo
    }
});


app.listen(45678, () => {
    console.log('API rodando!');
})

// app.post('/users', (req, res) => {
//     var usuario = {
//         name: "Erick Patrick",
//         email: "erick@email.com",
//         password: '123456'
//     }

//     User.create({
//         ...usuario
//     }).then(() => {
//         res.json("Feito!")
//     }).catch(err => {
//         res.json("Ocorreu um erro: "+ err)
//     })
// })