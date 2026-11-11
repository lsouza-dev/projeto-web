CREATE SCHEMA IF NOT EXISTS mostruario_db;
USE mostruario_db;

CREATE TABLE IF NOT EXISTS usuarios (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS lojas (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) ,
    imagem_url VARCHAR(255),
    id_usuario INT NOT NULL,
    CONSTRAINT fk_lojas_usuarios
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id)
);


CREATE TABLE IF NOT EXISTS produtos (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    preco FLOAT NOT NULL DEFAULT 0,
    quantidade INT NOT NULL DEFAULT 0,
    id_categoria INT NOT NULL,
    id_loja INT NOT NULL,
    imagem_url VARCHAR(255),
	CONSTRAINT fk_produtos_categorias
    FOREIGN KEY (id_categoria)
    REFERENCES categorias (id),
    CONSTRAINT fk_produtos_lojas
    FOREIGN KEY (id_loja)
    REFERENCES lojas (id)
);










