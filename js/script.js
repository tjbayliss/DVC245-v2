		/*
	
		Name: Scatterplot (full interactive)
		Developer: J BAYLISS
		From/to: Oct-Dec 2014, June and September 2015
		Technologies: D3, Javascript, D3, Chosen, Bootstrap
		
		*/
		
		
		
		// initialise global variables.
		var graphic = $('#graphic'); // set variable to DOM element to contain graphic
		var menu = $("#menu"); // set variable to DOM element to contain selection menu (only visible in mobile view)
		var dvc = {}; // global object variable to contain all variables prefixed with 'dvc.'	
		
		
		
		var pymChild = null; // initial Pym variable
		var height; // height of graphic container. Updated on resizing.
		var chart_width; // width of graphic container. Updated on resizing.
		var circleScale; // initialise scale for definfing size of coloured dots.
		var margin; // initialise margin object            
		var svg; // cg container
		dvc.y1_value; // define local variables to store y-axis intersection point depending on x-axis/y-axis scenario
		dvc.y2_value; // define local variables to store y-axis intersection point depending on x-axis/y-axis scenario	
		var num_ticksx; // initialise car to contain number of ticks for x axis
		var num_ticksy; // initialise car to contain number of ticks for y axis	
		var buttons = $("#buttons"); // global variable to #buttons DOM DIV item
		buttonsWidth = buttons.width();// global variable to store the width of the #buttons DOM item
		var groupButtons = $("#groupButtons"); // global variable to #groupButtons DOM DIV item
		groupButtonsWidth = groupButtons.width(); // global variable to store the width of the #groupButtons DOM item
				
		
		// initialise arrays for containing least squares statistics
		dvc.LeastSquareArray_XY = [];
		dvc.LeastSquareArray_XX = [];
		dvc.LeastSquareArray_X = [];
		dvc.LeastSquareArray_Y = [];
		
				
		// broswer use checking ... need this to resovle issue with tooltip not locating precisely in FireFox.			
		var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0; // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
		var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
		var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0; // At least Safari 3+: "[object HTMLElementConstructor]"
		var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
		var isIE = /*@cc_on!@*/false || !!document.documentMode;   // At least IE6		
		
		var output = 'Detecting browsers by ducktyping:		';
		output += 'isFirefox: ' + isFirefox + '		';
		output += 'isChrome: ' + isChrome + '		';
		output += 'isSafari: ' + isSafari + '		';
		output += 'isOpera: ' + isOpera + '		';
		output += 'isIE: ' + isIE + '		';
            
	
	
					 
	
		/*
			name: 			drawGraphic
			DESCRIPTION:	Main drawing function to draw to DOM initial scarter plot view. 	
			CALLED FROM:	Pym in 	
			CALLS:			
			REQUIRES: 		n/a
			RETURNS: 		n/a
		*/
		function drawGraphic()
		{
			
			
			// initialise breakpoint for medium and small screens
			var threshold_md = 788;
			var threshold_sm = dvc.config.optional.mobileBreakpoint;
			
			
			// remove all highlight line components before redrawing
			d3.selectAll(".lineComponents").remove();
			
		
			//set variables for chart dimensions dependent on width of #graphic
			if (graphic.width() < threshold_sm) {
					
					
					// set mobile size margins, height and width
					margin = {top: dvc.config.optional.margin_sm[0], right: dvc.config.optional.margin_sm[1], bottom: dvc.config.optional.margin_sm[2], left: dvc.config.optional.margin_sm[3]}; 
					chart_width = graphic.width() - margin.left - margin.right;
					height = Math.ceil((chart_width * dvc.config.optional.aspectRatio_sm[1]) / dvc.config.optional.aspectRatio_sm[0]) - margin.top - margin.bottom;
					
					
					// set number of ticks to use on x- and y-axis.
					num_ticksx = dvc.config.optional.x_num_ticks_sm_md_lg[0];
					num_ticksy = dvc.config.optional.y_num_ticks_sm_md_lg[0];
					
					
			} else if (graphic.width() < threshold_md) {
					
					
					// set mobile size margins, height and width
					margin = {top: dvc.config.optional.margin_md[0], right: dvc.config.optional.margin_md[1], bottom: dvc.config.optional.margin_md[2], left: dvc.config.optional.margin_md[3]}; 
					chart_width = graphic.width() - margin.left - margin.right;
					height = Math.ceil((chart_width * dvc.config.optional.aspectRatio_sm[1]) / dvc.config.optional.aspectRatio_sm[0]) - margin.top - margin.bottom;
					
					
					// set number of ticks to use on x- and y-axis.
					num_ticksx = dvc.config.optional.x_num_ticks_sm_md_lg[1];
					num_ticksy = dvc.config.optional.y_num_ticks_sm_md_lg[1];												
					
					
			} else {
					
					
					// set mobile size margins, height and width
					margin = {top: dvc.config.optional.margin_lg[0], right: dvc.config.optional.margin_lg[1], bottom: dvc.config.optional.margin_lg[2], left: dvc.config.optional.margin_lg[3]}
					chart_width = graphic.width() - margin.left - margin.right;
					height = Math.ceil((chart_width * dvc.config.optional.aspectRatio_lg[1]) / dvc.config.optional.aspectRatio_lg[0]) - margin.top - margin.bottom;
					
					num_ticksx = dvc.config.optional.x_num_ticks_sm_md_lg[2];
					num_ticksy = dvc.config.optional.y_num_ticks_sm_md_lg[2];
					
					
			} // end else ...
				
				
			// clear out existing graphics and menu
			graphic.empty();	
			menu.empty();	
			
						
			// update values for padding to graphic area
			dvc.Padding_top = margin.top;
			dvc.Padding_right = margin.right;
			dvc.Padding_left = margin.left;
			dvc.Padding_bottom = margin.bottom;
						
			
			// parse data into columns
			dots = {};
			values = []; // define array to contain values for dots.
			
			
			// for each 'column' in data object
			for (var column in graphic_data[0]) {
						
				
				// dots object with content from graphic_data					
				dots = graphic_data.map(function(d,i) {
					
					
					// push value onto associated array
					values.push(d.value);
					
					
					// return obecjt variables to sue in code. This needs to be updated in accordance with field content of files
					return {
						'group' : d.group,
						'code' : d.code,
						'name' : d.name,
						'0' : +d.var0,
						'1' : +d.var1,
						'2' : +d.var2,
						'3' : +d.var3,
						'4' : +d.var4,
						'5' : +d.var5,
						'value' : +d.value
					};
				});
			}
						
			
			// define circle size scale in relation to range of data held in file.
			// range has been  set arbitraily
			circleScale = d3.scale.sqrt().domain([0, d3.max(values)]).range([0, 7]);
				

			//create svg for chart
			svg = d3.select('#graphic')
					.append('svg')
					.attr("width", chart_width + margin.left + margin.right)
					.attr("height", height + margin.top + margin.bottom +150)
					.append("g")
					.attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");
				
				
			// append checkbox to show/hide 1:1 equality line			
			d3.select("#graphicRow")
				.append("input")
				.attr("type" , "checkbox")
				.attr("id" , "equality")
				.attr("checked" , function(d,i){
					
					if ( dvc.boolEqualityLine == false ) {
						document.getElementById("equality").checked = false;
						return;
					}
					else if ( dvc.boolEqualityLine == true ) {;
						document.getElementById("equality").checked = true;
						return;
					}
					return;
				})
				.attr("class" , "lineComponents")
   				.attr("onClick", "getState(this.id)")
				.style("position" , "absolute")
				.style("left" , chart_width*(5/24) + "px")
				.style("top" , "75px");
				
				
			// append text to show/hide 1:1 equality line label		
			d3.select("#graphicRow")
				.append("text")
				.text("Equality line")
				.attr("id" , "equalityLabel")
				.attr("class" , "lineComponents")
				.style("position" , "absolute")
				.style("font-size" , "14px")
				.style("left" , chart_width*(7/24) + "px")
				.style("text-align" , "end")
				.style("top" , "75px");		
				
				
			// append checkbox to show/hide regression line			
			d3.select("#graphicRow")
				.append("input")
				.attr("type" , "checkbox")
				.attr("id" , "regression")
				.attr("checked" , function(d,i){
					
					if ( dvc.boolRegressionLine == false ) {
						document.getElementById("regression").checked = false;
						return;
					}
					else if ( dvc.boolRegressionLine == true ) {;
						document.getElementById("regression").checked = true;
						return;
					}
					return;
				})
				.attr("class" , "lineComponents")
   				.attr("onClick", "getState(this.id)")
				.style("position" , "absolute")
				.style("left" , chart_width*(12/24) + "px")
				.style("top" , "75px");	
				
				
			// append text to show/hide 1:1 Regression line label		
			d3.select("#graphicRow")
				.append("text")
				.text("Regression line (full data)")
				.style("font-size" , "14px")
				.attr("id" , "regressionLabel")
				.attr("class" , "lineComponents")
				.style("position" , "absolute")
				.style("left" , chart_width*(14/24) + "px")
				.style("top" , "75px");	
	
	
			
			// define clipPath around scatter plot frame
			svg.append("defs").append("clipPath")
				.attr("id", "clip")
				.append("rect")
				.attr("width", chart_width - margin.left - margin.right )
				.attr("height", height );
				

			// Build y-axis variable selection list. initialise and populate with selection ist variable indexes
			var valueArray = [];
			for ( var i=0 ; i < dvc.config.vars.variables.length; i++ ) { valueArray[i] = i; }	


			// build and manipulate data arrays to help populate y-axis array...
			var YdataVariablesArrays = d3.zip( dvc.config.vars.variables , valueArray );
			dvc.YdataVariablesArrays = YdataVariablesArrays.sort(function(b, a){ return d3.descending(a[0], b[0])});
	
		
			// Build option menu for y-Axis
			var yAxisOptns = d3.select("#graphic")
				.append("select")
				.attr("id","selectyAxisGroup")
				.attr("style","width:15%")
				.attr("class","chosen-select");
				
				
			// populate variable selection list.
			yAxisOptns.selectAll("p")
				.data(dvc.YdataVariablesArrays)
				.enter()
				.append("option")
				.attr("value", function(d){ return d[1]}) 
				.text(function(d){ return d[0]});
				
											
			// define dimensions and functionality associated with selection list ... 
			$('#selectyAxisGroup').chosen({width: "15%", allow_single_deselect: true, placeholder_text_single:"Select y-Axis variable"}).on('change',function(evt,params)
			{


				// if selection list variable is valid selection ...
				if(typeof params != 'undefined')
				{		
	
												
					// update selectedIndex and name variables of newly selected option on selection list
					dvc.selectedYVariableIndex = params.selected;
					dvc.selectedYVariable = dvc.config.vars.variables[dvc.selectedYVariableIndex];	
					dvc.selectedYUnits = dvc.config.vars.units[this.selectedIndex];
					
					
					// update selectedIndex and name variables of newly selected option on selection list
					d3.select("#yAxisLabel").text(dvc.selectedYVariable + " (" + dvc.selectedYUnits + ")");
						
										
					// transition and update scatter plot based on new user selection
					transitionData();							
					
						
				} // end if ....
				
				
				
				else {
				} // end else ....
					
								
			});	// end definition of y-axis variable selection list	
				

			// Build y-axis variable selection list. initialise and populate with selection ist variable indexes
			var valueArray = [];
			for ( var i=0 ; i < dvc.config.vars.variables.length; i++ ) { valueArray[i] = i; }	


			// build and manipulate data array s to help populate x-axis array...
			var XdataVariablesArrays = d3.zip( dvc.config.vars.variables , valueArray );					
			dvc.XdataVariablesArrays = XdataVariablesArrays.sort(function(b, a){ return d3.descending(a[0], b[0])});									
		

			// Build option menu for x-Axis
			var xAxisOptns = d3.select("#graphic")
				.append("select")
				.attr("id","selectxAxisGroup")
				.attr("style","width:15%")
				.attr("class","chosen-select");
				
				
			// populate variable selection list.
			xAxisOptns.selectAll("p")
				.data(dvc.XdataVariablesArrays)
				.enter()
				.append("option")
				.attr("value", function(d){ return d[1]}) 
				.text(function(d){ return d[0]});
					
											
			// define dimensions and functionality associated with selection list ... 
			$('#selectxAxisGroup').chosen({width: "15%", allow_single_deselect: true, placeholder_text_single:"Select x-Axis variable"}).on('change',function(evt,params)
			{

				// if selection list variable is valid selection ...
				if(typeof params != 'undefined')
				{		
												
					// update selectedIndex and name variables of newly selected option on selection list
					dvc.selectedXVariableIndex = params.selected;
					dvc.selectedXVariable = dvc.config.vars.variables[dvc.selectedXVariableIndex];	
					dvc.selectedXUnits = dvc.config.vars.units[this.selectedIndex];

				
					// update selectedIndex and name variables of newly selected option on selection list
					d3.select("#xAxisLabel").text(dvc.selectedXVariable + " (" + dvc.selectedXUnits + ")");
					
										
					// transition and update scatter plot based on new user selection
					transitionData();							
					
						
				} // end if ....
				
				
				
				else {
				} // end else ....
					
								
			});	 // end definition of x-axis variable selection list	

	
			// initialise and update displayed value on y-axis selection list
			document.getElementById("selectyAxisGroup").selectedIndex = dvc.selectedYVariableIndex;
			document.getElementById("selectyAxisGroup_chosen").selectedIndex = dvc.selectedYVariableIndex;
			$('#selectyAxisGroup').val(dvc.selectedYVariableIndex);	
			$('#selectyAxisGroup').trigger("chosen:updated");	
			var ySelector = $('#selectyAxisGroup');
			ySelectorWidth = ySelector.width();	

	
			// initialise and update displayed value on xy-axis selection list
			document.getElementById("selectxAxisGroup").selectedIndex = dvc.selectedXVariableIndex;
			document.getElementById("selectxAxisGroup_chosen").selectedIndex = dvc.selectedXVariableIndex;								
			$('#selectxAxisGroup').val(dvc.selectedXVariableIndex);	
			$('#selectxAxisGroup').trigger("chosen:updated");
		

			// Build axis limits selection list
			var valueArray = [];
			for ( var i=0 ; i < dvc.config.vars.axisLimits.length; i++ ) { valueArray[i] = i; }	


			// build and manipulate data array s to help populate y-axis array...
			var axisLimitsVariablesArrays = d3.zip( dvc.config.vars.axisLimits , valueArray );						
			dvc.axisLimitsVariablesArrays = axisLimitsVariablesArrays.sort(function(b, a){ return d3.ascending(a[0], b[0])});
		
		
			// Build option menu for x-Axis
			var axisLimitOptns = d3.select("#graphic")
				.append("select")
				.attr("id","selectAxisLimitsGroup")
				.attr("style","width:15%")
				.attr("class","chosen-select")
				.attr("position" , "absolute");
				
				
			// populate variable selection list.
			axisLimitOptns.selectAll("p")
				.data(dvc.axisLimitsVariablesArrays)
				.enter()
				.append("option")
				.attr("value", function(d){ return d[1]}) 
				.text(function(d){ return d[0]});
						
											
			// define dimensions and functionality associated with selection list ... 
			$('#selectAxisLimitsGroup').chosen({width: "15%", allow_single_deselect: true, placeholder_text_single:"Select axis limits"}).on('change',function(evt,params)
			{


				// if selection list variable is valid selection ...
				if(typeof params != 'undefined')
				{		
												
					// update selectedIndex and name variables of newly selected option on selection list
					dvc.limitTypeIndex = params.selected;
					dvc.selectedAxisLimitVariable = dvc.config.vars.axisLimits[dvc.limitTypeIndex];							
					
										
					// transition and update scatter plot based on new user selection
					transitionData();							
					
						
				} // end if ....
				
				
				else {
				} // end else ....
								
			});	// end defining of selectAxisLimitsGroup

	
			// initialise and update displayed value on selectAxisLimitsGroup selection list
			document.getElementById("selectAxisLimitsGroup").selectedIndex = dvc.limitTypeIndex;
			document.getElementById("selectAxisLimitsGroup_chosen").selectedIndex = dvc.limitTypeIndex;
			$('#selectAxisLimitsGroup').val(dvc.limitTypeIndex);	
			$('#selectAxisLimitsGroup').trigger("chosen:updated");
			var axisLimitTypeSelector = $("#selectAxisLimitsGroup");
			var axisLimitTypeSelectorWidth = axisLimitTypeSelector.width();
			
						
			// updarte poositoning of all three selection lists
			d3.select("#selectAxisLimitsGroup_chosen").style( "top" , 60 + "px" ).style( "left" , (chart_width*(5/24)) + "px" );					
			d3.select("#selectxAxisGroup_chosen").style( "top" , 60 + "px" ).style( "left" , (chart_width*(12/24)) + "px" );	
			d3.select("#selectyAxisGroup_chosen").style( "top" , 60 + "px" ).style( "left" , (chart_width*(20/24)) + "px" );

					
			// update text content of axis limit selection list label
			d3.select("#graphic")
				.append("label")
				.attr("id" , "xaxisLimitSelectorLabel")
				.style("position" , "absolute")
				.style("left" , (chart_width*(2/24)) + "px")
				.style("top" , "60px")
				.text(dvc.config.vars.labels[1]);	

					
			// update text content of x-axis variable selection list label
			d3.select("#graphic")
				.append("label")
				.attr("id" , "xAxisSelectorLabel")
				.style("position" , "absolute")
				.style("left" , (chart_width*(10/24)) + "px")
				.style("top" , "60px")
				.text(dvc.config.vars.labels[2]);

					
			// update text content of y-axis variable selection list label
			d3.select("#graphic")
				.append("label")
				.attr("id" , "yAxisSelectorLabel")
				.style("position" , "absolute")
				.style("left" , (chart_width*(18/24)) + "px")
				.style("top" , "60px")
				.text(dvc.config.vars.labels[0]);

			
			// if  displayed on mobile view
			if (graphic.width() < threshold_sm) {
					
					
				// update text label content
				document.getElementById("xAxisSelectorLabel").innerHTML = "x";
				document.getElementById("yAxisSelectorLabel").innerHTML = "y";
				document.getElementById("xaxisLimitSelectorLabel").innerHTML = "Axis";					
				document.getElementById("equalityLabel").innerHTML = "Equality";
				document.getElementById("regressionLabel").innerHTML = "Regression";
				
				
				// modify which DOM DIVs are displayed	
				d3.select("#menu").attr("class" , "col-sm-12 col-xs-12 show");
				d3.select("#groupButtons").attr("class" , "col-sm-12 col-xs-12 hide");
				d3.select("#groupButtonsColors").attr("class" , "col-sm-12 col-xs-12 hide");
					
			
				if ( dvc.config.vars.groups.length > 1 ) {
					
					
					d3.select("#equality").style("top" , "50px");
					d3.select("#equalityLabel").style("top" , "50px");
					d3.select("#regression").style("top" , "50px");
					d3.select("#regressionLabel").style("top" , "50px");
					
					
				}// end if ...
				else {
				
					
					d3.select("#equality").style("top" , "35px");
					d3.select("#equalityLabel").style("top" , "35px");
					d3.select("#regression").style("top" , "35px");
					d3.select("#regressionLabel").style("top" , "35px");
					
					
				}// end else ...
				
					
			}// end if ... 
			
				
			// else if  displayed on tablet view
			else if (graphic.width() < threshold_md){
					
					
				// update text label content
				document.getElementById("xAxisSelectorLabel").innerHTML = "x";
				document.getElementById("yAxisSelectorLabel").innerHTML = "y";
				document.getElementById("xaxisLimitSelectorLabel").innerHTML = "Axis";
				document.getElementById("equalityLabel").innerHTML = "Equality line";
				document.getElementById("regressionLabel").innerHTML = "Regression line (full data)";
				
				
				// modify which DOM DIVs are displayed	
				d3.select("#menu").attr("class" , "col-sm-12 col-xs-12 hide");
				d3.select("#groupButtons").attr("class" , "col-sm-12 col-xs-12 show");
				d3.select("#groupButtonsColors").attr("class" , "col-sm-12 col-xs-12 show");
				
				
				if ( dvc.config.vars.groups.length > 1 ) {
				
					
					d3.select("#equality").style("top" , "85px");
					d3.select("#equalityLabel").style("top" , "85px");
					d3.select("#regression").style("top" , "85px");
					d3.select("#regressionLabel").style("top" , "85px");
					
					
				}// end if ...
				else {
					
				
					d3.select("#equality").style("top" , "35px");
					d3.select("#equalityLabel").style("top" , "35px");
					d3.select("#regression").style("top" , "35px");
					d3.select("#regressionLabel").style("top" , "35px");
					
					
				}// end else ...
				
			}// end else if ... 
			
			
			else{
					
					
				// update text label content
				document.getElementById("xAxisSelectorLabel").innerHTML = "x-axis";
				document.getElementById("yAxisSelectorLabel").innerHTML = "y-axis";
				document.getElementById("xaxisLimitSelectorLabel").innerHTML = "Axis limits";				
				document.getElementById("equalityLabel").innerHTML = "Equality line";
				document.getElementById("regressionLabel").innerHTML = "Regression line (full data)";
				
				
				// modify which DOM DIVs are displayed	
				d3.select("#menu").attr("class" , "col-sm-12 col-xs-12 hide");
				d3.select("#groupButtons").attr("class" , "col-sm-12 col-xs-12 show");
				d3.select("#groupButtonsColors").attr("class" , "col-sm-12 col-xs-12 show");
				
				
				if ( dvc.config.vars.groups.length > 1 ) {
				
				
					d3.select("#equality").style("top" , "85px");
					d3.select("#equalityLabel").style("top" , "85px");
					d3.select("#regression").style("top" , "85px");
					d3.select("#regressionLabel").style("top" , "85px");
					
					
				}// end if ..
				
				
				else {
					
					d3.select("#equality").style("top" , "35px");
					d3.select("#equalityLabel").style("top" , "35px");
					d3.select("#regression").style("top" , "35px");
					d3.select("#regressionLabel").style("top" , "35px");
					
					
				}// end else ..
				
			}// end else ..



			// if data is sub-categorised into more thn one group
			// build election list to display in mobile view (to replace the buttons used as tablet and desktp view)
			if ( dvc.config.vars.groups.length > 1 ) {	
			
			
				// Build group selection list 
				var valueArray = [];
				for ( var i=0 ; i < dvc.config.vars.groups.length; i++ ) { valueArray[i] = i; }	
			
			
				// build and manipulate data array s to help populate y-axis array...
				var groupArray = d3.zip( dvc.config.vars.groups , valueArray );		//	var codeoccyzip = d3.zip(dvc.allOcc, dvc.allCode);						
				dvc.groupArray = groupArray.sort(function(b, a){ return d3.ascending(a[10], b[1])});	// dvc.codeoccyzip = codeoccyzip.sort(function(b, a){ return d3.descending(a[0], b[0])});										
			
			
				// Build option menu for x-Axis
				var groupOptns = d3.select("#menu")
					.append("select")
					.attr("id","selectGroup")
					.attr("style","width:100%")
					.attr("class","chosen-select");
			
					
				// populate variable selection list.
				groupOptns.selectAll("p")
					.data(dvc.groupArray)
					.enter()
					.append("option")
					.attr("value", function(d){ return d[1]}) 
					.text(function(d){ return d[0]});
							
												
				// define dimensions and functionality associated with selection list ... 
				$('#selectGroup').chosen({width: "100%", allow_single_deselect: true, placeholder_text_single:"Select group to highlight"}).on('change',function(evt,params)
				{
			
					// if selection list variable is valid selection ...
					if(typeof params != 'undefined')
					{		
													
						// update selectedIndex and name variables of newly selected option on selection list
						dvc.selectedGroupIndex = params.selected;
						dvc.selectedGroup = dvc.config.vars.groups[dvc.selectedGroupIndex];	
						
						var str = (dvc.selectedGroup.toString()).replace(' ', '');	
						clickPillGroups(str);
							
					} // end if ....
					
					
					else {
					} // end else ....
					
									
				});	 // end selection list definition
			
			
				// update displayed variable and positioning of group selection list
				document.getElementById("selectGroup").selectedIndex = dvc.selectedGroupIndex;
				document.getElementById("selectGroup_chosen").selectedIndex = dvc.selectedGroupIndex;
				$('#selectGroup').val(dvc.selectedGroupIndex);	
				$('#selectGroup').trigger("chosen:updated");
				d3.select("#selectGroup").style( "left" , "0px" );
				d3.select("#selectGroup_chosen").style( "left" , "0px" );	
				
			}// end if ... 
					
					
			// clear and reanitialise arrays for containing data values for x and y variables	
			dvc.xData = [];
			dvc.yData = [];

			
			// for each dot in 'dots' array
			dots.forEach(function(d,i){
				
				
				// set global variables for x and y axis value
				var x = +d[dvc.selectedXVariableIndex];
				var y = +d[dvc.selectedYVariableIndex];
				
				
				// push x and y values on to dvc. global arrays for use later
				dvc.xData.push(+d[dvc.selectedXVariableIndex]);
				dvc.yData.push(+d[dvc.selectedYVariableIndex]);
				
				
				// call function to calculate values for least squares
				calculateLeastSquaresValues(x, y);
				
				
			});	// end forEach		
		
		
				
			//x domain calculations	: zero to intelligent max choice, or intelligent min and max choice,  or interval chosen manually
			if (dvc.config.essential.AxisScale == "auto_zero_max" ){
					
				
				// redefine domains for x and y axis
				dvc.xDomain = [	0, Math.ceil(d3.max(dvc.xData)/dvc.config.essential.xAxisScaleDivisor)*dvc.config.essential.xAxisScaleDivisor ];
				dvc.yDomain = [	0, Math.ceil(d3.max(dvc.yData)/dvc.config.essential.yAxisScaleDivisor)*dvc.config.essential.yAxisScaleDivisor ];
				
						
			}// end else if ...
			else if (dvc.config.essential.AxisScale == "auto_min_max" ){	
	
	
				dvc.xMin = Math.floor(d3.min(dvc.xData)/dvc.config.essential.xAxisScaleDivisor)*dvc.config.essential.xAxisScaleDivisor;
				dvc.xMax = Math.ceil(d3.max(dvc.xData)/dvc.config.essential.xAxisScaleDivisor)*dvc.config.essential.xAxisScaleDivisor;
				dvc.yMin = Math.floor(d3.min(dvc.yData)/dvc.config.essential.yAxisScaleDivisor)*dvc.config.essential.yAxisScaleDivisor;
				dvc.yMax = Math.ceil(d3.max(dvc.yData)/dvc.config.essential.yAxisScaleDivisor)*dvc.config.essential.yAxisScaleDivisor;
					
				
				// redefine domains for x and y axis
				dvc.xDomain = [ dvc.xMin , dvc.xMax ];
				dvc.yDomain = [ dvc.yMin , dvc.yMax ];
				

			} // end if ...			
			else {
					
				
				// redefine domains for x and y axis
				dvc.xDomain = dvc.config.essential.AxisScale;
			   	dvc.yDomain = dvc.config.essential.AxisScale;
				
				
			} // end else ...
			
			
			// overwrite domains for x and y axis depending on whether data is to be displayed using fixed limits or data limits 
			if ( dvc.selectedAxisLimitVariable == "Fixed" ) {
					
				
				// redefine domains for x and y axis
				dvc.xDomain = [ dvc.xMin , dvc.xMax ];
				dvc.yDomain = [ dvc.yMin , dvc.yMax ];				
				
				
			} // end if ...
			else if ( dvc.selectedAxisLimitVariable == "Data" ) {
					
				
				// redefine domains for x and y axis
				dvc.xDomain = [ Math.floor(d3.min(dvc.xData)/1)*1 , Math.ceil(d3.max(dvc.xData)/1)*1 ];
				dvc.yDomain = [ Math.floor(d3.min(dvc.yData)/1)*1 , Math.ceil(d3.max(dvc.yData)/1)*1 ];
				
				
			}// end else if ...
			
												 
			// define and construct x axis domain and ranges
			x = d3.scale.linear().domain(dvc.xDomain).range([ margin.left , ( chart_width - margin.right) ]);
			dvc.xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(num_ticksx).tickFormat(d3.format(",." + dvc.config.essential.xaxislabelPrecison + "f"));
			svg.append("g")
				.attr("class", "x axis")
				.attr("id", "focusXAxis")
				.attr("transform", "translate(0," + ( height+ dvc.Padding_top ) + ")")
				.call(dvc.xAxis);	
			
												 
			// define and construct y axis domain and ranges
			y = d3.scale.linear().domain(dvc.yDomain).range([ ( height) , 0 ]);
			dvc.yAxis = d3.svg.axis().scale(y).orient("left").ticks(num_ticksy).tickFormat(d3.format(",." + dvc.config.essential.yaxislabelPrecison + "f"));						
			svg.append("g")
				.attr("class", "y axis")
				.attr("id", "focusYAxis")
				.attr("transform", "translate(" + dvc.Padding_left + "," + dvc.Padding_top + ")")
				.call(dvc.yAxis);
			
											
			// draw tick grid lines extending from y-axis ticks on axis across scatter graph
			dvc.xticks = svg.selectAll('#focusXAxis').selectAll('.tick');					 
			dvc.xticks.append('svg:line')
				.attr( 'id' , "xAxisTicks" )
				.attr( 'y0' , 0 )
				.attr( 'y1' , -height )
				.attr( 'x1' , 0 )
				.attr( 'x2',  0 )
				.style("opacity" , 0.33);
					
											
			// draw tick grid lines extending from y-axis ticks on axis across scatter graph
			dvc.yticks = svg.selectAll('#focusYAxis').selectAll('.tick');					 
			dvc.yticks.append('svg:line')
				.attr( 'id' , "yAxisTicks" )
				.attr( 'y0' , 0 )
				.attr( 'y1' , 0 )
				.attr( 'x1' , 0 )
				.attr( 'x2', chart_width - margin.left - margin.right)
				.style("opacity" , 0.33);
									
			
			//x axis label
			svg.append("text")
				.attr('class', 'unit')
				.attr('id', 'yAxisLabel')
				.attr("x", x(dvc.xDomain[0]) )
				.attr("y", y(dvc.yDomain[1]) )
				.attr("text-anchor" , "start")
				.text(dvc.selectedYVariable + " (" + dvc.selectedYUnits + ")");
				
			
			//x axis label
			svg.append("text")
				.attr('class', 'unit')
				.attr('id', 'xAxisLabel')
				.attr("x", x(dvc.xDomain[1]) )
				.attr("y", y(0) + (margin.top) + 40 )
				.attr("text-anchor" , "end")
				.text(dvc.selectedXVariable + " (" + dvc.selectedXUnits + ")");				
			
							
			// call function to calculate y-axis intersect value and y-axis value at X(max) based on data range relationship y- ansd x-axes
			calculateYValues();

		
			// Calculate best fit line parameter values using values/arrays from calculateLeastSquaresValues
			calculateLeastSquaresLine();	
			
					
			// append and hide reference line component. used when mouse over a coloured dot.
			svg.append("line")
				.attr("class" , "referenceItems" )
				.attr("id" , "horiReferenceLine" )
				.style("stroke" , "solid")
				.style("stroke-width" , "3px")
				.style("display" , "none");	
			
					
			// append and hide reference line component. used when mouse over a coloured dot.
			svg.append("rect")
				.attr("class" , "referenceItems" )
				.attr("id" , "horiReferenceBox" )
				.style("stroke", "solid" )
				.style("stroke-width", "3px")
				.style("fill", "white")
				.style("display" , "none");	
			
					
			// append and hide reference line component. used when mouse over a coloured dot.
			svg.append("line")
				.attr("class" , "referenceItems" )
				.attr("id" , "vertReferenceLine" )
				.style("stroke" , "solid")
				.style("stroke-width" , "3px")
				.style("display" , "none");	
			
					
			// append and hide reference line component. used when mouse over a coloured dot.
			svg.append("rect")
				.attr("class" , "referenceItems" )
				.attr("id" , "vertReferenceBox" )
				.style("stroke", "solid" )
				.style("stroke-width", "3px")
				.style("fill", "white")
				.style("display" , "none");
			
			
			// select all plotted circles, and draw based on data values ... 													
			svg.selectAll(".circle")
				.data(dots)
				.enter()
				.append( "circle" )
				.attr( "class" , function(d,i){ return "circles " + d.group; })
				.attr( "id" , function (d,i){ return "circle" +  i; })
				.attr( "cx" , function( d , i ) { return x(d[dvc.selectedXVariableIndex]); })
				.attr( "cy" , function( d , i ) { return y(d[dvc.selectedYVariableIndex])+dvc.Padding_top; })
				.attr( "r" , function( d , i ) { return circleScale(d.value); })
				.attr( "fill" , function ( d , i ) {
					
					
					// if data is categorised in to groups in data.csv file ... 						
					if (  dvc.config.vars.groups.length > 1 ) {
	
								
						// if a group [button] has been selected  , OR no group has been selected						
						if ( dvc.booleanButtons[dvc.config.vars.groups.indexOf(d.group)] == true || dvc.booleanButtons.indexOf(true) == -1 ) {
								
							
							// define color based on group class of drawn dot
							var index = dvc.config.vars.groups.indexOf(d.group);
							return dvc.config.vars.grpColorArray[index];
								
								
						} // end if ... 
						else {
							
							
							// return grey
							return "#666";
							
							
						}// end else ... 
						
							
					} // end if ...
					else {
					
					
						// return config file defined single colour	
						return dvc.config.vars.singleColor;
						
					
					}// end else ...
				})
				.attr( "stroke" , function ( d , i ) {
					
					
					// if data is categorised in to groups in data.csv file ... 						
					if (  dvc.config.vars.groups.length > 1 ) {
	
								
						// if a group [button] has been selected  , OR no group has been selected						
						if ( dvc.booleanButtons[dvc.config.vars.groups.indexOf(d.group)] == true || dvc.booleanButtons.indexOf(true) == -1 ) {
								
							
							// define color based on group class of drawn dot
							var index = dvc.config.vars.groups.indexOf(d.group);
							return dvc.config.vars.grpColorArray[index];
							
							
						} // end if ... 
						else {
							
							
							// return grey
							return "#666";
							
							
						}// end else
						
						
					} // end if ... 
					else {
					
					
						// return config file defined single colour	
						return dvc.config.vars.singleColor;
						
						
					}// end else 
				})
				.attr( "opacity" , function ( d , i ) {
	
								
					// if a group [button] has been selected  , OR no group has been selected						
					if ( dvc.booleanButtons[dvc.config.vars.groups.indexOf(d.group)] == true || dvc.booleanButtons.indexOf(true) == -1 ) { return 1.00; }
					else { return 0.15; }
				})
				.attr( "fill-opacity" , function ( d , i ) {
	
								
					// if a group [button] has been selected  , OR no group has been selected						
					if ( dvc.booleanButtons[dvc.config.vars.groups.indexOf(d.group)] == true || dvc.booleanButtons.indexOf(true) == -1 ) { return 0.50; }
					else { return 0.50; }
				})					
				.attr( "display" , "inline");
					
									
				//Initiate the voronoi function
				//Use the same variables of the data in the .x and .y as used in the cx and cy of the circle call
				//The clip extent will make the boundaries end nicely along the chart area instead of splitting up the entire SVG
				//(if you do not do this it would mean that you already see a tooltip when your mouse is still in the axis area, which is confusing)
				var voronoi = d3.geom.voronoi()
					.x(function(d,i) { return x(d[dvc.selectedXVariableIndex]); })
					.y(function(d,i) { return y(d[dvc.selectedYVariableIndex])+dvc.Padding_top; })
					.clipExtent([[margin.left-5, margin.top-5], [chart_width-margin.left + 15 , height + margin.top + 5]]);
							
				
				// append group dedicated to displaying only all the loaded data			
				svg.append("g").attr("id" , "voronoiGridFull");
											
				//Create the Voronoi grid
				d3.select("#voronoiGridFull").selectAll("path")
					.data(voronoi(dots))//Use vononoi() with your dataset inside
					.enter()
					.append("path")
						.attr("d", function(d, i) {
							if (typeof d !== 'undefined') { return "M" + d.join("L") + "Z"; }
							else {  return; }
						})
						.datum(function(d, i) { 
							if (typeof d !== 'undefined') { return  d.point; }
							else { return; }
						})
						.attr("class", function(d,i) {//Give each cell a unique class where the unique part corresponds to the circle classes
							if (typeof d !== 'undefined') { return "voronoi " + d.group; }
							else { return; }
						})
						.attr( "id" , function (d,i){ return "voronoi" +  i; })
						.style("stroke", "none") 
						.style("fill", "none")
						.style("pointer-events", "all" )
						.on("mouseover" , function( d, i ) {
							
							
							// remove voronoi grid and temporary drawn dots associated with selecting an individual group
							d3.select("#voronoiGridTemp").remove();
							d3.selectAll(".TEMPcircles").remove();
							d3.select("#SelectedyAxisValueLabel").remove();	
							d3.select("#SelectedxAxisValueLabel").remove();							
								
														
							// call function to detemine class name from selected dot.
							getSelectedReferenceInfo(this.id);	
							
							
							// if class of selected dot indicates that it is still active (i.e. a group has not been selected
							if ( $('#' + dvc.selectedCircleID).attr("class").indexOf("disabled") == -1 ) {
									
							
								// grey out all circles, the recolor only those dots in the group selected
								d3.selectAll('.circles').style( "opacity" , 0.25 ).style( "fill-opacity" , 0.125 );
								d3.select('#' + dvc.selectedCircleID).style( "opacity" , 1.0 ).style( "fill-opacity" , 1.0 );								
								
								
								// determine x and y axis value for selected dots, and sote as local var accordingly.
								var xValue = d[dvc.selectedXVariableIndex];
								var yValue = d[dvc.selectedYVariableIndex];									
									
									
								// call function to display D3 tooltip on mouse over.
								showTooltip(d , this.id , xValue , yValue, "FULL");
								
								
								//  display previously hidden reference line components - HORIZONTAL LINE								
								d3.select("#horiReferenceLine")
									.attr("x1" , x(dvc.xDomain[0])-5 )
									.attr("x2" , x(d[dvc.selectedXVariableIndex]) )
									.attr("y1" , margin.top + y(d[dvc.selectedYVariableIndex]) )
									.attr("y2" , margin.top + y(d[dvc.selectedYVariableIndex]) )
									.style("stroke" , function(d,i){
										if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
										else { return dvc.config.vars.singleColor; }
									})
									.style("display" , "inline" );
								
								
								//  display previously hidden reference line components - HORIZONTAL REFERENCE BOX								
								d3.select("#horiReferenceBox")
									.attr("x" , x(d[dvc.selectedXVariableIndex])-25 )
									.attr("y" , margin.top + y(dvc.yDomain[0])+5 )
									.attr("width" , 50 )
									.attr("height" , 30 )
									.style("stroke" , function(d,i){
										if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
										else { return dvc.config.vars.singleColor; }
									})
									.attr("rx", 5 )
									.attr("ry", 5 )
									.style("display" , "inline" );
								
								
								//  display previously hidden reference line components - VERTICAL REFERENCE BOX								
								d3.select("#vertReferenceBox")
									.attr("x" , x(dvc.xDomain[0])-55 )
									.attr("y" , margin.top + y(d[dvc.selectedYVariableIndex])-15 )
									.attr("width" , 50 )
									.attr("height" , 30 )
									.style("stroke" , function(d,i){
										if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
										else { return dvc.config.vars.singleColor; }
									})
									.attr("rx", 5 )
									.attr("ry", 5 )
									.style("display" , "inline" );
								
								
								//  display previously hidden reference line components - VERTICAL LINE								
								d3.select("#vertReferenceLine")
									.attr("x1" , x(d[dvc.selectedXVariableIndex]) )
									.attr("x2" , x(d[dvc.selectedXVariableIndex]) )
									.attr("y1" , margin.top + y(d[dvc.selectedYVariableIndex]) )
									.attr("y2" , margin.top + y(dvc.yDomain[0])+5 )
									.style("stroke" , function(d,i){
										if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
										else { return dvc.config.vars.singleColor; }
									})
									.style("display" , "inline" );
										
										
								// draw y axis label
								svg.append("text")
									.attr("class" , "referenceItems" )
									.attr('id', 'SelectedyAxisValueLabel')
									.attr("x", x(dvc.xDomain[0])-30 )
									.attr("y", margin.top + y(d[dvc.selectedYVariableIndex])+5 )
									.style("font-size" , "12px" )
									.style("stroke" , "none" )
									.style("stroke" , function(d,i){
										if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
										else { return dvc.config.vars.singleColor; }
									})
									.attr("text-anchor" , "middle")
									.text(yValue.toFixed(1));
									
			
								// draw x axis label
								svg.append("text")
									.attr("class" , "referenceItems" )
									.attr('id', 'SelectedxAxisValueLabel')
									.attr("x", x(d[dvc.selectedXVariableIndex]) )
									.attr("y", margin.top + y(dvc.yDomain[0])+25 )
									.style("font-size" , "12px" )
									.style("stroke" , "none" )
									.style("stroke" , function(d,i){
										if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
										else { return dvc.config.vars.singleColor; }
									})
									.attr("text-anchor" , "middle")
									.text(xValue.toFixed(1));
									
							}// end if ...
							
						})
						.on("mouseout",  function(d,i){
							
							
							// display selected circle, and high all the DOM reference objects
							d3.select('#' + dvc.selectedCircleID).style("display" , "inline");
							d3.selectAll(".referenceItems").style("display" , "none" );
							
							
							// if no group button has been selected
							if ( dvc.booleanButtons.indexOf(true) == -1 ) {
								
								
								// select all dots and colour according to the assigned group in data.csv					
								d3.selectAll(".circles")
									.attr("class" , function(d,i){ return "circles " + d.group; })
									.style( "fill" , function ( d , i ) {
										var index = dvc.config.vars.groups.indexOf(d.group);
										return dvc.config.vars.grpColorArray[index];
									})
									.style( "stroke" , function ( d , i ) {
										var index = dvc.config.vars.groups.indexOf(d.group);
										return dvc.config.vars.grpColorArray[index];
									})
									.style( "opacity" , 1.00 )
									.style( "fill-opacity" , 0.50 );
									
									
							}// end if 
							else {
								
								
								// modify CSS attribution accordingly. grey out all dots in display
								d3.selectAll('.circles').attr("class" , function(d,i){ return "circles disabled " + d.group; }).style( "stroke" , "solid" ).style( "stroke" , "#666" ).style( "fill" , "#666" ).style( "opacity" , 0.15 ).style("pointer-events" , "none");
													
													
								// what is the index of the button/group that has been pressed/selected. Determine colour accordingly
								var index = dvc.config.vars.groups.indexOf(dvc.config.vars.groups[dvc.booleanButtons.indexOf(true)]);
								var color = dvc.config.vars.grpColorArray[index];
								
								
								// highlight all dots in display in selected group					
								d3.selectAll('.circles' + '.' + dvc.config.vars.groups[dvc.booleanButtons.indexOf(true)]).attr("class" , "circles " + dvc.config.vars.groups[dvc.booleanButtons.indexOf(true)]).style( "stroke" , "solid" ).style( "stroke" , color ).style( "fill" , color ).style( "opacity" , 1.00 ).style( "fill-opacity" , 0.50 ).style("pointer-events" , "auto");
								
								
							} /// end else ...
	
								
							// call function to remove D3 style tooltip from graphic.
							removeTooltip();
							
							
						});// end definition of vi=oroinoi layer creation.
				
							
				// draw 1:1 equality line
				svg.selectAll('#focusYAxis')
					.append( 'svg:line' )
					.attr( "id"  , "equalityLine" )
					.attr("clip-path", "url(#clip)")
					.attr( 'x1' , 0 )
					.attr( 'y1' , dvc.y1_value )
					.attr( 'x2' , dvc.max_max_VariableValue * dvc.xValIncrement )
					.attr( 'y2' , dvc.y2_value )
					.style("display" , function(d,i){
						if ( dvc.boolEqualityLine == true ){ return "inline"; }
						else { return "none"; }
					});
					
					
				// draw FULL DATA regression line
				svg.selectAll('#focusYAxis')
					.append( 'svg:line' )
					.attr( "id"  , "regressionLine" )
					.attr( "clip-path", "url(#clip)")
					.style( "stroke-width" , "5px" )
					.style( "stroke-dasharray" , "10 5" )
					.attr( 'x1' , 0 )
					.attr( 'y1' , y(dvc.yATminX) )
					.attr( 'x2' , ( dvc.xDomainArray[1] - dvc.xDomainArray[0] ) * dvc.xValIncrement )
					.attr( 'y2' , y(dvc.yATmaxX) )
					.on("mouseover" , function(){ })
					.on("mouseout" , function(){ })
					.style("display" , function(d,i){
						if ( dvc.boolRegressionLine == true ){ return "inline"; }
						else { return "none"; }
					});
					
				
				// append new checkboxes to svg element for display/hide of regression line and 1:1 equality line
				svg.append("input").attr("type" , "check").attr("id" , "equality").attr("onClick", "getState(this.id)");
				svg.append("input").attr("type" , "check").attr("id" , "regression").attr("onClick", "getState(this.id)");								
				d3.select("#equality").attr("x" , 50).attr("y" , 50);
					
				
				// special case for IE broswer use to position regression line
				if ( isIE == true ) { $("#regression").prop("position" , "absolute").prop("left" , "0px").prop("top" , "0px"); }
				else { d3.select("#regression").style("position" , "absolute").style("left" , "0px").style("top" , "0px"); }
					
				
				// special case for IE broswer use to position equality line
				if ( isIE == true ) { $("#equality").prop("position" , "absolute").prop("left" , "0px").prop("top" , "0px"); }
				else { d3.select("#equality").style("position" , "absolute").style("left" , "0px").style("top" , "0px"); }
				
							
				//use pym to calculate chart dimensions	
				if (pymChild) { pymChild.sendHeight(); }
						
			
				return;
				 
			
			 } // end function rawGraphic()
		 
		 
		 
		 
			
			/*
				NAME: 			calculateYValues
				DESCRIPTION: 	function to calculate variables relating to linear regression lines
				CALLED FROM:	drawGraphic
								transitionData
				CALLS:			n/a	
				REQUIRES: 		n/a
				RETURNS: 		n/a
			*/
			function calculateYValues()
			{
			
			
				// determine pixel incrementation between sequential integer steps of x- and y-axis. Necessary for redrawing equalityLine
				dvc.xValIncrement = x(1) - x(0);					
				dvc.yValIncrement = y(0) - y(1);
				
				
				// store domains of both axes as local variable (Note: /*dvc.xScale*/x.domain([1]) does not seem to return necessary value)
				// then determine higher maximum domain value from both
				dvc.xDomainArray = x.domain();
				dvc.yDomainArray = y.domain();	
				
			
				// store as local variables minimum and maximum values of both axes, afer comparing									
				dvc.min_min_VariableValue = d3.min( [ dvc.xDomainArray[0] , dvc.yDomainArray[0] ]);
				dvc.max_min_VariableValue = d3.max( [ dvc.xDomainArray[0] , dvc.yDomainArray[0] ]);
				dvc.min_max_VariableValue = d3.min( [ dvc.xDomainArray[1] , dvc.yDomainArray[1] ]);
				dvc.max_max_VariableValue = d3.max( [ dvc.xDomainArray[1] , dvc.yDomainArray[1] ]);								
				
				
				// calculate pixel values for y-component of equality line based on relationship scenario between yAxis(min) and xAxis(min)
				if ( dvc.xDomainArray[0] > dvc.yDomainArray[0] ) {
					
					
					dvc.y1_value = height - ( ( dvc.max_min_VariableValue - dvc.min_min_VariableValue ) * dvc.yValIncrement );
					dvc.y2_value = height - ( ( dvc.max_max_VariableValue + ( dvc.max_min_VariableValue - dvc.min_min_VariableValue ) ) * dvc.yValIncrement );
					
					
				}// end if
				
				
				else if ( dvc.xDomainArray[0] < dvc.yDomainArray[0] ) {
			
			
					dvc.y1_value = height - ( ( dvc.min_min_VariableValue - dvc.max_min_VariableValue ) * dvc.yValIncrement );
					dvc.y2_value = height - ( ( dvc.max_max_VariableValue + ( dvc.min_min_VariableValue - dvc.max_min_VariableValue ) ) * dvc.yValIncrement );
					
					
				}// end else if ...
				
				
				else {							
				
				
					dvc.y1_value = height - ( ( dvc.min_min_VariableValue - dvc.max_min_VariableValue ) * dvc.yValIncrement );
					dvc.y2_value = height - ( ( dvc.max_max_VariableValue ) * dvc.yValIncrement );
					
					
				}// end else ...
											
			
				return;						
			
				
			} // end function calculateYValues()	
			
			
			
			
			
			/*
				NAME: 			calculateLeastSquaresValues
				DESCRIPTION: 	function to calculate values for Least Squares Line
				CALLED FROM:	drawGraphic
								transitionData
				CALLS:			n/a
				REQUIRES:		X
								Y 		
				RETURNS:		n/a 		
			*/
			function calculateLeastSquaresValues(X, Y)
			{
				
								
				// calculate XY for each coordinate pairing
				var XY = parseFloat(X*Y);
				
								
				// calculate XX for each coordinate pairing
				var XX = parseFloat(X*X);
				
								
				// add latest value for X onto dedicated array
				dvc.LeastSquareArray_X.push(X);
				
								
				// add latest value for Y onto dedicated array					 	
				dvc.LeastSquareArray_Y.push(Y);
								
				
				// add latest value for XY onto dedicated array					 	
				dvc.LeastSquareArray_XY.push(XY);				
			
				
				// add latest value for XX onto dedicated array					 						 	
				dvc.LeastSquareArray_XX.push(XX);
									
			
				return;
				
				
			}// end function calculateLeastSquares()
		
			
			
			
			
			
			/*
				NAME: 			calculateLeastSquaresLine
				DESCRIPTION: 
				CALLED FROM:	drawGraphic
								transitionData	
				CALLS:			n/a
				REQUIRES: 		n/a	
				RETURNS: 		n/a		
			*/
			function calculateLeastSquaresLine()
			{ 
			
			
				// calculate sum of X co-ordinates
				dvc.sigmaX = d3.sum(dvc.LeastSquareArray_X);
				
				
				// calculate sum of Y co-ordinates
				dvc.sigmaY = d3.sum(dvc.LeastSquareArray_Y);
			
						
				// calculate sum of X*Y co-ordinates
				dvc.sigmaXY = d3.sum(dvc.LeastSquareArray_XY);
			
			
				//calculate sum of X*X co-ordinates
				dvc.sigmaXX = d3.sum(dvc.LeastSquareArray_XX);
			
			
				// calculate top part to equation for calculating the line's slope
				var top = ( dvc.sigmaXY - ( ( dvc.sigmaX * dvc.sigmaY ) / dvc.LeastSquareArray_X.length ) );
			
						
				// calculate bottom part to equation for calculating the line's slope						
				var bottom = ( ( dvc.sigmaXX - ( ( dvc.sigmaX*dvc.sigmaX ) / dvc.LeastSquareArray_X.length ) ) );
			
						
				// calculate the regression line's slope												
				dvc.regressionSlopeGradient =  top / bottom;
			
						
				// mean value of X component of all coordinates
				var xMean = dvc.sigmaX / dvc.LeastSquareArray_X.length;
			
			
				// mean value of Y component of all coordinates
				var yMean = dvc.sigmaY / dvc.LeastSquareArray_Y.length;
			
			
				// calculate line intercept
				var yIntercept = yMean - ( dvc.regressionSlopeGradient * xMean );
			
						
				// store final line equation
				dvc.eqtnText = dvc.selectedYVariable + " = (" + dvc.regressionSlopeGradient.toFixed(2) + "*" + dvc.selectedXVariable + ") + " + yIntercept.toFixed(2);
											
			
				// determine pixel incrementation between sequential integer steps of x- and y-axis. Necessary for redrawing equalityLine
				dvc.xValIncrement = x(1) - x(0);					
				dvc.yValIncrement = y(0) - y(1);
				
				
				// store domains of both axes as local variable (Note: /*dvc.xScale*/x.domain([1]) does not seem to return necessary value)
				// then determine higher maximum domain value from both
				dvc.xDomainArray = x.domain();
				dvc.yDomainArray = y.domain();		
						
			
				// calculate y-axis value at xAxis(min)
				dvc.yATminX = dvc.regressionSlopeGradient * dvc.xDomainArray[0] + yIntercept;
			
			
				// calculate y-axis value at xAxis(max)
				dvc.yATmaxX = dvc.regressionSlopeGradient * dvc.xDomainArray[1] + yIntercept;
				
						
				return;
				
				
			 } // end function calculateLeastSquaresLine()
		
			
			
			
			
			
			/*
				NAME: 			buildUI
				DESCRIPTION: 	function to build intitial UI interface.
				CALLED FROM:	Modernizr.inlinesvg
				CALLS:			n/a
				REQUIRES: 		n/a	
				RETURNS: 		n/a		
			*/
			function buildUI(){	
				
					
				// if loaded data is categorised into more than one group
				if ( dvc.config.vars.groups.length > 1 ) {			
					
					
					// calculate button width for category/groups buttons, and each paired set of button
					var pillWidthPercentWidth = (100/dvc.config.vars.groups.length);	
		
		
					// select all DIV to contain all group/category buttons and define their class and IDs
					d3.select("#groupButtons").append("div").attr( "class" , "btn-group" ).attr( "id" , "simple-justified-button-groupGrps" );			
		
		
					// select new DIV to previously creatd append new div and define class and ID
					d3.select("#simple-justified-button-groupGrps").append("div").attr( "class" , "btn-group btn-group-justified" ).attr( "id" , "justifiedBtnGrp" ).attr( "role" , "group" ).attr( "aria-label" , "Justified button group" );
		
		
					// for each element of config.groups array ... 
					dvc.config.vars.groups.forEach(function(d, i) {
						
						
						// store the element value as a local variable
						var fid = d;						
						var str = (d.toString()).replace(' ', '');						
						
						
						// select base DIV and append an 'a' and button , defining text and ID based on 'd, i' declaration
						d3.select("#justifiedBtnGrp").append("a").attr("href" , "#").attr("class" , "btn btn-default selectGroup").attr("id" , str).text(d).style( "text-align" , "center" ).style("border-style", "solid").style("border-width", "1px").style("border-color", "white").attr("onClick" , "clickPillGroups(this.id)");
					
										
					})	// end forEach...	
					
					
					// append new DIV to attach thin coloured bars to use for highlighted selected group/cartegory buttons
					d3.select("#groupButtonsColors").append("div").attr( "class" , "btn-group" ).attr( "id" , "simple-justified-button-groupGrpsColors" );			
		
		
					// select new DIV to previously creatd append new div and define class and ID
					d3.select("#simple-justified-button-groupGrpsColors").append("div").attr( "class" , "btn-group btn-group-justified" ).attr( "id" , "justifiedBtnGrpColors" ).attr( "role" , "group" ).attr( "aria-label" , "Justified button group" );
	
	
					// for each element of config.groups array ... 									
					dvc.config.vars.groups.forEach(function(d, i) {
						
						var str = (d.toString()).replace(' ', '');
						
						// append new DIV and modify CSS to colour-specific alue for Group/category button under which DIV it is situated
						d3.select("#justifiedBtnGrpColors").append("div").attr("class" , "btn-group btn-group-justified colorPanel").attr("id" , "panel" + str ).style("background-color" , /*dvc.chartConfig.*/dvc.config.vars.grpColorArray[i]).style( "text-align" , "center" ).style( "width" , pillWidthPercentWidth + "%" ).style( "height" , "10px" ).style("border-style", "solid").style("border-width", "1px").style("border-color", "white").style("opacity", 1.00 );
						
						
					})// end for each ...
					
					
					// update class	name of 'Show All' button only
					d3.select("#Showall").attr("class" , "btn btn-default selectGroup disabled"); 
					d3.select("#panelShowall").style("opacity" , 0.33); 				
					
					
				}// end if ... 
				
				else { 
					
					
					// update class	name of all buttons
					d3.select("#groups").attr("class" ,  "row hide" );
					
				}
				
				
				return;
				
				
			} // end function buildUI()
			
	
			
		
						
			
				
			/*
				NAME: 			clickPillGroups
				DESCRIPTION: 	handles user interaction with any of the other bootstrap buttons, i.e. any category or tool button. Modifies relevant CSS
				CALLED FROM:	onClick of any button in the relevant groups
				CALLS: 			loadChartData					
	 			REQUIRES: 		fid - ID of button selected by user
				RETURNS: 		n/a
			*/
			function clickPillGroups(fid){
				
			
				// determines index of selected button inside 'groups' array in config.json file			
				selectedBtnIndex = dvc.config.vars.groups.indexOf(fid);
				selectedGrpBtn = fid;
			
			
				// reset all group buttons and associated  horizontal colour div bars to become inactive */
				dvc.config.vars.groups.forEach(function(d,i)
				{	
								
				
					// store element as local var and perform find/replace on it to remove spaces
					var str = (d.toString()).replace(' ', '');
					
					
					// update class name accordingly, and colour 
					d3.select("#" + str).attr("class" , "btn btn-default selectGroup");
					d3.select("#panel" + str).style("opacity" , 0.33);
					d3.select("#" + str).style("pointer-events" , "auto" );
					
				
				}) // end forEach 
			
						
			// update selected group button to active class and highlight associated colour div bar.
			d3.select("#" + fid).attr("class" , "btn btn-default selectGroup active");
			d3.select("#" + fid).style("pointer-events" , "none" );
			d3.select("#panel" + fid).style("opacity" , 1.0);
			
	
			// for each element in array defining which if any group/category selection button has been pressed
			dvc.booleanButtons.forEach(function(d,i){
				
			
				// if element in dvc.booleanButtons is related to the selected group/category button
				if ( i == dvc.config.vars.groups.indexOf(fid) ) {
					
										
					// if element in dvc.booleanButtons is already false, set to true
					if ( dvc.booleanButtons[i] == false ) { dvc.booleanButtons[i] = true; } 
					
										
					// or vice versa
					else { dvc.booleanButtons[i] = false; }					
						
					
				}// end if
				
				
				// if element in dvc.booleanButtons is not related to the selected group/category button
				else
				{
				
								
					// set to false
					dvc.booleanButtons[i] = false;
					
					
				}// end else
							
				
			})// end forEach 
			
			
			// if fid of button selected in that of 'Show All' button
			if ( fid == "Showall" ) {
				
				
				// remove and display reelvant voronoi grid and groups of circles/dots
				d3.select("#voronoiGridFull").style("display" , "inline");
				d3.select("#voronoiGridTemp").remove();
				d3.selectAll(".TEMPcircles").remove();
				
				
				// select circles in main circle layer; modify CSS  attribution accordingly
				d3.selectAll(".circles")
					.attr("class" , function(d,i){ return "circles " + d.group; })
					.style( "fill" , function ( d , i ) {
						var index = dvc.config.vars.groups.indexOf(d.group);
						return dvc.config.vars.grpColorArray[index];
					})
					.style( "stroke" , function ( d , i ) {
						var index = dvc.config.vars.groups.indexOf(d.group);
						return dvc.config.vars.grpColorArray[index];
					})
					.style( "opacity" , 1.00 )
					.style( "fill-opacity" , 0.50 );
					
					
					// clear global array to hold array of dots cotnained within selected grou (prevents [re]drawing of TEMP voronoi layer 'transitionData() function
					dvc.tempDotArray = [];
					
					
					// transition data (i.e. relevant voronoi layer(s) and and dot layers 
					transitionData();
					
					
			} // end if ...
			
			
			else {
				
				
				// // modify/remove relevant voronoi and dot layer									
				d3.select("#voronoiGridFull").style("display" , "none");
				d3.select("#voronoiGridTemp").remove();
				d3.selectAll(".TEMPcircles").remove();
				
				
				// modify CSS attribution accordingly grey out all dots in display
				d3.selectAll('.circles').attr("class" , function(d,i){ return "circles disabled " + d.group; }).style( "stroke" , "solid" ).style( "stroke" , "#666" ).style( "fill" , "#666" ).style( "opacity" , 0.15 ).style("pointer-events" , "none");
									
				
				// ascertain index of 'fid' in vars.groups array, and assocaited color from .vars.grpColorArray
				var index = dvc.config.vars.groups.indexOf(fid);
				var color = dvc.config.vars.grpColorArray[index];
				
				
				// highlight all dots in display in selected group					
				d3.selectAll('.circles' + '.' + fid).attr("class" , "circles " + fid).style( "stroke" , "solid" ).style( "stroke" , color ).style( "fill" , color ).style( "opacity" , 1.00 ).style( "fill-opacity" , 0.50 ).style("pointer-events" , "auto");
				
				
				// update global variabel with grp name, and ascertain its index in .vars.groups array
				dvc.selectedGroup = fid;
				dvc.selectedGroupIndex = dvc.config.vars.groups.indexOf(fid);					
				
										
				// update group selection list with group as selected by buttons (ensures continuity when moving between window sizes).
				document.getElementById("selectGroup").selectedIndex = dvc.selectedGroupIndex;
				document.getElementById("selectGroup_chosen").selectedIndex = dvc.selectedGroupIndex;
				$('#selectGroup').val(dvc.selectedGroupIndex);	
				$('#selectGroup').trigger("chosen:updated");
				
				
				// clear and initialise array to contain dots held in full/main 'dots' array possessing selected group class name. Populate via filter function
				dvc.tempDotArray = [];
				dvc.tempDotArray = dots.filter(function(d, i) { return d.group == fid; });
				
							
				// select all plotted TEMP circles (i.e those with selected group classname), and draw based on data values ... 													
				svg.selectAll(".TEMPcircles")
					.data(dvc.tempDotArray)
					.enter()
					.append( "circle" )
					.attr( "class" , function(d,i){ return "TEMPcircles " + d.group; })
					.attr( "id" , function (d,i){ return "TEMPcircle" +  i; })
					.attr( "cx" , function( d , i ) { return x(d[dvc.selectedXVariableIndex]); })
					.attr( "cy" , function( d , i ) { return y(d[dvc.selectedYVariableIndex])+dvc.Padding_top; })
					.attr( "r" , function( d , i ) { return circleScale(d.value); })
					.attr( "fill" , function ( d , i ) {
						
						
						// if data is categorised in to more than one data group in data.csv file.						
						if (  dvc.config.vars.groups.length > 1 ) {


								// group button selected is same as group of dot being processed, OR, no group button is selected at all.
								if ( dvc.booleanButtons[dvc.config.vars.groups.indexOf(d.group)] == true || dvc.booleanButtons.indexOf(true) == -1 ) {
									
									
									// determine index of selected group in .vars.groups, and return its corresponding colour
									var index = dvc.config.vars.groups.indexOf(d.group);
									return dvc.config.vars.grpColorArray[index];
									
									
								}// end if ...
								else {
									
									
									// return dull grey
									return "#666";
									
									
								}// end else ...
							
								
						}// end if ...
						else {
							
							
							// return single colour defined in config.
							return dvc.config.vars.singleColor;
							
							
						}// end else ...
					})
					.attr( "stroke" , function ( d , i ) {
						
						
						// if data is categorised in to more than one data group in data.csv file.						
						if (  dvc.config.vars.groups.length > 1 ) {


								// group button selected is same as group of dot being processed, OR, no group button is selected at all.
								if ( dvc.booleanButtons[dvc.config.vars.groups.indexOf(d.group)] == true || dvc.booleanButtons.indexOf(true) == -1 ) {
									
									
									// determine index of selected group in .vars.groups, and return its corresponding colour
									var index = dvc.config.vars.groups.indexOf(d.group);
									return dvc.config.vars.grpColorArray[index];
									
									
								}// end if ...
								else {
									
									
									// return dull grey
									return "#666";
									
									
								}// end else 
								
								
						}// end if ...
						else {
							
							
							// return single colour defined in config.
							return dvc.config.vars.singleColor;
							
							
						}// end else ...
					})
					.attr( "opacity" , function ( d , i ) {
						
						
						if ( dvc.booleanButtons[dvc.config.vars.groups.indexOf(d.group)] == true || dvc.booleanButtons.indexOf(true) == -1 ) { return 0.00; }
						else { return 0.00; }
						
					})
					.attr( "fill-opacity" , function ( d , i ) {
						
						
						if ( dvc.booleanButtons[dvc.config.vars.groups.indexOf(d.group)] == true || dvc.booleanButtons.indexOf(true) == -1 ) { return 0.00; }
						else { return 0.00; }
						
					})					
					.attr( "display" , "inline");
					

				var voronoi = d3.geom.voronoi()
						.x(function(d,i) { return x(d[dvc.selectedXVariableIndex]); })
						.y(function(d,i) { return y(d[dvc.selectedYVariableIndex])+dvc.Padding_top; })
						.clipExtent([[margin.left-5, margin.top-5], [chart_width-margin.left + 15 , height + margin.top + 5]]);						
		
				svg.append("g").attr("id" , "voronoiGridTemp");
											
				//Create the Voronoi grid
				d3.select("#voronoiGridTemp").selectAll("path")
					.data(voronoi(dvc.tempDotArray)) //Use vononoi() with your dataset inside
					.enter()
					.append("path")
						.attr("d", function(d, i) {
							if (typeof d !== 'undefined') {  return "M" + d.join("L") + "Z"; }
							else {  return; }
						})
						.datum(function(d, i) {
							if (typeof d !== 'undefined') { return  d.point; }
							else { return; }
						})
						//Give each cell a unique class where the unique part corresponds to the circle classes
						.attr("class", function(d,i) {
							if (typeof d !== 'undefined') { return "voronoiTEMP " + d.group; }
							else { return; }
						})
					.attr( "id" , function (d,i){ return "voronoiTEMP" +  i; })
					.style("stroke", function (d,i){ return "none";	})
					.style("fill", "none")
					.style("pointer-events", "all" )
					.on("mouseover" , function( d, i ){
						
						
						// reset global var to hold ID of selected circle
						dvc.selectedCircleID = '';
						
						
						// remove x- and y-axis labels from DOM 						
						d3.select("#SelectedyAxisValueLabel").remove();	
						d3.select("#SelectedxAxisValueLabel").remove();							
							
													
						// call function to detemine key information for selected circle
						getSelectedReferenceInfo(this.id);							
							
				
						// store x- and y-values fof selected dot as local variables
						var xValue = d[dvc.selectedXVariableIndex];
						var yValue = d[dvc.selectedYVariableIndex];						
							
													
						// call function to show D3 style tooltip based on information gathered
						showTooltip(d , this.id , xValue , yValue, "TEMP");
						
						
						// update and display DOM reference element - HORIZONTAL LINE																			
						d3.select("#horiReferenceLine")
							.attr("x1" , x(dvc.xDomain[0])-5 )
							.attr("x2" , x(d[dvc.selectedXVariableIndex]) )
							.attr("y1" , margin.top + y(d[dvc.selectedYVariableIndex]) )
							.attr("y2" , margin.top + y(d[dvc.selectedYVariableIndex]) )
							.style("stroke" , function(d,i){
								if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
								else { return dvc.config.vars.singleColor; }
							})
							.style("display" , "inline" );
						
						
						// update and display DOM reference element - HORIZONTAL BOX
						d3.select("#horiReferenceBox")
							.attr("x" , x(d[dvc.selectedXVariableIndex])-25 )
							.attr("y" , margin.top + y(dvc.yDomain[0])+5 )
							.attr("width" , 50 )
							.attr("height" , 30 )
							.style("stroke" , function(d,i){
								if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
								else { return dvc.config.vars.singleColor; }
							})
							.attr("rx", 5 )
							.attr("ry", 5 )
							.style("display" , "inline" );
						
						
						// update and display DOM reference element - VERTICAL LINE																			
						d3.select("#vertReferenceLine")
							.attr("x1" , x(d[dvc.selectedXVariableIndex]) )
							.attr("x2" , x(d[dvc.selectedXVariableIndex]) )
							.attr("y1" , margin.top + y(d[dvc.selectedYVariableIndex]) )
							.attr("y2" , margin.top + y(dvc.yDomain[0])+5 )
							.style("stroke" , function(d,i){
								if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
								else { return dvc.config.vars.singleColor; }
							})
							.style("display" , "inline" );
						
						
						// update and display DOM reference element - VERTICAL BOX
						d3.select("#vertReferenceBox")
							.attr("x" , x(dvc.xDomain[0])-55 )
							.attr("y" , margin.top + y(d[dvc.selectedYVariableIndex])-15 )
							.attr("width" , 50 )
							.attr("height" , 30 )
							.style("stroke" , function(d,i){
								if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
								else { return dvc.config.vars.singleColor; }
							})
							.attr("rx", 5 )
							.attr("ry", 5 )
							.style("display" , "inline" );
							
								
						//y axis label
						svg.append("text")
							.attr("class" , "referenceItems" )
							.attr('id', 'SelectedyAxisValueLabel')
							.attr("x", x(dvc.xDomain[0])-30 )
							.attr("y", margin.top + y(d[dvc.selectedYVariableIndex])+5 )
							.style("font-size" , "12px" )
							.style("stroke" , "none" )
							.style("stroke" , function(d,i){
								if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
								else { return dvc.config.vars.singleColor; }
							})
							.attr("text-anchor" , "middle")
							.text(yValue.toFixed(1));
							
	
						//x axis label
						svg.append("text")
							.attr("class" , "referenceItems" )
							.attr('id', 'SelectedxAxisValueLabel')
							.attr("x", x(d[dvc.selectedXVariableIndex]) )
							.attr("y", margin.top + y(dvc.yDomain[0])+25 )
							.style("font-size" , "12px" )
							.style("stroke" , "none" )
							.style("stroke" , function(d,i){
								if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
								else { return dvc.config.vars.singleColor; }
							})
							.attr("text-anchor" , "middle")
							.text(xValue.toFixed(1));
					})
					.on("mouseout",  function(d,i){
						
						
						// select selected circle using its ID and modofy style accordingly. Hide all reference items
						d3.select('#' + dvc.selectedCircleID).style("display" , "inline");
						d3.selectAll(".referenceItems").style("display" , "none" );
						
						
						// if no group button has been selected 						
						if ( dvc.booleanButtons.indexOf(true) == -1 ) {
				
				
							// select all circles and modifiy CSS attribtuion accordingly
							d3.selectAll(".circles")
								.attr("class" , function(d,i){ return "circles " + d.group; })
								.style( "fill" , function ( d , i ) {
									var index = dvc.config.vars.groups.indexOf(d.group);
									return dvc.config.vars.grpColorArray[index];
								})
								.style( "stroke" , function ( d , i ) {
									var index = dvc.config.vars.groups.indexOf(d.group);
									return dvc.config.vars.grpColorArray[index];
								})
								.style( "opacity" , 1.00 )
								.style( "fill-opacity" , 0.50 );
						}
						else {
							
							// modify CSS attribution accordingly; grey out all dots in display
							d3.selectAll('.circles').attr("class" , function(d,i){ return "circles disabled " + d.group; }).style( "stroke" , "solid" ).style( "stroke" , "#666" ).style( "fill" , "#666" ).style( "opacity" , 0.15 ).style("pointer-events" , "none");
												
							
							// what is the index of the button/group that has been pressed/selected. Determine colour accordingly
							var index = dvc.config.vars.groups.indexOf(dvc.config.vars.groups[dvc.booleanButtons.indexOf(true)]);
							var color = dvc.config.vars.grpColorArray[index];
						
							
							// highlight all dots in display in selected group					
							d3.selectAll('.circles' + '.' + dvc.config.vars.groups[dvc.booleanButtons.indexOf(true)]).attr("class" , "circles " + dvc.config.vars.groups[dvc.booleanButtons.indexOf(true)]).style( "stroke" , "solid" ).style( "stroke" , color ).style( "fill" , color ).style( "opacity" , 1.00 ).style( "fill-opacity" , 0.50 ).style("pointer-events" , "auto");
							
							
						}// end if ...
	
				
						// call function to remove D3 tooltip from view									
						removeTooltip();
						
						
					});	// end defintion of voronoi layer
												
					
				}// end else ...
			
			
			return;
			
			
		}// end function clickPillGroups()
			
	
			
		
						
			
				
		/*
			NAME: 			getSelectedReferenceInfo
			DESCRIPTION: 	function uses ID of selected/mouseover'd circle to detemine group that has been selected (used to determine if tooltip is shown based on class of selected DOM dot)
			CALLED FROM:	drawGraphic
							transitionData
			CALLS: 			n/a					
			REQUIRES: 		fid - ID of button selected by user
			RETURNS: 		n/a
		*/
		function getSelectedReferenceInfo(fid){
			
			
			// reset relevant global variables		
			dvc.selectedCircleID = '';			
			dvc.circleClass = '';
			
			
			// use ID of selected circle to determine its class. store this as global var (for use in mouseover/mouse out actions) and stripe out unecessary text to return group name
			dvc.circleClass = ($('#' + fid).attr('class')).replace("voronoiTEMP " , '').replace("voronoi " , '').replace("disabled " , '');			
			dvc.selectedCircleID = fid.replace("voronoi" , 'circle');
			dvc.selectedCircleID = dvc.selectedCircleID.replace("TEMP" , '');
			
			
			// determine index of selected group/class, and thus related colour to use for colouring 
			dvc.index = dvc.config.vars.groups.indexOf(dvc.circleClass);
			dvc.color = dvc.config.vars.grpColorArray[dvc.index];
			   
			   
			return;
		
					
		}// end function getSelectedReferenceInfo(fid)
					
			
			
			
	
		/*
			NAME: 			transitionData
			DESCRIPTION: 	function used to transition all and/or selected grouped dots plus related voronoi layers
			CALLED FROM:	clickPillGroups
							drawGraphic
			CALLS:			showtooltip
							hidetooltip
			REQUIRES: 		n/a
			RETURNS: 		n/a
		*/
		function transitionData()
		{
	
	
			// remove ticks, temporary circles/dots and voronoi layers
			$(".tick").remove();
			d3.select("#voronoiGridFull").remove();
			d3.select("#voronoiGridTemp").remove();	
			d3.selectAll(".TEMPcircles").style("display" ,"none");	
			
			
			// update x- and y-axis labels based on new selections
			d3.select("#xAxisLabel").text(dvc.selectedXVariable + " (" + dvc.selectedXUnits + ")");	
			d3.select("#yAxisLabel").text(dvc.selectedYVariable + " (" + dvc.selectedYUnits + ")");
  
  
			// reset and empty arrays to store values for linear regresion line of best fit for plotted data points
			dvc.LeastSquareArray_XY = [];
			dvc.LeastSquareArray_XX = [];
			dvc.LeastSquareArray_X = [];
			dvc.LeastSquareArray_Y = [];		
			dvc.filteredLeastSquareArray_XY = [];
			dvc.filteredLeastSquareArray_XX = [];
			dvc.filteredLeastSquareArray_X = [];
			dvc.filteredLeastSquareArray_Y = [];
  
  
			// clear global variables relating to regression line of best fit ready for updating
			dvc.regressionSlopeGradient = 0;
			dvc.sigmaXY = 0;
			dvc.sigmaXX = 0;
			dvc.sigmaX = 0;
			dvc.sigmaY = 0;
			dvc.minX = 0;
			dvc.maxX = 0;
					
					
			// clear and reanitialise arrays for containing data values for x and y variables	
			dvc.xData = [];
			dvc.yData = [];

			
			// for each dot in 'dots' array
			dots.forEach(function(d,i){
				
				
				// set global variables for x and y axis value
				var x = +d[dvc.selectedXVariableIndex];
				var y = +d[dvc.selectedYVariableIndex];
				
				
				// push x and y values on to dvc. global arrays for use later
				dvc.xData.push(+d[dvc.selectedXVariableIndex]);
				dvc.yData.push(+d[dvc.selectedYVariableIndex]);
				
				
				// call function to calculate values for least squares
				calculateLeastSquaresValues(x, y);
				
				
			});	// end forEach		
		
		
				
			//x domain calculations	: zero to intelligent max choice, or intelligent min and max choice,  or interval chosen manually
			if (dvc.config.essential.AxisScale == "auto_zero_max" ){
					
				
				// redefine domains for x and y axis
				dvc.xDomain = [	0, Math.ceil(d3.max(dvc.xData)/dvc.config.essential.xAxisScaleDivisor)*dvc.config.essential.xAxisScaleDivisor ];
				dvc.yDomain = [	0, Math.ceil(d3.max(dvc.yData)/dvc.config.essential.yAxisScaleDivisor)*dvc.config.essential.yAxisScaleDivisor ];
				
						
			}// end else if ...
			else if (dvc.config.essential.AxisScale == "auto_min_max" ){	
	
	
				dvc.xMin = Math.floor(d3.min(dvc.xData)/dvc.config.essential.xAxisScaleDivisor)*dvc.config.essential.xAxisScaleDivisor;
				dvc.xMax = Math.ceil(d3.max(dvc.xData)/dvc.config.essential.xAxisScaleDivisor)*dvc.config.essential.xAxisScaleDivisor;
				dvc.yMin = Math.floor(d3.min(dvc.yData)/dvc.config.essential.yAxisScaleDivisor)*dvc.config.essential.yAxisScaleDivisor;
				dvc.yMax = Math.ceil(d3.max(dvc.yData)/dvc.config.essential.yAxisScaleDivisor)*dvc.config.essential.yAxisScaleDivisor;
					
				
				// redefine domains for x and y axis
				dvc.xDomain = [ dvc.xMin , dvc.xMax ];
				dvc.yDomain = [ dvc.yMin , dvc.yMax ];
				

			} // end if ...			
			else {
					
				
				// redefine domains for x and y axis
				dvc.xDomain = dvc.config.essential.AxisScale;
			   	dvc.yDomain = dvc.config.essential.AxisScale;
				
				
			} // end else ...
			
			
			// overwrite domains for x and y axis depending on whether data is to be displayed using fixed limits or data limits 
			if ( dvc.selectedAxisLimitVariable == "Fixed" ) {
					
				
				// redefine domains for x and y axis
				dvc.xDomain = [ dvc.xMin , dvc.xMax ];
				dvc.yDomain = [ dvc.yMin , dvc.yMax ];

				
			} // end if ...
			else if ( dvc.selectedAxisLimitVariable == "Data" ) {
					
				
				// redefine domains for x and y axis
				dvc.xDomain = [ Math.floor(d3.min(dvc.xData)/1)*1 , Math.ceil(d3.max(dvc.xData)/1)*1 ];
				dvc.yDomain = [ Math.floor(d3.min(dvc.yData)/1)*1 , Math.ceil(d3.max(dvc.yData)/1)*1 ];
				
				
			}// end else if ...
			
			
			// update x- and y-axis domains accordingly wrt new data and deifned axis limits.									 
			x.domain(dvc.xDomain);
		  	y.domain(dvc.yDomain);
			
			  
			// update xAxis and yAxis based xScale and yScale components 
			dvc.xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(num_ticksx).tickFormat(d3.format(",." + dvc.config.essential.xaxislabelPrecison + "f"));
			dvc.yAxis = d3.svg.axis().scale(y).orient("left").ticks(num_ticksy).tickFormat(d3.format(",." + dvc.config.essential.yaxislabelPrecison + "f"));
		  
  			
			// call function to calculate y-axis intersect value and y-axis value at X(max) based on data range relationship y- and x-axes
		  	calculateYValues();			
		  	calculateLeastSquaresLine();
  
  
			// transition x- and y-axes based on their new domain and range definitions
		  	svg.select(".x.axis").transition().duration(1000).call(dvc.xAxis);							
		  	svg.select(".y.axis").transition().duration(1000).call(dvc.yAxis);
		  
	  
	  		// intialise local variable to store data to use for plotting; if = full data; else = seelcted group data
	  		var dataToUse;
	  		if ( dvc.booleanButtons.indexOf(true) == -1 ) { dataToUse = dots; }
			else {  dataToUse = dvc.tempDotArray;  }
		  
	  
	  		// intialise local variable to define which voronoi layer to draw, for FULL data or selected GROUP data
	  		var src;
			if ( dvc.booleanButtons.indexOf(true) == -1 ) { src = "FULL"; }
			else { src = "TEMP"; }	
		  
		  
			// transition ALL ircles based on new data selections. Modify CSS based on value relationship to x- and y-axis ranges imposed by user.
			// If a GROUP seelction has been made via buttons or drop down, these are drawn underneath the temporary dots and voronoi layers
			svg.selectAll( "circle" )
				.data(dots)
				.transition()
				.ease("linear")
				.delay(function(d, i){ return i * 10; })
				.duration(500)
				.attr( "cx" , function( d , i ) { return x(d[dvc.selectedXVariableIndex]); })
				.attr( "cy" , function( d , i ) { return y(d[dvc.selectedYVariableIndex])+dvc.Padding_top; })
				.attr( "r" , function( d , i ) { return circleScale(d.value); })
				.attr( "fill" , function ( d , i ) {
					

					// if data have been categorised
					if ( dvc.config.vars.groups.length > 1 ) {


						// determine group index from config file, and return associated fill colour from colour array in config file
						var index = dvc.config.vars.groups.indexOf(d.group);
						return dvc.config.vars.grpColorArray[index];

					}// end if 
					else {


							// return single colour
							return dvc.config.vars.singleColor;


					}// end else
				})
				.attr( "stroke" , function ( d , i ) {


					// if data have been categorised
					if ( dvc.config.vars.groups.length > 1 ) {
						

						// determine group index from config file, and return associated fill colour from colour array in config file
						var index = dvc.config.vars.groups.indexOf(d.group);
						return dvc.config.vars.grpColorArray[index];


					}// end if ...
					else {


							// return single colour
							return dvc.config.vars.singleColor;


					}// end else ..


				});// end definition of transitioned full circles layer
				
				
				
				// if array exists of selected circles from selection group by button or drop down
				if (typeof dvc.tempDotArray !== 'undefined') {	
				

					// select all temporary circles associated with selected group
					svg.selectAll( ".TEMPcircles" )
						.data(dvc.tempDotArray)
						.transition()
						.ease("linear")
						.delay(function(d, i){ return i * 10; })
						.duration(500)
						.attr( "cx" , function( d , i ) { return x(d[dvc.selectedXVariableIndex]); })
						.attr( "cy" , function( d , i ) { return y(d[dvc.selectedYVariableIndex])+dvc.Padding_top; })
						.attr( "r" , function( d , i ) { return circleScale(d.value); })
						.style( "fill" , function ( d , i ) { return "none"; })
						.style( "stroke" , function ( d , i ) { return "none"; })
						.style( "opacity" , 0.0 )
						.style( "fill-opacity" , 0.0 );
						

				}	// end if .. 	
				
				
			  
			  	var layerToSelect = '';
								  
				//Initiate the voronoi function
				//Use the same variables of the data in the .x and .y as used in the cx and cy of the circle call
				//The clip extent will make the boundaries end nicely along the chart area instead of splitting up the entire SVG
				//(if you do not do this it would mean that you already see a tooltip when your mouse is still in the axis area, which is confusing)
				var voronoi = d3.geom.voronoi()
					.x(function(d,i) { return x(d[dvc.selectedXVariableIndex]); })
					.y(function(d,i) { return y(d[dvc.selectedYVariableIndex])+dvc.Padding_top; })
					.clipExtent([[margin.left-5, margin.top-5], [chart_width-margin.left + 15 , height + margin.top + 5]]);
				  

				  	// if y- and x-axis variables are not the same (NOTE: only same in variable name selected
				  	// if two differently named varaibles ave rthe same content, the voronoi layer will still be drawn)
				  	if ( dvc.selectedXVariable != dvc.selectedYVariable ) {
						

				  		//append new group layer to svg. Determine layer/ID name to use based on whether a gourp has been selected
					  	svg.append("g").attr("id" , function() {


					  		// if no group selection has been made
							if ( dvc.booleanButtons.indexOf(true) == -1 ) {


								// voronoi layer relates to ALL data
								layerToSelect = "voronoiGridFull";
							  	return "voronoiGridFull";


						  	}// end if 
						  	else { 


								// voronoi layer relates to selected group data
							  	layerToSelect = "voronoiGridTemp";
							  	return "voronoiGridTemp";


						  	}// end else


					 	});// end definition of appended group.
					  
					  	  
					  	//Create the Voronoi grid
					  	d3.select("#" + layerToSelect).selectAll("path")
						  	.data(voronoi(dataToUse))
						  	.enter()
						  	.append("path")
							 	.attr("d", function(d, i) {


							  		// if d is defined ....	
									if (typeof d !== 'undefined') {	return "M" + d.join("L") + "Z"; }								
								  	else { }
							  	})
							  	.datum(function(d, i) {


							  		// if d is defined ....	
									if (typeof d !== 'undefined') {	return d.point; }								
								  	else { }
							 	})
							  	.attr("class", function(d,i) {


							  		// if d is defined ....	
									if (typeof d !== 'undefined') {


										// if no group has been selected
										if ( dvc.booleanButtons.indexOf(true) == -1 ) { return "voronoi " + d.group; }
									  	else {  return "voronoiTEMP " + d.group; }


								  	}// end if ... 
								  	else { }								
							  	})
							  	.attr( "id" , function (d,i){


									// if no group has been selected
									if ( dvc.booleanButtons.indexOf(true) == -1 ) { return "voronoi" + i; }
								  	else {  return "voronoiTEMP" + i; }
							  	})
							  	.style("stroke", function (d,i){ return "none"; }) 
							 	.style("fill", "none")
								.style("pointer-events", "all")
							  	.on("mouseover" , function( d, i ) {


							  		// remove both axis labels ready to redraw
							  		d3.select("#SelectedyAxisValueLabel").remove();	
							  		d3.select("#SelectedxAxisValueLabel").remove();
							  		

							  		// call function to get class information relating to selected circle/dot
							 		getSelectedReferenceInfo(this.id);
						  

							  		// if group has not been disabled through selecting another group && the data to draw is ALL data, OR data is group-specific data
							  		if ( ( $('#' + dvc.selectedCircleID).attr("class").indexOf("disabled") == -1 && src == "FULL" ) || ( src == "TEMP" ) ) {
								  
							  
							  			// if data to draw is ALL data
								  		if ( src == "FULL" ) {
									  
									  
									  		// modify CSS accordingly
									  		d3.selectAll('.circles').style( "opacity" , 0.25 ).style( "fill-opacity" , 0.125 );
									  		d3.select('#' + dvc.selectedCircleID).style( "opacity" , 1.0 ).style( "fill-opacity" , 1.0 );
									  
									  
								  		} // end if ... 
								  
									  
									  	// update local variables with x- and y-axis values for selected circle
								  		var xValue = d[dvc.selectedXVariableIndex];
								  		var yValue = d[dvc.selectedYVariableIndex];	
														
										
										// show D3 style tooltip on mouseover				
								  		showTooltip(d , this.id , xValue , yValue, src);
								  
										
										// update DOM reference line component - HORIZONTAL LINE												  
										d3.select("#horiReferenceLine")
										  	.attr("x1" , x(dvc.xDomain[0])-5 )
											.attr("x2" , x(d[dvc.selectedXVariableIndex]) )
											.attr("y1" , margin.top + y(d[dvc.selectedYVariableIndex]) )
											.attr("y2" , margin.top + y(d[dvc.selectedYVariableIndex]) )
											.style("stroke" , function(d,i){
												if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
												else { return dvc.config.vars.singleColor; }
											})
											.style("display" , "inline" );
								  
										
										// update DOM reference line component - HORIZONTAL BOX
									  	d3.select("#horiReferenceBox")
										 	.attr("x" , x(d[dvc.selectedXVariableIndex])-25 )
										  	.attr("y" , margin.top + y(dvc.yDomain[0])+5 )
										  	.attr("width" , 50 )
										  	.attr("height" , 30 )
										  	.style("stroke" , function(d,i){
												if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
											  	else { return dvc.config.vars.singleColor; }
										  	})
										  	.attr("rx", 5 )
										  	.attr("ry", 5 )
										  	.style("display" , "inline" );
								  
										
										// update DOM reference line component - VERTICAL BOX
									  	d3.select("#vertReferenceBox")
										  	.attr("x" , x(dvc.xDomain[0])-55 )
										  	.attr("y" , margin.top + y(d[dvc.selectedYVariableIndex])-15 )
										  	.attr("width" , 50 )
										  	.attr("height" , 30 )
										  	.style("stroke" , function(d,i){
												if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
											  	else { return dvc.config.vars.singleColor; }
										  	})
										  	.attr("rx", 5 )
										  	.attr("ry", 5 )
										  	.style("display" , "inline" );
								  
										
										// update DOM reference line component - VERTICAL LINE												  
										d3.select("#vertReferenceLine")
										  	.attr("x1" , x(d[dvc.selectedXVariableIndex]) )
										  	.attr("x2" , x(d[dvc.selectedXVariableIndex]) )
										  	.attr("y1" , margin.top + y(d[dvc.selectedYVariableIndex]) )
										  	.attr("y2" , margin.top + y(dvc.yDomain[0])+5 )
										  	.style("stroke" , function(d,i){
											  	if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
											  	else { return dvc.config.vars.singleColor; }
										  	})
										  	.style("display" , "inline" );
											  
											  
										//y axis label
										svg.append("text")
											.attr("class" , "referenceItems" )
											.attr('id', 'SelectedyAxisValueLabel')
											 .attr("x", x(dvc.xDomain[0])-30 )
											  .attr("y", margin.top + y(d[dvc.selectedYVariableIndex])+5 )
											  .style("font-size" , "12px" )
											  .style("stroke" , "none" )
											  .style("stroke" , function(d,i){
												  if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
												  else { return dvc.config.vars.singleColor; }
											  })
											  .attr("text-anchor" , "middle")
											  .text(yValue.toFixed(1));
										  
				  
									  	//x axis label
									  	svg.append("text")
										  	.attr("class" , "referenceItems" )
										  	.attr('id', 'SelectedxAxisValueLabel')
										  	.attr("x", x(d[dvc.selectedXVariableIndex]) )
										  	.attr("y", margin.top + y(dvc.yDomain[0])+25 )
										  	.style("font-size" , "12px" )
										  	.style("stroke" , "none" )
										  	.style("stroke" , function(d,i){
											  	if ( dvc.config.vars.groups.length > 1 ){ return dvc.color; }
											  	else { return dvc.config.vars.singleColor; }
										  	})
										  	.attr("text-anchor" , "middle")
										  	.text(xValue.toFixed(1));


									}// end if ...
							  	})
							  	.on("mouseout",  function(d,i){
								  
								  
								  	// modify CSS display of all mouse over refernece items
								  	d3.selectAll(".referenceItems").style("display" , "none" );
								  

								  	// if no group has been selected
								  	if ( dvc.booleanButtons.indexOf(true) == -1 ) {
						  
									  	
								  		// select all circles from FULL set. Modify CSS accordingly
									  	d3.selectAll(".circles")
										  	.attr("class" , function(d,i){ return "circles " + d.group; })
										  	.style( "fill" , function ( d , i ) {
												var index = dvc.config.vars.groups.indexOf(d.group);
											  	return dvc.config.vars.grpColorArray[index];
										 	})
										  	.style( "stroke" , function ( d , i ) {
											  	var index = dvc.config.vars.groups.indexOf(d.group);
											  	return dvc.config.vars.grpColorArray[index];
										  	})
										  	.style( "opacity" , 1.00 )
										  	.style( "fill-opacity" , 0.50 );


								  	}// end if ..
								  	else {
									  

										// modify CSS attribution accordingly; grey out all dots in display
									  	d3.selectAll('.circles').attr("class" , function(d,i){ return "circles disabled " + d.group; }).style( "stroke" , "solid" ).style( "stroke" , "#666" ).style( "fill" , "#666" ).style( "opacity" , 0.15 ).style("pointer-events" , "none");
											
										// determine index of group selected, and thus group-specific color to use		  
									  	var index = dvc.config.vars.groups.indexOf(dvc.config.vars.groups[dvc.booleanButtons.indexOf(true)]);
									  	var color = dvc.config.vars.grpColorArray[index];
									  

									  	// highlight all dots in display in selected group					
									  	d3.selectAll('.circles' + '.' + dvc.config.vars.groups[dvc.booleanButtons.indexOf(true)]).attr("class" , "circles " + dvc.config.vars.groups[dvc.booleanButtons.indexOf(true)]).style( "stroke" , "solid" ).style( "stroke" , color ).style( "fill" , color ).style( "opacity" , 1.00 ).style( "fill-opacity" , 0.50 ).style("pointer-events" , "auto");
								  	

								  	}// end else ...
												

								  	// call function to remove D3 tooltip
								  	removeTooltip();


							  });// end definiton of voronoi layer		
			

			}// end if ... 
					

			// transition and redraw equality line based on new axis variables.						
			svg.selectAll('#equalityLine')
				.transition()
				.ease("linear")
				.duration(1000)
				.attr("clip-path", "url(#clip)")
				.attr( 'x1' , 0 )
				.attr( 'y1' , dvc.y1_value )
				.attr( 'x2' , dvc.max_max_VariableValue * dvc.xValIncrement )
				.attr( 'y2' , dvc.y2_value );
							
				
			// transition and redraw FULL DATA regression line
			svg.selectAll('#regressionLine')
				.transition()
				.ease("linear")
				.duration(1000)
				.attr("clip-path", "url(#clip)")
				.attr( 'x1' , 0 )
				.attr( 'y1' , y(dvc.yATminX) )
				.attr( 'x2' , ( [ dvc.xDomainArray[1] - dvc.xDomainArray[0] ] ) * dvc.xValIncrement )
				.attr( 'y2' , y(dvc.yATmaxX) );							


			// redraw tick grid lines extending from x-axis ticks on axis across scatter graph
			dvc.xticks = svg.selectAll('#focusXAxis').selectAll('.tick');					 
			dvc.xticks.append('svg:line')
				.attr( 'id' , "xAxisTicks" )
				.attr( 'y0' , 0 )
				.attr( 'y1' , -height )
				.attr( 'x1' , 0 )
				.attr( 'x2',  0 )
				.style("opacity" , 0.33);	
					
											
			// redraw tick grid lines extending from y-axis ticks on axis across scatter graph
			dvc.yticks = svg.selectAll('#focusYAxis').selectAll('.tick');					 
			dvc.yticks.append('svg:line')
				.attr( 'id' , "yAxisTicks" )
				.attr( 'y0' , 0 )
				.attr( 'y1' , 0 )
				.attr( 'x1' , 0 )
				.attr( 'x2', chart_width - margin.left - margin.right)
				.style("opacity" , 0.33);
			
			
			// set time out delay for redisplaying layer of temporary dots.
			// This prevents temporary dots moving visibly a short lag time after the main/FULL set
		    setTimeout(function() {
				d3.selectAll(".TEMPcircles").style("display" ,"inline");
			}, 1500);
		
	
			return;
			 
			 
		 }// end transitionData()
		 
					
			
			
			
		/*
			NAME: 			showTooltip
			DESCRIPTION: 	function used to display D3 style tooltip. Show the tooltip on the hovered over circle instead of the Voronoi grid
			CALLED FROM:	transitionData
							drawGraphic
			CALLS:			n/a	
			REQUIRES: 		d - data item 
							fid - ID of selected dot
							xVal - x-axis value of selected dot
							yVal - y-axis value of selected dot
							src - where has function been called from/what kind of voronoi layer is being moused over (FULL or TEMP)
			RETURNS: 		n/a
		*/
		function showTooltip(d, fid, xVal, yVal, src) {
									
							
			//Save the circle element (so not the voronoi which is triggering the hover event)
			//in a variable by using the unique class of the voronoi (CountryCode)
			var element;
			
			// store selected DOM element (i.e. selected dot) and perform string formatting depending whehter FULL or TEMP layer is accessed
			if ( src == "FULL" ) { element = d3.select("#" + dvc.selectedCircleID); }// end if 
			else if ( src == "TEMP" ) { element = d3.select("#" + dvc.selectedCircleID.replace("circle", "TEMPcircle")); }// end else if 
			else { }// end else 
		
				
			//Show the tooltip over the "element" variable (the circle) instead of "this"
			$(element).popover({
					placement: 'auto top',
					container: '#graphic',
					id:"toolTip",
					trigger: 'manual',
					html : true,
					content: function() { return "<span style='font-size: 14px; text-align: center;'><b>" + d.name + " (" + d.code + ")</b></br>" + (d.value.toFixed(1)) + " units </span>"; }
			});
			$(element).popover('show');
			
			
//			if ( isFirefox == true ) { 
//			
//				//console.log("isFirefox == true");
//				
//				//Show the tooltip over the "element" variable (the circle) instead of "this"
//				$(element).popover({
//						placement: 'left',
//						container: '#graphic',
//						id:"toolTip",
//						trigger: 'manual',
//						html : true,
//						content: function() { return "<span style='font-size: 14px; text-align: center;'><b>" + d.name + " (" + d.code + ")</b></br>" + (d.value.toFixed(1)) + " units </span>"; }
//				});
//				
//				d3.select("#toolTip").style("position" , "absolute").style("top" , dvc.mouseYcoordforFF + "px").style("left" , dvc.mouseXcoordforFF + "px");
//				$("#toolTip").prop("position" , "absolute").prop("top" , dvc.mouseYcoordforFF + "px").prop("left" , dvc.mouseXcoordforFF + "px");
//			}
			

			return;

			
		}//end function showTooltip
		 
					
			
			
			
		/*
			NAME: 			removeTooltip
			DESCRIPTION: 	function used to hide D3 style tooltip. Hide the tooltip when the mouse moves away
			CALLED FROM:	transitionData
							drawGraphic
			CALLS:			n/a	
			REQUIRES: 		n/a
			RETURNS: 		n/a
		*/
		function removeTooltip() {

			
			$('.popover').each(function() { $(this).remove(); });


			return;

		}//function removeTooltip
		 
					
			
			
			
		/*
			NAME: 			getState
			DESCRIPTION: 	function used to handle use of checkeboxes.
			CALLED FROM:	transitionData
							drawGraphic
			CALLS:			n/a	
			REQUIRES: 		fid - ID of selected checkbox
			RETURNS: 		n/a
		*/
		function getState(fid){
			

			// if equality line check box has been selected
			if ( fid == "equality" ){				


				// if current state is false/off
				if ( dvc.boolEqualityLine == false ){


					// display line and update current state to true/on
					d3.select("#equalityLine").style("display" , "inline");
					dvc.boolEqualityLine = true;


				}// end if ... 
				else {


					// hide line and update current state to false/off
					d3.select("#equalityLine").style("display" , "none");
					dvc.boolEqualityLine = false;


				}// end if ...


			}// end if ...
			

			// else if regression line check box has been selected
			else if ( fid == "regression" ){				


				if ( dvc.boolRegressionLine == false ){


					// display line and update current state to true/on
					d3.select("#regressionLine").style("display" , "inline");
					dvc.boolRegressionLine = true;


				}// end if...
				else {


					// hide line and update current state to false/off
					d3.select("#regressionLine").style("display" , "none");
					dvc.boolRegressionLine = false;


				}// end else ..


			}// end else if 


			else {}

			
			return;

			
		}// enf function getState()
		 
		
						
									
		
		//then, onload, check to see if the web browser can handle 'inline svg'
		if (Modernizr.inlinesvg)
		{
			
			
			// open and load configuration file. 					
			d3.json("data/config.json", function(error, json)
			{	
			
									
				// stroe read in json data from config file as as global dvc. variable ...	
				dvc.config = json;	
				
				
				// call functionm to draw initial UI on load.
				buildUI();
				
						
				// initialise all variables for onLoad scenario
				// x-Axis variables ...initialises to first element of "variables" array in config file 
				dvc.selectedXVariable = "var0";
				dvc.selectedXVariableIndex = dvc.config.vars.variables.indexOf(dvc.selectedXVariable);
				dvc.selectedXUnits = "Unit0";	
				
	
				// y-Axis variables ...initialises to first element of "variables" array in config file 
				dvc.selectedYVariable = "var1";
				dvc.selectedYVariableIndex = dvc.config.vars.variables.indexOf(dvc.selectedYVariable);
				dvc.selectedYUnits = "Unit1";	
				
	
				// axis limit selection variable ...initialises to first element of "axisLimits" array in config file 
				dvc.selectedAxisLimitVariable = "Fixed";	
				dvc.limitTypeIndex = dvc.config.vars.axisLimits.indexOf(dvc.selectedAxisLimitVariable);
				
	
				// axis limit selection variable ...initialises to first element of "groups" array in config file 
				dvc.selectedGroup =  "Show all";
				dvc.selectedGroupIndex = dvc.config.vars.groups.indexOf(dvc.selectedGroup);	
				
				
				// initialise array to define which buttons/selction list group option is selected during interaction.
				dvc.booleanButtons = [];				
				dvc.config.vars.groups.forEach(function(d,i){ dvc.booleanButtons[i] = false; })
				
				
				// initialise boolean vars relating to equality and regression lines
				dvc.boolEqualityLine = false;
				dvc.boolRegressionLine = false;
													
				
				//load chart data
				d3.csv(dvc.config.essential.graphic_data_url, function(error, data) {


					graphic_data = data;													
					pymChild = new pym.Child({renderCallback: drawGraphic});


				})// end data load
				

			})// end 
			
		
		} // end if ... 
		else {
			

			//use pym to create iframe containing fallback image (which is set as default)
			pymChild = new pym.Child();
			if (pymChild) { pymChild.sendHeight(); }
		

		}	