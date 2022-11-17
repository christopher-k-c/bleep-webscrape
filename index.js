require('dotenv').config()
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express')
const app = express()
var mongoose = require("mongoose");


const PORT = process.env.PORT;


var bleepSchema = mongoose.model( 'bleepSchemas',{
    artist: {
      type: String,
      required: true,
    },
    record: {
        type: String,
        required: true,
      },
    label: {
        type: String,
        required: true,
    },
    url: {
      type: String,
      required: false
    },
    image: {
        type: String,
        required: false
      }
});


const url = 'https://bleep.com/'

axios(url)
    .then(response => {
        const html= response.data;
        // console.log(html)

        // Storing all html inside the $symbol with cheerio functionality
        const $ = cheerio.load(html);
        var bleepNewIn = [];


        // Root
        let products = $('.product-tile')
        // Titles path
        let titles = products.find('.product-info .artist a')
        // Record Path
        let records = products.find('.product-info .release-title a')
        // Label Path
        let labels = products.find('.product-info .label a')
         // Urls Path        
        let urls = products.find('.product-image-box a')
        // // Images Path
        let images = products.find('.product-image-box a img')

        for(let i=0; i<products.length; i++){

            // console.log(images[i].attribs.src)
            {
                var collection = new bleepSchema({
                    artist: titles[i].children[0].data,
                    record: records[i].children[0].data,
                    label: labels[i].children[0].data,
                    url: urls[i].attribs.href,
                    image: images[i].attribs.src

                });
                bleepNewIn.push(collection)
            }
        }

        mongoose.connect(process.env.mongoDBURL).then(() => {
            bleepNewIn.map((value)=>{value.save({})});        
            console.log('MongoDB connected')
        }).then((bleepSchema)=>{
            console.log(bleepSchema, "i am collection")
        }).catch((e)=>{
            console.log(e)
        })
        


        // console.log(artists)

    }).catch(err =>{
        console.log(err)
    })




app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))




