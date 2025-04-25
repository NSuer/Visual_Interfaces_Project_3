class Overview {
    constructor(_config, _data, _mainCharacters) {
        this.config = {
            parentElement: _config.parentElement,
        };

        this.mainCharacters = _mainCharacters;
        this.data = _data;

        this.initVis();
    }

    getRealName(dataName) {
        const character = this.mainCharacters.find(character => character.dataName === dataName);
        return character ? character.name : 'Unknown';
    }

    initVis() {
        const margin = { top: 50, right: 50, bottom: 50, left: 100 };
        const width = d3.select(this.config.parentElement).node().getBoundingClientRect().width - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
    
        // Create SVG container
        const svg = d3.select(this.config.parentElement)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
    
        // Character short names (e.g., "Michael", "Jim")
        const characters = this.mainCharacters.map(d => d.dataName);
    
        // Map characters to their real names for Y-axis
        const characterNames = characters.map(dataName => this.getRealName(dataName));
    
        // Episode labels like "S1E1", "S1E2", etc.
        const episodes = this.data.flatMap(season =>
            season.episodes.map(episode => `S${season.season}E${episode.episode}`)
        );
    
        // Scales
        const xScale = d3.scaleBand()
            .domain(episodes)
            .range([0, width])
            .padding(0.05);
    
        const yScale = d3.scaleBand()
            .domain(characters)
            .range([0, height])
            .padding(0.05);
    
        // Color scale based on max lines
        const maxLines = d3.max(this.data, season =>
            d3.max(season.episodes, episode =>
                d3.max(episode.characters, d => +d.lines)
            )
        );
    
        const colorScale = d3.scaleSequential(d3.interpolateTurbo)
            .domain([0, maxLines]);
    
        // Filter episodes to include only the first episode of each season for x-axis labels
        const seasonStartEpisodes = this.data.map(season => `S${season.season}E${season.episodes[0].episode}`);
    
        // Axes
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .tickSize(0)
                .tickValues(seasonStartEpisodes) // Set tick values to season start episodes
            )
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');
    
            const yAxis = svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale)
                .tickFormat(d => {
                    const character = this.mainCharacters.find(c => c.dataName === d);
                    if (character && character.wikiLink) {
                        return `<a href="${character.wikiLink}" target="_blank" style="text-decoration: none; color: inherit;">${character.name}</a>`;
                    }
                    return this.getRealName(d);
                })
                .tickSize(0)
            );
        
    
        // Tooltip for Y-axis labels
        const yAxisTooltip = d3.select(this.config.parentElement)
            .append('div')
            .attr('class', 'y-axis-tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'white')
            .style('padding', '5px')
            .style('border', '1px solid #aaa')
            .style('border-radius', '3px')
            .style('pointer-events', 'none');
    
        // Calculate total episodes and lines for each character
        const characterStats = characters.map(character => {
            const episodesAppeared = new Set();
            let totalLines = 0;
    
            this.data.forEach(season => {
                season.episodes.forEach(episode => {
                    episode.characters.forEach(d => {
                        if (d.character === character) {
                            episodesAppeared.add(`S${season.season}E${episode.episode}`);
                            totalLines += +d.lines;
                        }
                    });
                });
            });
    
            return {
                character,
                episodesCount: episodesAppeared.size,
                totalLines
            };
        });

        
        // Ensure the hyperlinks are rendered as HTML
        yAxis.selectAll('.tick text')
            .each(function() {
                const textNode = d3.select(this);
                const html = textNode.text();
                textNode.html(html);
            });
    
        // Add interactivity to Y-axis labels
        yAxis.selectAll('.tick')
            .on('mouseover', (event, d) => {
                const stats = characterStats.find(c => c.character === d);
                if (stats) {
                    yAxisTooltip.transition().duration(200).style('opacity', 1);
                    yAxisTooltip.html(`
                        Character: ${this.getRealName(d)}<br>
                        Episodes: ${stats.episodesCount}<br>
                        Lines: ${stats.totalLines}
                    `)
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY - 20}px`);
                }
            })
            .on('mouseout', () => {
                yAxisTooltip.transition().duration(200).style('opacity', 0);
            });
    
        // Flatten data for heatmap, ensuring all combinations of characters and episodes are included
        const allCombinations = [];
        characters.forEach(character => {
            episodes.forEach(episode => {
                allCombinations.push({ character, episode, lines: 0 });
            });
        });
    
        // Merge actual data into the allCombinations array
        const heatmapData = allCombinations.map(combination => {
            const actualData = this.data.flatMap(season =>
                season.episodes.flatMap(episode =>
                    episode.characters.map(d => ({
                        character: d.character,
                        episode: `S${season.season}E${episode.episode}`,
                        lines: +d.lines
                    }))
                )
            ).find(d => d.character === combination.character && d.episode === combination.episode);
    
            return actualData || combination; // Use actual data if available, otherwise default
        });
    
        // Draw heatmap rectangles
        svg.selectAll()
            .data(heatmapData)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.episode))
            .attr('y', d => yScale(d.character))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .style('fill', d => colorScale(d.lines))
            .style('stroke', 'grey');
    
        // Tooltip setup for heatmap
        const tooltip = d3.select(this.config.parentElement)
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background', 'white')
            .style('padding', '5px')
            .style('border', '1px solid #aaa')
            .style('border-radius', '3px')
            .style('pointer-events', 'none');
    
        // Tooltip interactivity for heatmap
        svg.selectAll('rect')
            .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`Character: ${this.getRealName(d.character)}<br>Episode: ${d.episode}<br>Lines: ${d.lines}`)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 20}px`);
            })
            .on('mouseout', () => {
                tooltip.transition().duration(200).style('opacity', 0);
            });
    }

    updateVis() {
        // Placeholder for future updates
    }
}

