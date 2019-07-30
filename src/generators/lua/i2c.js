/*
 * Whitecat Blocky Environment, i2c block code generation
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L.
 * 
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@whitecatboard.org)
 * 
 * All rights reserved.  
 *
 * Permission to use, copy, modify, and distribute this software
 * and its documentation for any purpose and without fee is hereby
 * granted, provided that the above copyright notice appear in all
 * copies and that both that the copyright notice and this
 * permission notice and warranty disclaimer appear in supporting
 * documentation, and that the name of the author not be used in
 * advertising or publicity pertaining to distribution of the
 * software without specific, written prior permission.
 *
 * The author disclaim all warranties with regard to this
 * software, including all implied warranties of merchantability
 * and fitness.  In no event shall the author be liable for any
 * special, indirect or consequential damages or any damages
 * whatsoever resulting from loss of use, data or profits, whether
 * in an action of contract, negligence or other tortious action,
 * arising out of or in connection with the use or performance of
 * this software.
 */
'use strict';

goog.provide('Blockly.Lua.i2c');
goog.provide('Blockly.Lua.i2c.helper');

goog.require('Blockly.Lua');

Blockly.Lua.i2c.helper = {
	isI2c: function(block, test) {
		return ((
			(test.type == 'i2csetspeed') ||
			(test.type == 'i2cstartcondition') ||
			(test.type == 'i2cstopcondition') ||
			(test.type == 'i2caddress') ||
			(test.type == 'i2cread') ||
			(test.type == 'i2cwrite')
		) && (block.getFieldValue('MODULE') == test.getFieldValue('MODULE')));
	},
	
	hasAncestors: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.i2c.helper.isI2c(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},
	
	name: function(block) {
		var module = block.getFieldValue('MODULE');
		
		return  Code.status.maps.i2cUnits[module][1];
	},
	
	instance: function(block) {
		var module = block.getFieldValue('MODULE');

		return "_i2c" + Blockly.Lua.i2c.helper.name(block);
	},

	attach: function(block) {
		var module = block.getFieldValue('MODULE');
		var code = '';

		if (!Blockly.Lua.i2c.helper.hasAncestors(block)) {
			code += Blockly.Lua.indent(0, 'if (' + Blockly.Lua.i2c.helper.instance(block) + ' == nil) then') + "\n";
			code += Blockly.Lua.indent(1, '' + Blockly.Lua.i2c.helper.instance(block) + ' = i2c.attach(i2c.' + Blockly.Lua.i2c.helper.name(block) + ', i2c.MASTER)') + "\n";
			code += Blockly.Lua.indent(0, 'end') + "\n\n";			
		}

		return code;
	}
};

Blockly.Lua['i2csetspeed'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var speed = Blockly.Lua.valueToCode(block, 'SPEED', Blockly.Lua.ORDER_NONE);
	var tryCode = '', code = '';
	
	Blockly.Lua.addDependency("block", block);

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':setspeed('+speed+')' + "\n");

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set speed for ' + Blockly.Lua.i2c.helper.name(block) + ' speed '+speed+' hz');

	return code;
};

Blockly.Lua['i2cstartcondition'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var tryCode = '', code = '';

	Blockly.Lua.addDependency("block", block);

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':start()' + "\n");

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'start condition for ' + Blockly.Lua.i2c.helper.name(block));

	return code;
};

Blockly.Lua['i2cstopcondition'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var tryCode = '', code = '';

	Blockly.Lua.addDependency("block", block);

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':stop()') + "\n";

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'stop condition for ' + Blockly.Lua.i2c.helper.name(block));

	return code;
};

Blockly.Lua['i2caddress'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var address = Blockly.Lua.valueToCode(block, 'ADDRESS', Blockly.Lua.ORDER_NONE);
	var direction = block.getFieldValue('DIRECTION');
	var tryCode = '', code = '';

	Blockly.Lua.addDependency("block", block);

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':address(' + address + ', ' + (direction == "read" ? "true" : "false") + ')') + "\n";


	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set address ' + address + ' for ' + Blockly.Lua.i2c.helper.name(block) + ' for ' + direction);

	return code;
};

Blockly.Lua['i2cread'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.addDependency("block", block);

	var tryCode = '';
	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, '-- read from ' + Blockly.Lua.i2c.helper.name(block)) + "\n";
	tryCode += Blockly.Lua.indent(0, 'val = ' + Blockly.Lua.i2c.helper.instance(block) + ':read()') + "\n";

	getCode += Blockly.Lua.indent(0, "function _read_" + Blockly.Lua.i2c.helper.name(block) + "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local val") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, "return val") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	Blockly.Lua.addFragment("functions", "_read_" + Blockly.Lua.i2c.helper.name(block), block, getCode);

	code += Blockly.Lua.indent(0, "_read_" + Blockly.Lua.i2c.helper.name(block) + "()") + "\n";

	if (block.nextConnection) {
		code += '\n';
	}

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['i2cwrite'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);
	var tryCode = '', code = '';

	Blockly.Lua.addDependency("block", block);

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':write(' + value + ')') + "\n";

	code += Blockly.Lua.tryBlock(0, block, tryCode,'write ' + value + ' to ' + Blockly.Lua.i2c.helper.name(block));

	return code;
};
