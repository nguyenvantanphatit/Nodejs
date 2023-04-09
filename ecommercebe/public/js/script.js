let addToCart = document.querySelectorAll(".add-to-cart");
let cartCounter = document.querySelector("#cartCounter");
let qtyDec = document.querySelectorAll(".qty-dec");
let qtyInc = document.querySelectorAll(".qty-inc");

function updateCart(product) {
  axios
    .post("/update-cart", product)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
    })
    .catch((err) => {
      console.log(err);
    });
}
function updateCartInc(product) {
  axios
    .post("/update-cart", product)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
    })
    .catch((err) => {
      console.log(err);
    });
}
function updateCartDec(product) {
  axios
    .post("/update-cart-dec", product)
    .then((res) => {
      cartCounter.innerText = res.data.totalQty;
    })
    .catch((err) => {
      console.log(err);
    });
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let product = JSON.parse(btn.dataset.product);
    updateCart(product);
  });
});

qtyDec.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let product = JSON.parse(btn.dataset.product);
    updateCartDec(product);
    setTimeout(function () {
      location.reload();
    }, 1000);
  });
});

qtyInc.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let product = JSON.parse(btn.dataset.product);
    updateCartInc(product);
    setTimeout(function () {
      location.reload();
    }, 1000);
  });
});
