/*

 Copyright (C) 2013  AoPS Incorporated  aops@aops.com
 Copyright (C) 2011  Brad Miller  bonelake@gmail.com

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 */
 
 var defaultValues = {};
 var lineNumberFlags = {};
 var readOnlyFlags = {};
		
		// object that stored the various code windows
		var myCodeMirror = {};

		$( window ).load( function () {
			var codesources = document.getElementsByClassName("active_code");
			for (var i=0;i<codesources.length;i++) {
			    codesource = codesources[i];
				myCodeMirror[codesource.id] = CodeMirror.fromTextArea(codesource, {
				    mode : {
				        name : 'python',
				        version: 3,
				        singleLineStringErrors: false
				    },
				    theme : 'default',
					indentUnit : 4,
					matchBrackets : true,
					lineNumbers : lineNumberFlags[codesource.id],
					readOnly: readOnlyFlags[codesource.id],
					styleActiveLine : !readOnlyFlags[codesource.id]
				});
				
				defaultValues[codesource.id] = myCodeMirror[codesource.id].getValue();				

				$('.pywindow').click(function( event ) {
					event.stopPropagation();
				});

			}
		});
		
		function addCodeSource(codesource) {
				myCodeMirror[codesource.id] = CodeMirror.fromTextArea(codesource, {
				    mode : {
				        name : 'python',
				        version: 3,
				        singleLineStringErrors: false
				    },
				    theme : 'default',
					indentUnit : 4,
					matchBrackets : true,
					lineNumbers : lineNumberFlags[codesource.id],
					readOnly: readOnlyFlags[codesource.id],
					styleActiveLine : !readOnlyFlags[codesource.id]
				});
				
				defaultValues[codesource.id] = myCodeMirror[codesource.id].getValue();
// 				console.log(defaultValues);

				$('.pywindow').click(function( event ) {
					event.stopPropagation();
				});

				myCodeMirror[codesource.id].focused = true;
				console.log(myCodeMirror[codesource.id].display.measure.children.length);
// 				if (myCodeMirror[codesource.id].display.measure.children.length) {
// 					myCodeMirror[codesource.id].refresh();
// 					var refreshCount = 50;
// 					setTimeout(function () {
// 						revealCodeMirrorCode(codesource, refreshCount);
// 					}, 1000);
// 				}
		};
		
// 		function revealCodeMirrorCode (codesource, refreshCount) {
// 			myCodeMirror[codesource.id].refresh();
// 			if (myCodeMirror[codesource.id].display.measure.children.length && refreshCount > 0) {
// 				refreshCount -= 1;
// 				setTimeout(function () {
// 					revealCodeMirrorCode(codesource, refreshCount);
// 				}, 250);
// 			}
// 
// 		};
		

		// Here's everything you need to run a python program in skulpt
		// grab the code from your textarea
		// get a reference to your pre element for output
		// configure the output function
		// call Sk.importMainWithBody()
		function runit(insource,outpre,outerror,outcanvas) { 
			console.log('made it to the function runit');
// 			console.log(myCodeMirror);
// 			console.log(insource);
		   myCodeMirror[insource].save();
		   if (Sk && Sk.tg && Sk.tg.canvasLib) {
			   for (var oneCanvas in Sk.tg.canvasLib) {
				   if (Sk.tg.canvasLib[oneCanvas].intervalId) {
					   clearInterval(Sk.tg.canvasLib[oneCanvas].intervalId);
				   }
			   }
		   }
//		   console.log(outcanvas);
		   var outcanvaselement = document.getElementById(outcanvas);
		   outcanvaselement.width = outcanvaselement.width;
		   outcanvaselement.style.backgroundColor = '';
// 		   outcanvaselement.style.display = '';
		   var prog = document.getElementById(insource).value;
		   prog = prog.replace(/\//g, "*1.0/");
		   prog = prog.replace(/\*1.0\/\*1.0\//g, "//");
		   prog = prog.replace(/\*1.0\/=/g, "/=1.0*");
		   prog = prog.replace(/\n.+\.mainloop\(\)/gi, "");
		   // prog = prog.replace(/hi/gi, "    t.color(blue)");
		   var mypre = document.getElementById(outpre); 
		   var eContainer = document.getElementById(outerror); 
		   mypre.innerHTML = ''; 
		   eContainer.innerHTML = ''; 
		   if (outcanvas) Sk.canvas = outcanvas;
		   Sk.pre = outpre;
	       // set execLimit in milliseconds  -- for student projects set this to
	       // 25 seconds -- just less than Chrome's own timer.
	       Sk.execLimit = 25000;
	       Sk.configure({
	       		output: function(text) {
	       			var mypre = document.getElementById(outpre);
	       			mypre.innerHTML = mypre.innerHTML + text;
	       		},
	       		read: function(x) {
					if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
							throw "File not found: '" + x + "'";
					return Sk.builtinFiles["files"][x];
				}	  
           });
//		   Sk.configure({output:outf, read:builtinRead}); 
		   try {
			   Sk.importMainWithBody("<stdin>",false,prog); 
		   } catch (e) {
			   addErrorMessage(e,outerror);
		   }
		}

		// defaultValue is a string that you want the input box to revert to.
		// You run the code print("") in order to clear the outputs and error log.
		function resetit(insource,outpre,outerror,outcanvas) { 
			if (Sk && Sk.tg && Sk.tg.canvasLib) {
				for (var oneCanvas in Sk.tg.canvasLib) {
					if (Sk.tg.canvasLib[oneCanvas].intervalId) {
						clearInterval(Sk.tg.canvasLib[oneCanvas].intervalId);
					}
				}
			}
			var defaultValue = defaultValues[insource];
		   	myCodeMirror[insource].setValue('print("")');
			runit(insource,outpre,outerror,outcanvas);
		   	myCodeMirror[insource].setValue(defaultValue);
		    var outcanvaselement = document.getElementById(outcanvas);
		    if (outcanvaselement) {
		    	outcanvaselement.style.display = 'none';
		    }
		}
		
		function addErrorMessage(err,outerror) {
		    var errHead = $('<h3>').html('Error');
		    var eContainer = document.getElementById(outerror);
			console.log(eContainer);
		    eContainer.className = 'error alert alert-danger';
		    eContainer.appendChild(errHead[0]);
		    var errText = eContainer.appendChild(document.createElement('pre'))
		    var errString = err.toString();
		    var to = errString.indexOf(":");
		    var errName = errString.substring(0, to);
		    errText.innerHTML = errString;
		    $(eContainer).append('<h3>Description</h3>');
		    var errDesc = eContainer.appendChild(document.createElement('p'));
		    errDesc.innerHTML = errorText[errName];
		    $(eContainer).append('<h3>To Fix</h3>');
		    var errFix = eContainer.appendChild(document.createElement('p'));
		    errFix.innerHTML = errorText[errName + 'Fix'];
		    var moreInfo = '../ErrorHelp/' + errName.toLowerCase() + '.html';
			console.log(eContainer);
		}

		var errorText = {};

		errorText.ParseError = "A parse error means that Python does not understand the syntax on the line the error message points out.  Common examples are forgetting commas beteween arguments or forgetting a : on a for statement";
		errorText.ParseErrorFix = "To fix a parse error you just need to look carefully at the line with the error and possibly the line before it.  Make sure it conforms to all of Python's rules.";
		errorText.TypeError = "Type errors most often occur when an expression tries to combine two objects with types that should not be combined.  Like raising a string to a power";
		errorText.TypeErrorFix = "To fix a type error you will most likely need to trace through your code and make sure the variables have the types you expect them to have.  It may be helpful to print out each variable along the way to be sure its value is what you think it should be.";
		errorText.NameError = "A name error almost always means that you have used a variable before it has a value.  Often this may be a simple typo, so check the spelling carefully.";
		errorText.NameErrorFix = "Check the right hand side of assignment statements and your function calls, this is the most likely place for a NameError to be found.";
		errorText.ValueError = "A ValueError most often occurs when you pass a parameter to a function and the function is expecting one type and you pass another.";
		errorText.ValueErrorFix = "The error message gives you a pretty good hint about the name of the function as well as the value that is incorrect.  Look at the error message closely and then trace back to the variable containing the problematic value.";
		errorText.AttributeError = "This error message is telling you that the object on the left hand side of the dot, does not have the attribute or method on the right hand side.";
		errorText.AttributeErrorFix = "The most common variant of this message is that the object undefined does not have attribute X.  This tells you that the object on the left hand side of the dot is not what you think. Trace the variable back and print it out in various places until you discover where it becomes undefined.  Otherwise check the attribute on the right hand side of the dot for a typo.";
		errorText.TokenError = "Most of the time this error indicates that you have forgotten a right parenthesis or have forgotten to close a pair of quotes.";
		errorText.TokenErrorFix = "Check each line of your program and make sure that your parenthesis are balanced.";
		errorText.TimeLimitError = "Your program is running too long.  Most programs in this book should run in less than 10 seconds easily. This probably indicates your program is in an infinite loop.";
		errorText.TimeLimitErrorFix = "Add some print statements to figure out if your program is in an infinte loop.  If it is not you can increase the run time with sys.setExecutionLimit(msecs)";
		errorText.Error = "Your program is running for too long.  Most programs in this book should run in less than 30 seconds easily. This probably indicates your program is in an infinite loop.";
		errorText.ErrorFix = "Add some print statements to figure out if your program is in an infinte loop.  If it is not you can increase the run time with sys.setExecutionLimit(msecs)";
		errorText.SyntaxError = "This message indicates that Python can't figure out the syntax of a particular statement.  Some examples are assigning to a literal, or a function call";
		errorText.SyntaxErrorFix = "Check your assignment statments and make sure that the left hand side of the assignment is a variable, not a literal or a function.";
		errorText.IndexError = "This message means that you are trying to index past the end of a string or a list.  For example if your list has 3 things in it and you try to access the item at position 3 or more.";
		errorText.IndexErrorFix = "Remember that the first item in a list or string is at index position 0, quite often this message comes about because you are off by one.  Remember in a list of length 3 the last legal index is 2";
		errorText.URIError = "";
		errorText.URIErrorFix = "";
		errorText.ImportError = "This error message indicates that you are trying to import a module that does not exist";
		errorText.ImportErrorFix = "One problem may simply be that you have a typo.  It may also be that you are trying to import a module that exists in 'real' Python, but does not exist in this book.  If this is the case, please submit a feature request to have the module added.";
		errorText.ReferenceError = "This is most likely an internal error, particularly if the message references the console.";
		errorText.ReferenceErrorFix = "Try refreshing the webpage, and if the error continues, submit a bug report along with your code";
		errorText.ZeroDivisionError = "This tells you that you are trying to divide by 0. Typically this is because the value of the variable in the denominator of a division expression has the value 0";
		errorText.ZeroDivisionErrorFix = "You may need to protect against dividing by 0 with an if statment, or you may need to rexamine your assumptions about the legal values of variables, it could be an earlier statment that is unexpectedly assigning a value of zero to the variable in question.";
		errorText.RangeError = "This message almost always shows up in the form of Maximum call stack size exceeded.";
		errorText.RangeErrorFix = "This always occurs when a function calls itself.  Its pretty likely that you are not doing this on purpose. Except in the chapter on recursion.  If you are in that chapter then its likely you haven't identified a good base case.";
		errorText.InternalError = "An Internal error may mean that you've triggered a bug in our Python";
		errorText.InternalErrorFix = "Report this error, along with your code as a bug.";
		errorText.IndentationError = "This error occurs when you have not indented your code properly.  This is most likely to happen as part of an if, for, while or def statement.";
		errorText.IndentationErrorFix = "Check your if, def, for, and while statements to be sure the lines are properly indented beneath them.  Another source of this error comes from copying and pasting code where you have accidentally left some bits of code lying around that don't belong there anymore.";
		errorText.NotImplementedError = "This error occurs when you try to use a builtin function of Python that has not been implemented in this in-browser version of Python.";
		errorText.NotImplementedErrorFix = "For now the only way to fix this is to not use the function.  There may be workarounds.  If you really need this builtin function then file a bug report and tell us how you are trying to use the function.";
