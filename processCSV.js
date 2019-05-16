// processCSV module
// extract relevant data from CSV files

// load modules
let fs = require('fs'); //for saving to file
const util = require('util');


/////////////////////////////////////////////////////////////////////////////////////
// get all height items from given strig
function getCHeight (targetText, index, year) {
    // declare regex match strings
    const regexString = /(?:\s|:|\.|\/|\(|\.\+)(?<arr>(?<h>\/?(S\d\+)*(?:\d?St?p?\+)?(?:\d?Dp?\+?)?(?:P|PARTER)(?:\+Supanta)?(?:\+\d?\d?E?(?:taj)?)?(?:\+E(?:taj)?\s?retras)?(?:\+E(?:taj)?\s?t(?:ehnic)?)?(?:\+\d?Mp?)?(?:\+R)?\/?\/?)+)(?:\s|,|-|”|\/|\.$|\.[^R]|\)|$)/gmi;
    
    let match = '';
    const outArr = [];
    // const testString = 'LOCUINTA S+P+E+R';
    // console.log(`test: ${/(?:\s|:|\.|\/|\(|\.\+)((\/?(S\d\+)*(?:\d?St?p?\+)?(?:\d?Dp?\+?)?(?:P|PARTER)(?:\+Supanta)?(?:\+\d?\d?E?(?:taj)?)?(?:\+E(?:taj)?\s?retras)?(?:\+E(?:taj)?\s?t(?:ehnic)?)?(?:\+\d?Mp?)?(?:\+R)?\/?\/?)+)(?:\s|,|-|”|\/|\.$|\.[^R]|\)|$)/.exec(testString)}`);

    do {
        match = regexString.exec(targetText);
        if (match) {
            outArr.push(match.groups.arr);
            // console.log(`${year}/${index}: ${match.groups.arr}`);
        } else {
            // console.log(`${year}/${index}:`);
        }
    } while (match);

    // console.log(`${year}/${index}: ${outArr}`);
    return outArr;
}


/////////////////////////////////////////////////////////////////////////////////////
// get all type items from given string
function getCTypes (targetText, index, year) {
    // declare regex strings
    const regex01 = /^((dou.\s)?cas.\s|imobil|locuin.{2}|centru|cl.dire|bloc|garaj)|construire/gmi // construire
    const regex02 = /(?:construirea?\s(?:unui\s)?)?balcon|extindere/gmi // extindere
    const regex03 = /(supra)?etajare|mansardare/gmi // etajare, mansardare
    const regex04 = /repara.i[eia]/gmi // reparatie
    const regex05 = /renov.r[ie]|refa.adizare/gmi // renovare
    const regex06 = /modific.ri interioare|recompartimentare/gmi // modificari interioare /recompartimentare
    const regex07 = /(?:^|cu\s|si\s|\.|:\s)(modif\.?(icarea?)?(\sde)?\ssol)|(proiect modificator)/gmi // modificare solutie constructiva
    const regex08 = /continuare/gmi // continuare lucrari
    const regex09 = /((prima|regim de)\surgenta)|(interven.ie de prim.)/gmi // urgenta
    const regex10 = /consolidare/gmi // consolidare
    const regex11 = /modernizare/gmi // modernizare
    const regex12 = /\sgaze?|\sapa\s|\sapă\s|energie|\slea\s|l\.e\.a\./gmi // bransare la retele
    const regex13 = /reabilitarea?\s((piatra funerara)|obelisc|sarcofag|cavo)/gmi // reabilitare monumente funerare
    const regex14 = /(reabilitarea?\s+termica)|(eficien.)|termoizolare/gmi // reabilitare termica
    const regex15 = /sc?himbare(\sde)? destina.ie/gmi // schimbare de destinatie
    const regex16 = /amenh?ajar/gmi // amenajare terasa, statuie ...
    const regex17 = /(re)?amplasare|montare/gmi // amplasare /reamplasare firma luminoasa, totem luminos, terasa, statuie

    // declare array of regex with tags
    const matchStrings = [];
    matchStrings.push({ regex: regex01, tag: 'construire' });                     // construire
    matchStrings.push({ regex: regex02, tag: 'extindere' });                      // extindere
    matchStrings.push({ regex: regex03, tag: 'etajare' });                        // etajare, mansardare
    matchStrings.push({ regex: regex04, tag: 'reparatie' });                      // reparatie
    matchStrings.push({ regex: regex05, tag: 'renovare' });                       // renovare
    matchStrings.push({ regex: regex06, tag: 'modificari interioare' });          // modificari interioare /recompartimentare
    matchStrings.push({ regex: regex07, tag: 'modificare solutie' });             // modificare solutie constructiva
    matchStrings.push({ regex: regex08, tag: 'continuare lucrari' });             // continuare lucrari
    matchStrings.push({ regex: regex09, tag: 'urgenta' });                        // urgenta
    matchStrings.push({ regex: regex10, tag: 'consolidare' });                    // consolidare
    matchStrings.push({ regex: regex11, tag: 'modernizare' });                    // modernizare
    matchStrings.push({ regex: regex12, tag: 'bransare' });                       // bransare la retele
    matchStrings.push({ regex: regex13, tag: 'reabilitare monumente funerare' }); // reabilitare monumente funerare
    matchStrings.push({ regex: regex14, tag: 'reabilitare termica' });            // reabilitare termica
    matchStrings.push({ regex: regex15, tag: 'schimbare destinatie' });           // schimbare de destinatie
    matchStrings.push({ regex: regex16, tag: 'amenajare' });                      // amenajare terasa, statuie
    matchStrings.push({ regex: regex17, tag: 'amplasare' });                      // amplasare /reamplasare firma luminoasa, terasa, statuie

    const outArr = [];
    
    // match all types and add tags to array for found items
    for (let i = 0; i < matchStrings.length; i += 1) {
        if(matchStrings[i].regex.test(targetText)) {
            outArr.push(matchStrings[i].tag);
        }
    }

    // if no match is found, assign default value: 'construire'
    if (outArr.length === 0) outArr.push('construire');

    console.log(`${year}/${index}: ${outArr}`);
    return outArr;
}

/////////////////////////////////////////////////////////////////////////////////////
// get all type items from given string
function getCDesignation (targetText, index, year) {
    // declare regex strings
    // const regex01 = /construire/gmi // construire
    // const regex02 = /construire/gmi // extindere
    // const regex03 = /construire/gmi // reparatie
    // const regex04 = /construire/gmi // renovare
    // const regex05 = /construire/gmi // modificari interioare /recompartimentare
    // const regex06 = /construire/gmi // modificare solutie constructiva
    // const regex07 = /construire/gmi // continuare lucrari
    // const regex08 = /construire/gmi // urgenta
    // const regex09 = /construire/gmi // consolidare
    // const regex10 = /construire/gmi // modernizare
    // const regex11 = /construire/gmi // bransare la retele
    // const regex12 = /construire/gmi // reabilitare monumente funerare
    // const regex13 = /construire/gmi // reabilitare termica
    // const regex14 = /schimbare(\sde)? destina.ie/gmi // schimbare de destinatie
    // const regex15 = /construire/gmi // amplasare firma luminoasa

    // declare array of regex with tags
    // const matchStrings = [];
    // matchStrings.push({ regex: regex01, tag: 'construire' });                     // construire
    // matchStrings.push({ regex: regex02, tag: 'extindere' });                      // extindere
    // matchStrings.push({ regex: regex03, tag: 'reparatie' });                      // reparatie
    // matchStrings.push({ regex: regex04, tag: 'renovare' });                       // renovare
    // matchStrings.push({ regex: regex05, tag: 'modificari interioare' });          // modificari interioare /recompartimentare
    // matchStrings.push({ regex: regex06, tag: 'modificare solutie' });             // modificare solutie constructiva
    // matchStrings.push({ regex: regex07, tag: 'continuare lucrari' });             // continuare lucrari
    // matchStrings.push({ regex: regex08, tag: 'urgenta' });                        // urgenta
    // matchStrings.push({ regex: regex09, tag: 'consolidare' });                    // consolidare
    // matchStrings.push({ regex: regex10, tag: 'modernizare' });                    // modernizare
    // matchStrings.push({ regex: regex11, tag: 'bransare' });                       // bransare la retele
    // matchStrings.push({ regex: regex12, tag: 'reabilitare monumente funerare' }); // reabilitare monumente funerare
    // matchStrings.push({ regex: regex13, tag: 'reabilitare termica' });            // reabilitare termica
    // matchStrings.push({ regex: regex14, tag: 'schimbare destinatie' });           // schimbare de destinatie
    // matchStrings.push({ regex: regex15, tag: 'firma luminoasa' });                // amplasare firma luminoasa

    const outArr = [];
    
    // match all types and add tags to array for found items
    // for (let i = 0; i < matchStrings.length; i += 1) {
    //     if(matchStrings[i].regex.test(targetText)) {
    //         outArr.push(matchStrings[i].tag);
    //     }
    // }

    // console.log(`${year}/${index}: ${outArr}`);
    return outArr;
}


/////////////////////////////////////////////////////////////////////////////////////
// check for download errors and request data again
module.exports = function (year, outPath, inPath) {
    console.log(`@processCSV:: year = ${year}`);

    // init files path
    const dataFile = `${inPath}/${year}_lista_AC.csv`;
    const outFile = `${outPath}/${year}_lista_AC-processed.csv`;

    // declare processed items array
    const outArr = [];
    outArr.push('year;index;address');

    // read CSV file
    // if file for selected year exist
	if (fs.existsSync(dataFile)) {
		// read file into data array
        const dataArr = fs.readFileSync(dataFile, 'utf8').trim().split('\n');
        console.log(`@processCSV:: loaded ${dataArr.length - 1} items from file\n`);

        // for each item in array
        for (let i = 1; i < dataArr.length; i += 1) {
            // get current line array
            const currentLine = dataArr[i].split('";"');
            // console.log(currentLine);
            // create variables to hold data
            const index = currentLine[0].replace(/\"/g, ''); // numar autorizare
            const dateShow = currentLine[2].replace(/\"/g, ''); // data afisarii
            const dateCreated = currentLine[22].replace(/\"/g, ''); // data creare
            const dateRequest = currentLine[11].replace(/\"/g, ''); // data cerere
            const noRequest = currentLine[12].replace(/\"/g, ''); // numar cerere
            const impCat = currentLine[5]; // categoria de importanta
            const address = currentLine[4]; // adresa lucrare
            const title = currentLine[3]; // denumire lucrare
            const heightObj = getCHeight(title, index, year);
            // console.log(`${util.inspect(heightObj, false, null, true /* enable colors */) || ''}`);
            // console.log(`${heightObj || ''}`);
            const constructionType = getCTypes(title, index, year); // tipul de lucrare
            const constructionDesignation = getCDesignation(title, index, year); // dentinatia lucrarii
            const value = currentLine[8].replace(/\"/g, ''); // valoare lucrare
            const tax = currentLine[23].replace(/\"/g, ''); // taxa autorizare
            // add data to processed array
            outArr.push(`${year};${index};${constructionType};${title}`);
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
