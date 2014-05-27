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
	uploadedFiles : {},
	originalFiles : {},
	compatibleBrowserTest : function () {
		try {
			var testObj = Object.create({}, { p: { value: 42 } });
		}
		catch (e) {
			return false;
		}
		return true;
	},
	bookLocation : '//www.artofproblemsolving.com/School/MyClasses/Grid/Books/Python/',
	
	addCodeSource : function (codesource, uploadedFilesArray, uploadedFilesErrorArray) {
		var divId = codesource.id.slice(0,-5);
		var $pywindowTextArea = $("#" + divId + "_code");
		$pywindowTextArea.html($pywindowTextArea.text().replace(/newlineEscape/gi, '\n'));
		var spaceRegExp = new RegExp(String.fromCharCode(160),"g");
		$pywindowTextArea.html($pywindowTextArea.text().replace(spaceRegExp, ' '));
		
		// find things like [uploadedFile="sherlock.txt"][/uploadedFile] and 
		//  [pyfile="hello.txt"]hello there![/pyfile].
		//
		// Add any [uploadedFile]s to uploadedFilesArray, and add any [pyfile]s
		//  to the dom.
		if (!uploadedFilesArray) {
		    uploadedFilesArray = [];
		} else {
		    for (var fileKey in uploadedFilesArray) {
		        originalFiles[uploadedFilesArray[fileKey]] = false;
		    }
		}
        var retvalFromFileParsing = pythonTool.parseFilesFromText($pywindowTextArea.text());
        $pywindowTextArea.text(retvalFromFileParsing[0]);
        uploadedFilesArray = uploadedFilesArray.concat(retvalFromFileParsing[1]);
        $('#' + divId + '_files').append(retvalFromFileParsing[2]);
        
		if (pythonTool.lineNumberFlags[divId + "_code"] === void 0) {
			pythonTool.lineNumberFlags[divId + "_code"] = true;
		}
		if (pythonTool.defaultValues[codesource.id] === 'temporary') {
			return;
		} else if ($('#'+divId+'.pywindow div.CodeMirror').length > 0) {
			$('#'+divId+'.pywindow div.CodeMirror').remove();
		}
		
		pythonTool.defaultValues[codesource.id] = 'temporary';
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
		
		// Do something with uploadedFilesErrorArray
//         console.log(uploadedFilesArray);
//         console.log(uploadedFilesErrorArray);
		pythonTool.constructCurrentFilesObject(divId, uploadedFilesArray);
		
		var thisRunButton = $('#' + divId + '_runb');
		//console.log(thisRunButton);
		//console.log(thisRunButton.off);
		if (thisRunButton.off) {
	        $('#' + divId + '_runb').off('click').click(function () {
	            pythonTool.runit(divId);
	        });
			//console.log(thisRunButton.data());
	        $('#' + divId + '_popb').off('click').click(function () {
	            pythonTool.popOut(divId);
                });
	        $('#' + divId + '_resetb').off('click').click(function () {
	            pythonTool.resetit(divId);
	        });			
		} else {
	        $('#' + divId + '_runb').unbind('click').click(function () {
	            pythonTool.runit(divId);
	        });
	        $('#' + divId + '_popb').unbind('click').click(function () {
	            pythonTool.popOut(divId);
                });
	        $('#' + divId + '_resetb').unbind('click').click(function () {
	            pythonTool.resetit(divId);
	        });
		}
//         pythonTool.myCodeMirror[codesource.id].getValue();
        pythonTool.defaultValues[codesource.id] = pythonTool.getTextWithFiles(divId);
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
		
		// First, look for the file in the class's handouts section
		// Next, if it isn't there, check the course's handouts section.
		// Next, check 
		
// 		if (data.artofproblemsolving.com/aops20/courses/python1/772/sherlock.txt) {
// 		
// 		} else if (data.artofproblemsolving.com/aops20/courses/python1/handouts/sherlock.txt) {
// 		
// 		} else if (data.artofproblemsolving.com/aops20/courses/python2/handouts/sherlock.txt) {
// 		
// 		}
		
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
		if (!pythonTool.compatibleBrowserTest()) {
			alert('You cannot run the Python code in your current web browser.  You can run it if you update to Internet Explorer 9 or higher or a recent version of Chrome, Firefox, or Safari.');
			return;
		}
		
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

        // Tell Skulpt what the output element ids are.
        // Skulpt doesn't know about the error output element, so we add that manually later.
        if (outCanvasElement) Sk.canvas = outcanvas;
        Sk.pre = outpre;
        Sk.codeId = insource;

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
		prog = prog.replace(/^(\s*print(?=\s*\())/igm, "$1" + "3");
		prog = prog.replace(/^(\s*print3\s*\(.*?)(,\s*end\s*=)\s*(.*\)\s*(#.*)?)$/igm, '$1,"endfix="$3');
		prog = prog.replace(/^(\s*print3\s*\(.*?)(,\s*end\s*=)\s*(.*\)\s*(#.*)?)$/igm, '$1,"endfix="$3');
		prog = prog.replace(/^(\s*print3\s*\(.*?)(,\s*sep\s*=)\s*(.*\)\s*(#.*)?)$/igm, '$1,"sepfix="$3');
		prog = prog.replace(/^(\s*print3\s*\(.*?)(,\s*sep\s*=)\s*(.*\)\s*(#.*)?)$/igm, '$1,"sepfix="$3');

// 		console.log(Sk);
		// Set execLimit in milliseconds  -- for student projects set this to
		// 25 seconds -- just less than Chrome's own timer.
		Sk.execLimit = 25000;
		Sk.configure({
			output: function(text) {
				$mypre.text($mypre.text() + text);
			},
			read: function(x) {
// 				console.log(x);
// 				console.log(Sk.builtinFiles);
// 				console.log(Sk.builtinFiles["files"]);
				
				// look at uploaded files first
				
				
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

    resetit : function (insource,outpre,outerror,outcanvas) {
        var response = confirm("Do you really want to reset the Python code? Any changes that you have made will be lost." );
        if (response) {
            pythonTool.resetitCallback(insource,outpre,outerror,outcanvas);
        }
    },

    popOut : function (pywindowId) {
        var textToSend = pythonTool.getTextWithFiles(pywindowId);
        var baseURL = window.location.origin;
        if (!baseURL) {
            baseURL = 'https://artofproblemsolving.com';
        }
        var poppedWindow = window.open(baseURL + '/School/MyClasses/Grid/popoutPythonTool.html' + '?v=' + Date.now() + '#' + 
                pythonTool.encodeExtraCharacters(encodeURIComponent(textToSend)), 
            '_blank', 
            'width=600,height=700,toolbar=yes, scrollbars=yes, resizable=yes, location=yes, status=yes, titlebar=yes', 
            false);
//         console.log(poppedWindow);
        //poppedWindow.location = {'http://artofproblemsolving.com/School/MyClasses/Grid/popoutPythonTool.html#' + encodeURIComponent($('#'+insource)[0].value));
       // poppedWindow.document.write('testing: ' + $('#'+insource)[0].value);
    },
    
//     getTextWithFiles : function (pywindowId) {
//         var insource = pywindowId+'_code';
//         pythonTool.myCodeMirror[insource].save();
//         var textWithFiles = $('#'+insource)[0].value;
//         $.each(pythonTool.currentFiles.files[pywindowId], function (index, fileObject) {
//             if (fileObject.isOriginal && fileObject.global) {
//                 textWithFiles += '[uploadedFile="' + fileObject.fileName + '"][/uploadedFile]';
//             } else if (fileObject.isOriginal){
//                 if (!fileObject.defaultText) {
//                     fileObject.defaultText = '';
//                 }
//                 textWithFiles += '[pyfile="' + fileObject.fileName + '"]' + fileObject.defaultText + '[/pyfile]';
//             }
//         });
//         return textWithFiles;
//     },
    
    getTextWithFiles : function (pywindowId) {
        var insource = pywindowId+'_code';
        pythonTool.myCodeMirror[insource].save();
        var textWithFiles = $('#'+insource)[0].value;
//         console.log(textWithFiles);
        $.each(pythonTool.currentFiles.files[pywindowId], function (index, fileObject) {
//             console.log(fileObject.fileName);
            if (fileObject.isOriginal && fileObject.global) {
                textWithFiles += '[uploadedFile="' + fileObject.fileName + '"][/uploadedFile]';
            } else if (fileObject.isOriginal) {
                if (!fileObject.defaultText) {
                    fileObject.defaultText = '';
                }
                textWithFiles += '[pyfile="' + fileObject.fileName + '"]' + fileObject.defaultText + '[/pyfile]';
            }
//             console.log(textWithFiles);
        });
//         console.log(textWithFiles);
//         console.log(encodeURIComponent(textWithFiles));
//         console.log(pythonTool.encodeExtraCharacters(encodeURIComponent(textWithFiles)));
//         console.log(pythonTool.decodeExtraCharacters(pythonTool.encodeExtraCharacters(encodeURIComponent(textWithFiles))));
//         console.log(decodeURIComponent(pythonTool.decodeExtraCharacters(pythonTool.encodeExtraCharacters(encodeURIComponent(textWithFiles)))));
        return textWithFiles;
    },
    
    encodeExtraCharacters : function (text) {
        text = text.replace(/\(/g, '\%28');
        text = text.replace(/\)/g, '\%29');
        return text;
    },
    
    decodeExtraCharacters : function (text) {
        text = text.replace(/%28/g, '(');
        text = text.replace(/%29/g, ')');
        return text;
    },
    
    parseFilesFromText : function (textWithFiles) {
//         console.log(textWithFiles);
        var uploadedFilesArray = [];
        var textareaElementsString = '';
        // do a regex to find [pyfile]s and [uploadedFile]s
        
        // turn each [pyfile] into a hidden textarea
        var pyfileRegex = /\[\s*pyfile\s*=\s*[\'"](.+?)['"]\s*\]([\s\S]*?)\[\s*\/pyfile\s*\]/ig;
        textWithFiles = textWithFiles.replace(pyfileRegex, function (m, fileName, fileText) {
            textareaElementsString += '<textarea class="' + fileName + '">' + fileText + '</textarea>';
            return '';
        });
        
        // add each [uploadedFile] to the array.
        var uploadedFileRegex = /\[\s*uploadedFile\s*=\s*[\'"](.+?)['"]\s*\](.*?)\[\s*\/uploadedFile\s*\]/ig;
        textWithFiles = textWithFiles.replace(uploadedFileRegex, function (m, fileName, fileText) {
//             console.log(m);
//             console.log(fileName);
            uploadedFilesArray.push(fileName);
            return '';
        });
//         console.log([textWithFiles, uploadedFilesArray, textareaElementsString]);
        return [textWithFiles, uploadedFilesArray, textareaElementsString];
    },

    // defaultValue is a string that you want the input box to revert to.
	// You run the code print("") in order to clear the outputs and error log.
	resetitCallback : function (insource,outpre,outerror,outcanvas) {
		if (!outpre) {
			outpre = insource + '_pre';
			outerror = insource + '_error';
			outcanvas = insource + '_canvas';
			insource = insource + '_code';
		}
	    var divId = insource.slice(0,-5);
	    
		if (Sk && Sk.tg && Sk.tg.canvasLib) {
			for (var oneCanvas in Sk.tg.canvasLib) {
				if (Sk.tg.canvasLib[oneCanvas].intervalId) {
					clearInterval(Sk.tg.canvasLib[oneCanvas].intervalId);
				}
			}
		}
		var defaultValue = pythonTool.defaultValues[insource];
		console.log('resetit callback');
		var retvalFromFileParsing = pythonTool.parseFilesFromText(defaultValue);
		pythonTool.myCodeMirror[insource].setValue(retvalFromFileParsing[0]);
		pythonTool.resetFiles(divId);
        $('#' + divId + '_files').append(retvalFromFileParsing[2]);
        pythonTool.constructCurrentFilesObject(divId, retvalFromFileParsing[1])

		pythonTool.myCodeMirror[insource].refresh();
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
	
	resetFiles : function (divId) {
		pythonTool.currentFiles.files[divId] = void 0;
		$('#' + divId + '_files').empty();
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
				this.$elem = $('#' + this.pywindowId + '_files textarea.'+this.escapedId).first();
// 				console.log(this.$elem);
// 				console.log(this.$elem.length);
// 				console.log(this.$elem.length == 0);
				if ( this.$elem == null || this.$elem.length == 0) {
				    var thisUploadedFile = pythonTool.uploadedFiles[name.v];
// 				    console.log(thisUploadedFile);
					if (mode.v.indexOf('w') === 0) {
						this.$elem = $('<textarea>').addClass(name.v);
    					this.data$ = '';
						$('#' + this.pywindowId + '_files').append(this.$elem);
						pythonTool.currentFiles.addNewHiddenFileElement(this.pywindowId, this.$elem[0], false);
					} else if (mode.v.indexOf('a') === 0 || (mode.v.indexOf('r') === 0 && mode.v.indexOf('+') > -1 && thisUploadedFile)) {
						this.$elem = $('<textarea>').addClass(name.v);
						if (thisUploadedFile) {
						    if (thisUploadedFile.length > 100000) {
        						this.data$ = thisUploadedFile.substr(0,100000);
        						alert('Warning: The file ' + name.v + ' was truncated to 100000 characters. ' +
        						    'This Python widget was not made to support large files.  If you want ' +
        						    'the program you are currently running to work properly, use IDLE.'
        						);
        					} else {
        					    this.data$ = thisUploadedFile;
        					}
						} else {
    						this.data$ = '';
    					}
						$('#' + this.pywindowId + '_files').append(this.$elem);
						pythonTool.currentFiles.addNewHiddenFileElement(this.pywindowId, this.$elem[0], false);
					} else if (typeof thisUploadedFile == 'string') {
    					this.data$ = thisUploadedFile;
					} else if (thisUploadedFile) {
    					this.data$ = '';
					} else {
// 					    console.log('cannot find file');
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
			this.wpos$ = 0;

			this.__class__ = Sk.builtin.file;
			
			return this;

		}
		Sk.builtin.file.aopsmods = true;
		Sk.builtin.file.prototype = oldPrototype;
		Sk.builtin.file.prototype['write'] = new Sk.builtin.func(function(self, str) {
// 		    console.log('starting a write');
			if (self.mode.v.indexOf('w') !== 0 && self.mode.v.indexOf('a') !== 0 && self.mode.v.indexOf('+') == -1) {
				throw new Sk.builtin.IOError("File not open for writing");
			}
			if (self.mode.v.indexOf('a') === 0 || self.mode.v.indexOf('r') === 0) {
				self.wpos$ = self.data$.length;
			}
// 			console.log('made it this far');
// 			console.log(self);
// 			console.log(str);
			var firstPart = self.data$.slice(0,self.wpos$);
			self.wpos$ += str.v.length;
// 			console.log('made it farther');
			var secondPart = self.data$.slice(self.wpos$);
			self.data$ = firstPart + str.v + secondPart;
// 			console.log('made it even farther');
			self.$elem.text(self.data$); // likely issues with new lines, etc.
			self.$elem.change();
// 			console.log('made it to the end');
		});
		Sk.builtin.file.prototype['seek'] = new Sk.builtin.func(function(self, offset, whence) {
			if (whence === undefined ) whence = 0;
			if (whence == 0) {
				self.pos$ = offset.v;
				self.wpos$ = offset.v;
			} else if (whence == 1) {
				self.pos$ = self.pos$ + offset.v;
				self.wpos$ = self.wpos$ + offset.v;
			} else if (whence == 2) {
				self.pos$ = self.data$.length + offset.v;
				self.wpos$ = self.data$.length + offset.v;
			} else {
				throw new Sk.builtin.IOError("[Errno 22] Invalid argument");
			}
			if (self.pos$ < 0) self.pos$ = 0;
			if (self.wpos$ < 0) self.wpos$ = 0;
			if (self.pos$ > self.data$.length) self.pos$ = self.data$.length;
			if (self.wpos$ > self.data$.length) self.wpos$ = self.data$.length;
		});
		
		Sk.builtin.file.prototype['read'] = new Sk.builtin.func(function(self, size) {
			if (self.mode.v.indexOf('r') !== 0 && self.mode.v.indexOf('+') == -1) {
				throw new Sk.builtin.IOError("UnsupportedOperation: not readable");
			}
			if (self.closed) throw new Sk.builtin.ValueError("I/O operation on closed file");
// 			console.log(self.data$);
// 			console.log(self);
// 			console.log(size);
			var len = self.data$.length;
			if (size === void 0 || size.v === void 0) size = new Sk.builtin.int_(len);
			var ret = new Sk.builtin.str(self.data$.substr(self.pos$, size.v));
			self.pos$ += size.v;
			if (self.pos$ >= len) self.pos$ = len;
// 			console.log(ret);
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

		Sk.builtin.file.prototype['writelines'] = new Sk.builtin.func(function(self, strlist) {
			if (self.mode.v.indexOf('w') !== 0 && self.mode.v.indexOf('a') !== 0 && self.mode.v.indexOf('+') == -1) {
				throw new Sk.builtin.IOError("File not open for writing");
			}
			console.log(strlist);
			if (self.closed) throw new Sk.builtin.ValueError("I/O operation on closed file");
			for(var i in strlist.v) {
			    self.write.func_code(self, strlist.v[i]);
			}
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

        Sk.builtin.dict.prototype['pop'] = new Sk.builtin.func(function(self, key, defaultValue) {
            var ret = void 0;
//             console.log(self);
            var dictHasKey = false;
            
            for (var iter = self.tp$iter(), k = iter.tp$iternext();
                 k !== undefined;
                 k = iter.tp$iternext()) {
//                  console.log(iter);
//                  console.log(k);
//                  console.log(key);
                var v = self.mp$subscript(k);
                if (v === undefined) {
                    v = null;
                }
                if (k.v === key.v) {
                    dictHasKey = true;
                    ret = v;
                    delete self[k.__id];
                }
            }
//             console.log(self);

            if (!dictHasKey && defaultValue !== void 0) {
                ret = defaultValue;
            } else if (!dictHasKey) {
				throw new Sk.builtin.KeyError("'" + key.v + "'");
            }
            
            return ret;
        });

        Sk.builtin.str.prototype['isalpha'] = new Sk.builtin.func(function(self) {
            if (self.v.length < 1) {
                return Sk.builtin.bool(false);
            }
            var anyNonAlphaPatt = /[^a-zA-Z]/i;
            if (anyNonAlphaPatt.test(self.v)) {
                return Sk.builtin.bool(false);
            }

            return Sk.builtin.bool(true);
        });

        Sk.builtin.str.prototype['isdigit'] = new Sk.builtin.func(function(self) {
            if (self.v.length < 1) {
                return Sk.builtin.bool(false);
            }
            var anyNonDigitPatt = /[^0-9]/i;
            if (anyNonDigitPatt.test(self.v)) {
                return Sk.builtin.bool(false);
            }

            return Sk.builtin.bool(true);
        });

        Sk.builtin.str.prototype['isspace'] = new Sk.builtin.func(function(self) {
            if (self.v.length < 1) {
                return Sk.builtin.bool(false);
            }
            var anyNonSpacePatt = /[^\s]/i;
            if (anyNonSpacePatt.test(self.v)) {
                return Sk.builtin.bool(false);
            }

            return Sk.builtin.bool(true);
        });

        Sk.builtin.str.prototype['islower'] = new Sk.builtin.func(function(self) {
            var atLeastOneLower = /[a-z]/;
            if (!atLeastOneLower.test(self.v)) {
                return Sk.builtin.bool(false);
            }
            var anyUpperPatt = /[A-Z]/;
            if (anyUpperPatt.test(self.v)) {
                return Sk.builtin.bool(false);
            }

            return Sk.builtin.bool(true);
        });

        Sk.builtin.str.prototype['isupper'] = new Sk.builtin.func(function(self) {
            var atLeastOneLower = /[A-Z]/;
            if (!atLeastOneLower.test(self.v)) {
                return Sk.builtin.bool(false);
            }
            var anyUpperPatt = /[a-z]/;
            if (anyUpperPatt.test(self.v)) {
                return Sk.builtin.bool(false);
            }

            return Sk.builtin.bool(true);
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
			var $mypre = $('#'+Sk.pre);
			var endOfPrint = '\n';
			var endAltered = false;
			var sepOfPrint = ' ';
			var sepAltered = false;
			var recentScrollTop = $mypre.scrollTop();
			var recentOldHeight = $mypre.height();

			var argsToPrint = [];
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
					argsToPrint.push(thisStr);
				}
			}
			for (var i in argsToPrint) {
				if (i == 0) {
					$mypre.text($mypre.text() + argsToPrint[i]);
				} else {
					$mypre.text($mypre.text() + sepOfPrint + argsToPrint[i]);
				}
			}
			$mypre.text($mypre.text() + endOfPrint);
			
			$mypre.height('auto');
			var myScrollHeight = $mypre.height();
			var newOutputHeight = myScrollHeight;
			var changeInScrollHeight = myScrollHeight - Sk.myOldScrollHeight;
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
					
			if (myScrollHeight > newOutputHeight) {
				$mypre.height(newOutputHeight);
				$mypre.scrollTop(recentScrollTop);
				$mypre.animate({scrollTop : myScrollHeight - newOutputHeight}, 10);
			} else {
				$mypre.scrollTop(0);
			}
		};
		
		Sk.builtins.print3 = print3;
	},
	
	// add a callback function for text areas
	//  It responds to a "Save" button
	//  Set its textarea's html to the textarea's value.
	// Also, when adding the button and textarea, make the text area indicate when it is edited but unsaved.

    addCurrentCodeSources: function () {
        var codesources = $(".active_code");
        for (var i=0;i<codesources.length;i++) {
            pythonTool.addCodeSource (codesources[i]);
        }
    }
};

$( window ).load( function () {
    pythonTool.addCurrentCodeSources();
//	var codesources = $(".active_code");
//	for (var i=0;i<codesources.length;i++) {
//		pythonTool.addCodeSource (codesources[i]);
//	}
});

pythonTool.addCurrentCodeSources();


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
errorText.FileNotFoundError = "This error occurs when you try to open a file in read mode, but the file does not exist yet.";
errorText.FileNotFoundErrorFix = "If you are planning to write to the file, you should open it in 'w' or 'a' mode.  If not, check the spelling of the file name, and make sure you have the file in the right folder.";
errorText.IOError = "This error occurs when you are reading from or writing to a file.";
errorText.IOErrorFix = "";
errorText.KeyError = "This error occurs when a mapping (dictionary) key is not found in the set of existing keys.";
errorText.KeyErrorFix = "";






pythonTool.filesHolder = function () {
	this.files = {};
	this.showDeleted = {};
	
	this.defaultFileObject = {
		'deleted' : false,
		'edited' : false,
		'editedAt' : '',
		'fileName' : 'untitled.txt',
		'global' : false,
		'blobURL' : '',
		'currentText' : '',
		'defaultText' : null,
		'$elem' : null,
		'isOriginal' : false,
	
		'getText' : function () {
			return this.currentText;
		}
    };
    
    this.previewModal = $(
        '<div class="pywindow-file-preview-modal">' + 
            '<div class="pywindow-file-preview-titlebar">' +
                '<button style="float:left;" class="btn pywindow-btn-small pywindow-preview-popout" type="button">Pop Out</button> ' +
                '<div style="font-size:150%; float:left; margin-left:auto; margin-right:auto; width:450px; text-align:center;" class="pywindow-preview-fileName">File Preview</div> ' +
                '<button style="float:right;" class="btn pywindow-btn-small btn-danger pywindow-preview-close" type="button"><img border="0" class="pyfile_delete" src="' + pythonTool.bookLocation + '_static/delete.png" title="Delete File" width="10" height="10"></button> ' +
                '<div style="clear:both"></div>' +
            '</div> ' +
            '<div class="pywindow-file-fake-scroll"></div>' +
            '<div class="pywindow-file-loading">Loading...</div>' +
            '<textarea readonly rows="1" cols="80"></textarea> ' +
        '</div>'
    ).hide();
    $('body').append(this.previewModal);
    this.showPreviewModal = function (textToPreview, fileName) {
        if (textToPreview === true) {
            return false;
        }
        var self = this;
        this.previewModal.find('textarea').remove();
        this.previewModal.append('<textarea readonly rows="1" cols="80"></textarea>')
        this.previewModal.find('.pywindow-preview-fileName').html(fileName);
        this.previewModal.find('.pywindow-file-loading').show();
        this.previewModal.find('.pywindow-file-preview-titlebar').hide();
        this.previewModal.find('.pywindow-file-fake-scroll').hide();
        this.previewModal.show(250);
        this.previewModal.find('.pywindow-file-preview-titlebar').show(250);
        this.previewModal.find('.pywindow-file-fake-scroll').show(250);
        var cols = this.previewModal.find('textarea')[0].cols;
        var linecount = 0;
        var oldLineCount = 0;
        var arrayOfLines = textToPreview.split('\n');
        var reducedTextToPreview = '';
        for (var i in arrayOfLines) {
            oldLineCount = linecount;
            linecount += Math.ceil(arrayOfLines[i].length / cols);
            if (linecount <= 10000) {
                reducedTextToPreview += arrayOfLines[i] + '\n';
            } else {
                reducedTextToPreview += '\n[File was cut off because it was too large for this preview.]\n';
                linecount = oldLineCount+2;
                break;
            }
        }
        linecount += 2;
        this.previewModal.find('textarea')[0].rows = linecount;
        this.previewModal.find('.pywindow-file-loading').hide();
        this.previewModal.find('textarea').text(reducedTextToPreview);
        if (this.previewModal.find('.pywindow-preview-popout').off) {
            this.previewModal.find('.pywindow-preview-popout').off();
        } else {
            this.previewModal.find('.pywindow-preview-popout').unbind();
        }
        this.previewModal.find('.pywindow-preview-popout').click(function () {
            var poppedWindow = window.open('', '_blank', 
                'width=620, height=500, scrollbars=yes, resizable=yes', 
                true
            );
            poppedWindow.document.write('<textarea readonly ' + 
                'rows="' + linecount + 
                '" cols="80" ' +
                'style="border:none; margin:5px; padding:5px; resize: none; ' + 
                    'font-family: \'Droid Sans Mono\', \'Lucida Console\', Monospace, Courier; ' + 
                    'font-size:75%;"' +
                '>' + reducedTextToPreview + '</textarea>'
            );
            poppedWindow.document.title = fileName;
            self.hidePreviewModal();
        });
        this.previewModal.find('.pywindow-preview-close').click(function () {
            self.hidePreviewModal();
        });
    };
    this.hidePreviewModal = function () {
        this.previewModal.find('textarea').text('');
        this.previewModal.hide(250);
        this.previewModal.find('.pywindow-file-preview-titlebar').hide(250);
        this.previewModal.find('.pywindow-file-fake-scroll').hide(250);
    };
	
};

pythonTool.filesHolder.prototype.initializeHiddenIFrame = function () {
    var hiddenIFrameID = 'hiddenDownloader',
        iframe = document.getElementById(hiddenIFrameID);
    if (iframe === null) {
        iframe = document.createElement('iframe');
        iframe.name = hiddenIFrameID;
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        iframe.src = 'http://www.notaops.com';
        document.body.appendChild(iframe);
    }
};



pythonTool.filesHolder.prototype.deleteAllFilesWithFileName = function (fileObject) {
	var currentFilesForThisDiv = this.files[fileObject.divId];
	if (!currentFilesForThisDiv) {
		currentFilesForThisDiv = [];
		this.files[fileObject.divId] = currentFilesForThisDiv;
	}
	for (var fileKey in currentFilesForThisDiv) {
		if (currentFilesForThisDiv[fileKey].fileName == fileObject.fileName &&
		        !currentFilesForThisDiv[fileKey].deleted) {
			currentFilesForThisDiv[fileKey].deleted = true;
			if (currentFilesForThisDiv[fileKey].$elem) {
    			currentFilesForThisDiv[fileKey].currentText = currentFilesForThisDiv[fileKey].$elem.text();
    			currentFilesForThisDiv[fileKey].$elem.remove();
    		}
		}
	}
// 	this.displayFileBrowserView(divId);
};

pythonTool.filesHolder.prototype.addFile = function (fileObject, index) {
	var currentFilesForThisDiv = this.files[fileObject.divId];
    this.deleteAllFilesWithFileName(fileObject);
    if (index === void 0 || index == -1) {
    	currentFilesForThisDiv.push(fileObject);
    } else {
        currentFilesForThisDiv.splice(index, 0, fileObject);
    }
};



pythonTool.filesHolder.prototype.addNewHiddenFileElement = function (divId, hiddenFileElement, isOriginal) {
    var fileObjectGenerator = $.extend({}, this.defaultFileObject);
    var fileObject = new pythonTool.fileObject(divId, fileObjectGenerator);
    $hiddenFileElement = $(hiddenFileElement);
//     console.log(fileObject);
    var classList = $hiddenFileElement.attr('class').split(/\s+/);
    $.each(classList, function(index, elementClass){
        if (elementClass.length < 7 || elementClass.substr(0,7) !== 'ac-file') {
            fileObject.fileName = elementClass;
        }
    });
    fileObject.setFileTimeStamp();
    fileObject.text = null;
    fileObject.defaultText = $hiddenFileElement.text();
    var escapedFileName = fileObject.fileName.replace(/\./, '\\.');
	fileObject.$elem = $('#' + divId + '_files textarea.' + escapedFileName).first();
    if (isOriginal) {
        fileObject.isOriginal = true;
    }
    fileObject.getText = function () {
        return fileObject.$elem.text();
    };
    var oldIndex = -1;
    $.each(pythonTool.currentFiles.files[divId], function (index, fileObjectFromList) {
        if (fileObject.fileName == fileObjectFromList.fileName) {
            oldIndex = index;
        }
    });
    if (oldIndex == -1) {
        fileObject.addFile();
    } else {
        fileObject.addFile(oldIndex+1);
    }
};
pythonTool.filesHolder.prototype.addTempGlobalFileElement = function (divId, fileName, isOriginal) {
    var fileObjectGenerator = $.extend({}, this.defaultFileObject);
    var fileObject = new pythonTool.fileObject(divId, fileObjectGenerator);
    fileObject.fileName = fileName;
    fileObject.text = null;
    fileObject.global = 'temp';
    if (isOriginal) {
        fileObject.isOriginal = true;
    }
    fileObject.getText = function () {
        return pythonTool.uploadedFiles[fileName];
    };
    fileObject.addFile();
};
pythonTool.filesHolder.prototype.addRealGlobalFileElement = function (divId, fileName, isOriginal) {
    $.each(pythonTool.currentFiles.files, function (divId, currentFilesForThisDiv) {
//         var currentFilesForThisDiv = pythonTool.currentFiles.files[divId];
        var indexToRemove = -1;
        $.each(currentFilesForThisDiv, function (index, fileObject) {
            if (fileObject.fileName == fileName && fileObject.global == 'temp') {
                indexToRemove = index;
            }
        });
        if (indexToRemove > -1) {
            var tempFileObject = currentFilesForThisDiv.splice(indexToRemove, 1);
            var fileObjectGenerator = $.extend({}, this.defaultFileObject);
            var fileObject = new pythonTool.fileObject(divId, fileObjectGenerator);
            fileObject.fileName = fileName;
            fileObject.text = null;
            fileObject.global = true;
            if (isOriginal) {
                fileObject.isOriginal = true;
            }
            fileObject.getText = function () {
                return pythonTool.uploadedFiles[fileName];
            };
            fileObject.addFile(indexToRemove);
        }
    });
};

pythonTool.filesHolder.prototype.ajaxLoadError = function (fileName) {
    $.each(pythonTool.currentFiles.files, function (divId, currentFilesForThisDiv) {
        var indexToEdit = -1;
        $.each(currentFilesForThisDiv, function (index, fileObject) {
            if (fileObject.fileName == fileName && fileObject.global == 'temp') {
                indexToEdit = index;
            }
        });
        if (indexToEdit > -1) {
            var tempFileObject = currentFilesForThisDiv[indexToEdit];
            tempFileObject.editedAt = '(Load Failed)';
            pythonTool.currentFiles.displayFileBrowserView(divId);
        }
    });
};


pythonTool.filesHolder.prototype.displayFileBrowserView = function (divId, showDeleted) {
    // divId is required.
    if (showDeleted === void 0) {
        showDeleted = this.showDeleted[divId];
    }
    this.initializeHiddenIFrame();
    $('#' + divId).find('.pywindow-file-table-holder').remove();
    var showHideDeletedButton = '<button class="btn pywindow-btn-small pyfile_show_deleted">Show Deleted</button>';
    if (showDeleted) {
        showHideDeletedButton = '<button class="btn pywindow-btn-small pyfile_hide_deleted">Hide Deleted</button>';
    }
    var $fileBrowserElement = $('<div class="pywindow-file-table-holder">' +
    	'<table class="pywindow-file-table"><tr>' +
        '<th></th>' +
        '<th style="margin-right:auto; min-width:100px;">File  <font size="1">(Click to preview)</font></th>' +
        '<th style="margin-right:auto;">Edited at</th>' +
        '<th colspan="2">' + showHideDeletedButton + '</th>' + 
//         '<th></th>' +
        '</tr></table></div>');
    $.each(this.files[divId], function (fileKey, fileObject) {
        if (fileObject.deleted && !showDeleted) {
        	return;
        } else {
			var deleteResetRestoreButton = '';
			var fileRowStyle = '';
			var fileNameSupplement = '';
			var downloadDisabled = '';
			var previewDisabled = '';
			var previewAvailable = ' class="pyfile_preview"';
			if (fileObject.deleted == true) {
				fileRowStyle = ' style="background-color:#e99"';
// 				deleteResetRestoreButton = '<button class="pyfile_restore">Restore</button>';
				deleteResetRestoreButton = '<img border="0" class="pyfile_restore" src="' + pythonTool.bookLocation + '_static/restore.png" title="Restore File" width="16" height="16">';
    			if (fileObject.global == 'temp') {
//     			    fileNameSupplement = ' (Loading...)';
    			    downloadDisabled = ' style="display:none;"';
    			    previewDisabled = ' style="display:none;"';
    			    previewAvailable = ' ';
    			}
			} else if (fileObject.global == false) {
// 				deleteResetRestoreButton = '<button class="pyfile_delete">Delete</button>';
				deleteResetRestoreButton = '<img border="0" class="pyfile_delete" src="' + pythonTool.bookLocation + '_static/delete.png" title="Delete File" width="16" height="16">';
			} else {
    			if (fileObject.edited == true) {
    				deleteResetRestoreButton = '<button class="pyfile_reset">Reset</button>';
    			}
    			if (fileObject.global == 'temp') {
    				fileRowStyle = ' style="background-color:#FFFACD"';
//     			    fileNameSupplement = ' (Loading...)';
    			    downloadDisabled = ' style="display:none;"';
    			    previewDisabled = ' style="display:none;"';
    			    previewAvailable = ' ';
    			}
			}
			if (fileObject.downloadDisabled) {
			    downloadDisabled = ' style="display:none;"';
			}
			$fileRow = $('<tr' + previewAvailable + ' title="Preview File" ' + fileRowStyle + '>' +
				'<td><img border="0" src="' + pythonTool.bookLocation + '_static/preview.png" title="Preview File" width="12" height="15"></td>' +
				'<td>' + fileObject.fileName + fileNameSupplement + '</td>' +
				'<td>' + fileObject.editedAt + '</td>' +
				'<td>' + deleteResetRestoreButton + '</td>' +
// 				'<td><button class="pyfile_download"' + downloadDisabled + '><a id="' + divId + '_downloadLink_' + fileObject.fileName.split('.').join('') + 
				'<td><a id="' + divId + '_downloadLink_' + fileObject.fileName.split('.').join('') + 
				    '" title="Download File' +
					'" href="' + fileObject.blobURL + 
					'" target="_blank" download="' + fileObject.fileName + '"><img border="0" src="' + pythonTool.bookLocation + '_static/download.png" title="Download File" width="16" height="16"' + downloadDisabled + '></a></td>' +
// 					'" target="_blank" download="' + fileObject.fileName + '">Download</a></button></td>' +
// 					'" target="_blank" download="' + fileObject.fileName + '">Download</a></td>' +
// 					'" target="hiddenDownloader">Download</a></button></td>' +
// 					'" target="hiddenDownloader">Download</a></td>' +
// 					'" target="_blank" download="' + fileObject.fileName + '">Download</a></button></td>' +
// 				'<td><button' + previewDisabled + previewAvailable + '">Preview</button></td>' +
				'</tr>');
			$fileBrowserElement.find('table').append($fileRow);
        }
        $fileRow.find('.pyfile_delete').click(function () {
            console.log('calling deleteFile');
            fileObject.deleteFile();
        });
        $fileRow.find('.pyfile_reset').click(function () {
            fileObject.resetFile();
        });
        $fileRow.find('.pyfile_restore').click(function () {
            fileObject.restoreFile();
        });
        $fileRow.find('.pyfile_download').click(function (eventObject) {
            eventObject.stopPropagation();
//             eventObject.preventDefault();
//             fileObject.downloadFile();
        });
        $fileRow.find('.pyfile_download').submit(function (eventObject) {
            eventObject.stopPropagation();
            return false;
        });
        $fileRow.find('a').click(function (eventObject) {
            eventObject.stopPropagation();
        });
        $fileRow.find('a').submit(function (eventObject) {
            eventObject.stopPropagation();
            return false;
        });
//         $fileRow.find('.pyfile_preview').click(function (eventObject) {
        $fileRow.click(function (eventObject) {
//             eventObject.preventDefault();
            fileObject.previewFile();
        });
    });
    $fileBrowserElement.find('.pyfile_show_deleted').click(function (eventObject) {
        eventObject.preventDefault();
        pythonTool.currentFiles.toggleDeleted(divId, true);
    });
    $fileBrowserElement.find('.pyfile_hide_deleted').click(function (eventObject) {
        eventObject.preventDefault();
        pythonTool.currentFiles.toggleDeleted(divId, false);
    });
    $fileBrowserElement.click(function (eventObject) {
        eventObject.stopPropagation();
    });
    $fileBrowserElement.submit(function (eventObject) {
        eventObject.stopPropagation();
        return false;
    });
    $('#' + divId).append($fileBrowserElement);
};

pythonTool.filesHolder.prototype.toggleDeleted = function (divId, showDeleted) {
    // Set a variable somewhere 
    this.showDeleted[divId] = showDeleted;
    this.displayFileBrowserView(divId);
};

pythonTool.currentFiles = new pythonTool.filesHolder();










pythonTool.fileObject = function (divId, fileProperties) {
	this.divId = divId;
	for (var filePropertyKey in fileProperties) {
	    this[filePropertyKey] = fileProperties[filePropertyKey];
	}
};

pythonTool.fileObject.prototype.deleteFile = function () {
	// Delete this file
	if (!this.deleted) {
    	this.deleted = true;
    	if (this.$elem) {
        	this.currentText = this.$elem.text();
// 	        this.$elem.text('');
	        this.$elem.remove();
	    }
	    this.displayFileBrowserView();
	}
};

pythonTool.fileObject.prototype.restoreFile = function () {
//     console.log('restoring file');
	// restore the file
	pythonTool.currentFiles.deleteAllFilesWithFileName(this);
	this.deleted = false;
	
    this.escapedId = this.fileName.replace(/\./, '\\.');
    this.$elem = $('#' + this.divId + '_files textarea.'+this.escapedId).first();
    if ((this.$elem == null || this.$elem.length == 0) && !this.global) {
        this.$elem = $('<textarea>').addClass(this.fileName);
        $('#' + this.divId + '_files').append(this.$elem);
    }
// 	console.log(this);
	if (this.$elem && this.currentText) {
	    this.$elem.text(this.currentText);
	}
	this.displayFileBrowserView();
};

pythonTool.fileObject.prototype.resetFile = function () {
	// do a special delete that preserves the default text
	if (this.$elem) {
	    console.log(this.fileName);
	    console.log(this.$elem);
	    this.deleted = true;
	    this.currentText = this.$elem.text();
	    if (this.defaultText) {
        	this.$elem.text(this.defaultText);
        } else {
            this.$elem.text('');
        }
        // put this at the correct index.
        // not implemented yet. asdf 
        pythonTool.currentFiles.addNewHiddenFileElement(this.divId, this.$elem[0]);
    } else {
        // not implemented yet. asdf
    }
	this.displayFileBrowserView();
};

pythonTool.fileObject.prototype.downloadFile = function () {
    // download the file 
    // Actually, don't do anything here.  It happens in the <a></a>
};

pythonTool.fileObject.prototype.previewFile = function () {
    // display modal with a preview of the text in the file
    // check that newlines come through well
    pythonTool.currentFiles.showPreviewModal(this.getText(), this.fileName);
};

pythonTool.fileObject.prototype.addFile = function (index) {
    // add the file to current files
//     pythonTool.currentFiles.deleteAllFilesWithFileName(this.fileName);
    pythonTool.currentFiles.addFile(this, index);
    this.setFileTimeStamp();
    this.displayFileBrowserView();
};

pythonTool.fileObject.prototype.setFileTimeStamp = function () {
    this.prepareForDownload();
    var myDate = new Date();
    var oldEditedAt = this.editedAt;
    var oldDate = new Date(this.editedAt);
    var monthFix = myDate.getMonth() + 1;
    this.editedAt = '' + monthFix + '/' + myDate.getDate() + '/' + myDate.getFullYear() + ' ' + myDate.toLocaleTimeString();
    if (this.global == 'temp') {
        this.editedAt = '(Loading...)';
    }
    if (oldEditedAt == '' || this.editedAt == '(Loading...)' || 
            myDate.getTime() > oldDate.getTime() + 1000) {
        this.displayFileBrowserView();
    }
};


pythonTool.fileObject.prototype.prepareForDownload = function () {
    if (typeof Blob == 'undefined' || 
            !(typeof Blob === "function" || typeof Blob === "object") ||
            window.navigator.userAgent.indexOf("MSIE ") > 0 ||
            !!navigator.userAgent.match(/Trident.*rv\:11\./) 
            ) {
        this.blobURL = '';
        this.downloadDisabled = true;
    } else {
        if (this.getText() === true) {
            // The file is being loaded via ajax.  Wait for it and disable the download button.
            //  Taken care of another way.  The download button is hidden if
            //  the file's text isn't there yet.  But be aware that this may cause issues
            return;
        }
        // Safari doesn't like anything but text/plain.
//         var blobToDownload = new Blob([this.getText()], {type:'application/x-download-me'});
        this.blobInnerData = this.getText();
        this.blobData = new Blob([this.blobInnerData], {type:'text/plain'});
        window.URL = window.webkitURL || window.URL;
        var blobURL = window.URL.createObjectURL(this.blobData);
        this.blobURL = blobURL;
    }
	$('#' + this.divId + '_downloadLink_' + this.fileName.split('.').join('')).attr('href', blobURL);
};
    




pythonTool.fileObject.prototype.displayFileBrowserView = function (divId, showDeleted) {
	if (!divId) {
		divId = this.divId;
	}
	pythonTool.currentFiles.displayFileBrowserView(divId, showDeleted);
};







pythonTool.constructCurrentFilesObject = function (divId, uploadedFilesArray) {
//     console.log('constructing files for ' + divId);
    if (pythonTool.currentFiles.files[divId] !== undefined && 
            $('#' + divId).find('.pywindow-file-table-holder').length > 0) {
        return false;
    }
    pythonTool.currentFiles.files[divId] = [];
    
    if(divId == 'problem_7812_user_179293_comment_0') {
        console.log('break break break break break break break break break break break break break break break break break break break break break');
        console.log(uploadedFilesArray);
    }
	if (uploadedFilesArray && $.isArray(uploadedFilesArray)) {
		$.each(uploadedFilesArray, function (index, uploadedFileName) {
		    if (!pythonTool.uploadedFiles.hasOwnProperty(uploadedFileName)) {
		        if (!pythonTool.verifyFileName(uploadedFileName)) {
		            return false;
		        }
                pythonTool.uploadedFiles[uploadedFileName] = true;
                $.ajax({
                    type: 'GET',
                    url : '' + pythonTool.bookLocation + '_static/files/' + uploadedFileName,
                    success : function(result) {
                        pythonTool.uploadedFiles[uploadedFileName] = result;
                        // Also turn the download buttons on.  Maybe change the visual of the
                        //  file in the file browser.
                        // to be implemented. asdf
                        pythonTool.currentFiles.addRealGlobalFileElement(divId, uploadedFileName, true);
                    },
                    error : function (textStatus, errorThrown) {
                        pythonTool.currentFiles.ajaxLoadError(uploadedFileName);
                    }
                });
		    }
		    if (pythonTool.uploadedFiles.hasOwnProperty(uploadedFileName) && 
		            pythonTool.uploadedFiles[uploadedFileName] !== true) {
    		    pythonTool.currentFiles.addTempGlobalFileElement(divId, uploadedFileName, true);
		        pythonTool.currentFiles.addRealGlobalFileElement(divId, uploadedFileName, true);
		    } else {
    		    pythonTool.currentFiles.addTempGlobalFileElement(divId, uploadedFileName, true);
    		}
		});
	}
	
	var $hiddenFileElements = $('#' + divId + '_files textarea');
	$hiddenFileElements.each(function(index,hiddenFileElement) {
        pythonTool.currentFiles.addNewHiddenFileElement(divId, hiddenFileElement, true);
	});
	
	var $hiddenFilesHolder = $('#' + divId + '_files');
	$hiddenFilesHolder.change(function (eventObject) {
	    var classString = $(eventObject.target).attr('class');
	    var filesToSearch = pythonTool.currentFiles.files[divId];
	    var eventTargetFileObject = null;
	    $.each(filesToSearch, function (index, fileToSearch) {
	        // Only update the time stamp on the most recent version of the file
	        if (classString.indexOf(fileToSearch.fileName) > -1 && 
	                !fileToSearch.deleted) {
	            eventTargetFileObject = fileToSearch;
	        }
	    });
	    if (eventTargetFileObject === null) {
	        pythonTool.currentFiles.addNewHiddenFileElement (divId, eventObject.target);
	    } else {
    	    eventTargetFileObject.setFileTimeStamp();
    	}
	});

};

pythonTool.verifyFileName = function (fileName) {
	if (!fileName) {
		fileName = this.fileName;
	}
    var splitFileName = fileName.split('.');
    if (splitFileName.length !== 2) return false;
    if (splitFileName[1] !== 'txt') return false;
    return true;
};


$( window ).load( function () {
    if ($('body').find('.pywindow-file-preview-modal').length == 0) {
        $('body').append(pythonTool.currentFiles.previewModal);
    }
});

