require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const flash = require("express-flash");
const MongoDbStore = require("connect-mongo")(session);
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const cloudinary = require("cloudinary").v2;
const upload = require("./multer/multer");
const stripe = require("stripe")(process.env.STRIPE_SKEY);

//

//
app.set("view engine", "ejs");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));
app.use(express.json());
cloudinary.config({
  cloud_name: process.env.CLD_CLOUD_NAME,
  api_key: process.env.CLD_API_KEY,
  api_secret: process.env.CLD_API_SECRET,
});

mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);
const connection = mongoose.connection;
let mongoStore = new MongoDbStore({
  mongooseConnection: connection,
  collection: "sessions",
});
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    }, //24hrs
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  admin: Boolean,
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const productSchema = new mongoose.Schema({
  title: String,
  imgurl: String,
  imgid: String,
  price: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Author",
  },
});

productSchema.virtual("coverImagePath").get(function () {
  if (this.coverImage != null && this.coverImageType != null) {
    return `data:${
      this.coverImageType
    };charset=utf-8;base64,${this.coverImage.toString("base64")}`;
  }
});

const Product = new mongoose.model("Product", productSchema);

// author
const authorSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

authorSchema.pre("remove", function (next) {
  Book.find({ author: this.id }, (err, books) => {
    if (err) {
      next(err);
    } else if (books.length > 0) {
      next(new Error("This author has books still"));
    } else {
      next();
    }
  });
});

module.exports = mongoose.model("Author", authorSchema);
//
const categorySchema = new mongoose.Schema({
  title: String,
});
const Category = new mongoose.model("Category", categorySchema);

const orderSchema = new mongoose.Schema({
  date: String,
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: Object,
  phone: String,
  address: String,
  paymentType: {
    type: String,
    default: "COD",
  },
  status: {
    type: String,
    default: "order placed",
  },
});
const Order = new mongoose.model("Order", orderSchema);

app.get("/", async function (req, res) {
  var curUser = null;
  if (req.isAuthenticated()) {
    curUser = req.user;
  }
  await Product.find().exec(function (err, foundProducts) {
    if (err) {
      console.log(err);
      res.redirect("/");
    } else {
      res.render("home", {
        products: foundProducts,
        user: curUser,
      });
    }
  });
});

app.get("/cart", function (req, res) {
  var curUser = null;
  if (req.isAuthenticated()) {
    curUser = req.user;
  }
  res.render("cart", {
    user: curUser,
  });
});

app.post("/update-cart", function (req, res) {
  if (!req.session.cart) {
    req.session.cart = {
      items: {},
      totalQty: 0,
      totalPrice: 0,
    };
  }
  let cart = req.session.cart;
  if (!cart.items[req.body._id]) {
    cart.items[req.body._id] = {
      item: req.body,
      qty: 1,
    };
    cart.totalQty = cart.totalQty + 1;
    cart.totalPrice = cart.totalPrice + parseInt(req.body.price);
  } else {
    cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
    cart.totalPrice = cart.totalPrice + parseInt(req.body.price);
    cart.totalQty = cart.totalQty + 1;
  }
  return res.json({
    totalQty: req.session.cart.totalQty,
  });
});

app.post("/update-cart-dec", function (req, res) {
  let cart = req.session.cart;
  if (cart.items[req.body._id].qty <= 1) {
    const bookId = req.body._id;
    cart.totalQty = cart.totalQty - cart.items[bookId].qty;
    cart.totalPrice =
      cart.totalPrice -
      parseInt(cart.items[bookId].item.price) * cart.items[bookId].qty;
    delete cart.items[bookId];
    return res.json({
      totalQty: req.session.cart.totalQty,
    });
  } else {
    cart.items[req.body._id].qty = cart.items[req.body._id].qty - 1;
    cart.totalPrice = cart.totalPrice - parseInt(req.body.price);
    cart.totalQty = cart.totalQty - 1;
    return res.json({
      totalQty: req.session.cart.totalQty,
    });
  }
});

app.post("/cart/remove/:pid", async function (req, res) {
  const bookId = req.params.pid;
  let cart = req.session.cart;
  cart.totalQty = cart.totalQty - cart.items[bookId].qty;
  cart.totalPrice =
    cart.totalPrice -
    parseInt(cart.items[bookId].item.price) * cart.items[bookId].qty;
  await delete cart.items[bookId];
  res.redirect("/cart");
});

app.get("/compose", async function (req, res) {
  if (req.isAuthenticated() && req.user.admin === true) {
    await Category.find().exec(function (err, foundCategories) {
      if (err) {
        console.log(err);
        res.redirect("/compose");
      } else {
        res.render("compose", {
          categories: foundCategories,
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/compose", upload.single("image"), async function (req, res) {
  try {
    if (req.isAuthenticated() && req.user.admin === true) {
      await cloudinary.uploader.upload(
        req.file.path,
        async function (error, result) {
          if (!result) {
            console.log(error);
            res.redirect("/compose");
          } else {
            product = new Product({
              title: req.body.title,
              imgurl: result.secure_url,
              imgid: result.public_id,
              price: req.body.price,
            });
            product.save();
            res.redirect("/");
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/compose");
  }
});

app.get("/terms", function (req, res) {
  var curUser = null;
  if (req.isAuthenticated()) {
    curUser = req.user;
  }
  res.render("info", {
    title: "Terms",
    user: curUser,
  });
});

app.get("/privacy", function (req, res) {
  var curUser = null;
  if (req.isAuthenticated()) {
    curUser = req.user;
  }
  res.render("info", {
    title: "Privacy Policy",
    user: curUser,
  });
});

app.get("/refund", function (req, res) {
  var curUser = null;
  if (req.isAuthenticated()) {
    curUser = req.user;
  }
  res.render("info", {
    title: "Refund Policy",
    user: curUser,
  });
});

app.get("/disclaimer", function (req, res) {
  var curUser = null;
  if (req.isAuthenticated()) {
    curUser = req.user;
  }
  res.render("info", {
    title: "Disclaimer",
    user: curUser,
  });
});

app.get("/orders", function (req, res) {
  res.render("orders");
});

app.get("/admin", async function (req, res) {
  var curUser = null;
  if (req.isAuthenticated() && req.user.admin) {
    await Order.find({
      status: {
        $ne: "delivered",
      },
    })
      .sort({
        date: 1,
      })
      .exec(async function (err, foundOrders) {
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          curUser = req.user;
          res.render("admin", {
            user: curUser,
            orders: foundOrders,
          });
        }
      });
  } else {
    res.redirect("/");
  }
});

app.post("/orders", async function (req, res) {
  if (req.isAuthenticated()) {
    if (req.body.paymentType === "card") {
      res.render("payment", {
        phone: req.body.phone,
        address: req.body.address,
        key: process.env.STRIPE_PKEY,
        price: req.session.cart.totalPrice * 100,
      });
    } else {
      const order = new Order({
        date: new Date(),
        userid: req.user._id,
        items: req.session.cart.items,
        phone: req.body.phone,
        address: req.body.address,
      });
      order.save();
      await delete req.session.cart;
      res.redirect("/user/" + req.user._id);
    }
  } else {
    res.redirect("/login");
  }
});

app.post("/payment", async (req, res) => {
  stripe.charges
    .create({
      amount: req.session.cart.totalPrice * 100,
      source: req.body.stripeToken,
      currency: "inr",
      description: "book empire purchase",
    })
    .then(async () => {
      const order = new Order({
        date: new Date(),
        userid: req.user._id,
        items: req.session.cart.items,
        phone: req.body.phone,
        address: req.body.address,
        paymentType: "card",
      });
      order.save();
      await delete req.session.cart;
      res.redirect("/user/" + req.user._id);
    })
    .catch((err) => {
      res.send(err);
    });
});

app.get("/orders/:orderid", async function (req, res) {
  if (req.isAuthenticated()) {
    const orderId = req.params.orderid;
    await Order.findOne(
      {
        _id: orderId,
      },
      function (err, foundOrder) {
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          res.render("orders", {
            user: req.user,
            order: foundOrder,
          });
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.get("/user/:uid", async function (req, res) {
  if (req.isAuthenticated()) {
    const userId = req.params.uid;
    await User.find(
      {
        _id: userId,
      },
      async function (err, foundUser) {
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          await Order.find(
            {
              userid: userId,
            },
            function (err, foundOrders) {
              if (err) {
                console.log(err);
                res.redirect("/");
              } else {
                res.render("profile", {
                  user: req.user,
                  orders: foundOrders,
                });
              }
            }
          );
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.post("/orders/status", async function (req, res) {
  const result = await Order.updateOne(
    {
      _id: req.body.orderId,
    },
    {
      $set: {
        status: req.body.status,
      },
    }
  );
  res.redirect("/admin");
});

app.get("/product/:pid", async function (req, res) {
  var curUser = null;
  if (req.isAuthenticated()) {
    curUser = req.user;
  }
  const productId = req.params.pid;
  await Product.findOne(
    {
      _id: productId,
    },
    function (err, foundProduct) {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("product", {
          product: foundProduct,
          user: curUser,
        });
      }
    }
  );
});

app.get("/profile/:pname", async function (req, res) {
  var curUser = null;
  if (req.isAuthenticated()) {
    curUser = req.user;
  }
  const authorName = req.params.pname;
  await Product.find(
    {
      author: authorName,
    },
    function (err, foundProducts) {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("home", {
          products: foundProducts,
          user: curUser,
        });
      }
    }
  );
});

app.get("/categories/:cname", async function (req, res) {
  var curUser = null;
  if (req.isAuthenticated()) {
    curUser = req.user;
  }
  const categoryName = req.params.cname;
  await Product.find(
    {
      category: categoryName,
    },
    function (err, foundProducts) {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("home", {
          products: foundProducts,
          user: curUser,
        });
      }
    }
  );
});

app.get("/login", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("login", {
      user: null,
    });
  }
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, async function (err) {
    if (err) {
      console.log(err);
      res.redirect("/login");
    } else {
      await passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});

app.get("/logout", function (req, res) {
  if (req.isAuthenticated()) {
    req.logout();
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});

app.get("/register", function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register", {
      user: null,
    });
  }
});

app.post("/register", function (req, res) {
  User.register(
    {
      username: req.body.username,
      name: req.body.name,
      admin: false,
    },
    req.body.password,
    async function (err, user) {
      if (err) {
        res.send(err.message + " go back and use different email as username.");
        res.redirect("/register");
      } else {
        await passport.authenticate("local")(req, res, function () {
          res.redirect("/");
        });
      }
    }
  );
});

// phaan trang

// phaan trange is

app.get("/", async (req, res, next) => {
  let perPage = 2;
  let page = req.params.page || 1;
  Product.find()
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec((err, books) => {
      Product.countDocuments((err, count) => {
        if (err) return next(err);
        res.render("home", {
          products: products,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

// pagination
app.get("/:page", async (req, res, next) => {
  let perPage = 2;
  let page = req.params.page || 1;

  Product.find()
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec((err, products) => {
      Product.countDocuments((err, count) => {
        if (err) return next(err);
        res.render("home", {
          products: products,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});
//

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Server is running on port " + PORT);
});
