window.db = null;
store = {
    install : (successCB, errorCB) => {
        db.transaction(function(tx){
            tx.executeSql( 'CREATE TABLE IF NOT EXISTS category ( \
                name TEXT NOT NULL, \
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
            );' );
            
            tx.executeSql( 'CREATE TABLE IF NOT EXISTS users ( \
                username TEXT NOT NULL, \
                password TEXT NOT NULL, \
                email TEXT NOT NULL, \
                role TEXT NOT NULL, \
                business_name TEXT, \
                abn INTEGER, \
                business_type TEXT, \
                contact TEXT, \
                phone TEXT, \
                address TEXT, \
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP \
            );' );
            
            tx.executeSql( 'CREATE TABLE IF NOT EXISTS product ( \
                name TEXT NOT NULL, \
                price TEXT, \
                category INTEGER, \
                supplier INTEGER, \
                delivery_time TEXT, \
                photo TEXT, \
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
                FOREIGN KEY(category) REFERENCES category (rowid) \
                FOREIGN KEY(supplier) REFERENCES users (rowid) \
            );' );
        }, errorCB, successCB);
    },

    verifyUser: (username, password, successCB, errorCB) => {
        db.transaction(function(tx){
            let sql = `SELECT rowid, * FROM users WHERE username = "${username}" AND password = "${password}"`;
            tx.executeSql( sql, [], successCB, errorCB );
        });
    },

    createUser: (payload, successCB, errorCB) => {
        db.transaction(function(tx){
            let sql = `INSERT INTO users 
            (username, password, email, role, business_name, abn, business_type, contact, phone, address)
            VALUES (
                "${payload.username}",
                "${payload.password}",
                "${payload.email}",
                "${payload.role}",
                "${payload.business_name}",
                ${payload.abn},
                "${payload.business_type}",
                "${payload.contact}",
                "${payload.phone}",
                "${payload.address}"
            )`;

            console.log(sql);
            tx.executeSql(sql, [], successCB, errorCB);
        });
    },
    
    getProducts: (successCB, errorCB) => {
        db.transaction(function(tx){
            tx.executeSql( 'SELECT rowid, * FROM product', [], successCB, errorCB );
        });
    },

    getProductByID: (id, successCB, errorCB) => {
        db.transaction(function(tx){
            let sql = `SELECT p.rowid, * FROM product p, users u WHERE p.rowid = ${id} AND p.supplier = u.rowid`;
            tx.executeSql(sql, [], successCB, errorCB );
        });
    },

    getProductsByCategory: (cat, successCB, errorCB) => {
        db.transaction(function(tx){
            let sql = `SELECT p.rowid, c.name as title, p.* FROM product p, users u, category c WHERE p.category = ${cat} AND p.supplier = u.rowid AND p.category = c.rowid`;
            tx.executeSql(sql, [], successCB, errorCB );
        });
    },

    createProduct: (payload, successCB, errorCB ) => {
        db.transaction(function(tx){
            let sql = `INSERT INTO product 
            (name, price, category, supplier, delivery_time, photo ) 
            VALUES (
                "${payload.name}", 
                "${payload.price}", 
                ${payload.category}, 
                ${payload.supplier}, 
                "${payload.delivery_time}",
                "${payload.photo}"
                )`;
            tx.executeSql(sql,[], successCB, errorCB);
        });
    },

    deleteProduct: ( ID, successCB, errorCB ) => {
        db.transaction(function(tx){
            tx.executeSql( `DELETE FROM product WHERE rowid = ${ID}`, [], successCB, errorCB );
        });
    },

    updateProduct: (query, payload) => {},

    getCategory: (successCB, errorCB) => {
        db.transaction(function(tx){
            tx.executeSql( 'SELECT rowid, * FROM category', [], successCB, errorCB );
        });
    },

    createCategory: (payload, successCB, errorCB ) => {
        db.transaction(function(tx){
            tx.executeSql(`INSERT INTO category (name) VALUES ("${payload}")`,[], successCB, errorCB);
        });
    },

    deleteCategory: ( ID, successCB, errorCB )  => {
        db.transaction(function(tx){
            tx.executeSql( `DELETE FROM category WHERE rowid = ${ID}`, [], successCB, errorCB );
        });  
    },

    updateCategory: (ID, name, successCB, errorCB) => {
        db.transaction(function(tx){
            tx.executeSql(`UPDATE category SET name = "${name}" WHERE rowid = ${ID}`,[], successCB, errorCB);
        });
    }
}

document.addEventListener("deviceready", () => {
    window.db = window.openDatabase("umarket", "1.0", "U-Market", 1000000);
    let storage = window.localStorage;
    let IsDbInstalled = storage.getItem("IsDbInstalled");
    
    db.transaction(function(tx){
        /*tx.executeSql( 'DROP TABLE category' );
        tx.executeSql( 'DROP TABLE users' );
        tx.executeSql( 'DROP TABLE product' );
        storage.removeItem("IsDbInstalled");
        storage.removeItem("user");
        storage.removeItem("role");*/

        if(IsDbInstalled == null || IsDbInstalled == 0){  
            store.install(() => {
                storage.setItem("IsDbInstalled", 1);
            }, err => { console.error(err); });
        }
    });
}, false);