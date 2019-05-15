// processCSV module
// extract relevant data from CSV files

// load modules
let fs = require('fs'); //for saving to file


/////////////////////////////////////////////////////////////////////////////////////
// check for download errors and request data again
module.exports = function (year, outPath, inPath) {
    console.log(`@processCSV:: year = ${year}`);

    // init files path
    const dataFile = `${inPath}/${year}_lista_AC.csv`;
    const outFile = `${outPath}/${year}_lista_AC-processed.csv`;

    // declare processed items array
    const outArr = [];
    outArr.push('year;index;address\n');

    // read CSV file
    // if file for selected year exist
	if (fs.existsSync(dataFile)) {
		// read file into data array
        const dataArr = fs.readFileSync(dataFile, 'utf8').trim().split('\n');
        console.log(`@processCSV:: loaded ${dataArr.length - 1} items from file\n`);

        // for each item in array
        for (let i = 1; i < dataArr.length; i += 1) {
            // get current line array
            const currentLine = dataArr[i].split(';');
            console.log(currentLine);
            // add data to processed array
            outArr.push(`${year};${currentLine[0]};${currentLine[4]}`);
        }

    } else {
        console.log(`@processCSV:: file ${year}_lista_AC.csv is not found!`);
    }

    // save processed data to file
    fs.writeFile(outFile, outArr.join('\n'), (err) => {
        // If an error occurred, show it and return
        if(err) return console.error(err);
        console.log(`@processCSV:: data for year = ${year} saved to file!`)
    });
}
