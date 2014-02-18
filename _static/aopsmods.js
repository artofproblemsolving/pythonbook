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

var pythonTool = {
	defaultValues : {},
	lineNumberFlags : {},
	readOnlyFlags : {},
	myCodeMirror : {},
	errorText : {},
	defaultOutputHeights : {},
	
	addCodeSource : function (codesource) {
		pythonTool.myCodeMirror[codesource.id] = CodeMirror.fromTextArea(codesource, {
			mode : {
				name : 'python',
				version: 3,
				singleLineStringErrors: false
			},
			theme : 'default',
			indentUnit : 4,
			matchBrackets : true,
			lineNumbers : pythonTool.lineNumberFlags[codesource.id],
			readOnly: pythonTool.readOnlyFlags[codesource.id] ? 'nocursor' : false,
			styleActiveLine : !pythonTool.readOnlyFlags[codesource.id]
		});
		
		pythonTool.defaultValues[codesource.id] = pythonTool.myCodeMirror[codesource.id].getValue();
		var divId = codesource.id.slice(0,-5);
// 		console.log(pythonTool.defaultValues[codesource.id]);
		if ( $('#'+divId+'.pywindow').parent('.preview').length > 0 ) {
			$('#'+divId+'.pywindow button').click(function( event ) {
				event.stopPropagation();
			});
		} else {
			$('#'+divId+'.pywindow').click(function( event ) {
				event.stopPropagation();
			});
		}
		
		var $outPreElement = $('#'+divId+'.pywindow .active_out');
		$outPreElement.hide();
		
		// Don't forget mouseup after mouseleave as well.
// 		$outPreElement.mouseleave(function (e) {
// 			console.log('asdf');
// 			console.log(e);
// 			var currentHeight = $outPreElement.height();
// // 			var currentScrollTop = $outPreElement.scrollTop();
// // 			$outPreElement.height($outPreElement[0].style.min-height);
// // 			$outPreElement.mousemove();
// // 			$outPreElement.scrollTop(0);
// // 			$outPreElement.scrollTop(currentScrollTop);
// 			$outPreElement.height('auto');
// 			var contentHeight = $outPreElement.height();
// 			$outPreElement.height(currentHeight);
// 			console.log(currentHeight);
// 			console.log(contentHeight);
// 			if (currentHeight != contentHeight && contentHeight > 150) {
// 				console.log('made it in');
// 				pythonTool.defaultOutputHeights[codesource.id] = currentHeight;
// 			} else if (contentHeight <= 150) {
// 				pythonTool.defaultOutputHeights[codesource.id] = void 0;
// 			}
// 		});
		
// 		pythonTool.myCodeMirror[codesource.id].focused = true;
// 		if (myCodeMirror[codesource.id].display.measure.children.length) {
// 			myCodeMirror[codesource.id].refresh();
// 			var refreshCount = 50;
// 			setTimeout(function () {
// 				revealCodeMirrorCode(codesource, refreshCount);
// 			}, 1000);
// 		}
	},
	
// 	revealCodeMirrorCode : function (codesource, refreshCount) {
// 		pythonTool.myCodeMirror[codesource.id].refresh();
// 		if (pythonTool.myCodeMirror[codesource.id].display.measure.children.length && refreshCount > 0) {
// 			refreshCount -= 1;
// 			setTimeout(function () {
// 				pythonTool.revealCodeMirrorCode(codesource, refreshCount);
// 			}, 250);
// 		}
// 	},

	// Here's everything you need to run a python program in skulpt
	// grab the code from your textarea
	// get a reference to your pre element for output
	// configure the output function
	// call Sk.importMainWithBody()
	runit : function (insource,outpre,outerror,outcanvas) {
		if (Sk && Sk.builtin.file && !Sk.builtin.file.aopsmods) {
			pythonTool.modifySkulptIO();
		}

		// If the function is run with one argument, calculate the ids of the input and output elements.
		if (!outpre) {
			outpre = insource + '_pre';
			outerror = insource + '_error';
			outcanvas = insource + '_canvas';
			insource = insource + '_code';
		}
		
		Sk.builtin.file.prototype.pywindowId = insource.slice(0, -5);
	
		// Transfer the user's code from the CodeMirror to the textarea
		pythonTool.myCodeMirror[insource].save();
	
		// If there is a program already running, stop it by clearing the interval.
		if (Sk && Sk.tg && Sk.tg.canvasLib) {
		   for (var oneCanvas in Sk.tg.canvasLib) {
			   if (Sk.tg.canvasLib[oneCanvas].intervalId) {
				   clearInterval(Sk.tg.canvasLib[oneCanvas].intervalId);
			   }
		   }
		}
	
		// Clear all of the outputs
		var outCanvasElement = document.getElementById(outcanvas);
		outCanvasElement.width = outCanvasElement.width;
		outCanvasElement.style.backgroundColor = '';
		outCanvasElement.style.display = 'none';
		
		var outErrorElement = document.getElementById(outerror); 
		outErrorElement.innerHTML = '';
		outErrorElement.style.display = 'none';
		
// 		var outPreElement = document.getElementById(outpre); 
// 		outPreElement.style.display = 'block';
// 		outPreElement.innerHTML = ''; 
		$mypre = $('#'+outpre);
		var oldOutText = $mypre.text();
		Sk.myOldHeight = $mypre.height();
		$mypre.height('auto');
		if (!oldOutText || oldOutText[0] !== '>') {
			Sk.myOldHeight = 'auto';
			// Overwrite anything that was in the empty shell
			$mypre.text('>>> ====================== OUTPUT ======================\n');
			Sk.myOldScrollHeight = 0;
		} else {
			Sk.myOldScrollHeight = $mypre.height();
			$mypre.height(Sk.myOldHeight);
// 			$('#'+outpre).text(oldOutText + '\n>>> ====================== OUTPUT ======================\n');
			Sk.builtins.print3('\n>>> ====================== OUTPUT ======================');
		}
		$mypre.show();
		
		// Deal with issues arising with Python 2 vs Python 3: / vs //
		// It turns out that skulpt has an option for this in Sk.configure,
		//   so I took out the regexs below.
		var prog = document.getElementById(insource).value;
// 		prog = prog.replace(/\//g, "*1.0/");
// 		prog = prog.replace(/\*1.0\/\*1.0\//g, "//");
// 		prog = prog.replace(/\*1.0\/=/g, "/=1.0*");
		prog = prog.replace(/\n.+\.mainloop\(\)/gi, "");
		prog = prog.replace(/^(\s*print)/igm, "$1" + "3");
		prog = prog.replace(/^(\s*print3\s*\(.*?)(,\s*end\s*=)(.*?\)\s*$)/igm, '$1,"endfix="$3');
		prog = prog.replace(/^(\s*print3\s*\(.*?)(,\s*end\s*=)(.*?\)\s*$)/igm, '$1,"endfix="$3');
		prog = prog.replace(/^(\s*print3\s*\(.*?)(,\s*sep\s*=)(.*?\)\s*$)/igm, '$1,"sepfix="$3');
		prog = prog.replace(/^(\s*print3\s*\(.*?)(,\s*sep\s*=)(.*?\)\s*$)/igm, '$1,"sepfix="$3');
		
// 		prog = prog.replace(/^(\s*print)\s*\((.*?)()(.*?)\)\s*$/igm, "$1" + "3(" + "$2" + ")\n");
// // 		prog = prog.replace(/(\n\s*print)\s*\((.*?)\)\s*\n/ig, "$1" + "3(" + "$2" + ")\n");
// 		prog = prog.replace(/^(print)\s*\((.*?)\)\s*\n/ig, "$1" + "3(" + "$2".replace(/,\s*end\s*=/gi, ',"endfix="').replace(/,\s*sep\s*=/gi, ',"sepfix="') + ")\n");
// 		prog = prog.replace(/^(print)\s*\((.*?)\)\s*$/ig, "$1" + "3(" + "$2".replace(/,\s*end\s*=/gi, ',"endfix="').replace(/,\s*sep\s*=/gi, ',"sepfix="') + ")");
// 		prog = prog.replace(/(?=^print3)\s*\((.*?)\)\s*$/ig, "$1" + "3(" + "$2".replace(/,\s*end\s*=/gi, ',"endfix="').replace(/,\s*sep\s*=/gi, ',"sepfix="') + ")");
// 		console.log(prog);
		
		// Tell Skulpt what the output element ids are.
		// Skulpt doesn't know about the error output element, so we add that manually later.
		if (outCanvasElement) Sk.canvas = outcanvas;
		Sk.pre = outpre;
		Sk.codeId = insource;
		
// 		console.log(Sk);
		// Set execLimit in milliseconds  -- for student projects set this to
		// 25 seconds -- just less than Chrome's own timer.
		Sk.execLimit = 25000;
		Sk.configure({
			output: function(text) {
// 				var mypre = document.getElementById(Sk.pre);
// 				var $mypre = $('#'+Sk.pre);
				$mypre.text($mypre.text() + text);
// 				mypre.innerHTML = mypre.innerHTML + text;
			},
			read: function(x) {
				console.log(Sk.builtinFiles);
				console.log(Sk.builtinFiles["files"]);
				if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
					throw "File not found: '" + x + "'";
				}
				return Sk.builtinFiles["files"][x];
			},
			python3: true
		});
// 		Sk.configure({output:builtinOutput, read:builtinRead}); 
		try {
			Sk.importMainWithBody("<stdin>",false,prog); 
		} catch (e) {
			pythonTool.addErrorMessage(e,outerror);
			outErrorElement.style.display = 'block';
		}
	},
	
	// defaultValue is a string that you want the input box to revert to.
	// You run the code print("") in order to clear the outputs and error log.
	resetit : function (insource,outpre,outerror,outcanvas) { 
		if (!outpre) {
			outpre = insource + '_pre';
			outerror = insource + '_error';
			outcanvas = insource + '_canvas';
			insource = insource + '_code';
		}
		if (Sk && Sk.tg && Sk.tg.canvasLib) {
			for (var oneCanvas in Sk.tg.canvasLib) {
				if (Sk.tg.canvasLib[oneCanvas].intervalId) {
					clearInterval(Sk.tg.canvasLib[oneCanvas].intervalId);
				}
			}
		}
		var defaultValue = pythonTool.defaultValues[insource];
		pythonTool.myCodeMirror[insource].setValue('print("")');
		pythonTool.runit(insource,outpre,outerror,outcanvas);
		pythonTool.myCodeMirror[insource].setValue(defaultValue);
		var outCanvasElement = document.getElementById(outcanvas);
		if (outCanvasElement) {
			outCanvasElement.style.display = 'none';
		}
		var outPreElement = document.getElementById(outpre);
		if (outPreElement) {
			outPreElement.innerHTML = ''; 
			outPreElement.style.display = 'none';
		}
		var outErrorElement = document.getElementById(outerror);
		if (outErrorElement) {
			outErrorElement.style.display = 'none';
		}
	},

	addErrorMessage : function (err,outerror) {
		var errHead = $('<h3>').html('Error');
		var eContainer = document.getElementById(outerror);
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
	},
	
	modifySkulptIO : function () {
		var oldPrototype = Sk.builtin.file.prototype;
		Sk.builtin.file = function (name, mode, buffering) {
			this.pywindowId = oldPrototype.pywindowId;
			if (!this.pywindowId) this.pywindowId = '';
			if (mode.v.indexOf('r') !== 0 && 
					mode.v.indexOf('w') !== 0 && 
					mode.v.indexOf('a') !== 0) {
				throw new Sk.builtin.ValueError("mode string must begin with one of 'r', 'w', 'a'");
			}
			
			this.mode = mode;
			this.name = name;
			this.closed = false;
			
			if ( Sk.inBrowser ) {
				// Add more options here for how to read.v;
				this.escapedId = name.v.replace(/\./, '\\.');
				console.log(this.pywindowId + '_files textarea.'+this.escapedId);
				// Shouldn't need .first()
				this.$elem = $('#' + this.pywindowId + '_files textarea.'+this.escapedId).first();
				console.log(this.$elem);
				if ( this.$elem == null || this.$elem.length == 0) {
					if (mode.v.indexOf('w') === 0 || mode.v.indexOf('a') === 0) {
						this.$elem = $('<textarea>').addClass(name.v);
						this.data$ = '';
						$('#' + this.pywindowId + '_files').append(this.$elem);
					} else {
						throw new Sk.builtin.FileNotFoundError("[Errno 2] No such file or directory: '"+name.v+"'");
					}
				} else if (mode.v.indexOf('w') === 0) {
					this.data$ = '';
					this.$elem.html('');
				} else {
					this.data$ = this.$elem.text();
				}
			} else {
				this.data$ = Sk.read(name.v);
			}
			this.lineList = this.data$.split("\n");
			var lastIndex = this.lineList.length-1;
			if (this.lineList[lastIndex] == '') {
				this.lineList = this.lineList.slice(0,-1);
				for(var i in this.lineList) {
					this.lineList[i] = this.lineList[i]+'\n';
				}
			} else {
				for(var i in this.lineList) {
					this.lineList[i] = this.lineList[i]+'\n';
				}
				this.lineList[lastIndex] = this.lineList[lastIndex].replace('\n','');
			}
			this.currentLine = 0;
			this.pos$ = 0;

			this.__class__ = Sk.builtin.file;
			
			console.log(this.data$);

			return this;

		}
		Sk.builtin.file.aopsmods = true;
		Sk.builtin.file.prototype = oldPrototype;
		Sk.builtin.file.prototype['write'] = new Sk.builtin.func(function(self, str) {
			if (self.mode.v.indexOf('w') !== 0 && self.mode.v.indexOf('a') !== 0 && self.mode.v.indexOf('+') == -1) {
				throw new Sk.builtin.IOError("File not open for writing");
			}
			if (self.mode.v.indexOf('a') === 0) {
				self.pos$ = self.data$.length;
			}
			var firstPart = self.data$.slice(0,self.pos$);
			self.pos$ += str.v.length;
			var secondPart = self.data$.slice(self.pos$);
			self.data$ = firstPart + str.v + secondPart;
			self.$elem.text(self.data$); // likely issues with new lines, etc.
		});
		Sk.builtin.file.prototype['seek'] = new Sk.builtin.func(function(self, offset, whence) {
			if (whence === undefined ) whence = 0;
			if (whence == 0) {
				self.pos$ = offset.v;
			} else if (whence == 1) {
				self.pos$ = self.pos$ + offset.v;
			} else if (whence == 2) {
				self.pos$ = self.data$.length + offset.v;
			} else {
				throw new Sk.builtin.IOError("[Errno 22] Invalid argument");
			}
			if (self.pos$ < 0) self.pos = 0;
			if (self.pos$ > self.data$.length) self.pos$ = self.data$.length;
		});
		
		Sk.builtin.file.prototype['read'] = new Sk.builtin.func(function(self, size) {
			if (self.mode.v.indexOf('r') !== 0 && self.mode.v.indexOf('+') == -1) {
				throw new Sk.builtin.IOError("UnsupportedOperation: not readable");
			}
			if (self.closed) throw new Sk.builtin.ValueError("I/O operation on closed file");
			console.log(self.data$);
			console.log(self);
			var len = self.data$.length;
			if (size === void 0 || size.v === void 0) size = new Sk.builtin.int_(len);
			var ret = new Sk.builtin.str(self.data$.substr(self.pos$, size.v));
			self.pos$ += size.v;
			if (self.pos$ >= len) self.pos$ = len;
			console.log(ret);
			return ret;
		});

		Sk.builtin.file.prototype['readline'] = new Sk.builtin.func(function(self, size) {
			if (self.mode.v.indexOf('r') !== 0 && self.mode.v.indexOf('+') == -1) {
				throw new Sk.builtin.IOError("UnsupportedOperation: not readable");
			}
			if (self.closed) throw new Sk.builtin.ValueError("I/O operation on closed file");
			var line = "";
			if (self.currentLine < self.lineList.length) {
				line = self.lineList[self.currentLine];
				self.currentLine++;
			}
			return new Sk.builtin.str(line);
		});

		Sk.builtin.file.prototype['readlines'] = new Sk.builtin.func(function(self, sizehint) {
			if (self.mode.v.indexOf('r') !== 0 && self.mode.v.indexOf('+') == -1) {
				throw new Sk.builtin.IOError("UnsupportedOperation: not readable");
			}
			if (self.closed) throw new Sk.builtin.ValueError("I/O operation on closed file");
			var arr = [];
			for(var i = self.currentLine; i < self.lineList.length; i++) {
				arr.push(new Sk.builtin.str(self.lineList[i]));
			}
			return new Sk.builtin.list(arr);
		});
		
		Sk.builtin.dict.prototype['copy'] = new Sk.builtin.func(function(self) {
			var ret = [];
			
			for (var iter = self.tp$iter(), k = iter.tp$iternext();
					k !== undefined;
					k = iter.tp$iternext()) {
				var v = self.mp$subscript(k);
				if (v === undefined) {
					v = null;
				}
				ret.push(k);
				ret.push(v);
			}
			return new Sk.builtin.dict(ret);
		});
		
// 		Sk.builtin.pyCheckArgs = function (name, args, minargs, maxargs, kwargs, free) {
// 			var nargs = args.length;
// 			var msg = "";
// 			console.log(nargs);
// 			console.log(args);
// 
// 			if (maxargs === undefined) { maxargs = Infinity; }
// 			if (kwargs) { nargs -= 1; }
// 			if (free) { nargs -= 1; }
// 			if ((nargs < minargs) || (nargs > maxargs)) {
// 			if (minargs === maxargs) {
// 				msg = name + "() takes exactly " + minargs + " arguments";
// 			} else if (nargs < minargs) {
// 				msg = name + "() takes at least " + minargs + " arguments";
// 			} else {
// 				msg = name + "() takes at most " + maxargs + " arguments";
// 			}
// 			msg += " (" + nargs + " given)";
// 			throw new Sk.builtin.TypeError(msg);
// 			};
// 		};


		var print3 = function (a,b,c) {
// 			console.log('Printing!!!');
// 			console.log(arguments);
// 			Sk.builtin.pyCheckArgs("range", arguments, 1, 3);
// 			Sk.builtin.pyCheckType("start", "integer", Sk.builtin.checkInt(start));
			var $mypre = $('#'+Sk.pre);
			var endOfPrint = '\n';
			var endAltered = false;
			var sepOfPrint = ' ';
			var sepAltered = false;
			var recentScrollTop = $mypre.scrollTop();
			var recentOldHeight = $mypre.height();
// 			$mypre.height('auto');
// 			var recentOldScrollHeight = $mypre.height();

			var argsToPrint = [];
// 			args = Sk.misceval.arrayFromArguments(arguments);
			for (var i in arguments) {
				// check if it says "end=...", "sep=..."asdf.
				var thisStr = Sk.builtin.str(arguments[i]).v;
				if (thisStr.indexOf('endfix') == 0) {
					if (!endAltered) {
						endAltered = true;
						endOfPrint = thisStr.slice(7);
					} else {
						throw new Sk.builtin.SyntaxError("keyword argument repeated");
					}
				} else if (thisStr.indexOf('sepfix') == 0) {
					if (!sepAltered) {
						sepAltered = true;
						sepOfPrint = thisStr.slice(7);
					} else {
						throw new Sk.builtin.SyntaxError("keyword argument repeated");
					}
				} else {
// 					console.log(thisStr);
					argsToPrint.push(thisStr);
				}
			}
// 			console.log($mypre.text());
// 			console.log(argsToPrint);
			for (var i in argsToPrint) {
				// check that it is something to print.  Strings only? no, but what restrictions?  asdf.
// 				console.log(i);
// 				console.log(argsToPrint[i]);
				if (i == 0) {
					$mypre.text($mypre.text() + argsToPrint[i]);
				} else {
					$mypre.text($mypre.text() + sepOfPrint + argsToPrint[i]);
				}
			}
			$mypre.text($mypre.text() + endOfPrint);
			
// 			$mypre.css('height', 'auto');
			$mypre.height('auto');
			var myScrollHeight = $mypre.height();
// 			console.log(myScrollHeight);
// 			var defaultOutputHeight = pythonTool.defaultOutputHeights[Sk.codeId];
// 			if (!defaultOutputHeight || Sk.myOldScrollHeight) {
// 				defaultOutputHeight = 300;
// 				if (myScrollHeight-Sk.myOldScrollHeight > defaultOutputHeight) {
// 					defaultOutputHeight = myScrollHeight-Sk.myOldScrollHeight;
// 				}
// 				if (defaultOutputHeight > 500) defaultOutputHeight = 500;
// 				pythonTool.defaultOutputHeights[Sk.codeId] = defaultOutputHeight;
// 			}
			var newOutputHeight = myScrollHeight;
			var changeInScrollHeight = myScrollHeight - Sk.myOldScrollHeight;
// 			console.log(changeInScrollHeight);
			if (Sk.myOldHeight > myScrollHeight) {
				newOutputHeight = Sk.myOldHeight;
			} else if (Sk.myOldHeight >= 500) {
				newOutputHeight = Sk.myOldHeight;
			} else if (changeInScrollHeight < 300) {
				if (myScrollHeight < 300) {
					newOutputHeight = myScrollHeight;
				} else {
					newOutputHeight = 300;
				}
			} else if (changeInScrollHeight < 500) {
				newOutputHeight = changeInScrollHeight;
			} else {
				newOutputHeight = 500;
			}
					
// 			console.log(newOutputHeight);
			if (myScrollHeight > newOutputHeight) {
				$mypre.height(newOutputHeight);
				$mypre.scrollTop(recentScrollTop);
				$mypre.animate({scrollTop : myScrollHeight - newOutputHeight}, 10);
			} else {
				$mypre.scrollTop(0);
			}
		};
		
		Sk.builtins.print3 = print3;
		
// 		var skprint = function print() {
// 			console.log('Printing!!!');
// 			console.log(arguments);
// 			args = Sk.misceval.arrayFromArguments(arguments);
// 		};
// 		
// // 		Sk.builtins.print = Sk.builtin.print;
// 		Sk.builtins.print = skprint;
	}
	
	// add a callback function for text areas
	//  It responds to a "Save" button
	//  Set its textarea's html to the textarea's value.
	// Also, when adding the button and textarea, make the text area indicate when it is edited but unsaved.

}

$( window ).load( function () {
	var codesources = document.getElementsByClassName("active_code");
	for (var i=0;i<codesources.length;i++) {
		pythonTool.addCodeSource (codesources[i]);
	}
});


// Temporary way for entering errors.  Add them to the pythonTool object above.
var errorText = pythonTool.errorText;


// Add an IO error description
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


// var downloadFile = function(dataToDownload, fileName, fromButton) {
// 
// 	if (!dataToDownload) return;
// 	if (!fileName) {
// 		// look at database, and choose the next file name
// 	}
// 	var downloadLink = document.getElementById('downloadLink');
// 	var downloadButton = document.getElementById('downloadButton');
// 	var blobForFile = new Blob([JSON.stringify(dataToDownload, null, '\t')]);
// 
// 	window.URL = window.webkitURL || window.URL;
// 	
// 	var blobURL = window.URL.createObjectURL(blobForFile);
// 	downloadLink.href = blobURL;
// 	downloadLink.download = fileName;
// 	downloadButton.innerHTML = 'Click again to download problem';
// 	downloadLink.dataset.downloadurl = 'application/javascript : ' + fileName + ' : ' + blobURL;
// //  	downloadLink.draggable = true;
// //  	downloadLink.classlist.add('dragout');
// // 	downloadLink.addEventListener("dragstart", function (e) {
// //  	   e.dataTransfer.setData("DownloadURL", downloadLink.dataset.downloadurl);
// // 	});
// // 	downloadLink.addEventListener("dragend", function (e) {
// // // 		resetButtonAndURL();
// // 	});
// 	documentReadyForDownload = true;
// 
// };
// 
// var resetButtonAndURL = function () {
// 	var downloadLink = document.getElementById('downloadLink');
// 	var downloadButton = document.getElementById('downloadButton');
// 	downloadButton.innerHTML = 'Prepare Problem for Download';
// 	if (downloadLink && downloadLink.href) {
// 		setTimeout("window.URL.revokeObjectURL(document.getElementById('downloadLink').href)", 1500);
// 	}
// 	documentReadyForDownload = false;
// };
// 
// 
// var downloadButtonCallback = function (e) {
// 	if(documentReadyForDownload) {
// 	resetButtonAndURL();
// 		// do nothing?
// // 	} else if(documentBeingPrepared) {
// 		// actually do nothing
// 	} else {
//  		e.preventDefault();
// 		downloadFile(currentDrawing, 'testingTesting.js');
// 	}
// };
// 
// // Javascript can't write to a file. The best you'll be able to do is get 
// // Javascript to read and edit the XML then post that data to a server-side 
// // script to write to file.
// 
// 
// 
// var toggleEditMode = function(optionalSet) {
// 	//asdf
// 	var editModeButton = document.getElementById('editModeButton');
// 	if (optionalSet != undefined) {
// 		editMode = optionalSet;
// 	} else {
// 		editMode = !editMode;
// 	}
// 	if (editMode) {
// 		editModeButton.innerHTML = 'Turn Edit Mode Off';
// 	} else {
// 		editModeButton.innerHTML = 'Turn Edit Mode On';
// 	}
// };
// 
// var editButtonCallback = function (e) {
// 	var generatingArguments = document.getElementById('editableGeneratingArguments').value;
// 	console.log(generatingArguments);
// 	generatingArguments = JSON.parse(generatingArguments);
// 	console.log('before');
// 	currentDrawing.generatingFunction(generatingArguments);
// 	console.log('here');
// 	redraw();
// };
// 
