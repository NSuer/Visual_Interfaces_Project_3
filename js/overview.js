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
    
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, maxLines]);
    
        // Axes
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickSize(0))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');
    
        svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale)
                .tickFormat((d, i) => characterNames[i]) // Use real names for Y-axis
                .tickSize(0)
            );
    
        // Flatten data for heatmap
        const heatmapData = this.data.flatMap(season =>
            season.episodes.flatMap(episode =>
            episode.characters.map(d => ({
                character: d.character, // e.g., "Michael"
                episode: `S${season.season}E${episode.episode}`,
                lines: +d.lines
            }))
            )
        );

        // Filter episodes to only show labels at the start of each season
        const seasonStartEpisodes = this.data.map(season => `S${season.season}E1`);
        svg.select('.x-axis')
            .call(d3.axisBottom(xScale)
            .tickSize(0)
            .tickFormat(d => seasonStartEpisodes.includes(d) ? d : '')
            )
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');
    
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
            .style('stroke', 'white');
    
        // Tooltip setup
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
    
        // Tooltip interactivity
        svg.selectAll('rect')
            .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(`Character: ${d.character}<br>Episode: ${d.episode}<br>Lines: ${d.lines}`)
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

