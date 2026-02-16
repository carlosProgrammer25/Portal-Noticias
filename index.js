/*
node -> ambiente de execucao js no servidor
express -> framework node para criacao de servidor, rotas...
ejs -> mecanismo de modelo usada para renderizar HTML dinamicamente (html + js)
mongoose -> biblioteca para trabalhar com MongoDB usando Node
path -> path é um módulo nativo do Node.js. serve para trabalhar com caminhos de arquivos e pastas
*/
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
//pegando o valor exportado pelo arquivo -> posts model do mongoose
const Posts = require('./Posts.js');



            //configurações são do Express
//Permite o Express receber JSON que vem do cliente
app.use(express.json());
//Permite Express receber dados de formulário (form HTML)
app.use(express.urlencoded({ extended: true }));
//Define o EJS como motor para renderizar HTML
app.engine('html', require('ejs').renderFile);
//Diz que o documento sera do tipo  html motor para renderizar
app.set('view engine', 'html');
//Libera a pasta "public" para arquivos estáticos (css, imagens, js)
//Qualquer arquivo dentro da pasta public pode ser acessado pelo navegador
app.use('/public', express.static('public'));
//Define onde ficam os arquivos das páginas(páginas que eu vou renderizar)
app.set('views', path.join(__dirname, './pages'));


//ponto de entrada da conexão com o banco
//banco 'danki
//usuario e senha root:oEBWEbuIHtcxC7qX@cluster0
mongoose.connect('mongodb+srv://root:oEBWEbuIHtcxC7qX@cluster0.kme1j.mongodb.net/danki')
.then(() => {
    console.log('MongoDB conectado');
})
.catch(err => {
  console.error(err);
});




                    //CAMINHOS
//rota raiz do site: app.get('/', async (req, res)
app.get('/', async (req, res) => {

    //try e catch -> serve para tratar erros e evitar que o programa quebre
    try {
        // Home sem busca, caso busca seja enviada null
        if (!req.query.busca) {

            //await usando para aguardar a promise ser resolvida
            //find() metodo do model , fornecido pelo mongoose -> buscar documentos na colecao
            //find({sem filtro, retorna todos os documentos})
            //.sort(id -1) organiza documentos pelo campo id de forma decrescente
            const posts = await Posts.find({}).sort({ _id: -1 });

            console.log(posts);

            //organiza docuemtntos pelo campo viwes de forma decrescente com limite de resultado 3 documentos
            const postsTop = await Posts.find({}).sort({ views: -1 }).limit(3);

            //tratamento de dados antes de renderizar
            //map percorre o array e cria um novo array pelo callback
            //map(parametro => {}) val recebe documentos e elementos do campo id
            const postsFormatados = posts.map(val => ({

                //Cada iteração do map pega um documento e cria um objeto novo
                titulo: val.titulo,
                conteudo: val.conteudo,
                descricaoCurta: val.conteudo.substr(0, 7),
                imagem: val.imagem,
                slug: val.slug,
                categoria: val.categoria
            }));

            
            //tratamento de dados antes de renderizar
            const postsTopFormatados = postsTop.map(val => ({
                titulo: val.titulo,
                conteudo: val.conteudo,
                descricaoCurta: val.conteudo.substr(0, 100),
                imagem: val.imagem,
                slug: val.slug,
                categoria: val.categoria,
                views: val.views
            }));

            //renderizando a home com dados formatados
            return res.render('home', {
                //postsFormatados == todos os dados do banco
                posts: postsFormatados,
                //postsTopFormatados === todos os documentos pelo campo viwes
                postsTop: postsTopFormatados
            });
        }
        else{            
            // home com busca
            const postsBusca = await Posts.find({
                //titulo campo do schema -> referencia ao campo do documento
                //regex: req.query.busca procura textos que contenham o valor digitado na URL
                //$options: 'i' ignora maiúsculas e minúsculas
                titulo: { $regex: req.query.busca, $options: 'i' }
            });

            //tratamento de dados antes de renderizar
            const postsBuscaFormatados = postsBusca.map(val => ({
                titulo: val.titulo,
                conteudo: val.conteudo,
                descricaoCurta: val.conteudo.substr(0, 100),
                imagem: val.imagem,
                slug: val.slug,
                categoria: val.categoria,
                views: val.views,
                autor: val.autor
            }));

            //renderizando pagina busca
            res.render('busca', {
                //documentos encontrados na busca
                posts: postsBuscaFormatados,
                //numero de documentos retornado do banco
                contagem: postsBuscaFormatados.length
            });
        };
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    };
});

//slug aqui é o nome do caminho da rota
//slug nome da variavel(parametro url) que armazena o valor enviado na url
//Sim — o slug é basicamente um identificador amigável do documento, usado na URL para buscar ele no banco
app.get('/:slug', async (req, res) => {

    //try e catch -> serve para tratar erros e evitar que o programa quebre
    try {

        //pega o valor da url amigavel e se encontrar o documento referente ao valor. faça atualizacao
        //respota armazena o documento que foi alterado
        const resposta = await Posts.findOneAndUpdate(
            //slug foi criado no model(Schema)
            //representa um campo do documento no banco
            //req.params.slug é o valor que veio da URL
            //O MongoDB verifica se existe um documento cujo campo slug tenha valor vindo na url amigavel
            { slug: req.params.slug },
            //inc define qual campo sera atualizado
            //incremente +1 no campo views onde valor da url amigavel seja compativel com campo slug
            { $inc: { views: 1 } },
            //sem usar new true, findOneAndUpdate retorna o documento com valor antigo do campo.
            { new: true }
        );

        //se não encontrar valor no campo slug redireciona para caminho raiz
        if (!resposta) {
            return res.redirect('/');
        }

        const postsTop = await Posts
            //encontrar sem filtro
            .find({})
            //organize o documento retornado pelo campo views do documento de forma decrescente
            //Banco de Dados → Collection(Posts) → Documentos
            .sort({ views: -1 })
            .limit(3);

        const postsTopFormatados = postsTop.map(val => ({
            titulo: val.titulo,
            conteudo: val.conteudo,
            descricaoCurta: val.conteudo.substr(0, 100),
            imagem: val.imagem,
            slug: val.slug,
            categoria: val.categoria,
            views: val.views
        }));

        //single rendezia banco de dado
        res.render('single', {
            //esse é o documento encontrado no banco de dados, que faz referencia ao campo slug
            noticia: resposta,
            //nesse sera renderizado os documento/noticias com base em views em ordem decrescente
            postsTop: postsTopFormatados
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao carregar notícia');
    }
});

//app.listen() faz o servidor começar a "escutar" requisições HTTP em uma porta específica.
//Ele é chamado uma única vez, quando o servidor inicia.
app.listen(5000, () => {
    console.log('servidor rodando');
});
