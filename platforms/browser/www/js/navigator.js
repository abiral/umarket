jQuery(document).on('init', event => {
  let page = event.target;
  let elem = jQuery(page);
  let nav = jQuery('#navigator')[0];
  let titleBar = elem.find('.toolbar .section-title');
  let role = window.localStorage.getItem("role");

  let filterList = event => {
    let keyword = jQuery(event.currentTarget).val();
    if(keyword != ""){
      jQuery(`.list-collection .list`).hide();
      jQuery(`.list-collection .list[data-title*='${keyword}']`).fadeIn(200);
    }
  };

  switch(page.id){
    case 'login':
      titleBar.html(page.data.title);
    break;

    case "panel":
      console.log("Panel");
      if(role == 'buyer'){
        document.getElementById('seller-tab').setTabbarVisibility('false');
        document.getElementById('buyer-tab').setTabbarVisibility('true');
      }else{
        document.getElementById('seller-tab').setTabbarVisibility('true');
        document.getElementById('buyer-tab').setTabbarVisibility('false');
      }
    break;

    case 'signup':
      titleBar.html(page.data.title);
    break;

    case 'category':
      redirectIfLoggedIn();

      if(role == 'buyer'){
        jQuery('ons-fab').remove();
      }

      getCategory();

      let activeCategory = null;

      jQuery(document).on('change', 'ons-search-input', filterList );
      
      jQuery(document).on('tap', '.category-item', event => {
        let el = event.currentTarget;
        let ID = jQuery(el).attr("data-id");
        let title = jQuery(el).attr("data-title");
        getProductsByCategory(ID, data => {
          nav.pushPage('products.html', {data: {title: `Products in <strong>${title}</strong> category`, products: data }});
        }, err => {
          ons.notification.alert("Product with this category is not registered yet", {title: "Product not found"});
        });

      });

      jQuery(document).on('hold', '.category-item', event => {
        let el = event.currentTarget;
        let title = jQuery(el).attr("data-title");
        activeCategory = jQuery(el).attr("data-id");
        ons.notification.prompt("Enter new name",{
          defaultValue: title, 
          title: 'You are editing a category'
        }).then( newCategory => {
          updateCategory(activeCategory, newCategory, el);
        });
      });


      jQuery(document).on('swipeleft', '.category-item', event => {
        let el = event.currentTarget;
        activeCategory = jQuery(el).attr("data-id");
        
        ons.notification.confirm('Are you sure?', { 
          title: 'You are about to delete a category', 
          buttonLabels: ["No", "Yes"]
        }).then( response => {
          if(response){
            deleteCategory(activeCategory, el);
          }
        });
      });
    break;

    case 'products':
    case 'dashboard':
    
      if(role == 'buyer'){
        jQuery('ons-fab').remove();
      }

      if(typeof page.data != "undefined" && typeof page.data.products != "undefined"){
        titleBar.html(page.data.title);
        let allProducts = page.data.products;        
        let items = "";
        for(let i = 0; i< allProducts.length; i++ ){
          items += `<ons-list-item tappable class="product-item list" data-id="${allProducts[i].rowid}" data-title="${allProducts[i].name}" >${allProducts[i].name}</ons-list-item>`
        }
        jQuery('.go-to-category').show();
        jQuery(page).find('.product-list').html(items);
      }else{
        getProduct();
      }

      jQuery(document).on('change', 'ons-search-input', filterList );

      let activeProduct = null;

      if(typeof page.data != "undefined" && typeof page.data.product != "undefined"){
        titleBar.html(page.data.title);
        let newProduct = page.data.product;
        let item = `<ons-list-item tappable class="product-item list" data-id="${newProduct.ID}" data-title="${newProduct.name}" >${newProduct.name}</ons-list-item>`
        jQuery(page).find('.product-list').append(item);
      }

      jQuery(document).on('tap', '#add-new-product', event => {
        addProduct();
      });

      jQuery(document).on('hold', '.product-item', event => {
          let elem = event.currentTarget;
          let title = elem.attr("data-title");
          activeProduct = elem.attr("data-id");
      });

      jQuery(document).on('swipeleft', '.product-item', event => {
          let el = event.currentTarget;
          activeProduct = el.getAttribute("data-id");
          console.log("Deleting product ", activeProduct);

          ons.notification.confirm('Are you sure?', { 
            title: 'You are about to delete a product', 
            buttonLabels: ["No", "Yes"]
          }).then( response => {
            if(response){
              deleteProduct(activeProduct, el);
            }
          });
      });

      jQuery(document).on('tap', '.product-item', event => {
          let elem = event.currentTarget;
          activeProduct = elem.getAttribute("data-id");
          getSingleProduct(activeProduct, (product)=>{
            nav.pushPage('products-single.html', {data: {title: product.name, product: product }});
          }, (err) => {
            ons.notification.alert('The product you are looking for is not available', {title: 'Product Not Found'});
          });
      });
    break;

    case 'products-create':
      jQuery(document).on('tap', '#create-product', event => {
          createProduct(result => {
            let nav = jQuery('#navigator')[0];
            nav.pushPage('products.html', {data: {title: 'Products', product: result }});
          }, err => {
            ons.notification.alert(err, {title:"Couldn't create a product"});
          });
      });
    break;

    case 'products-single':
        let product = page.data.product;
        titleBar.html(page.data.title);
        if(!product.photo){
          product.photo = "http://via.placeholder.com/350x150";
        };

        jQuery('#product-thumb').attr('src', product.photo);
        jQuery('#price').html("$ "+product.price);
        jQuery('#delivery').html(product.delivery_time);
        jQuery('#supplier').html(product.business_name);
        jQuery('#address').html(product.address);
        jQuery('#phone').html(product.phone);

        jQuery(document).on('tap','.pop-page', () => {
          nav.popPage();
        });
    break;

    default:
      elem.find('#log-me-in').on('tap', () => {
        nav.pushPage('login.html', {data: {title: 'Login'}});
      });
      
      elem.find('#sign-me-up').on('tap', () => {
        nav.pushPage('signup.html', {data: {title: 'Register'}});
      });

      jQuery(document).on('click', '#reset', event => {
        store.removeJunks( (tx, result) => {
          store.install( (tx, result) => {
              ons.notification.alert("Database reset done", {title: "Success"});
          }, (tx, err) => {
            ons.notification.alert(err, {title: 'Error'});
          });
        }, (tx, err) => {
            ons.notification.alert(err, {title: 'Error'});
        });
      });
  }

  let goBack = () => {    
    nav.popPage();
  };

});
