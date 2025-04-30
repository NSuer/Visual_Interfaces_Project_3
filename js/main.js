let IinesPerEpisodeData = {};
window.selected = null; // Initialize selected variable

let DataName = [
	'Michael',
	'Dwight',
	'Jim',
	'Pam',
	'Andy',
	'Kevin',
	'Angela',
	'Oscar',
	'Erin',
	'Ryan',
	'Darryl',
	'Phyllis',
	'Kelly',
	'Jan',
	'Toby',
	'Stanley',
	'Meredith',
	'Creed',
	'Gabe',
];

cloudLayout = null;
cloudSVG = null;

encounterNames = [
	'Michael',
	'Dwight',
	'Jim',
	'Pam',
	'Andy',
	'Kevin',
	'Angela',
	'Oscar'
];

let seasonFrames = []
let cloudColor = "LightCoral"
let speakerFrames = []

let mainCharacters = [
	{ name: 'Michael Scott', role: 'Regional Manager', dataName: DataName[0], wikiLink: 'https://en.wikipedia.org/wiki/Michael_Scott_(The_Office)' },
	{ name: 'Dwight Schrute', role: 'Assistant to the Regional Manager', dataName: DataName[1], wikiLink: 'https://en.wikipedia.org/wiki/Dwight_Schrute' },
	{ name: 'Jim Halpert', role: 'Salesman', dataName: DataName[2], wikiLink: 'https://en.wikipedia.org/wiki/Jim_Halpert' },
	{ name: 'Pam Beesly', role: 'Receptionist', dataName: DataName[3], wikiLink: 'https://en.wikipedia.org/wiki/Pam_Beesly' },
	{ name: 'Andy Bernard', role: 'Salesman', dataName: DataName[4], wikiLink: 'https://en.wikipedia.org/wiki/Andy_Bernard' },
	{ name: 'Kevin Malone', role: 'Accountant', dataName: DataName[5], wikiLink: 'https://en.wikipedia.org/wiki/Kevin_Malone' },
	{ name: 'Angela Martin', role: 'Accountant', dataName: DataName[6], wikiLink: 'https://en.wikipedia.org/wiki/Angela_Martin' },
	{ name: 'Oscar Martinez', role: 'Accountant', dataName: DataName[7], wikiLink: 'https://en.wikipedia.org/wiki/Oscar_Martinez_(The_Office)' },
	{ name: 'Erin Hannon', role: 'Receptionist', dataName: DataName[8], wikiLink: 'https://en.wikipedia.org/wiki/Erin_Hannon' },
	{ name: 'Ryan Howard', role: 'Temp', dataName: DataName[9], wikiLink: 'https://en.wikipedia.org/wiki/Ryan_Howard_(The_Office)' },
	{ name: 'Darryl Philbin', role: 'Warehouse Foreman', dataName: DataName[10], wikiLink: 'https://en.wikipedia.org/wiki/Darryl_Philbin' },
	{ name: 'Phyllis Vance', role: 'Saleswoman', dataName: DataName[11], wikiLink: 'https://en.wikipedia.org/wiki/Phyllis_Vance' },
	{ name: 'Kelly Kapoor', role: 'Customer Service Representative', dataName: DataName[12], wikiLink: 'https://en.wikipedia.org/wiki/Kelly_Kapoor' },
	{ name: 'Jan Levinson', role: 'Corporate Executive', dataName: DataName[13], wikiLink: 'https://en.wikipedia.org/wiki/Jan_Levinson' },
	{ name: 'Toby Flenderson', role: 'HR Representative', dataName: DataName[14], wikiLink: 'https://en.wikipedia.org/wiki/Toby_Flenderson' },
	{ name: 'Stanley Hudson', role: 'Salesman', dataName: DataName[15], wikiLink: 'https://en.wikipedia.org/wiki/Stanley_Hudson' },
	{ name: 'Meredith Palmer', role: 'Supplier Relations', dataName: DataName[16], wikiLink: 'https://en.wikipedia.org/wiki/Meredith_Palmer' },
	{ name: 'Creed Bratton', role: 'Quality Assurance', dataName: DataName[17], wikiLink: 'https://en.wikipedia.org/wiki/Creed_Bratton_(The_Office)' },
	{ name: 'Gabe Lewis', role: 'Corporate Liaison', dataName: DataName[18], wikiLink: 'https://en.wikipedia.org/wiki/Gabe_Lewis' },
];

d3.csv('data/IinesPerEpisode.csv')
	.then(data => {
		IinesPerEpisodeData = d3.group(data, d => d.season, d => d.episode);
		IinesPerEpisodeData = Array.from(IinesPerEpisodeData, ([season, episodes]) => ({
			season: +season, // Convert season to a number for sorting
			episodes: Array.from(episodes, ([episode, characters]) => ({
				episode: +episode, // Convert episode to a number for sorting
				characters: characters
					.filter(d => DataName.includes(d.speaker)) // Filter characters by DataName
					.map(d => ({
						character: d.speaker,
						lines: d.LinesInEpisode
					}))
			})).sort((a, b) => a.episode - b.episode) // Sort episodes
		})).sort((a, b) => a.season - b.season); // Sort seasons
		
		new Overview({ 
			parentElement: '#Overview',
		  }, IinesPerEpisodeData, mainCharacters);
		
	})
	.catch(error => {
		console.log('Error loading the data');
		console.log(error);
	});

d3.csv('data/CleanedLines.csv')
	.then(data => {
		// group data on speaker then season
		let dataOnSeasons = d3.group(data, d => d.speaker.toLowerCase().trim(), d => d.season);
		//console.log(dataOnSeasons)

		dataOnSeasons = Array.from(dataOnSeasons, ([speakerName, seasons]) => ({
			speakerName: speakerName, // cast season number str to an actual number
			seasons: Array.from(seasons, ([seasonNumber, lines]) => ({
				seasonNumber,
				lines: lines
					.map(d => ({
						id: +d.id, // clean names, cast strs that should be numbers as such
						season: +d.season,
						text: d["line-text"],
						speaker: d.speaker
					}))
			}))
		}))

		//console.log(dataOnSeasons)

		boringWords = ["um", "and", "the", "if", "was", "are", "for", "is", "this", "a", "you", "to", "just", "of", "we", "uh", "hey", "do", "i'm", "an", "your", "can", "get", "that's", "one", "well",
			 "that", "my", "with", "i", "like", "then", "no", "at", "so", "it's", "all", "on", "oh", "not", "it", "but", "or", "him", "here", "what", "what's", "they", "you're", "ok", "right", "going"
			, "let's", "ah", "us", "really", "because", "as", "very", "has", "were", "now",  "how", "who", "got", "when", "i'll", "she", "did", "take", "let", "have", "some", "will", "he's", "had", "gonna", "too", "something", "there", "yeah", "about", "am", "he", "me", "in", "up", "come", "would", "these", "be", "out", "don't", "okay", "her", "we're", "go"]

		// for each speaker, log how many times they say each word in each season.
		const NUM_SPEAKERS = 8
		const NUM_SEASONS = 9
		const MAX_FONT_SIZE = 30
		const MIN_FONT_SIZE = 5

		for (let i = 0; i < NUM_SPEAKERS; i ++){

			// make a frame for this character's lines nested by season
			speakerFrames.push([])

			// for each season
			for (let j = 0; j < NUM_SEASONS; j ++){

				// push empty arr to store word instances spoken by this character over the current season.
				newSeasonWordsFrame = new Array()

				// get the list of this character's lines in this season from the data
				const lineObjectsRaw = (dataOnSeasons.find(d => d.speakerName == encounterNames[i].toLowerCase())).seasons.find(d => d.seasonNumber == j + 1)
				
				if (lineObjectsRaw === undefined){
					speakerFrames[i].push(newSeasonWordsFrame)
					continue;
				}

				// for each word in each line, tally it
				let lineObjects = lineObjectsRaw.lines
				for (let k = 0; k < lineObjects.length; k ++) {
					currLine = (lineObjects[k].text).split(" ")

					for(let l = 0; l < currLine.length; l ++){

						if (boringWords.includes(currLine[l]))
							continue

						let currWordIndex = newSeasonWordsFrame.findIndex(d => d.word == currLine[l])
						if (currWordIndex == -1){
							// word is new to this character this season, record it in a new object in newSeasonWords Frame.
							newSeasonWordsFrame.push({"word": currLine[l], "count": 1})

						} else{
							// character already spoke this word this season, record instance in existing object
							newSeasonWordsFrame[currWordIndex].count += 1;
						}
					}


					//console.log(currLine)
				}

				// with all words from this character this season collected, only push the top 40 most spoken words.
				newSeasonWordsFrame = newSeasonWordsFrame.sort((a, b) => b.count - a.count)

				if (newSeasonWordsFrame.length > 40) {
					newSeasonWordsFrame = newSeasonWordsFrame.slice(0, 40)
				}

				// append count to word (for display on wordcloud)
				newSeasonWordsFrame.map(d => d.word = d.word + " (" + d.count + ")")

				speakerFrames[i].push(newSeasonWordsFrame)
			}
		}

		console.log(speakerFrames)

		// now with count of all words for each characters by season, normalize "count" to size scale

		const colorSet = ['LightCoral', 'LightSalmon', 'LemonChiffon', 'DarkSeaGreen', 'CadetBlue', 'PowderBlue', 'Thistle', 'Pink']

		// make graph
		wordCloud = new WordCloud({ 
			parentElement: '#wordCloud',
			colors: colorSet
		}, speakerFrames[0][0]);

	});

d3.csv('data/EncounterTicker.csv')
	.then(data => {

		// ADJACENCY MATRIX OF ENCOUNTERS
		// format: 3d matrix
		// a season is defined by an 8x8 matrix: each row represents the encounters a character has
		// with the other seven, themselves being 0, as we discount schizophrenia.
		// seasons are collected in a list, creating the 3d matrix.

		// going off TotalLines.csv to pull 8 most social characters:


		//speaker -> EncounterWith

		// group data on season then speaker
		let dataOnSeasons = d3.group(data, d => d.season, d => d.speaker);

		dataOnSeasons = Array.from(dataOnSeasons, ([season, speakerEntries]) => ({
			season: +season, // cast season number str to an actual number
			speakers: Array.from(speakerEntries, ([speakerName, encounterEntries]) => ({
				speakerName,
				encounters: encounterEntries
					.map(d => ({
						encounterWith: d["Encounter With"], // clean names, cast strs that should be numbers as such
						season: +d.season,
						sharedEpisodes: +d["Shared Episodes"],
						speaker: d.speaker
					}))
					.filter(d => encounterNames.includes(d.encounterWith)) // filter listening characters on the top 8
			}))
			.filter(d => encounterNames.includes(d.speakerName)) // filter speaking characters on the top 8
		}))

		// only take top 8 speakers, sort them alphabetically

		const NUM_SEASONS = 9

		// for each season
		for (let i = 0; i < NUM_SEASONS; i ++){

			// push empty arr for season. this will become a 2d array of character interactions over the season,
			// referred to as a season frame. the collective of all these frames is the earlier-declared seasonFrames.
			seasonFrames.push([])

			// iterate through dataset on current season. 
			// for each character in encounterNames, push a row describing their interactions with the rest of the top 8.
			for (let j = 0; j < encounterNames.length; j ++) {

				// make empty row for this character
				newCharacterFrame = new Array(encounterNames.length).fill(0)

				// get the interaction list of the current character in the current season
				const encounterFrame = dataOnSeasons.find(d => d.season == i + 1).speakers.find(d => d.speakerName == encounterNames[j])

				if (encounterFrame === undefined) {
					seasonFrames[i].push(newCharacterFrame)
					continue
				}

				// if that existed, copy the interactions from data into this character's row for this season's frame.
				// account for missing entries, meaning the 2 characters had no interactions, keeping length of 8. 
				let encounterMatrix = encounterFrame.encounters;
				//console.log("Character: " + encounterNames[j] + " Season: " + (i+1) + " Encounters: ")
				//console.log(encounterMatrix)

				for (let k = 0; k < encounterMatrix.length; k ++) {
					newCharacterFrame[encounterNames.indexOf(encounterMatrix[k].encounterWith)] = encounterMatrix[k].sharedEpisodes; 
				}

				// push new character frame to this season's season frame
				seasonFrames[i].push(newCharacterFrame)
			}

		}

		console.log("completed postprocessing for chord graph.")

		const colorSet = ['LightCoral', 'LightSalmon', 'LemonChiffon', 'DarkSeaGreen', 'CadetBlue', 'PowderBlue', 'Thistle', 'Pink']

		encounterChord = new EncounterChord({ 
			parentElement: '#EncounterChord',
			characterNames: encounterNames,
			colors: colorSet
		}, seasonFrames[0]);



	})
	.catch(error => {
		console.log('Error loading the encounter data');
		console.log(error);
	});

d3.select('#query-season').on('click', function() {
	console.log("button! ");
	encounterChord.data = seasonFrames[(+document.getElementById("season-select").value) - 1]
	encounterChord.updateVis();
	});

d3.select('#query-cloud').on('click', function() {
	console.log("cloud button! ");
	console.log(document.getElementById("cloud-character-select").value)

	let charIndex = encounterNames.indexOf(document.getElementById("cloud-character-select").value)
	let seasonIndex = (+document.getElementById("season-select").value) - 1
	wordCloud.data = speakerFrames[charIndex][seasonIndex]

	let colorSet = ['LightCoral', 'LightSalmon', 'LemonChiffon', 'DarkSeaGreen', 'CadetBlue', 'PowderBlue', 'Thistle', 'Pink']
	cloudColor = colorSet[charIndex]

	wordCloud.updateVis();
	});


// Add WordFrequencyGraph functionality
let wordFrequencyGraph;

// Load the word frequency data
d3.csv('data/scene_word_bank.csv')
    .then(data => {
        // Preprocess data
        const processedData = data.map(d => ({
            scene: d.Scene,
            characters: d.Speaker.split(", "),
            words: d.Words.split(" ")
        }));

        // Initialize the WordFrequencyGraph
        wordFrequencyGraph = new WordFrequencyGraph({
            parentElement: '#WordFrequencyGraph',
            characters: ['Michael', 'Dwight', 'Pam', 'Kevin', 'Oscar', 'Jim', 'Angela']
        }, processedData);

        // Populate dropdowns for character selection
        const dropdown1 = d3.select('#character1')
            .on('change', function () {
                const selected1 = this.value;
                const selected2 = dropdown2.property('value');
                wordFrequencyGraph.setSelectedCharacters([selected1, selected2]);
            });

        const dropdown2 = d3.select('#character2')
            .on('change', function () {
                const selected1 = dropdown1.property('value');
                const selected2 = this.value;
                wordFrequencyGraph.setSelectedCharacters([selected1, selected2]);
            });

        // Populate dropdown options
        const characters = ['Michael', 'Dwight', 'Pam', 'Kevin', 'Oscar', 'Jim', 'Angela'];
        dropdown1.selectAll('option')
            .data(characters)
            .enter()
            .append('option')
            .text(d => d)
            .attr('value', d => d);

        dropdown2.selectAll('option')
            .data(characters)
            .enter()
            .append('option')
            .text(d => d)
            .attr('value', d => d);

        // Set initial selection
        dropdown1.property('value', 'Michael');
        dropdown2.property('value', 'Dwight');
        wordFrequencyGraph.setSelectedCharacters(['Michael', 'Dwight']);
    })
    .catch(error => {
        console.log('Error loading the word frequency data');
        console.log(error);
    });