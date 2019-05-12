const axios = require('axios'); //for web requests with promise
const cheerio = require('cheerio'); // for content identification inside htmls
let fs = require('fs'); //for saving to file
const targetServer = 'https://primariaclujnapoca.ro/autorizari-constructii/autorizatii-de-construire';
const htmlOutputPath = './scraped';
const csvOutputPath = './processed';


/////////////////////////////////////////////////////////////////////////////////////
// parse text from html to csv
function parseHtml(htmlText) {
	// local variables
	const outArray = [];
	// load html text
	const $ = cheerio.load(htmlText);
	// return array
	return outArray;
}

/////////////////////////////////////////////////////////////////////////////////////
// parse html file
function parseFile(year, index) {
	const fileName = `year_index.html`;
	const htmlText = fs.readFileSync(`${htmlOutputPath}/${fileName}`);
	// parse text
	const authArr = parseHtml(htmlText);
}

/////////////////////////////////////////////////////////////////////////////////////
// parse all html files
function parseData() {
	// const fileName = `year_index.html`;
	// const htmlText = fs.readFileSync(`${htmlOutputPath}/${fileName}`);
	// // parse text
	// const authArr = parseHtml(htmlText);
}

/////////////////////////////////////////////////////////////////////////////////////
// save page to file
function saveToFile(year, index, data) {
	const filename = `${htmlOutputPath}/${year}_${index}.html`;
	// console.log(filename);
	fs.writeFileSync(filename, data);
	console.log(`saved to ${filename}`);
}

/////////////////////////////////////////////////////////////////////////////////////
// save batch array to files
const save_urls = async (promises, logFile) => {
	console.log('@save_url >>> WRITE BATCH');
	
	// await for batch array
	responses = await Promise.all(promises.map( p => p.promise.catch(e => {
		// add item to log
		logFile.write(`${p.year};${p.index};${e}\n`);
		console.error(`Error ${e} when getting index for year ${p.year} and index ${p.index}`)
	}) ));
	// write array to files
	for (let i = 0; i < promises.length; i++){
		const resp = responses[i];
		const p = promises[i];
		const filename = `${htmlOutputPath}/${p.year}_${p.index}.html`;
		if(resp.status === 200){
			saveToFile(p.year, p.index, resp.data);
			// console.log(`saved to ${filename}`);
		} else {
			console.error(`Error getting data for ${filename}`);
		};
	}
};


/////////////////////////////////////////////////////////////////////////////////////
// download file from server

async function downloadFile(year, index) {
	const data = await axios.get(`${targetServer}/autorizatie-de-construire-${index}-din-${year}/`);
	saveToFile(year, index, data);
}

/////////////////////////////////////////////////////////////////////////////////////
// download data from server

async function downloadData() {
	// create log file
	const logStream = fs.createWriteStream(`download_log.csv`);
	logStream.write('year;number;error\n');

	// for each year value in range
	for (let year = 2013; year <= 2019; year++){
		console.log(`YEAR:: ${year}`);
		// for each authorisation number, max limit set to max_count /year
		// available list starts in 2013 with index no 1045
		for (let index = year === 2013 ? 1045 : 1; index <= max_count[year]; index++){
			// if batch is full write array to files
			if (urls_to_fetch.length === batch_size || index > max_count[year]){
				await save_urls(urls_to_fetch, logStream).catch(e => {
					console.error(`Error for promise.all ${e}`);
					// console.trace('error');
				});
				urls_to_fetch = [];
			// if batch not full
			} else {
				urls_to_fetch.push({
					promise: axios.get(`${targetServer}/autorizatie-de-construire-${index}-din-${year}/`),
					index: index,
					year: year
				});
				console.log(`@url_to_fetch >>> AUT ${index}/${year}: REQUEST SENT`);
			}
		}
	}
}


/////////////////////////////////////////////////////////////////////////////////////
// MAIN

function main() {
	console.log(process.argv);

	// default local data
	const batch_size = 10;
	let urls_to_fetch = [];
	// manually add number of authorisations for each year available
	// the availability starts in 2013 with authorisation no 1025
	const first_auth = {2013: 1025};
	const last_auth = {2019: 588};
	const max_count = {
		2013: 1682,
		2014: 1494,
		2015: 1553,
		2016: 2286,
		2017: 1864,
		2018: 2001,
		2019: 588
	};

	// help text
    const helpText = '\n Available commands:\n\n\
		1. -h : display help text\n\
		2. -d : downloads all data from the website and save it in HTML files\n\
				+ can also accept additional arguments\n\
					2003 1025\n\
		3. -p : parse all HTML files and save the results in a CSV file\n\
				+ can also accept additional arguments\n\
					2003 1025\n\
		';
	// set default argument
	const argument = process.argv[2] || '-h';
	
	// run requested command
    // 1. if argument is 'h' or 'help' print available commands
    if (argument === '-h') {
        console.log(helpText);

    // 2. else if argument is 'd' >> download all data from server
    } else if (argument === '-d') {
		// get remaining arguments
		const year = process.argv[3] || 0;
		const index = process.argv[4] || 0;

		// if there are no more arguments, download all files from server
		if (year === index === 0) {
			// extract counties from the localities level tables
			downloadData();
		
		// if both year and index !== 0, extract the corresponding file
		} else if (year !== 0 && index !== 0) {
			downloadFile(year, index);

		// else print help
		} else {
			console.log(helpText);
		}
        
	
	// 3. else ift argument is 'p' >> parse all files
	} else if (argument === '-p') {
		// get remaining arguments
		const year = process.argv[3] || 0;
		const index = process.argv[4] || 0;

		// if there are no more arguments, download all files from server
		if (year === index === 0) {
			// extract counties from the localities level tables
			parseData();
		
		// if both year and index !== 0, extract the corresponding file
		} else if (year !== 0 && index !== 0) {
			parseFile(year, index);

		// else print help
		} else {
			console.log(helpText);
		}


    // else print help
	} else {
		console.log(helpText);
	}

}

// ////////////////////////////////////////////////////////////////////////////
// // RUN MAIN

main();
