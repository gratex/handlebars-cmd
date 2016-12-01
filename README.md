# handlebars-cmd

Invoke handlebars from the commandline. 

Example:

    echo "Hello {{name}}" | handlebars --name Test

Output:

    Hello Test

You may also pass a JSON string as an argument and it will be 
interpreted as an object.


You can also pass a JSON file:

    handlebars file.json < template.hbs > output.txt

You can also do these:
	
	handlebars file.json template.hbs
 
	cat file.json | handlebars template.hbs

	cat file.json | handlebars '{{name}}'

	echo "{{sampleDate}}" | node ./index.js '{"sampleDate":"2016-12-01T08:00:54.194Z"}'

# install

    npm install -g handlebars-cmd

# include helper

handlebars-cmd comes with a built-in helper `#include`
    
    {{{include 'api.md'}}}

You can also pass context (optional)
    
    {{{include 'render.md.hbs' item}}}

# generic ES6 helpers

	it also comes with str, math and date helpers 
	built in (dirty and generic for now but usable for CLI purposes)


	echo "Hello {{bd}} year {{date-getFullYear bd}}" | node ./index.js --name Test --bd "$(node -p "(new Date()).toJSON()")"	

	echo "Hello {{str-substr name 1 2}}" | node index.js --name Test

	echo "Hello {{math-min 10 2 12}}" | node index.js --name Test

# dojo helpers

	echo '{"sampleDate":"2016-12-01T08:00:54.194Z"}' | node ./index.js "{{dlocale-format sampleDate}}"

	echo '{"sampleDate":"2016-12-01T08:00:54.194Z", "_fmt":{"formatLength":"long"}}' | node ./index.js "{{dlocale-format sampleDate _fmt}}"

	echo '{"sampleDate":"2016-12-03T08:00:54.194Z"}' | node ./index.js "{{dlocale-isWeekend sampleDate}}"

	echo '{"sampleDate":"2016-12-03T08:00:54.194Z"}' | node ./index.js "{{dlocale-isWeekend sampleDate}}"

	TODO: dlocale-getNames sample


# license

MIT
