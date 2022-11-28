function ScatterPlot() {
   // variables for svg (canvas)
   let width = 800;
   let height = 600;
   let padding = 50;
   let svg = d3.select('body').append('svg');    // appends svg element to body
   // variables for tooltip
   let tooltip = d3.select('body').append('div')  // appends tootip element to body
   // variables for chart
   let heightScale;
   let xScale;
   let yScale;
   let xAxis;
   let yAxis;
   // variables for chart legend
   let keys =[]
   // variables for JSON data
   let dataJSON;
   let dataset = [];
   let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
   let req = new XMLHttpRequest();


   // GENERATE TOOLTIP (info @: https://d3-graph-gallery.com/graph/interactivity_tooltip.html)
   let generateTooltip = () => {
      tooltip
         .attr('class', 'tooltip')
         .attr('id', 'tooltip')
         .style('opacity', 0)
         .style('width', 'auto')
         .style('height', 'auto');
   }

   let mouseover = (item) => {
      tooltip
         .style('opacity', 0.9)
         .attr('data-year', item['Year']);
   }
   let mousemove = (event, item) => {
      tooltip
         .attr('data-year', item['Year'])
         .html(item['Name'] + ': ' + item['Nationality'] + '<br/>' + 'Year: ' +  item['Year'] + ', Time: ' + item['Time'])
         // .style("left", (d3.mouse(this)[0] + 90) + "px") // PROBLEM WITH CODE
         // .style("top", (d3.mouse(this)[1]) + "px")       // PROBLEM WITH CODE
         .style('left', event.pageX + 20 + 'px')
         .style('top', event.pageY - 20 + 'px');
   }
   let mouseleave = () => {
      tooltip
         .transition()
         .style('opacity', 0);
   }

   // Convert milliseconds to duration (in date format)
   let timeToDuration = (seconds) => {
      return new Date(seconds * 1000);            // JS date is in milliseconds
   }

   // draw canvas for chart (the svg element)
   let drawCanvas = () => {
      svg.attr('width', width)
         .attr('height', height);
   }

   let generateChartTitle = (titleLocationX, titleLocationY) => {
      svg.append('text')
         .text('Doping in Professional Bicycle Racing')
         .attr('id', 'title')
         .attr('x', titleLocationX)
         .attr('y', titleLocationY);
   }

   let generateAxesCaption = () => {
      svg.append('text')
         .attr('transform', 'rotate(-90)')
         .attr('x', -height / 3)
         .attr('y', 10)
         .text('Time in Minutes');
      svg.append('text')
         .attr('x', 450)
         .attr('y', 590)
         .text('Year')
         .attr('class', 'info');
   }

   // keys for legend & color scale
   keys = ['Riders with doping', 'Riders without doping']
   // Define a color scale (color scale not working. To be re-developed)
   let colorScale = d3.scaleOrdinal()
                     .domain('Riders with doping', 'Riders without doping')
                     .range('red', 'green');

   // GENERATE LEGEND (info: https://d3-graph-gallery.com/graph/custom_legend.html)
   let generateLegend = () => {
      // Add one dot in the legend for each legend item.
      let size = 15
      svg.selectAll('mydots')
         .data(keys)
         .enter()
         .append('rect')
            .attr('id', 'legend')
            .attr('x', 550)
            .attr('y', (d, i) => 100 + i*(size+5)) // 100 is where the first dot appears. 25 is the distance between dots
            .attr('width', size)
            .attr('height', size)
            // .attr("fill", (d) => colorScale(d))
            .attr('fill', (d) => {
               if(d === 'Riders with doping') {
                  return 'red'
               } else {
                  return 'green'
               }
            });
      // Add one label in the legend for each item.
      svg.selectAll("mylabels")
         .data(keys)
         .enter()
         .append("text")
            .attr('id', 'legend')
            .attr("x", 550 + size*1.5)
            .attr("y", (d, i) => 100 + i*(size+5) + (size/2)) // 100 is where the first dot appears. 25 is the distance between dots
            // .attr("fill", (d) => colorScale(d))
            .attr('fill', (d) => {
               if(d === 'Riders with doping') {
                  return 'red'
               } else {
                  return 'green'
               }
            })
            .text((d) => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
   }



   let generateScales = () => {
      xScale = d3.scaleLinear()
                  .domain([d3.min(dataset, (item) => item["Year"] - 1), d3.max(dataset, (item) => item["Year"] + 1)])
                  .range([padding, width - padding]);
      yScale = d3.scaleTime()
                  .domain([d3.min(dataset, (item) => timeToDuration(item["Seconds"])), d3.max(dataset, (item) => timeToDuration(item["Seconds"]))])
                  .range([padding, height - padding]);
   }

   let generateAxes = () => {
      let xAxis = d3.axisBottom(xScale)
                     .tickFormat(d3.format('d'));           // D3 number format to render in integer(removes commas)
      let yAxis = d3.axisLeft(yScale)
                     .tickFormat(d3.timeFormat('%M:%S'));   // D3 time format to render in mins:secs
      svg.append('g')                                       // create group element to contain axis
         .call(xAxis)
         .attr('id', 'x-axis')
         .attr('transform', 'translate(0, ' + (height - padding) + ')');
      svg.append('g')
         .call(yAxis)
         .attr('id', 'y-axis')
         .attr('transform', 'translate(' + padding + ', 0)');
   }

   let drawDots = () => {
      svg.selectAll('circle')
         .data(dataset)
         .enter()
         .append('circle')
         .attr('class', 'dot')
         .attr('data-xvalue', (item) => item["Year"])
         .attr('data-yvalue', (item) => timeToDuration(item["Seconds"]))
         .attr('cx', (item, index) => xScale(item["Year"]))
         .attr('cy', (item) => yScale(timeToDuration(item["Seconds"])))
         .attr('r', 7)
         .style('fill', (item) => {
            if(item['Doping'] != "") {
               return 'red'
            } else {
               return 'green'
            }
         })
         .on('mouseover', mouseover)
         .on('mousemove', mousemove)
         .on('mouseleave', mouseleave);
   }

   req.open('GET', url, true);                     // initialize request for data
   req.send();                                     // send request for data
   req.onload = function() {
      dataJSON = JSON.parse(req.responseText);     // parse returned data
      dataset = dataJSON;                          // select relevant JSON data part & assign to a variable
      // console.log(dataset)
      drawCanvas();
      generateChartTitle('200', '30');
      generateScales();
      generateAxes();
      drawDots();
      generateAxesCaption();
      generateLegend()
      generateTooltip()
   };


   return (
      <div>
         <button>Get Data</button>
         <button>Generate Plot</button>
      </div>
   )

}