/*Variables*/
//var width = 938;
//var height = 500;
var mooc_data = [];
var lec_data = [];
var new_group_array = [];
var new_parallel_array = [];
var new_linechart_array = [];
var groups = [{"name":"Asia", "select":"yes", "countries":[]},
              {"name":"Europe","select":"yes", "countries":[]},
              {"name":"North America", "select":"yes", "countries":[]},
              {"name":"South America", "select":"yes", "countries":[]},
              {"name":"Africa", "select":"yes", "countries":[]},
              {"name":"Oceania", "select":"yes", "countries":[]}];
var parallel = [];
var parallel_data = [];
var lineChart = [];
/*[["Asia", 10,10,20,30],["Europe", 40,20,40,60],["Europe", 40,20,4,3]];*/
var lineChart_data = [];
/*End of variables*/

var tooltip;
var heatinfo;

queue().defer(d3.csv, "mooc_count.csv")
       .defer(d3.csv, "lec_count.csv")
       .await(ready);

function ready(error, mooc, lec){
  mooc_data = mooc;
  lec_data = lec;
  //console.log(mooc_data);
  //console.log(lec_data);

  var projection = d3.geo.mercator().scale(155).translate([width / 2, height / 1.5]);
  var path = d3.geo.path().projection(projection);

  tooltip = d3.select("#map").append("div").attr("class","tooltip").style("opacity",0);
  heatinfo = d3.select("#map").append("div").attr("class","heatinfo");
  
  for (var i = 10; i >= 0; i--) {
    var hue = 70+i*18;
    var color = "hsl("+hue+", 80%,40%)";
    d3.select(".heatinfo")
      .append("div")
      .attr("class","heatone")
      .style("left",i*20)
      .style("top",50)
      .style("background-color",color);
  };
  d3.select(".heatinfo")
    .append("p")
    .attr("class","heatonetext")
    .text("1")
    .style("left",6)
    .style("top",70);
  d3.select(".heatinfo")
    .append("p")
    .attr("class","heatonetext")
    .text("12823")
    .style("left",184)
    .style("top",70);


  for (var i = 0; i < groups.length; i++) {
    $("#groups").append("<div class='tags selected'>" + groups[i].name + "</div>");
  };

  $(".tags").click(function(){
    //delete groups
    if ($(this).hasClass("selected")) {
      var group_name = $(this).text();
      for (var i = groups.length - 1; i >= 0; i--) {
        if (groups[i].name == group_name) {
          groups[i].select = "no";
        };
      };
    }
    //add group
    else{
      var group_name = $(this).text();
      for (var i = groups.length - 1; i >= 0; i--) {
        if (groups[i].name == group_name) {
          groups[i].select = "yes";
        };
      };
    };
    //change visual elements
    $(this).toggleClass("selected");
  });

  var colorhue = d3.scale.pow().exponent(0.25).range([70,230]);

  svg.append("rect")
     .attr("class", "background")
     .attr("width", width)
     .attr("height", height);

  var g = svg.append("g");

  d3.json("countries.topo.json", function(error, countries){
    var countries_data = topojson.feature(countries, countries.objects.countries).features;
    //add data into map
    for (var i = countries_data.length - 1; i >= 0; i--) {
      var name = countries_data[i].properties.name;
      for (var j = mooc_data.length - 1; j >= 0; j--) {
        if(mooc_data[j].country == name){
          countries_data[i].properties.continent = mooc_data[j].continent;
          countries_data[i].properties.total_count = mooc_data[j].total_count;
          countries_data[i].properties.email_count = mooc_data[j].email_count;
          countries_data[i].properties.signature_count = mooc_data[j].signature_count;
          countries_data[i].properties.total_lec = mooc_data[j].total_lec;
          countries_data[i].properties.total_quiz = mooc_data[j].total_quiz;
        };
      };
      for (var j = lec_data.length - 1; j >= 0; j--) {
        if(lec_data[j].country == name){
          countries_data[i].properties.lec1 = lec_data[j].lec1;
          countries_data[i].properties.lec2 = lec_data[j].lec2;
          countries_data[i].properties.lec3 = lec_data[j].lec3;
          countries_data[i].properties.lec4 = lec_data[j].lec4;
          countries_data[i].properties.lec5 = lec_data[j].lec5;
          countries_data[i].properties.lec6 = lec_data[j].lec6;
          countries_data[i].properties.lec7 = lec_data[j].lec7;
          countries_data[i].properties.lec8 = lec_data[j].lec8;
          countries_data[i].properties.lec9 = lec_data[j].lec9;
          countries_data[i].properties.lec10 = lec_data[j].lec10;
        }
      };
    };
   
    for (var i = 0; i < groups.length; i++) {
      //add data to parallel
      if (groups[i].countries.length == 0) {
        var total_count=0;
        var email_count=0;
        var signature_count=0;
        var total_lec=0;
        var total_quiz=0;
        for (var j = mooc_data.length - 1; j >= 0; j--) {
          if (groups[i].name == mooc_data[j].continent) {
            total_count +=parseInt(mooc_data[j].total_count);
            email_count +=parseInt(mooc_data[j].email_count);
            signature_count +=parseInt(mooc_data[j].signature_count);
            total_lec +=parseInt(mooc_data[j].total_lec);
            total_quiz +=parseInt(mooc_data[j].total_quiz);
          };
        };
        parallel.push({"name":groups[i].name,
                       "email":(email_count/total_count).toFixed(3),
                       "signature":(signature_count/total_count).toFixed(3),
                       "lecture":(total_lec/total_count).toFixed(3),
                       "quiz":(total_quiz/total_count).toFixed(3)});//,"signature":signature_count/total_count,"lecture":total_lec/total_count,"quiz":total_quiz/total_count});
        //add data to line chart
        var lec1 = 0;
        var lec2 = 0;
        var lec3 = 0;
        var lec4 = 0;
        var lec5 = 0;
        var lec6 = 0;
        var lec7 = 0;
        var lec8 = 0;
        var lec9 = 0;
        var lec10 = 0;
        for (var j = lec_data.length - 1; j >= 0; j--) {
          if (groups[i].name == lec_data[j].continent) {
            lec1 += parseInt(lec_data[j].lec1);
            lec2 += parseInt(lec_data[j].lec2);
            lec3 += parseInt(lec_data[j].lec3);
            lec4 += parseInt(lec_data[j].lec4);
            lec5 += parseInt(lec_data[j].lec5);
            lec6 += parseInt(lec_data[j].lec6);
            lec7 += parseInt(lec_data[j].lec7);
            lec8 += parseInt(lec_data[j].lec8);
            lec9 += parseInt(lec_data[j].lec9);
            lec10 += parseInt(lec_data[j].lec10);
          };
        };
        lineChart.push([groups[i].name,lec1,lec2,lec3,lec4,lec5,lec6,lec7,lec8,lec9,lec10]);
      };
    };
    //console.log(parallel);

    console.log(countries_data);



    var min = d3.min(countries_data, function(d) { return d.properties.total_count;});
    var max = 12000/*d3.max(countries_data, function(d) { return d.properties.total_count; })*/;
    colorhue.domain([min, max]);

    g.append("g")
     .attr("id", "countries")
     .selectAll("path")
     .data(countries_data)
     .enter()
     .append("path")
     .attr("d", path)
     .attr("fill", function(d){
        var total_count = d.properties.total_count;
        if (total_count) {return "hsl("+colorhue(total_count)+", 80%,40%)";} 
        else {return "#CCCCCC";}
      })
     .attr("stroke","#FFFFFF")
     .style("opacity", 0.6)
     .on("click", countryClicked)
     .on("mouseenter",function(d){
        d3.select(this).style("opacity", 1.0);
        //check whether has info to show
        if (!d.properties.total_count) {return;};
        //show info            
        var info = "<h4>"+d.properties.name+"<span>"+d.properties.continent+"</span></h4></br>"
                         +"<ul class='in_map'><li><em>"+d.properties.total_count+"</em> people enrolled this class</li>"
                         +"<li><em>"+d.properties.signature_count+"</em> people paid for signature certification</li>"
                         +"<li><em>"+d.properties.email_count+"</em> people subscribed email notification</li></ul>";
        tooltip.transition().duration(500).style("opacity", 1); 
        tooltip.html(info).style("left",(d3.event.pageX - 120) + "px").style("top", (d3.event.pageY - 160) + "px"); 
      })
     .on("mouseleave",function(d){
        d3.select(this).style("opacity", 0.6);
        tooltip.transition().duration(200).style("opacity", 0); 
      });
  });
  

};

/*Layout*/
$(window).resize(function() {
  var w = $("#map").width();
  svg.attr("width", w);
  svg.attr("height", w * height / width);
  var w_p = $("#parallel").width();
  svg_p.attr("width",w_p);
  svg_p.attr("height",w_p*height_p/width_p);
});

var scrollToElement = function(el, ms){
    var speed = (ms) ? ms : 600;
    $('html,body').animate({
        scrollTop: $(el).offset().top
    }, speed);
}

/*End of Layout*/


/*Interaction*/
function countryClicked(d) {
  var select_country = d.properties.name;
  if (!select_country) {
    return;
  };
  var length = new_group_array.length;
  var count = -1;
  if (length == 0) {
    new_group_array[0] = select_country;
    new_parallel_array.push({"name":d.properties.name,
                             "total":d.properties.total_count,
                             "email":d.properties.email_count,
                             "signature":d.properties.signature_count,
                             "lecture":d.properties.total_lec,
                             "quiz":d.properties.total_quiz});
    new_linechart_array.push({"name":d.properties.name,
                              "lec1":d.properties.lec1,
                              "lec2":d.properties.lec2,
                              "lec3":d.properties.lec3,
                              "lec4":d.properties.lec4,
                              "lec5":d.properties.lec5,
                              "lec6":d.properties.lec6,
                              "lec7":d.properties.lec7,
                              "lec8":d.properties.lec8,
                              "lec9":d.properties.lec9,
                              "lec10":d.properties.lec10});
    d3.select(this).style("opacity",0.5);
    $("#new_group").append("<li>" + select_country + "</li>");
  }
  else{
    for (var i = length - 1; i >= 0; i--) {
      if (new_group_array[i] == select_country) {
        count = i;
      };
    };
    if (count != -1) {
      new_group_array.splice(count,1);
      new_parallel_array.splice(count,1);
      new_linechart_array.splice(count,1);
      d3.select(this).style("opacity",1);
      $("li:contains("+select_country+")").remove();
    }
    /*up to 12 contries in one group*/

    else if (length < 12) {
      new_group_array[length] = select_country;
      new_parallel_array.push({"name":d.properties.name,
                               "total":d.properties.total_count,
                               "email":d.properties.email_count,
                               "signature":d.properties.signature_count,
                               "lecture":d.properties.total_lec,
                               "quiz":d.properties.total_quiz});
      new_linechart_array.push({"name":d.properties.name,
                                "lec1":d.properties.lec1,
                                "lec2":d.properties.lec2,
                                "lec3":d.properties.lec3,
                                "lec4":d.properties.lec4,
                                "lec5":d.properties.lec5,
                                "lec6":d.properties.lec6,
                                "lec7":d.properties.lec7,
                                "lec8":d.properties.lec8,
                                "lec9":d.properties.lec9,
                                "lec10":d.properties.lec10});
      d3.select(this).style("opacity",0.5);
      $("#new_group").append("<li>" + select_country + "</li>");
    };
  }
  /*
  console.log(new_group_array);
  console.log(new_parallel_array);
  */
}


function addGroup(){
  var name = $("#group_name").val();
  if (name == "") {
    $("#group_name").focus();
    return;
  };
  if (new_group_array.length == 0) {
    return;
  };
  //add data into groups
  var total_count=0;
  var email_count=0;
  var signature_count=0;
  var total_lec=0;
  var total_quiz=0;
  //console.log(new_parallel_array);
  for (var i = new_parallel_array.length - 1; i >= 0; i--) {
    total_count += parseInt(new_parallel_array[i].total);
    email_count += parseInt(new_parallel_array[i].email);
    signature_count += parseInt(new_parallel_array[i].signature);
    total_lec += parseInt(new_parallel_array[i].lecture);
    total_quiz += parseInt(new_parallel_array[i].quiz);
  };
  parallel.push({"name":name,
                 "email":(email_count/total_count).toFixed(3),
                 "signature":(signature_count/total_count).toFixed(3),
                 "lecture":(total_lec/total_count).toFixed(3),
                 "quiz":(total_quiz/total_count).toFixed(3)});

  var lec1 = 0;
  var lec2 = 0;
  var lec3 = 0;
  var lec4 = 0;
  var lec5 = 0;
  var lec6 = 0;
  var lec7 = 0;
  var lec8 = 0;
  var lec9 = 0;
  var lec10 = 0;
  for (var i = new_linechart_array.length - 1; i >= 0; i--) {
    lec1 +=parseInt(new_linechart_array[i].lec1);
    lec2 +=parseInt(new_linechart_array[i].lec2);
    lec3 +=parseInt(new_linechart_array[i].lec3);
    lec4 +=parseInt(new_linechart_array[i].lec4);
    lec5 +=parseInt(new_linechart_array[i].lec5);
    lec6 +=parseInt(new_linechart_array[i].lec6);
    lec7 +=parseInt(new_linechart_array[i].lec7);
    lec8 +=parseInt(new_linechart_array[i].lec8);
    lec9 +=parseInt(new_linechart_array[i].lec9);
    lec10 +=parseInt(new_linechart_array[i].lec10);
  };
  lineChart.push([name,lec1,lec2,lec3,lec4,lec5,lec6,lec7,lec8,lec9,lec10]);

  groups.push({"name":name,"select":"yes","countries":new_group_array});

  //change visual elements
  $("#group_name").val("");
  $("#new_group").slideUp(300,function(){
    $("#groups").append("<div class='tags selected'>" + name + "</div>");
    new_group_array = [];
    $("#new_group").empty();
    $("#new_group").show();
    d3.selectAll("#countries path").style("opacity",0.6);
  });
}

function analyze(){
  //console.log(parallel_data);
  parallel_data.splice(0,parallel_data.length);
  lineChart_data.splice(0,lineChart_data.length);
  //process data
  var analyze_groups = [];
  for (var i = 0; i < groups.length; i++) {
    if (groups[i].select == "yes") {
      analyze_groups.push(groups[i]);
      parallel_data.push(parallel[i]);
      lineChart_data.push(lineChart[i]);
    };
  };
  if (analyze_groups.length == 0) {return;};

  /*console.log(groups);*/
  
  //console.log(analyze_groups);
  //console.log(parallel_data);
  

  createParallel(parallel_data);
  createLineChart(lineChart_data);

  //calculate parallel data
  /*
  d3.csv("mooc_count.csv", function(error,mooc_count){
    for (var i = analyze_groups.length - 1; i >= 0; i--) {
      if (analyze_groups[i].countries.length == 0) {
        var total_count=0;
        var email_count=0; //signature_count,total_lec,total_quiz = 0;
        for (var j = mooc_count.length - 1; j >= 0; j--) {
          if (analyze_groups[i].name == mooc_count[j].continent) {
            total_count = total_count + mooc_count[j].total_count;
            email_count = email_count + mooc_count[j].email_count;
          };
        };
        console.log(email_count/total_count);
        parallel_data.push({"name":analyze_groups[i].name,"email":email_count/total_count});//,"signature":signature_count/total_count,"lecture":total_lec/total_count,"quiz":total_quiz/total_count});
      };
    };
  });
  //console.log(parallel_data);
  createParallel(parallel_data);
  */

  //scroll down page with animation
  scrollToElement('#parallel', 1000);
}
/*End of interactions*/


/*Begin of Parallel*/
function createParallel(data){
  //refresh parallel
  $("#parallel>svg>g").empty();
  
  console.log(data);

  var dimensions = [
  {
    name: "name",
    scale: d3.scale.ordinal().rangePoints([height_p,0]),
    type: String
  },
  {
    name: "email",
    scale: d3.scale.linear().range([height_p,0]),
    type: Number
  },
  {
    name: "signature",
    scale: d3.scale.linear().range([height_p,0]),
    type: Number
  },
  {
    name: "lecture",
    scale: d3.scale.sqrt().range([height_p,0]),
    type: Number
  },
  {
    name: "quiz",
    scale: d3.scale.linear().range([height_p,0]),
    type: Number
  }];
  
  var x = d3.scale.ordinal()
            .domain(dimensions.map(function(d) { return d.name; }))
            .rangePoints([0, width_p]);

  var line = d3.svg.line().defined(function(d) { return !isNaN(d[1]); });

  var yAxis = d3.svg.axis().orient("left");

  var dimension = svg_p.selectAll(".dimension")
                     .data(dimensions)
                     .enter()
                     .append("g")
                     .attr("class", "dimension")
                     .attr("transform", function(d) { return "translate(" + x(d.name) + ")"; });

  dimensions.forEach(function(dimension) {
    dimension.scale.domain(dimension.type === Number
        ? d3.extent(parallel_data, function(d) { return + d[dimension.name]; })
        : data.map(function(d) { return d[dimension.name]; }).sort());
  });
  dimension.append("g")
           .attr("class", "axis")
           .each(function(d) { d3.select(this).call(yAxis.scale(d.scale)); })
           .append("text")
           .attr("class", "title")
           .attr("text-anchor", "middle")
           .attr("y", -9)
           .text(function(d) { return d.name; });

  svg_p.append("g")
       .attr("class", "background")
       .selectAll("path")
       .data(parallel_data)
       .enter()
       .append("path")
       .attr("d", function(d){
          return line(dimensions.map(function(dimension) {
            return [x(dimension.name), dimension.scale(d[dimension.name])];
          }));
       });;

  svg_p.append("g")
       .attr("class", "foreground")
       .selectAll("path")
       .data(parallel_data)
       .enter()
       .append("path")
       .attr("d", function(d){
          return line(dimensions.map(function(dimension) {
            return [x(dimension.name), dimension.scale(d[dimension.name])];
          }));
       });
  // Rebind the axis data to simplify mouseover.
  svg_p.select(".axis").selectAll("text:not(.title)")
     .attr("class", "label")
     .data(parallel_data, function(d) { return d.name || d; });

  var projection = svg_p.selectAll(".axis text,.background path,.foreground path")
                      .on("mouseover", mouseover)
                      .on("mouseout", mouseout);

  function mouseover(d) {
    svg_p.classed("active", true);
    projection.classed("inactive", function(p) { return p !== d; });
    projection.filter(function(p) { return p === d; }).each(moveToFront);
  }

  function mouseout(d) {
    svg_p.classed("active", false);
    projection.classed("inactive", false);
  }

  function moveToFront() {
    this.parentNode.appendChild(this);
  }
}
/*End of Parallel*/


/*Line Chart*/
function createLineChart(data){
  //refresh parallel
  $("#comparison>#chart").empty();

  console.log(data);
  var chart = c3.generate({
    size: {
        width: $("#comparison").width() - 400,
        height: 0.5*width,
    },
    data: {
      columns:data
    },
    axis:{
      x:{
        type:"category",
        categories:["Lecture 1","Lecture 2","Lecture 3","Lecture 4","Lecture 5","Lecture 6","Lecture 7","Lecture 8","Lecture 9","Lecture 10"]
      }
    }
});
  
}

/*End of Line Chart*/
