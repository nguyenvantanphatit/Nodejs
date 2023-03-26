import axios from "axios";

let addToCart = document.querySelectorAll(".add-to-cart");

function updateCart(product) {
  axios.post("/update-cart", product).then((res) => {
    console.log(res);
  });
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let product = JSON.parse(btn.dataset.product);
    updateCart(product);
  });
});
