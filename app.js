const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const path = require('path');
const { Script } = require('vm');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuração do MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  port:'3306',
   password: 'Fleabag84@',
   database: 'doadiv'
});

connection.connect();


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sobre.html'));
});
app.use(express.static(path.join(__dirname, 'public')));



// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`Requisição para recurso estático: ${req.path}`);
    next();
});
app.use((req, res, next) => {
    console.log(`Recebendo solicitação: ${req.method} ${req.path}`);
    console.log('Body:', req.body);
    next();
});

app.use(express.static(__dirname));
app.use(session({
    secret: 'seu_segredo_aqui',  // Escolha um valor secreto para assinar o ID da sessão.
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Defina como true se estiver usando HTTPS
  }));

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.use(bodyParser.json());


app.post('/usuario', (req, res) => {
    const { nome, email, senha ,confirmar_senha } = req.body;

    console.log("Dados recebidos:", req.body);  // Log dos dados recebidos
    console.log("Senha recebida:", senha);  // Log da senha



        
    if (senha !== confirmar_senha) {
        console.error("As senhas não coincidem");
        
        alert('Esta é uma mensagem de erro');
        
    } 

    //  const salt = bcrypt.genSaltSync(10);
    //  const hashedPassword = bcrypt.hashSync(senha, salt);
 


    const query = 'INSERT INTO dadosUsuario (nome, email, senha) VALUES (?,?,?)';
    connection.query(query, [nome, email, senha], (err, results) => {
        if (err) {
            console.error("Erro ao inserir os dados:", err);
            res.send("Erro ao cadastrar. Tente novamente.");
        } else {
            res.sendFile(__dirname + '/public/login.html');
        }
    });
});


app.post('/Ong', (req, res) => {
    const { email, senha, nome, fotoComprovante, categoria, descricao } = req.body;
    console.log("Senha recebida:", senha);  // Log da senha

    if (!senha) {
        console.error("Senha não fornecida ou indefinida");
        res.send("Erro ao cadastrar. Senha não fornecida.");
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(senha, salt);

    const query = 'INSERT INTO dadosOng (email, senha, nome, fotoComprovante, categoria, descricao) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [email, hashedPassword, nome, fotoComprovante, categoria, descricao], (err, results) => {
        if (err) {
            console.error("Erro ao inserir os dados:", err);
            res.send("Erro ao cadastrar. Tente novamente.");
        } else {
            res.sendFile(__dirname + '/public/login.html');
        }
    });
});

function verifyPassword(results, userType, req, res) {
    const storedPassword = results[0].senha; 
    const userInputPassword = req.body.senha; 

    
    if (userInputPassword === storedPassword) {
        console.log(`${userType} autenticado com sucesso`);
        res.redirect('/index.html'); 
    } else {
        console.log(`Senha incorreta para ${userType}`);
        res.status(401).send('<script>alert("Senha incorreta"); window.location.href = "/login.html";</script>');
    }
}












// Rota para processar o login
    app.post('/login', (req, res) => {
        console.log("Acessando rota /login");
        const { email, senha: senha} = req.body;
        console.log(`Dados de login recebidos: Email: ${email}, Senha: ${senha}`);

        const queryusuario = 'SELECT senha FROM dadosUsuario WHERE email = ?';
        connection.query(queryusuario, [email], (err, results) => {
            if (err) {
                console.error("Erro ao buscar o email na tabela Usuario:", err);
                res.status(500).send("Erro interno do servidor");
                return;
            }

            if (results.length === 0) {
                
                const queryong = 'SELECT senha FROM dadosOng WHERE email = ?';
                connection.query(queryong, [email], (err, results) => {
                    if (err) {
                        console.error("Erro ao buscar o email na tabela Ong:", err);
                        res.status(500).send("Erro interno do servidor");
                        return;
                    }
                    
                    if (results.length === 0) {
                        res.status(400).send("Email não encontrado");
                        return;
                    }

                   // verifyPassword(results, "Ong", req, res);
                });
        } 
       // else {
          //  verifyPassword(results, "Ong", req, res);
                
        //}
        });

    app.get('/index.html', function(req, res) {
        if (req.session.loggedin) {
          res.send('Welcome back, ' + req.session.username + '!');
        } else {
          res.send('Please login to view this page!');
        }
        res.end();
      });

    res.sendFile(__dirname + '/public/index.html');
   
});



// app.get('/perfil_ong', (req, res) => {
//     if (!req.session.ongEmail) {
//         return res.status(400).send("Monitor não autenticado");
//     }

//     const emailOng = req.session.ongEmail;
//     const query = 'SELECT * FROM dadosOng WHERE email = ?';

//     connection.query(query, [emailOng], (err, results) => {
//         if (err) {
//             console.error("Erro ao buscar os detalhes do monitor:", err);
//             res.status(500).send("Erro interno do servidor");
//             return;
//         }

//         if (results.length === 0) {
//             res.status(400).send("Monitor não encontrado");
//             return;
//         }

//         const monitorDetails = results[0];
//         res.json(monitorDetails);
//     });
// });


// app.get('/perfil_usuario', (req, res) => {
//     if (!req.session.usuarioEmail) {
//         return res.status(400).send("Aluno não autenticado");
//     }

//     const emailUsuario = req.session.usuarioEmail;
//     const query = 'SELECT * FROM dadosUsuario WHERE email = ?';

//     connection.query(query, [emailUsuario], (err, results) => {
//         if (err) {
//             console.error("Erro ao buscar os detalhes do usuario:", err);
//             res.status(500).send("Erro interno do servidor");
//             return;
//         }

//         if (results.length === 0) {
//             res.status(400).send("Usuario não encontrado");
//             return;
//         }

//         const usuarioDetails = results[0];
//         res.json(usuarioDetails);
//     });
// });



app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Erro ao realizar logout:", err);
            return res.send("Erro ao realizar logout. Tente novamente.");
        }
        res.redirect('/login.html');  // Redireciona para a página de login após o logout
    });
});



app.post('/processar_recuperacao_senha', (req, res) => {
    const { email, novaSenha } = req.body;

   
    const query = 'SELECT * FROM dadosusuario WHERE email = ?';
    connection.query(query, [email], (err, results) => {
        if (err) {
            console.error("Erro ao buscar os detalhes do aluno:", err);
            return res.send("Erro interno do servidor. Tente novamente.");
        }

        if (results.length === 0) {
            return res.send("E-mail incorreto.");
        }

        // Atualizar a senha no banco de dados
        const updateQuery = 'UPDATE dadosusuario SET senha = ? WHERE email = ?';
        connection.query(updateQuery, [novaSenha, email], (updateErr, updateResults) => {
            if (updateErr) {
                console.error("Erro ao atualizar a senha:", updateErr);
                return res.send("Erro interno do servidor. Tente novamente.");
            }
            
            res.redirect('/login.html');
        });
    });
});


app.post('/form', (req, res) => {
    const { nome,telefone,email,data_nascimento,outro_telefone,disponibilidade } = req.body;
  
    const query = 'INSERT INTO form ( nome,telefone,email,data_nascimento,outro_telefone,disponibilidade ) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [ nome,telefone,email,data_nascimento,outro_telefone,disponibilidade ], (err, results) => {
        if (err) {
            console.error("Erro ao inserir os dados:", err);
            res.send("Erro ao cadastrar. Tente novamente.");
        } else {
            res.sendFile(__dirname + '/public/index.html');
        }
    });
});











app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});