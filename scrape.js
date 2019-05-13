const axios = require('axios'); //for web requests with promise
const cheerio = require('cheerio'); // for content identification inside htmls
let fs = require('fs'); //for saving to file
const targetServer = 'https://primariaclujnapoca.ro/autorizari-constructii/autorizatii-de-construire';
const htmlOutputPath = './scraped';
const csvOutputPath = './processed';
const readline = require('readline');
const stream = require('stream');


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
// convert date to numerical
function convertDate(text) {
	let newText = '';

	// replace text with numerical values
	newText = text.replace(' ianuarie ', '-01-');
	newText = newText.replace(' februarie ', '-02-');
	newText = newText.replace(' martie ', '-03-');
	newText = newText.replace(' aprilie ', '-04-');
	newText = newText.replace(' mai ', '-05-');
	newText = newText.replace(' iunie ', '-06-');
	newText = newText.replace(' iulie ', '-07-');
	newText = newText.replace(' august ', '-08-');
	newText = newText.replace(' septembrie ', '-09-');
	newText = newText.replace(' octombrie ', '-10-');
	newText = newText.replace(' noiembrie ', '-11-');
	newText = newText.replace(' decembrie ', '-12-');

	// return numerical text
	return newText;
}


/////////////////////////////////////////////////////////////////////////////////////
// parse all html files
function parseData(year, index, data) {
	console.log('@parseData\n');
	const filename = `${htmlOutputPath}/${year}_${index}.html`;
	console.log(filename);
	// load html data
	const $ = cheerio.load(data.replace('\n', ' '));
	// important data for save
	const newArray = [];
	newArray.push(index); // numar autorizatie
	newArray.push(year); // an
	newArray.push(convertDate($('div.fusion-page-title-captions h3').text())); // data afisarii numeric
	newArray.push($('div.field-lucrari').text().trim()); // titlu lucrare
	newArray.push($('div.field-adresa_lucrare').text()); // adresa lucrare
	newArray.push($('div.field-categorie_importanta').text().replace('Categorie importanță:', '')); // categoria de importanta
	newArray.push($('div.field-nrfisacarte').text()); // carte funciara
	newArray.push($('div.field-nrtopo').text()); // numar topo
	newArray.push($('div.field-valoarelucrari').text().replace('Investiție de bază:', '').trim()); // valoare lucrari
	newArray.push($('div.col-md-8').text().trim()); // detalii proiect
	newArray.push($('div.field-nume').text().trim()); // titular
	newArray.push($('div.field-nrcerere').text().replace('CERERE NR.', '')); // numar cerere autorizare
	newArray.push($('div.field-datacerere').text().replace('DIN DATA:', '').replace(/\./g, '-')); // data cerere autorizare
	newArray.push($('div.field-durataexecut').text()); // durata de executie a lucrarilor: Valoare
	newArray.push($('div.field-luni_zile_exec').text()); // durata de executie a lucrarilor: UM
	newArray.push($('div.field-valabilitate').text()); // termen de valabilitate: Valoare
	newArray.push($('div.field-luni_zile_valab').text()); // termen de valabilitate: UM
	newArray.push($('div.field-primar').text().replace('PRIMAR:', '')); // primar
	newArray.push($('div.field-secretar').text().replace('SECRETAR:', '')); // secretar
	newArray.push($('div.field-arhitectsef').text().replace('ARHITECT ȘEF:', '')); // arhitect sef
	newArray.push($('div.field-sefserviciuaut').text().replace('ȘEF SERVICIU:', '')); // sef serviciu autorizari
	newArray.push($('div.field-inspectorurbanism').text().replace('ÎNTOCMIT DE:', '')); // intocmit de
	newArray.push($('div.field-data_creare').text().replace('Data creare:', '').replace(/\./g, '-')); // data creare
	newArray.push($('div.field-taxaautorizare').text().replace('Taxa de autorizare:', '')); // taxa autorizare
	
	// console.log(dateIssued);
	// return new array
	console.log(`@parseData:: ${year}/${index} DONE\n`);
	console.log(newArray);
	return newArray;

}


/////////////////////////////////////////////////////////////////////////////////////
// save page to file
function saveToFile(year, index, data, outStream) {
	// console.log(data.data);
	// parse data
	const dataArr = parseData(year, index, data);

	// write to file
	// fs.writeFileSync(filename, dataArr.join(';'));
	outStream.write(`${dataArr.join(';')}\n`);
	console.log(`@saveToFile:: AC ${year}/${index} saved to file`);
}


/////////////////////////////////////////////////////////////////////////////////////
// download file from server
async function downloadFile(year, index) {
	const data = await axios.get(`${targetServer}/autorizatie-de-construire-${index}-din-${year}/`);
	saveToFile(year, index, data);
}

/////////////////////////////////////////////////////////////////////////////////////
// download data from server
async function downloadData(first_auth, last_auth, max_count, batch_size) {
	let urls_to_fetch = [];
	// create log file
	const logStream = fs.createWriteStream(`download_log.csv`);
	logStream.write('year;number;error\n');
	// create output file
	const outStream = fs.createWriteStream(`lista_AC.csv`);
	const outStreamHeader = [
		'Aut. Nr.',
		'An',
		'Data',
		'Titlu',
		'Adresa',
		'Categorie importanta',
		'Carte funciara',
		'Nr. TOPO',
		'Detalii',
		'Titular',
		'Cerere Nr.',
		'Cerere Data',
		'Durata executie',
		'UM',
		'Valabilitate',
		'UM',
		'Primar',
		'Secretar',
		'Arhitect Sef',
		'Sef Serviciu',
		'Intocmit de',
		'Data creare',
		'Taxa autorizare',
	];
	outStream.write(`${outStreamHeader.join(';')}\n`);

	// for each year value in range
	for (let year = 2013; year <= 2019; year++){
		console.log(`YEAR:: ${year}`);
		// for each authorisation number, max limit set to max_count /year
		// available list starts in 2013 with index no 1045
		for (let index = year === 2013 ? 1045 : 1; index <= max_count[year]; index++){
			// fetch data
			try {
				const resp = await axios.get(`${targetServer}/autorizatie-de-construire-${index}-din-${year}/`);
				// test for success
				if(resp.status === 200){
					saveToFile(year, index, resp.data, outStream);
					// console.log(`saved to ${filename}`);
				} else {
					logStream.write(`${year};${index};${resp.status}\n`);
					console.error(`Error getting data for ${year}/${index}`);
				};
			} catch(e) {
					// add item to log
					logStream.write(`${year};${index};${e}\n`);
					console.error(`Error ${e} when getting index for year ${year} and index ${index}`)
			};
		}
	}
}


/////////////////////////////////////////////////////////////////////////////////////
// download data from server
async function downloadYear(year, first_auth, last_auth, max_count) {
	let lastIndex = 1;
	const outPath = `${csvOutputPath}/${year}_lista_AC.csv`;
	const logPath = `${csvOutputPath}/${year}_download_log.csv`;
	const errorPath = `${csvOutputPath}/${year}_error_log.csv`;
	// prepare streams
	let logStream = '';
	let errorStream = '';
	let outStream = '';

	// check if files already exist, append files
	if (fs.existsSync(outPath) && fs.existsSync(logPath) && fs.existsSync(errorPath)) {
		const loadFile = fs.readFileSync(logPath, 'utf8');
		// console.log(loadFile);
		const lastArr = loadFile.split('\n');
		console.log(lastArr);
		const lastItem = lastArr[lastArr.length-2].split(';');
		console.log(lastItem);
		lastIndex = lastItem[1];

		// create downloads log file
		logStream = fs.createWriteStream(logPath, {'flags': 'a'});
		// create error log file
		errorStream = fs.createWriteStream(errorPath, {'flags': 'a'});
		// create output file
		outStream = fs.createWriteStream(outPath, {'flags': 'a'});

	// if new download
	} else {
		// create downloads log file
		logStream = fs.createWriteStream(logPath);
		logStream.write('year;number\n');
		// create error log file
		errorStream = fs.createWriteStream(errorPath);
		errorStream.write('year;number;error\n');
		// create output file
		outStream = fs.createWriteStream(outPath);
		const outStreamHeader = [
			'Aut. Nr.',
			'An',
			'Data',
			'Titlu',
			'Adresa',
			'Categorie importanta',
			'Carte funciara',
			'Nr. TOPO',
			'Detalii',
			'Titular',
			'Cerere Nr.',
			'Cerere Data',
			'Durata executie',
			'UM',
			'Valabilitate',
			'UM',
			'Primar',
			'Secretar',
			'Arhitect Sef',
			'Sef Serviciu',
			'Intocmit de',
			'Data creare',
			'Taxa autorizare',
		];
		outStream.write(`${outStreamHeader.join(';')}\n`);
	}
	

	// for each index in given year, download data
	console.log(`@downloadYear: lastIndex = ${lastIndex}`);
	for (let index = year == 2013 ? 1045 : lastIndex; index <= max_count[year]; index++){
		// fetch data
		try {
			const resp = await axios.get(`${targetServer}/autorizatie-de-construire-${index}-din-${year}/`);
			// test for success
			if(resp.status === 200){
				saveToFile(year, index, resp.data, outStream);
				logStream.write(`${year};${index}\n`);
				// console.log(`saved to ${filename}`);
			} else {
				errorStream.write(`${year};${index};${resp.status}\n`);
				console.error(`Error getting data for ${year}/${index}`);
			}
		} catch(e) {
				// add item to log
				errorStream.write(`${year};${index};${e}\n`);
				console.error(`Error ${e} when getting index for year ${year} and index ${index}`)
		}
	}
}


/////////////////////////////////////////////////////////////////////////////////////
// MAIN
function main() {
	console.log(process.argv);

	// default local data
	const batch_size = 1;
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
			if (year === 0 && index === 0) {
				// extract counties from the localities level tables
				console.log('downloadData branch\n')
				downloadData(first_auth, last_auth, max_count, batch_size);
			
			// if both year and index !== 0, extract the corresponding file
			} else if (year !== 0 && index === 0) {
				console.log('downloadYear branch\n')
				downloadYear(year, first_auth, last_auth, max_count);
			
			// if both year and index !== 0, extract the corresponding file
			} else if (year !== 0 && index !== 0) {
				console.log('downloadFile branch\n')
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
