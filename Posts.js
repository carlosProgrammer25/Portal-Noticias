//Object Data Modeling = Modelagem de dados por objetos
//mongoose uma biblioteca faz a ponte js e banco de dados
//mongoose é usado apenas dentro do ambiente node
var mongoose = require('mongoose');

//Schema é uma classe usada para definir a estrutura dos dados
var Schema  = mongoose.Schema;

//criando objeto schema
var postSchema = new Schema({

    //definindo tipo de dado que sera manipulado em cada atributo
    //Os nomes dos atributos do schema fazem referência direta aos campos (keys) dos documentos da coleção no MongoDB
    titulo:String,
    imagem: String,
    categoria: String,
    conteudo: String,
    slug: String,
    autor: String,
    views: Number

    //Este schema/model vai usar a collection posts dentro do banco de dados danki
},{collection:'posts'})

//Cria um Model chamado Posts, baseado no postSchema
var Posts = mongoose.model("Posts",postSchema);

//exportando model
module.exports = Posts;


//O Model é usado para interagir com o banco, e o Mongoose é a biblioteca que conecta o Node ao MongoDB e aplica a validação definida no Schema