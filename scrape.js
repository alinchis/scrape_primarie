const axios = require('axios'); //for web requests with promise
const cheerio = require('cheerio'); // for content identification inside htmls
let fs = require('fs'); //for saving to file
const targetServer = 'https://primariaclujnapoca.ro/autorizari-constructii/autorizatii-de-construire';
const csvOutputPath = './scraped';
const procOutputPath = './processed';
const geoOutputPath = './geolocated';
// custom modules
const processCSV = require('./processCSV.js');


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
	console.log(`@parseData:: ${year}/${index} STARTING\n`);

	// load html data
	const $ = cheerio.load(data);
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
	newArray.push($('div.col-md-8').text().replace(/\n/g, ' ').replace(/\s{2,}/g, ' ').trim()); // detalii proiect
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
	// console.log(newArray);
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
	outStream.write(`"${dataArr.join('";"')}"\n`);
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
		lastIndex = parseInt(lastItem[1]) + 1;

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
			'Valoare Lucrari',
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

		// in case of year 2013, the first available authorisation starts at 1045
		if (year == first_auth.key) lastIndex = first_auth.value;
	}
	

	// for each index in given year, download data
	console.log(`@downloadYear: lastIndex = ${lastIndex}`);
	for (let index = lastIndex; index <= max_count[year]; index++){
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

	// close write Streams
	outStream.close();
	logStream.close();
	errorStream.close();
}


/////////////////////////////////////////////////////////////////////////////////////
// check for download errors and request data again
async function reviewDownloads(year) {
	console.log(`@reviewDownloads:: year = ${year}`);

	// init file paths
	const dataPath = `${csvOutputPath}/${year}_lista_AC.csv`;
	const logPath = `${csvOutputPath}/${year}_download_log.csv`;
	const errorPath = `${csvOutputPath}/${year}_error_log.csv`;

	const tempDataPath = `${csvOutputPath}/${year}_lista_AC-temp.csv`;
	const tempLogPath = `${csvOutputPath}/${year}_download_log-temp.csv`;
	const tempErrorPath = `${csvOutputPath}/${year}_error_log-temp.csv`;


	// if files for selected year exist
	if (fs.existsSync(dataPath) && fs.existsSync(logPath) && fs.existsSync(errorPath)) {
		// read files into variables
		const dataArr = fs.readFileSync(dataPath, 'utf8').trim().split('\n');
		const logArr = fs.readFileSync(logPath, 'utf8').trim().split('\n');
		const errorArr = fs.readFileSync(errorPath, 'utf8').trim().split('\n');

		// for each item in error array
		// iterator starts at 1, first line is header item
		const newErrorArr = [];
		for (let i=1; i < errorArr.length; i += 1) {
			// check if the error is server error 500
			const searchString = 'code 500';
			const currentItem = errorArr[i].split(';');
			const index = currentItem[1];
			if (currentItem[2].indexOf(searchString) > -1) {
				console.log(`@reviewDownloads:: ${year}/${index}`);
				
				// fetch data
				try {
					console.log(`${year}/${index}: Request data ...`);
					const resp = await axios.get(`${targetServer}/autorizatie-de-construire-${index}-din-${year}/`);
					// test for success
					console.log(`${year}/${index}: Verify data ...`);
					if(resp.status === 200){
						// parse data
						const respArr = parseData(year, index, resp.data);
						console.log(respArr);

						// find index of previous element
						let prevIndex = 0;
						let prevAuth = 1;
						for (let x = index - 1; x >= 1; x -= 1) {
							const searchIndex = logArr.indexOf(`${year};${x}`);
							if (searchIndex >= 0) {
								prevIndex = searchIndex;
								prevAuth = x;
								console.log(`${year}/${index}: Previous index found = ${x}`);
								break;
							}
						}
	
						// insert data into log array
						logArr.splice(prevIndex + 1, 0, `${year};${index}`);

						// insert data into data array
						dataArr.splice(prevIndex + 1, 0, respArr.join(';'));

						// delete error item from error array
						// errorArr.splice(i, 1);

						console.log(`${year}/${index}: Arrays updated`);
					} else {
						console.error(`${year}/${index}: Error code ${resp.status}`);
						// new data is not available, keep the error in list
						newErrorArr.push(errorArr[i]);
					}
				} catch(e) {
						// add item to log
						console.error(`Comumunication ERROR when getting data for ${year}/${index}\n${e}\n`)
				}

			// else push error to new Error Array
			} else {
				newErrorArr.push(errorArr[i]);
			}
		}

		// save new arrays to files
		// save new data array to file
		fs.writeFile(tempDataPath, dataArr.join('\n'), (err) => {
			// If an error occurred, show it and return
			if(err) return console.error(err);
			// Successfully wrote to the file!
			// remove old file
			fs.unlink(dataPath, (err) => {
				if (err) throw err;
				console.log(`${dataPath} file was deleted\n`);
				// rename current file
				fs.rename(tempDataPath, dataPath, (err) => {
					if (err) {
							console.log('Data File rename ERROR: ' + err);
							throw err;
					}
					console.log('Data File renamed Succesffulyy!!\n');
				});
			});
		});
		// save new log array to file
		fs.writeFile(tempLogPath, logArr.join('\n'), (err) => {
			// If an error occurred, show it and return
			if(err) return console.error(err);
			// Successfully wrote to the file!
			// remove old file
			fs.unlink(logPath, (err) => {
				if (err) throw err;
				console.log(`${logPath} file was deleted\n`);
				// rename current file
				fs.rename(tempLogPath, logPath, (err) => {
					if (err) {
							console.log('Log File rename ERROR: ' + err);
							throw err;
					}
					console.log('Log File renamed Succesffulyy!!\n');
				});
			});
		});
		// save new error array to file
		fs.writeFile(tempErrorPath, newErrorArr.join('\n'), (err) => {
			// If an error occurred, show it and return
			if(err) return console.error(err);
			// Successfully wrote to the file!
			// remove old file
			fs.unlink(errorPath, (err) => {
				if (err) throw err;
				console.log(`${errorPath} file was deleted\n`);
				// rename current file
				fs.rename(tempErrorPath, errorPath, (err) => {
					if (err) {
							console.log('Error File rename ERROR: ' + err);
							throw err;
					}
					console.log('Error File renamed Succesffulyy!!\n');
				});
			});
		});
	
	// else print error message
	} else {
		console.log(`ERROR: some or all files for year = ${year} are missing!`)
	}
}


/////////////////////////////////////////////////////////////////////////////////////
// MAIN
function main() {
	console.log(`\nArguments Array:\n[ ${process.argv.join(' , ')} ]\n`);

	// manually add number of authorisations for each year available
	// the availability starts in 2013 with authorisation no 1025
	const first_auth = { key:2013, value:1045 };
	const last_auth = { key:2019, value:596 }; // updated at 15.05.2019
	const max_count = {
		2013: 1682,
		2014: 1494,
		2015: 1553,
		2016: 2286,
		2017: 1864,
		2018: 2001,
		2019: 596
	};

	// help text
    const helpText = '\n Available commands:\n\n\
		1. -h : HELP > display help text\n\
		2. -d : DOWNLOAD > downloads all data from the website and save it in CSV files by year\n\
				+ can also accept additional arguments\n\
					2003 1025\n\
		3. -r : REVIEW > parse all CSV files and check for download errors\n\
						in case of server error 500 is found request data again and update files\n\
				+ can also accept year argument\n\
					[2003 - 2019]\n\
		4. -p : PROCESS > extract relevant data from CSV files\n\
				+ can also accept year argument\n\
					[2003 - 2019]\n\
		';
	// set default argument
	const argument = process.argv[2] || '-h';
	
	// run requested command
	// 1. if argument is 'h' or 'help' print available commands
	if (argument === '-h') {
			console.log(helpText);

	// 2. else if argument is 'd' >> download data from server
	} else if (argument === '-d') {
		// get remaining arguments
		const year = process.argv[3] || 0;
		const index = process.argv[4] || 0;

		// if there are no more arguments, download all years
		if (year === 0 && index === 0) {
			// extract counties from the localities level tables
			console.log('download all years branch\n')
			// for each year
			for (let i = first_auth.key; i <= last_auth.key; i += 1) {
				console.log(`Year value = ${year} OK!\n`);
				downloadYear(i, first_auth, last_auth, max_count);
			}
		
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
			
	
	// 3. else if argument is 'r' >> parse all CSV files and check for download errors
	} else if (argument === '-r') {
		// get remaining arguments
		const year = process.argv[3] || 0;

		// if there are no more arguments, download all files from server
		if (year === 0) {
			// extract counties from the localities level tables
			console.log('Review all years\n');
			// for each year review downloads
			for (let i = first_auth.key; i <= last_auth.key; i += 1) {
				console.log(`Year value = ${i} OK!\n`);
				reviewDownloads(i);
			}
		
		// if year !== 0 and in range, check files for errors
		} else if (year !== 0 && year >= first_auth.key && year <= last_auth.key) {
			console.log(`Year value = ${year} OK!\n`);
			reviewDownloads(year);
		
		// if year !== 0 and out of range, exit
		} else if (year !== 0 && ( year < first_auth.key || year > last_auth.key )) {
			console.log(`ERROR: year ${year} out of range [${first_auth.key} - ${last_auth.key}]\n`);

		// else print help
		} else {
			console.log(helpText);
		}

	// 4. else if argument is 'p' >> parse all CSV files and retrieve relevant data
	} else if (argument === '-p') {
		// get remaining arguments
		const year = process.argv[3] || 0;

		// if there are no more arguments, process all years
		if (year === 0) {
			// extract counties from the localities level tables
			console.log('Process all years\n');
			// for each year review downloads
			for (let i = first_auth.key; i <= last_auth.key; i += 1) {
				console.log(`Year value = ${i} OK!\n`);
				processCSV(i, procOutputPath, csvOutputPath);
			}
		
		// if year !== 0 and in range, process csv files for given year
		} else if (year !== 0 && year >= first_auth.key && year <= last_auth.key) {
			console.log(`Year value = ${year} OK!\n`);
			processCSV(year, procOutputPath, csvOutputPath);
		
		// if year !== 0 and out of range, exit
		} else if (year !== 0 && ( year < first_auth.key || year > last_auth.key )) {
			console.log(`ERROR: year ${year} out of range [${first_auth.key} - ${last_auth.key}]\n`);

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
