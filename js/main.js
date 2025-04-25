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
	'Holly',
	'Nellie',
	'Creed',
	'Gabe',
];

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
	{ name: 'Holly Flax', role: 'HR Representative', dataName: DataName[17], wikiLink: 'https://en.wikipedia.org/wiki/Holly_Flax' },
	{ name: 'Nellie Bertram', role: 'Special Projects Manager', dataName: DataName[18], wikiLink: 'https://en.wikipedia.org/wiki/Nellie_Bertram' },
	{ name: 'Creed Bratton', role: 'Quality Assurance', dataName: DataName[19], wikiLink: 'https://en.wikipedia.org/wiki/Creed_Bratton_(The_Office)' },
	{ name: 'Gabe Lewis', role: 'Corporate Liaison', dataName: DataName[20], wikiLink: 'https://en.wikipedia.org/wiki/Gabe_Lewis' },
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

