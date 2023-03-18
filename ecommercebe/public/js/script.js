// import axios from 'axios';
// import Noty from 'noty'
let addToCart=document.querySelectorAll('.add-to-cart');
let cartCounter=document.querySelector('#cartCounter');
let qtyDec=document.querySelectorAll('.qty-dec');
let qtyInc=document.querySelectorAll('.qty-inc');

function updateCart(book){
    axios.post("/update-cart",book).then(res=>{
      cartCounter.innerText=res.data.totalQty;
    //   new Noty({
    //     text: 'Item added to cart'
    //   }).show();
  }).catch(err=>{
    console.log(err);
  })
}
function updateCartInc(book){
    axios.post("/update-cart",book).then(res=>{
      cartCounter.innerText=res.data.totalQty;
    //   new Noty({
    //     text: 'Item added to cart'
    //   }).show();
  }).catch(err=>{
    console.log(err);
  })
}
function updateCartDec(book){
    axios.post("/update-cart-dec",book).then(res=>{
      cartCounter.innerText=res.data.totalQty;
    //   new Noty({
    //     text: 'Item added to cart'
    //   }).show();
  }).catch(err=>{
    console.log(err);
  })
}

addToCart.forEach(btn=>{
  btn.addEventListener('click',e=>{
    let book=JSON.parse(btn.dataset.book);
    updateCart(book);
  })
})

qtyDec.forEach(btn=>{
  btn.addEventListener('click',e=>{
    let book=JSON.parse(btn.dataset.book);
    updateCartDec(book);
    setTimeout(function(){
      location.reload();
    },1000);
    // window.location.reload();
  })
})

qtyInc.forEach(btn=>{
  btn.addEventListener('click',e=>{
    let book=JSON.parse(btn.dataset.book);
    updateCartInc(book);
    setTimeout(function(){
      location.reload();
    },1000);
    // window.location.reload();
  })
})
