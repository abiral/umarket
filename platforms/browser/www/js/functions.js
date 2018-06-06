let sF = function(tx, res) {};
let eF = function(err) {};

let login = () => {
    let payload = {
        u: jQuery('#username').val(),
        p: jQuery('#password').val()
    };

    if(payload.u == 'a' && payload.p == 'a'){
        document.querySelector('#navigator').pushPage('panel.html', {data: {title: 'Panel'}});
    }else{
        store.verifyUser(payload.u, payload.p, (tx, result) => {
            if(result.rows.length > 0){
                window.localStorage.setItem("user", result.rows[0].rowid);
                window.localStorage.setItem("role", result.rows[0].role);
                document.querySelector('#navigator').pushPage('panel.html', {data: {title: 'Panel'}});

            }else{
                ons.notification.alert('Incorrect username or password.', {title: 'Invalid'});
            }
        }, (tx, err) => {

        });
    }    
};

let register = () => {
    let abn = jQuery('#abn').val();
    let payload = {
        business_name : jQuery('#business_name').val(),
        abn : (abn)?abn:0,
        business_type : jQuery('#business_type').val(),
        contact : jQuery('#contact').val(),
        phone : jQuery('#phone').val(),
        email : jQuery('#email').val(),
        address : jQuery('#address').val(),
        role : jQuery('#role').val(),
        username : jQuery('#username').val(),
        password : jQuery('#password').val(),
    };

    store.createUser(payload, (tx, result)=> {
        window.localStorage.setItem("user", result.insertId);
        window.localStorage.setItem("role", payload.role);
        document.querySelector('#navigator').pushPage('panel.html', {data: {title: 'Panel'}});
    }, ( tx, err) => {
        console.error(err.message);
    })
}

let logMeOut = () => {
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("role");
    document.querySelector('#navigator').pushPage('home.html', {data: {title: 'Welcome'}});
    ons.notification.alert('You are successfully logged out', {title: 'Logged Out'});
}

let redirectIfLoggedIn = () => {
    let nav = jQuery('#navigator')[0];
    let user = window.localStorage.getItem("user");
    if(user == null){
        nav.pushPage('home.html', {data: {title: 'Welcome'}});
        //let role = window.localStorage.getItem("role");
        //nav.pushPage('panel.html', {data: {title: 'Panel'}});
    }
}

let addCategory = () => {
    ons.notification.prompt('Enter new category',{title: "Category"}).then( category => {
        store.createCategory(category, (tx, result ) => {
            if(result.rowsAffected > 0){
                let nav = jQuery('#navigator')[0];
                let page = nav.topPage;
                let item = `<ons-list-item tappable class="category-item list" data-id="${result.insertId}" data-title="${category}" >${category}</ons-list-item>`
                jQuery(page).find('.categories-list').append(item);
            }
        }, (tx, err)=>{
            console.error(err.message);
            return false;
        });
        
    });
};

let getCategory = (successCB=sF, errorCB=eF, printToDOM=true) => {
    store.getCategory((tx, data)=>{
        if(printToDOM){
            let output = "";
            if(data.rows.length > 0){
              for(let i = 0; i<data.rows.length; i++){
                output += `<ons-list-item tappable class="category-item list" data-id="${data.rows[i].rowid}" data-title="${data.rows[i].name}" >${data.rows[i].name}</ons-list-item>`;
              }  
            }
            jQuery('.categories-list').html(output);
        }
        
        successCB(tx, data);
    }, (tx, err) => {
        console.error(err.message);
        errorCB(err);
    });
};

let createCategory = (payload, successCB, errorCB) => {
    store.createCategory(payload, successCB, errorCB);
};

let deleteCategory = (ID, el, successCB=sF, errorCB=eF)  => {
    store.deleteCategory(ID, (tx, result) => {
        if(result.rowsAffected > 0){
            jQuery(el).remove();
            successCB(tx, result);
        }
    }, (tx, err) => {
        console.error(err.message);
        errorCB(err);
    });
};

let updateCategory = (ID, name, el, successCB=sF, errorCB=eF) => {
    store.updateCategory(ID, name, (tx, result) => {
        if(result.rowsAffected > 0){
          let item = `<ons-list-item tappable class="category-item list" data-id="${ID}" data-title="${name}" >${name}</ons-list-item>`;
          jQuery(el).replaceWith(item);
          successCB(tx, result);
        }
    }, (tx, err) => {
        console.error(err.message);
        errorCB(err);
    });
};

let requestUpload = () => {
    ons.openActionSheet({
        title: 'Choose Source',
        cancelable: true,
        buttons: ['Gallery','Camera']
    }).then( index => {
        let source = false;
        console.log("INdex: ", index);
        if(index == 1){
            source = Camera.PictureSourceType.CAMERA;
        }else{
            source = Camera.PictureSourceType.PHOTOLIBRARY;
        }

        uploadImage(source, file => {
            console.log(file);
            jQuery('.img-preview').attr('src',file);
        },err => {
            console.error(err);
        });
    } );
};

let uploadImage = (source, successCB, errorCB) => {
    let destinationType = navigator.camera.DestinationType;
    navigator.camera.getPicture(successCB, errorCB, {
        quality: 100, // photo quality
        destinationType: destinationType.FILE_URI,
        sourceType: source,
        encodingType: Camera.EncodingType.JPEG
    });
};

let addProduct = () => {
    getCategory((tx, data) => {
        if(data.rows.length > 0){
            let options="";
            for(let i = 0; i<data.rows.length; i++){
                options += `<option value="${data.rows[i].rowid}">${data.rows[i].name}</option>`;
            }

            document.querySelector('#navigator').pushPage('products-create.html', {data: {title: 'Add New Product'}, animation: 'lift'}).then( () => {
                jQuery('#category select').html(options);
            });

        }else{
            ons.notification.alert('You need to have atleast one category first', {title: 'No category available'});
            document.querySelector('#navigator').pushPage('dashboard.html', {data: {title: 'Categories'}, animation: 'lift'});
        }
    },(tx, err) => {
        console.error(err.message);
    }, false);
};

let createProduct = (successCB, errorCB) => {
    let img = jQuery('#image').attr('src');
    let payload = {
        name : jQuery('#name').val(),
        price : jQuery('#price').val(),
        delivery_time : jQuery('#delivery_time').val(),
        category : jQuery('#category').val(),
        photo: (typeof img == "undefined")? "" : img,
        supplier : window.localStorage.getItem("user"),
    };

    store.createProduct(payload, (tx, result) => {
        successCB({ID: result.insertId, name: payload.name});
        console.log(result);
    }, (tx, err) => {
        errorCB(err.message);
        console.error(err);
    });
}

let getProduct = (successCB=sF, errorCB=eF, printToDOM=true) => {
    store.getProducts((tx, data)=>{
        if(printToDOM){
            let output = "";
            if(data.rows.length > 0){
              for(let i = 0; i<data.rows.length; i++){
                output += `<ons-list-item tappable class="product-item list" data-id="${data.rows[i].rowid}" data-title="${data.rows[i].name}" >${data.rows[i].name}</ons-list-item>`;
              }  
            }
            jQuery('.product-list').html(output);
        }
        
        successCB(tx, data);
    }, (tx, err) => {
        console.error(err.message);
        errorCB(err);
    });
};

let getProductsByCategory = (category, successCB=sF, errorCB=eF) => {
    store.getProductsByCategory(category, (tx, data)=>{
        if(data.rows.length > 0 ){
            successCB(data.rows);
        }else{
            errorCB("No product with this category is registered");
        }
    }, (tx, err) => {
        console.error(err.message);
        errorCB(err.message);
    });
};

let deleteProduct = (ID, el, successCB=sF, errorCB=eF) => {
    store.deleteProduct(ID, (tx, result) => {
        if(result.rowsAffected > 0){
            jQuery(el).remove();
            successCB(tx, result);
        }
    }, (tx, err) => {
        console.error(err.message);
        errorCB(err);
    });
};

let getSingleProduct = (id, successCB, errorCB) => {
    store.getProductByID(id, (tx, data)=>{
        if(data.rows.length > 0){
            successCB(data.rows[0]);
        }else{
            errorCB("No Product found");
        }
    }, (tx, err)=>{
        console.error(err.message);
        errorCB(err.message);
    });
}