#!/usr/bin/env node

var fs = require('fs'),
    args = require('optimist').argv,
    hbs = require('handlebars');

if (args._.length) {
    processWithMultiArgs(args, displayResult);
} else
    for (var key in args) {
        try {
            args[key] = JSON.parse(args[key]);
        } catch (e) {}
    }

function readStream(s, done) {
    var bufs = [];
    s.on('data', function(d) {
        bufs.push(d);
    });
    s.on('end', function() {
        done(null, Buffer.concat(bufs));
    });
    s.resume();
}

readStream(process.stdin, function(err, tmpl) {
    process.stdout.write(handle(tmpl, args));
});

function handle(tmpl, args) {
    hbs.registerHelper('include', function(file, context, opt) {
        var context = null == context ? args : context;
        var f = fs.readFileSync(file);
        return handle(f, context);
    });
    // FIXME: let user include helpers with cli
    // do not include by default
    require('./helpers.js'); // self registering, also usable with node -r ./helpers other-cli.js

    var template = hbs.compile(tmpl.toString());
    var result = template(args);
    return result;
}

function processWithMultiArgs(args, callback) {
    if (args._.length === 2) {
        args = args._.map(function(file) {
            return fs.readFileSync(file).toString();
        });
        return callback(args[0], args[1]);
    } else if (args._.length === 1) {
        var arg1 = fs.readFileSync(args._[0]).toString();
        if (Object.keys(args).length > 2) {
            return callback(arg1, args);
        }
        readStream(process.stdin, function(error, tmpl) {
            return callback(tmpl + "", arg1)
        });
    }
}

function displayResult(arg1, arg2) {
    process.stdout.write(autoHandle(arg1, arg2));
    process.exit(0);
}

/**
 * Wrapper method of handle which can auto swap args correspondingly 
 * @param  {string/object} arg1 [Template or json]
 * @param  {string/object} arg2 [Template or json]
 * @return {string}      
 */
function autoHandle(arg1, arg2) {
    arg1 = objectifyJson(arg1);
    arg2 = objectifyJson(arg2);
    if (typeof arg2 === 'object') {
        return handle(arg1, arg2);
    }

    if (typeof arg1 === 'object') {
        return handle(arg2, arg1);
    }

    console.log("MISSING JSON");
    process.exit(1);
}

/**
 * Convert input to json object
 * If failed, return the origin string
 * @param  {string/ object} value [input value]
 * @return {string/ object}
 */
function objectifyJson(value) {
    if (typeof value === 'string') {
        try {
            value = JSON.parse(value);
        } catch (e) {
            return value;
        }
    }
    return value;
}
