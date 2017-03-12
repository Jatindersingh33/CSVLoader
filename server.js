import express from 'express';
import config from './config';
import fs from 'fs';
import {MongoClient} from 'mongodb';
import mongoose from 'mongoose';

const server = express();

// connect to database
mongoose.connect(config.mongodbUri);

var lineList = fs.readFileSync(config.filePath).toString().split('\n');
lineList.shift();

//creating schema for database
var schemaKeyList = ['PostCode', 'Suburb', 'State', 'dc', 'type', 'lat', 'lon'];

var PostCodeSchema = new mongoose.Schema({
    PostCode: String,
    Suburb: String,
    State: String,
    dc: String,
    type: String,
    lat: String,
    lon: String
});

//create model for schema
var PostDoc = mongoose.model('PostCodes', PostCodeSchema);

function queryAllEntries () {
    PostDoc.aggregate(
        {$group: {_id: '$PostCode', oppArray: {$push: {
            Suburb: '$Suburb',
            State: '$State',
            dc: '$dc',
            type: '$type',
            lat: '$lat',
            lon: '$lon'
            }}
        }}, function(err, qDocList) {
        //console.log(util.inspect(qDocList, false, 10));
        process.exit(0);
    });
}


function createDocRecurse (err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    if (lineList.length) {
        var line = lineList.shift();
        var doc = new PostDoc();
        line.split(',').forEach(function (entry, i) {
            doc[schemaKeyList[i]] = entry;
        });
        doc.save(createDocRecurse);
    } else {
        queryAllEntries();
    }
}

createDocRecurse(null);
