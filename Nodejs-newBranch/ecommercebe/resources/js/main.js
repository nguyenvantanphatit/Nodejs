import axios from 'axios';

let addToCart=document.querySelectorAll('.add-to-cart');

function updateCart(book){
    axios.post("/update-cart",book).then(res=>{
      console.log(res);
    })
}

addToCart.forEach(btn=>{
  btn.addEventListener('click',e=>{
    let book=JSON.parse(btn.dataset.book);
    updateCart(book);
  })
})
