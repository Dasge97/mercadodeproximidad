-- Active: 1762442615612@@127.0.0.1@3306
-- ======================================
-- BASE DE DATOS
-- ======================================
CREATE DATABASE IF NOT EXISTS terretashop_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE terretashop_db;

-- ======================================
-- USUARIOS
-- ======================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  nickname VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  tipo ENUM('comprador', 'vendedor', 'admin') NOT NULL,
  lat DECIMAL(10,8) DEFAULT NULL,
  lng DECIMAL(11,8) DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- CATEGORIAS
-- ======================================
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT
);

-- ======================================
-- PRODUCTOS
-- ======================================
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  id_categoria INT,
  tipo VARCHAR(50), -- kg, litros, unidades...
  stock DECIMAL(10,2) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(255),
  id_vendedor INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duracion_producto INT, -- días

  CONSTRAINT fk_producto_vendedor
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_producto_categoria
    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
    ON DELETE SET NULL
);

-- ======================================
-- PUNTOS DE ENTREGA
-- ======================================
CREATE TABLE puntos_entrega (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_vendedor INT NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  descripcion VARCHAR(255),

  CONSTRAINT fk_punto_vendedor
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ======================================
-- RESERVAS
-- ======================================
CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_vendedor INT NOT NULL,
  id_comprador INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  id_punto_entrega INT NOT NULL,
  estado ENUM('pendiente', 'aceptada', 'rechazada', 'cancelada', 'completada')
    DEFAULT 'pendiente',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_entrega DATE,

  CONSTRAINT fk_reserva_vendedor
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id),

  CONSTRAINT fk_reserva_comprador
    FOREIGN KEY (id_comprador) REFERENCES usuarios(id),

  CONSTRAINT fk_reserva_producto
    FOREIGN KEY (id_producto) REFERENCES productos(id),

  CONSTRAINT fk_reserva_punto
    FOREIGN KEY (id_punto_entrega) REFERENCES puntos_entrega(id)
);

-- ======================================
-- VALORACIONES
-- ======================================
CREATE TABLE valoraciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  id_autor INT NOT NULL,
  id_destinatario INT NOT NULL,
  nota_producto TINYINT CHECK (nota_producto BETWEEN 1 AND 5),
  nota_entrega TINYINT CHECK (nota_entrega BETWEEN 1 AND 5),
  nota_negociacion TINYINT CHECK (nota_negociacion BETWEEN 1 AND 5),
  comentario TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_valoracion_reserva
    FOREIGN KEY (id_reserva) REFERENCES reservas(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_valoracion_autor
    FOREIGN KEY (id_autor) REFERENCES usuarios(id),

  CONSTRAINT fk_valoracion_destinatario
    FOREIGN KEY (id_destinatario) REFERENCES usuarios(id)
);

-- ======================================
-- NOTIFICACIONES
-- ======================================
CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  id_usuario INT NOT NULL,
  tipo ENUM('aceptada', 'recibido', 'cancelada', 'pendiente') NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_notificacion_reserva
    FOREIGN KEY (id_reserva) REFERENCES reservas(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_notificacion_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
    ON DELETE CASCADE
);


-- ======================================
-- MENSAJES
-- ======================================
CREATE TABLE mensajes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  id_comprador INT NOT NULL,
  id_vendedor INT NOT NULL,
  mensaje TEXT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_mensaje_reserva
    FOREIGN KEY (id_reserva) REFERENCES reservas(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_mensaje_comprador
    FOREIGN KEY (id_comprador) REFERENCES usuarios(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_mensaje_vendedor
    FOREIGN KEY (id_vendedor) REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ======================================
-- DATOS DE PRUEBA
-- ======================================
INSERT INTO usuarios (id, nombre, nickname, email, contrasena, tipo, lat, lng) VALUES
  (1, 'Admin Demo', 'admin_demo', 'admin@demo.local', '$2a$10$CUsoJoPMovPnXgSY2lbYBebnxfpMSnK.vPhDaqYTSpC0Uk73wZczq', 'admin', 39.074900, -0.269700),
  (2, 'Vendedor Tavernes', 'vendedor_tv', 'vendedor@demo.local', '$2a$10$GmvwttnPgr6vYMFGQRVTBOInnbr9x229R5v5jaGNj.BZ1goKlqGHa', 'vendedor', 39.074900, -0.269700),
  (3, 'Comprador Demo', 'comprador_demo', 'comprador@demo.local', '$2a$10$0F1hMFG4ol52n4V/3fBkpObqQgTnGD1W/dre3IJbc1HiPsKo4VU2G', 'comprador', 39.080000, -0.270000),
  (4, 'Vendedor Playa', 'vendedor_playa', 'playa@demo.local', '$2a$10$vn7y69iWtREgFuUfYv115eTopLzJRCMT/bmGuVVqZGQQyvr4VpnsC', 'vendedor', 39.100000, -0.230000),
  (5, 'Comprador Centro', 'comprador_centro', 'centro@demo.local', '$2a$10$hMdTTy0vNUtkfPJJzVRtrex0lCWz.grm/zOPYdhPrVQjqPvbJyhuq', 'comprador', 39.050000, -0.300000);

INSERT INTO categorias (id, nombre, descripcion) VALUES
  (1, 'Verduras', 'Verdura fresca de proximidad'),
  (2, 'Fruta', 'Fruta de temporada'),
  (3, 'Aceite', 'Productores locales');

INSERT INTO productos (id, nombre, id_categoria, tipo, stock, precio, descripcion, imagen, id_vendedor, duracion_producto) VALUES
  (1, 'Tomate Valenciano', 1, 'kg', 50, 2.80, 'Tomate de la huerta de la Valldigna', NULL, 2, 5),
  (2, 'Naranjas Lane Late', 2, 'kg', 120, 1.50, 'Naranja dulce de Tavernes', NULL, 2, 10),
  (3, 'Aceite de Oliva', 3, 'L', 30, 8.90, 'Aceite suave de almazara cercana', NULL, 2, 180),
  (4, 'Miel de Azahar', 3, 'L', 25, 9.50, 'Miel local de azahar', NULL, 4, 90),
  (5, 'Lechuga Marina', 1, 'ud', 80, 1.20, 'Lechuga cultivada cerca de la costa', NULL, 4, 7);

INSERT INTO puntos_entrega (id, id_vendedor, lat, lng, descripcion) VALUES
  (1, 2, 39.074964, -0.269870, 'Mercado Municipal, Tavernes de la Valldigna'),
  (2, 2, 39.067500, -0.246900, 'Playa de Tavernes - aparcamiento principal'),
  (3, 2, 39.092000, -0.290000, 'Rotonda entrada por CV-50'),
  (4, 4, 39.105000, -0.240000, 'Paseo marítimo, punto info'),
  (5, 4, 39.095000, -0.220000, 'Parking playa norte');

INSERT INTO reservas (id, id_vendedor, id_comprador, id_producto, cantidad, id_punto_entrega, estado, fecha_entrega) VALUES
  (1, 2, 3, 1, 2.50, 1, 'pendiente', '2025-12-30'),
  (2, 4, 3, 4, 1.00, 4, 'pendiente', '2025-12-28');

INSERT INTO mensajes (id, id_reserva, id_comprador, id_vendedor, mensaje) VALUES
  (1, 1, 3, 2, 'Hola, ¿puedes llevar 2.5 kg mañana al mercado?');

INSERT INTO valoraciones (id, id_reserva, id_autor, id_destinatario, nota_producto, nota_entrega, nota_negociacion, comentario) VALUES
  (1, 1, 3, 2, 5, 5, 5, 'Todo perfecto');
