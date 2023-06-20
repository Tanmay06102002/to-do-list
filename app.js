const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/views/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Tanmay:Tanmay%4006@cluster0.rhjvtrb.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "cook food",
});

const item2 = new Item({
    name: "eat food",
});

const item3 = new Item({
    name: "sleep",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema)




const workItems = [];

app.listen(3000, () => {
    console.log("Server listening at port 3000");
});



app.get("/", (req, res) => {

    const day = date.getDate();


    Item.find({})
        .then(result => {
            if (result.length === 0) {
                Item.insertMany(defaultItems);
                redirect("/")
            } else {
                res.render("list", {
                    listTitle: "Today",
                    newListItems: result
                });
            }
        })
        .catch(err => {
            console.log(err)
        })

});

app.post("/", (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/")
    }else{
        List.findOne({name: listName})
        .then(function(result){
            result.items.push(item);
            result.save();
            res.redirect("/"+listName);
        })
    }

    
});


app.post("/delete",(req,res) =>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId)
        .then(function(){
            console.log("Item deleted successfully")
            res.redirect("/")
        })
        .catch(function(err){
            console.log(err);
        })

    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}})
        .then(function(result){
            res.redirect("/"+listName)
        })
    }

})


app.get("/:newList", (req,res) =>{
    const newList = _.capitalize(req.params.newList);

    List.findOne({name: newList})
    .then(function(result){
        if(result){
            // console.log("Exists");
            res.render("list", {
                listTitle: result.name,
                newListItems: result.items
            });
        }else{
            // console.log("Exists")
            const list = new List({
                name: newList,
                items: defaultItems
            })
        
            list.save()

            res.redirect("/"+newList)
        }
    })

})

app.post("/work", (req, res) => {
    const item = res.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});


app.get("/about", (req, res) => {
    res.render("about");
});