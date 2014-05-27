# Copyright (C) 2011  Bradley N. Miller
# Modifications (C) 2013 AoPS Incorporated
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

__author__ = 'bmiller'

from docutils import nodes
from docutils.parsers.rst import directives
from docutils.parsers.rst import Directive
import json
import os

# try:
#     import conf
#     version = conf.version
#     staticserver = conf.staticserver
# except:
#     version = '2.1.0'
#     staticserver = 'runestonestatic.appspot.com'

def setup(app):
    app.add_directive('activecode',ActiveCode)

# 	<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js" type="text/javascript"></script> 
# 	<link rel="stylesheet" href="codemirrorEdited.css">
# 	<script src="codemirror.js" type="text/javascript"></script> 
# 	<script src="python.js" type="text/javascript"></script> 
# 	<script src="matchbrackets.js" type="text/javascript"></script> 
# 	<script src="active-line.js" type="text/javascript"></script> 
# 	<script src="skulpt.min.js" type="text/javascript"></script> 
# 	<script src="skulpt-stdlib.js" type="text/javascript"></script> 
# 	<script src="aopsmods.js" type="text/javascript"></script>


#   If you want to play with the codemirror files, uncomment 
#     [codemirror.js, python.js, matchbrackets.js, and active-line.js]
#     and comment out [pywindowCodemirrorC.js].

    app.add_stylesheet('codemirrorEdited.css')
    app.add_javascript('http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js')
#    app.add_javascript('codemirror.js' )
#    app.add_javascript('python.js' )
#    app.add_javascript('matchbrackets.js')
#    app.add_javascript('active-line.js')
    app.add_javascript('pywindowCodemirrorC.js' )
    app.add_javascript('skulpt.min.js' )
    app.add_javascript('skulpt-stdlib.js')
    app.add_javascript('aopsmods.js')

    app.add_node(ActivcodeNode, html=(visit_ac_node, depart_ac_node))

    app.connect('doctree-resolved',process_activcode_nodes)
    app.connect('env-purge-doc', purge_activecodes)



START = '''
<div id="%(divid)s" class="pywindow" >
'''

# had cols="%(cols)d" in the textarea spec
EDIT1 = '''
<div id="%(divid)s_code_div" style="display: %(hidecode)s">
<textarea rows="%(rows)d" id="%(divid)s_code" class="active_code" prefixcode="%(include)s">
%(initialcode)s</textarea>
</div>
<script type="text/javascript">
pythonTool.lineNumberFlags['%(divid)s_code'] = %(linenumflag)s;
pythonTool.readOnlyFlags['%(divid)s_code'] = %(readonlyflag)s;
</script>
'''

EDITRUN = '''
<div>
<button style="float:left" type='button' class='btn btn-run' id="%(divid)s_runb">Run</button>
<button style="float:left margin-left:150px;" type='button' class='btn' id="%(divid)s_popb">Pop Out</button>
<button style="float:right" type="button" class='btn btn-reset' id="%(divid)s_resetb">Reset</button>
<div style='clear:both'></div>
</div>
'''

EDITERROR = '''
<div id='%(divid)s_error'></div>
'''

UNHIDE='''
<button class='btn btn-default' id="%(divid)s_showb" onclick="$('#%(divid)s_code_div').toggle();cm_editors['%(divid)s_code'].refresh();\
$('#%(divid)s_saveb').toggle();$('#%(divid)s_loadb').toggle()">Show/Hide Code</button>
'''

CANVAS = '''
<div style="text-align: center">
<canvas id="%(divid)s_canvas" class="ac-canvas" height="%(cheight)d" width="%(cwidth)d" style="border-style: solid; display: none; text-align: center"></canvas>
</div>
'''

SUFF = '''<pre id="%(divid)s_suffix" style="display:none">%(suffix)s</pre>'''

PRE = '''
<pre id="%(divid)s_pre" class="active_out">

</pre>

<div id="%(divid)s_files" class="ac-files ac-files-hidden"></div>
'''

END = '''
</div>

'''

AUTO = '''
<script type="text/javascript">
$(document).ready(function() {
    $(window).load(function() {
        var runb = document.getElementById("%(divid)s_runb");
        pythonTool.runit('%(divid)s',runb, %(include)s);
    });
});
</script>
'''

LATEX = '''
\\begin{verbatim}
%(initialcode)s
\\end{verbatim}
'''

class ActivcodeNode(nodes.General, nodes.Element):
    def __init__(self,content):
        """

        Arguments:
        - `self`:
        - `content`:
        """
        super(ActivcodeNode,self).__init__()
        self.ac_components = content

# self for these functions is an instance of the writer class.  For example
# in html, self is sphinx.writers.html.SmartyPantsHTMLTranslator
# The node that is passed as a parameter is an instance of our node class.
def visit_ac_node(self,node):
    #print self.settings.env.activecodecounter
    res = START
    if 'above' in node.ac_components:
        res += CANVAS
    res += EDIT1
    if 'norun' not in node.ac_components:
        res += EDITRUN
    res += EDITERROR    
    if 'above' not in node.ac_components:
        if 'nocanvas' not in node.ac_components and 'norun' not in node.ac_components:
            res += CANVAS
    if 'hidecode' not in node.ac_components:
        node.ac_components['hidecode'] = 'block'
    if node.ac_components['hidecode'] == 'none':
        res += UNHIDE
    if 'suffix' in node.ac_components:
        res += SUFF
    if 'nopre' not in node.ac_components and 'norun' not in node.ac_components:
        res += PRE
    if 'autorun' in node.ac_components:
        res += AUTO
    res += END
    res = res % node.ac_components
    res = res.replace("u'","'")  # hack:  there must be a better way to include the list and avoid unicode strings

    self.body.append(res)

def visit_ac_node_latex(self,node):
    res = LATEX % node.ac_components
    self.body.append(res)

def depart_ac_node(self,node):
    ''' This is called at the start of processing an activecode node.  If activecode had recursive nodes
        etc and did not want to do all of the processing in visit_ac_node any finishing touches could be
        added here.
    '''
    pass


def process_activcode_nodes(app,env,docname):
    pass


def purge_activecodes(app,env,docname):
    pass


class ActiveCode(Directive):
    required_arguments = 1
    optional_arguments = 1
    has_content = True
    option_spec = {
        'nocanvas':directives.flag,
        'nopre':directives.flag,
        'above':directives.flag,  # put the canvas above the code
        'autorun':directives.flag,
        'norun':directives.flag,
        'caption':directives.unchanged,
        'include':directives.unchanged,
        'hidecode':directives.flag,
        'nolinenums':directives.flag,
        'tour_1':directives.unchanged,
        'tour_2':directives.unchanged,
        'tour_3':directives.unchanged,
        'tour_4':directives.unchanged,
        'tour_5':directives.unchanged,
        'rows':directives.positive_int,
        'cols':directives.positive_int,
        'cheight':directives.positive_int,
        'cwidth':directives.positive_int
    }

    def run(self):
        env = self.state.document.settings.env
        # keep track of how many activecodes we have.... could be used to automatically make a unique id for them.
        if not hasattr(env,'activecodecounter'):
            env.activecodecounter = 0
        env.activecodecounter += 1

        self.options['divid'] = self.arguments[0]

#        if 'cols' not in self.options:
#            self.options['cols'] = min(65,max([len(x) for x in self.content]))
        if 'rows' not in self.options:
            self.options['rows'] = len(self.content)
        if 'cheight' not in self.options:
            self.options['cheight'] = 400
        if 'cwidth' not in self.options:
            self.options['cwidth'] = 400

        if 'nolinenums' in self.options:
            self.options['linenumflag'] = 'false'
        else: 
            self.options['linenumflag'] = 'true'
        if 'norun' in self.options:
            self.options['readonlyflag'] = 'true'
        else:
            self.options['readonlyflag'] = 'false'
        if self.content:
            if '====' in self.content:
                idx = self.content.index('====')
                source = "\n".join(self.content[:idx])
                suffix = "\n".join(self.content[idx+1:])
            else:
                source = "\n".join(self.content)
                suffix = "\n"
        else:
            source = '\n'
            suffix = '\n'

        self.options['initialcode'] = source
        self.options['suffix'] = suffix
        str=source.replace("\n","*nline*")
        str0=str.replace("\"","*doubleq*")
        str1=str0.replace("(","*open*")
        str2=str1.replace(")","*close*")
        str3=str2.replace("'","*singleq*")
        self.options['argu']=str3

        complete=""
        no_of_buttons=0
        okeys = self.options.keys()
        for k in okeys:
            if '_' in k:
                x,label = k.split('_')
                no_of_buttons=no_of_buttons+1
                complete=complete+self.options[k]+"*atype*"

        newcomplete=complete.replace("\"","*doubleq*")
        self.options['ctext'] = newcomplete
        self.options['no_of_buttons'] = no_of_buttons

        if 'caption' not in self.options:
            self.options['caption'] = ''

        if 'include' not in self.options:
            self.options['include'] = 'undefined'
        else:
            lst = self.options['include'].split(',')
            lst = [x.strip() for x in lst]
            self.options['include'] = lst

        if 'hidecode' in self.options:
            self.options['hidecode'] = 'none'
        else:
            self.options['hidecode'] = 'block'

        return [ActivcodeNode(self.options)]


class ActiveExercise(ActiveCode):
    required_arguments = 1
    optional_arguments = 0
    has_content = True

    def run(self):
        self.options['hidecode'] = True
        return super(ActiveExercise,self).run()


if __name__ == '__main__':
    a = ActiveCode()
