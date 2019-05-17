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
function getCAction (targetText, index, year) {
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
    const regex18 = /cercet.r/gmi // cercetari si investigatii

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
    matchStrings.push({ regex: regex18, tag: 'cercetare' });                      // cercetari si investigatii

    const outArr = [];
    
    // match all types and add tags to array for found items
    for (let i = 0; i < matchStrings.length; i += 1) {
        if(matchStrings[i].regex.test(targetText)) {
            outArr.push(matchStrings[i].tag);
        }
    }

    // if no match is found, assign default value: 'construire'
    if (outArr.length === 0) outArr.push('construire');

    // console.log(`${year}/${index}: ${outArr}`);
    return outArr;
}


/////////////////////////////////////////////////////////////////////////////////////
// get housing type
function getHouseType (targetText, index, year) {
    // declare regex strings
    const house = {
        regex: /unifam|familial|individual|cas.\s|locuin.a/gmi, // locuinte individuale /unifamiliale
        tag: 'locuinte unifamiliale'
    }
    const house1 = {
        regex: /\sizolat.\s/gmi, // izolate
        tag: 'izolate'
    }
    const house2 = {
        regex: /cuplat|(2|doua)\s+(loc(uinte)?|case)/gmi, // cuplate
        tag: 'cuplate'
    }
    const house3 = {
        regex: /locuin.e\s+colective/gmi, // insiruite
        tag: 'insiruite'
    }
    // work array
    const outArr = [];

    // if housing test is true update work array and search for details
    if (house.regex.test(targetText)) {
        // push house tag to work array
        outArr.push(house.tag);
        // check for details
        // if it checks for 'isolated'
        if (house1.regex.test(targetText)) {
            // push 'isolated' tag to work array
            outArr.push(house1.tag);
        // else if it checks for 'coupled'
        } else if (house2.regex.test(targetText)) {
            // push 'coupled' tag to work array
            outArr.push(house2.tag);
        // else if it checks for 'aligned'
        } else if (house3.regex.test(targetText)) {
            // push 'aligned' tag to work array
            outArr.push(house3.tag);
        // if none is found
        } else {
            // push 'isolated' tag to work array
            outArr.push(house1.tag);
        }
    }

    // console.log(`${year}/${index}: ${outArr}`);
    return outArr;
}


/////////////////////////////////////////////////////////////////////////////////////
// get all type items from given string
function getCType (targetText, index, year) {
    // declare regex strings
    const regex01 = /ansamblu\s(de\s)?locuin.|grup.*case/gmi // ansamblu de locuinte
    const regex02 = /locuin.e\s+colective|apartament/gmi // locuinte colective
    const regex03 = /monumente?\s+istorice?/gmi // monument istoric
    const regex04 = /birou|sediu firma|centru\s(de\s)?afaceri/gmi // birouri
    const regex05 = /comer/gmi // spatii comerciale
    const regex06 = /servicii/gmi // servicii
    const regex07 = /garaj/gmi // garaj
    const regex08 = /.mprejmuire/gmi // imprejmuire
    const regex09 = /balcon/gmi // balcon
    const regex10 = /biseric./gmi // biserica
    const regex11 = /ascensor/gmi // ascensor
    const regex12 = /marcare|firm.\s+luminoas/gmi // firma luminoasa, inscriptie
    const regex13 = /obelisc|piatra funerar|monument funerar|sarcofag|\scavo/gmi // monumente funerare
    const regex14 = /statuie/gmi // arta monumentala
    const regex15 = /teras.\s(sezon|in sistem proviz)/gmi // terasa sezoniera
    const regex16 = /hotel|cazare/gmi // spatii cazare
    const regex17 = /modernizare strada/gmi // strada
    const regex18 = /acoperi.|.arpant.|.nvelitoare|acoperi. teras./gmi // acoperis, sarpanta, acoperis terasa, invelitoare
    const regex19 = /amenaj.ri exterioare/gmi // amenajari exterioare
    const regex20 = /recompartiment|amenaj.r. interio/gmi // recompartimentari, amenajari interioare
    const regex21 = /hal./gmi // hala

    // declare array of regex with tags
    const matchStrings = [];
    matchStrings.push({ regex: regex02, tag: 'locuinte colective' });              // locuinte colective
    matchStrings.push({ regex: regex03, tag: 'monument istoric' });                // monument istoric
    matchStrings.push({ regex: regex04, tag: 'birouri' });                         // birouri
    matchStrings.push({ regex: regex05, tag: 'comert' });                          // comert
    matchStrings.push({ regex: regex06, tag: 'servicii' });                        // servicii
    matchStrings.push({ regex: regex07, tag: 'garaj' });                           // garaj
    matchStrings.push({ regex: regex08, tag: 'imprejmuire' });                     // imprejmuire
    matchStrings.push({ regex: regex09, tag: 'balcon' });                          // balcon
    matchStrings.push({ regex: regex10, tag: 'biserica' });                        // biserica
    matchStrings.push({ regex: regex11, tag: 'ascensor' });                        // ascensor
    matchStrings.push({ regex: regex12, tag: 'marcare' });                         // firma luminoasa, inscriptie
    matchStrings.push({ regex: regex13, tag: 'monument funerar' });                // monumente funerare
    matchStrings.push({ regex: regex14, tag: 'arta monumentala' });                // arta monumentala
    matchStrings.push({ regex: regex15, tag: 'terasa sezoniera' });                // terasa sezoniera
    matchStrings.push({ regex: regex16, tag: 'spatii cazare' });                   // spatii cazare
    matchStrings.push({ regex: regex17, tag: 'strada' });                          // strada
    matchStrings.push({ regex: regex18, tag: 'acoperis' });                        // acoperis, sarpanta, acoperis terasa, invelitoare
    matchStrings.push({ regex: regex19, tag: 'amenajari exterioare' });                        // amenajari exterioare
    matchStrings.push({ regex: regex20, tag: 'amenajari interioare' });                        // recompartimentari, amenajari interioare
    matchStrings.push({ regex: regex21, tag: 'hala' });                            // hala

    const outArr = [];

    // check for groups
    if(regex01.test(targetText)) {
        outArr.push('ansamblu');
    }
    
    // match all types and add tags to array for found items
    const housing = getHouseType(targetText, index, year);
    // if housing is found
    if (housing.length > 0) {
        outArr.push(`${housing[0]}-${housing[1]}`);
    }
    // check for other types
    for (let i = 0; i < matchStrings.length; i += 1) {
        if(matchStrings[i].regex.test(targetText)) {
            outArr.push(matchStrings[i].tag);
        }
    }

    console.log(`${year}/${index}: ${outArr}`);
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
    outArr.push('year;index;data-afisare;data-creare;data-cerere;nr.cerere;regim-h;actiune;tip-lucrari;adresa;titlu');

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
            const cAction = getCAction(title, index, year); // tipul de lucrare
            const cType = getCType(title, index, year); // dentinatia lucrarii
            const value = currentLine[8].replace(/\"/g, ''); // valoare lucrare
            const tax = currentLine[23].replace(/\"/g, ''); // taxa autorizare
            // add data to processed array
            outArr.push(`${year};${index};${dateShow};${dateCreated};${dateRequest};${noRequest};${heightObj};${cAction};${cType};"${address}";"${title}"`);
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
