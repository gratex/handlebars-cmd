#!/usr/bin/env node

var fs   = require('fs'),
    args = require('optimist').argv,
    hbs  = require('handlebars');

if (args._.length) {
    try {
        args = JSON.parse(fs.readFileSync(args._[0]).toString());
    } catch (e) { }
}
else for (var key in args) {
    try {
        args[key] = JSON.parse(args[key]);
    } catch (e) {
    }
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
    function handle(tmpl, args) {
        hbs.registerHelper('include', function (file, context, opt) {
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
    process.stdout.write(handle(tmpl, args));
});

