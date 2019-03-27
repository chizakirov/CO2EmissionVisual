// select all existing divs inside the body
// and tie data to them
// var bars = d3.select("body")
//             .selectAll("div")
//             .data([4, 8, 15, 16, 20, 12]); //.data() joins elements to the data provided. in this case, a div is an element
// We create the bars variable to hang onto our previous d3 selection
// and preserve the data/elements that we console logged previously.
// In other words, we don't want to lose the _enter and _exit collections.
// As soon as we execute .data(), the _enter and _exit collections are determined.
// Now let's ENTER and create the right amount of divs to supplement our data
// This will append to the body element since we saved the selection previously into
// the bars variable
// bars.enter().append("div"); //enter() invoke these nodes (elements) to be built; append() add whatever elements we choose. The .enter().append() combination builds elements for the data that don't have element representation yet

// Now EXIT and remove any lingering divs we might have had
// In this case we had no surplus of divs to remove.
// bars.exit().remove();

// var getJSON = function(url, callback) {
//   var xhr = new XMLHttpRequest();
//   xhr.open('get', url, true);
//   xhr.responseType = 'json';
//   xhr.onload = function() {
//     var status = xhr.status;
//     if (status == 200) {
//       callback(null, xhr.response);
//     } else {
//       callback(status);
//     }
//   };
//   xhr.send();
// };
// getJSON('https://raw.githubusercontent.com/kyleconyers/truthTreeClimate/master/client/public/csvjson.json',     function(err, data) {

document.addEventListener("DOMContentLoaded", function(e){
  const x = document.querySelector('.search');
  if(x){
    x.addEventListener('click', searchLocation);
  };
  function searchLocation(e){
    const input = document.getElementById("myInput");
    const filter = input.value.toLowerCase();
    if(filter === ""){
      console.log("Enter a location name");
    } else{
      fetchData(filter);
    }
    e.preventDefault();
  }
});

function fetchData(filter){
  console.log("search term: " + filter);
  const url = 'https://raw.githubusercontent.com/kyleconyers/truthTreeClimate/master/client/public/csvjson.json';
  fetch(url)
    .then(response => {return response.json();})
    .then(data => {
      const searchResult = Search(data, filter);
      drawChart(searchResult);
    })
}
  

function Search(data, filter){
  let resultArray = [];
  let countryArray = [];

  //loop through the JSON data and find the search text
    for(i = 0; i < data.length; i++){
      if(data[i].NAME.toLowerCase() === filter.toLowerCase()){
        countryArray.push(data[i].NAME);
        console.log("country/state/county name: ", data[i].NAME);
        console.log("population: ", data[i].POPULATION);
        document.getElementById("search-result").innerHTML = "CO2 Emission with Population Comparable to " + data[i].NAME;
        var popMax = data[i].POPULATION * 1.3;
        var popMin = data[i].POPULATION * 0.9;
      }
      if(countryArray.length > 0){
        if(data[i].POPULATION <= popMax && data[i].POPULATION >= popMin && data[i].NAME != "" && data[i].UNITTYPE.toUpperCase() === "NATION"){
          resultArray.push({
            id: +i, //+ for number
            country: data[i].NAME,
            population: +data[i].POPULATION/1000000, //convert string to number
            popdensity: +data[i].POPDENSITY/1000000,
            carbon: +data[i].CARBON
          });
        }
      }
    }
    if(countryArray.length == 0){
      console.log("no search result");
    }
  //sort array of objects
  function compare(a, b){
    const popA = a.population;
    const popB = b.population;
    let comparison = 0;
    if (popA > popB) {
      comparison = 1;
    } else if (popA < popB) {
      comparison = -1;
    }
    return comparison;
  }
  
  var sortedSearchData = resultArray.sort(compare);
  console.log("population list ", resultArray);
  return sortedSearchData;
};

function drawChart(data){
  // var svgWidth = 800, svgHeight = 400;
  // var margin = { top: 20, right: 20, bottom: 30, left: 50 };
  // var width = svgWidth - margin.left - margin.right;
  // var height = svgHeight - margin.top - margin.bottom;
  // var svg = d3.select('svg')
  //   .attr("width", svgWidth)
  //   .attr("height", svgHeight);

    var margin = { top: 60, left: 60, bottom: 60, right: 90 } 
    var height = 480, width = 780;
    
    //The next section declares the functions linear and scale
    var y = d3.scale.linear().range([0, height]);
    var x = d3.time.scale().range([0, width]);
    
    //The declarations for our two axes are relatively simple
    //show data (nums) under the x-axis line
    var xAxis = d3.svg.axis().scale(x).orient("bottom")
        .ticks(d3.time.seconds, 30)
        .tickFormat(ft);
    //show data (nums) left of the y-axis line
    var yAxis = d3.svg.axis().scale(y).orient("left");
    
  
  /* 
  * The next block of code selects the id scatterplot-stats on the web page 
  * and appends an svg object to it of the size 
  * that we have set up with our width, height and margin’s.
  */
    var svg = d3.select("#scatterplot-stats").append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right);
    
    svg.append("rect")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("x", 0)
          .attr("y", 0)
          .attr("fill", "white")
          .attr("fill-opacity", 0.8);
    // It also adds a g element that provides a reference point for adding our axes.  
    svg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    //declair the tooltip
    var tooltip = d3.select("#scatterplot-stats").append("div")
        .attr("class", "tooltip");
    
   
    /*
    * If doping allegiance make the circle red else make it orange
    */
    function doping(arg) {
      return arg !== "" ? "red" : "orange";
    }
    
    /* 
    * this function is like mouse over. 
    * If we place the mouse over a circle the tooltip is going to show up.
    */
    function showToolTip(d, i) {
      tooltip.style({
        "height": "125px",
        "width": "200px",
        "opacity": 0.9
      });
      var circle = d3.event.target; 
      var tippadding = 5, tipsize = { 
        dx: parseInt(tooltip.style("width")), 
        dy: parseInt(tooltip.style("height")) 
      };
    
      tooltip.style({
          "top": (d3.event.pageY - tipsize.dy - 5) + "px",
          "left": (d3.event.pageX - tipsize.dx - 5) + "px"
        }).html("<span><b>" + d.Name + ": " + d.Nationality + "<br/>" + 
              "Place: " + d.Place + " | Time: " + d.Time + "<br/>" + 
              "Year: " + d.Year + "<br/><br/>" + 
              "Doping: " + d.Doping + "</b></span>");
    }
    
    /* 
    * This function is like mouse out. 
    * If we mouse out then the tooltip is hidding
    */
    function hideToolTip(d, i) {
      tooltip.style({
        "height": 0,
        "width": 0,
        "opacity": 0
      }).html("");
    }
    
    /* 
    * This function is like click. 
    * If we click in the circle we are transfering to another site
    */
    // function openEntry(d) {
    //   if(d.URL) {
    //     var win = window.open(d.URL, "_blank");
    //     win.focus();
    //   }
    // }
    
    /* 
    * d3.json takes the variable url and two more parameters
    * if error, then throw it
    * else map the time-date in the horizontal axis and the rank-position in the verticall axis
    */
    d3.json(url, (error, data) => {
      if(error) {
        throw new Error("d3.json error");
      }
      else {
        var fastest = d3.min(data.map((item) => { return ft.parse(item.Time); }));
        var slowest = d3.max(data.map((item) => { return ft.parse(item.Time); }));
        
        x.domain([slowest, fastest]);
        y.domain([1, d3.max(data, (d) => { return d.Place; }) + 1]);
        //Add a "g" element that provides a reference point for adding our axes.
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .append("text") //add text to the axis
            .attr("transform", "translate(" + width + ",-30)")
            .attr("dy", "1.8em")
            .attr("text-anchor", "end")
            .text("Population");
        
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text") //add text to the axis
            .attr("transform", "rotate(-90)")
            .attr("dy", "-0.8em")
            .attr("text-anchor", "end")
            .text("Carbon");
        
        /* 
        * we add the cyclists to our scatterplot
        * This block of code creates the cyclists (selectAll(".cyclist")) 
        * and associates each of them with a data set (.data(data)).
        * We then append a circle 
        * with values for x/y position and height/width as configured in our earlier code.
        * we parse the time and the place
        */ 
        var cyclist = svg.selectAll(".cyclist")
            .data(data)
          .enter().append("g")
            .attr("class", "cyclist")
            .attr("x", (d) => { return x(ft.parse(d.Time)); })
            .attr("y", (d) => { return y(d.Place); });
        
        cyclist.append("circle")
            .attr("cx", (d) => { return x(ft.parse(d.Time)); })
            .attr("cy", (d) => { return y(d.Place); })
            .attr("r", 5)
            .attr("fill", (d) => { return doping(d.Doping); })
            //call the functions
            .on("mouseover", showToolTip)
            .on("mouseout", hideToolTip)
            .on("click", openEntry);
        
        //append the text and fix the distance btw the circles and the names
        cyclist.append("text")
            .attr("x", (d) => { return x(ft.parse(d.Time)) + 7; })
            .attr("y", (d) => { return y(d.Place) + 5; })
            .text((d) => { return d.Name; });
        
        //right-bottom explainatory text
        // var isDoped = svg.append("g")
        //     .attr("transform", "translate(" + (width - 150) + "," + (height - 100) + ")")
        //     .append("text") 
        //       .attr("x", 10)
        //       .attr("y", 5)
        //       .attr("fill", "red")
        //       .text("* Doping allegiance");;
        // var isNotDoped = svg.append("g")
        //     .attr("transform", "translate(" + (width - 150) + "," + (height - 80) + ")")
        //     .append("text")
        //       .attr("x", 10)
        //       .attr("y", 5)
        //       .attr("fill", "orange")
        //       .text("* No doping allegiance");
      } //end of else
      
    });
  }
  
  
  
  
  
//   var g = svg.append("g")
//               .attr("transform", 
//               "translate(" + margin.left + "," + margin.top + ")" );
//   var x = d3.scaleLinear().rangeRound([0, width]);
//   var y = d3.scaleLinear().rangeRound([height, 0]);
//   var line= d3.line()
//               .x(function(d) { return x(d.population)})
//               .y(function(d) { return y(d.carbon)});

//   x.domain(d3.extent(data, function(d) { return d.population; }));
//   y.domain([0, d3.max(data, function(d) { return d.carbon; })]);

//   g.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x))
//     .select(".domain")
//     .remove();

//   g.append("g")
//     .call(d3.axisLeft(y))
//     .append("text")
//     .attr("fill", "#000")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 6)
//     .attr("dy", "0.71em")
//     .attr("text-anchor", "end")
//     .text("Carbon (million tons)");

//   g.append("text")
//     .call(d3.axisBottom(x))
//     .attr("transform",
//             "translate(" + (width/2) + " ," + 
//                            (height + margin.top + 20) + ")")
//     .attr("text-anchor", "middle")
//     .text("Population (million)");

//   g.append("path")
//     .datum(data)
//     .attr("fill", "none")
//     .attr("stroke", "steelblue")
//     .attr("stroke-linejoin", "round")
//     .attr("stroke-linecap", "round")
//     .attr("stroke-width", 1.5)
//     .attr("d", line);
// }

//BAR CHART
// document.addEventListener('DOMContentLoaded', function(e){
//   var data = [4, 15, 8, 16, 20, 12];
//   d3.select("body")
//             .selectAll("div")
//             .data(data)
//             .enter().append("div")
//             .style("height", function(d) {return d*20+"px"}) // width dynamically changes based on each data 
//             .style("background-color", function(c) { // background-color based on value
//               if(c <= 12){
//                   return "rgb(0,80,0)";
//                 }
//               else{
//                 return "rgb(0,200,0)";
//               }
//             })
//             .text(function(t) {return t});
// });

