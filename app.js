//jshint esversion:6

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const date = require(__dirname + "/date.js")
const _ = require("lodash");



const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-naresh:<password>@cluster1.gbu9u.mongodb.net/todolistDB", {useNewUrlParser : true, useUnifiedTopology: true})

const itemsSchema = {
  name : String
};


const Item = mongoose.model("Item", itemsSchema);




const item1 = new Item({
  name : "welcome to the task List"
})

const item2 = new Item({
  name: "Hit the + button to add new item"
})

const item3 = new Item({
  name: "<-- Hit this to Delete Item"
})






const defaultItems = [item1, item2, item3]

const listSchema ={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){
  Item.find({}, function(err, foundItems){

    if(err){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to DB")
        }
      });
      res.redirect("/")
    }
    else{
      res.render("list", {listTitle:"Today", newListItems:foundItems})
    }
  })
});


app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" +  customListName)
        //console.log("Dosen't exist");
      }
      else{
      //  console.log("Exists!")
      res.render("list", {listTitle:foundList.name, newListItems: foundList.items })
      }
    };
  })

})





app.post("/", function(req, res){
  const itemName = req.body.item;
  const listName = req.body.list;

  const item = new Item({
    name : itemName
  })

  if (listName === "Today"){
    item.save()
    res.redirect("/")
  }
  else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+ listName);
    })
  }
})


app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("success")
        res.redirect("/")
      }
    });
  } else{
      List.findOneAndUpdate({name:listName}, {$pull:{items: {_id : checkedItemId}}}, function(err, foundList){
        if(!err){
          res.redirect("/" + listName)
        }
      })
    }
})


app.get("/work", function(req, res){
  res.render("list", {listTitle:"work", newListItems : workItems})
})

app.post("/work", function(req, res){
  let item = req.body.item;
  workItems.push(item);
  res.redirect("/work")
})

app.get("/about", function(req, res){
  res.render("about", {})
});


let port = process.env.PORT

if (port == null || port == ""){
  port = 3000;
}
app.listen(port, function(){
  console.log("server is running")
});
