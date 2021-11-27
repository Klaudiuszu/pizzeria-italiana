/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[class="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

    }
    renderInMenu() {
      const thisProduct = this;
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

      
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = document.getElementsByClassName('product__header');
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
        event.preventDefault();
        //console.log(clickableTrigger);
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        //console.log('activeProduct',activeProduct);
        /* if there is active product and it's not thisProduct.element, remove class active from it */

        if(activeProduct && activeProduct != thisProduct.element){

          activeProduct.classList.remove('active');
          thisProduct.element.classList.add('active');
          
        } else {
          thisProduct.element.classList.toggle('active');

        }
      }
      
      );
    }
    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    
  
    processOrder() {
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);
      
      let price = thisProduct.data.price;
      
      for(let paramId in thisProduct.data.params) {
        
        const param = thisProduct.data.params[paramId];
        
        for(let optionId in param.options) {
          
          const option = param.options[optionId];
          
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //console.log(optionSelected);

          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          //console.log(optionImage);
    
          if(optionSelected) {

            if(!option.default == false) {
              price += option.price;
              //console.log(option.default)W
              
            } else if(!option.default == true) {
              price += option.price;
            }

            if(optionImage){

              //console.log(optionImage);
            
              thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId).classList.add(classNames.menuProduct.imageVisible);

              console.log(option.default);
            }
          } else {
            //console.log('.' + paramId + '-' + optionId);
            if(optionImage){
              thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId).classList.remove(classNames.menuProduct.imageVisible);
            }
        
          }
                    
        }
      }

      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
      thisProduct.priceSingle = price;
    }



    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);
      
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
        
      });
    }

    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
      
    }

    prepareCartProduct() {
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.price = thisProduct.data.price;
      productSummary.priceSingle = thisProduct.priceSingle;

      productSummary.params = {};
      productSummary.params = thisProduct.prepareCartProductParams();

    
      return productSummary;
    }

    prepareCartProductParams(){
    
      const thisProduct = this;
    
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
      
    
      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        
        params[paramId] = {
          label: param.label,
          options: {}
        };
    
        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }  
  }
  class amountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    
    }
    
    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      
      thisWidget.input.value = settings.amountWidget.defaultValue;

    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      if(thisWidget.value !== newValue && !isNaN(newValue) && settings.amountWidget.defaultMin <= newValue && settings.amountWidget.defaultMax >= newValue){
        thisWidget.value = newValue;
            
        thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
    }

    initActions(){

      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
        
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
        
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
        //console.log(thisWidget);
      });

    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};
      
      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger= thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initActions(){

      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(event){
        event.preventDefault();

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    add(menuProduct){

      const thisCart = this;
      const generatedHTML =  templates.cartProduct(menuProduct);
      
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);
      console.log('adding product', menuProduct);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);
      
    }
  }

  class CartProduct{

    constructor(element, menuProduct){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.priceSingle = menuProduct.priceSingle;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom={};

      thisCartProduct.dom.wrapper = element; // JAK TO DZIAŁA??

      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);

    }
  }

  const app = {

    initMenu: function(){
    
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    initData: function(){
      const thisApp = this;
  
      thisApp.data = dataSource;
    },

    init: function(){

      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };
  app.init();
}