'use strict';

var solutionTemplate;
var inputs;
var variables = [];
var outputType = '';
var funcName = '';
var codeSelector = '.ace_content';
var printExpected = '';
var printAnswer = '';

var regexBool = '(true|false|0|1)';
var regexInt = '-?\\d+';
var regexFloat = '(?:\\d+\\.)\\d+f?';
var regexString = '\\".*\\"';
var regexVector = '\\[.*\\]';
var regexCapture = '\\[(.*)\\]';

var regexVectorType = 'vector<(.*)>';

function isSupportedType(type) {
  var supportedTypes = ['bool', 'int', 'long long', 'float', 'double', 'string'];
  if (supportedTypes.indexOf(type) != -1) {
    return true;
  }
  if (type.match(regexVectorType) != null) {
    return true;
  }
  return false;
}

function getVariables() {
  solutionTemplate = '';
  $('.ace_line').each(function(index, element) {
    solutionTemplate += $(element).text() + '\n';
  });

  if (solutionTemplate.match(/struct TreeNode/) != null) {
    error('Problems with TreeNode are not yet supported.');
    return false;
  }

  solutionTemplate = solutionTemplate.replace(/\/\*\*(.|\n)*\*\/\n/g, '');
  if (solutionTemplate.match(/^class Solution/) == null) {
    error('Please reset the code block and refresh the page.');
    return false;
  }


  // Parse input variables
  var vars = solutionTemplate.match(/\((.*)\)/);
  if (vars == null) {
    error('Failed to parse the input arguments');
    return false;
  }
  inputs = vars[1];
  var varsText = vars[1].split(/\s*,\s*/);
  for (var i = 0; i < varsText.length; i++) {
    var v = varsText[i];
    var tokens = v.split(/\s+/);
    var type = tokens[0], name = tokens[1];
    if (!isSupportedType(type)) {
      error('Input variable type is not supported by Leet-Compete.');
      return false;
    }
    variables.push({
      name: name,
      type: type,
      isVector: type.match(regexVectorType) != null
    });
  }
  
  // Parse output type
  outputType = solutionTemplate.match(/public:\s+(\S+(?: \S+)?)\s(\S+)\(/);
  if (outputType == null) {
    error('Failed to parse the return value.');
    return false;
  }
  funcName = outputType[2];
  outputType = outputType[1];

  if (outputType.match(regexVectorType) != null) {
    // Output is vector
    printExpected = ' << "{ ";\n';
    printExpected += '  for (int i = 0; i < expected.size(); i++) {\n';
    printExpected += '    cout << expected[i] << (i == (int)expected.size() - 1 ? " }\\n" : ", ");\n';
    printExpected += '  }';
    printAnswer = printExpected.replace(/expected/g, 'answer');
  } else {
    // Output is regular variable.
    printExpected = ' << expected << endl;';
    printAnswer = ' << answer << endl;';
  }
  return true;
}

function getVector(variable, input) {
  var elementType = variable.type.match(/vector<\s*(.*)\s*>/)[1];
  var result = [];
  result.push(elementType + ' vec[] = { ' + input.match(/\[(.*)\]/i)[1] + ' };');
  result.push(variable.name + '.assign(vec, vec + sizeof(vec) / sizeof(vec[0]));');
  return result;
}

function getInput(input) {
  var regex = '';
  for (var i = 0; i < variables.length; i++) {
    var name = variables[i].name;
    var type = variables[i].type;
    regex += '(?:' + name + '[\\s\\n]*[=:][\\s\\n]*)?';
    switch (true) {
      case type == 'bool':
        regex += '(' + regexBool + ')';
        break;
      case type == 'int' || type == 'long long':
        regex += '(' + regexInt + ')';
        break;
      case type == 'float' || type == 'double':
        regex += '(' + regexFloat + ')';
        break;
      case type == 'string':
        regex += '(' + regexString + ')';
        break;
      case type.match(regexVectorType) != null:
        regex += '(' + regexVector + ')';
        break;
    }
    regex += '[\\s\\n,;]*';
  }
  var result = [];
  var matched = input.match(RegExp(regex, 'i'));
  if (matched == null) {
    error('getInput exception');
    return [];
  }
  for (var i = 0; i < variables.length; i++) {
    var content = matched[i + 1];
    if (!variables[i].isVector) {
      result.push(variables[i].name + ' = ' + content + ';');
    } else {
      result = result.concat(getVector(variables[i], content));
    }
  }
  return result;
}

function getOutput(output) {
  var result = '', value = '';
  var isVector = false;
  switch (true) {
    case outputType == 'bool':
      value = output.match(RegExp(regexBool, 'i'))[0].toLowerCase();
      break;
    case outputType == 'int':
      value = output.match(RegExp(regexInt, 'i'))[0];
      break;
    case outputType == 'float':
      value = output.match(RegExp(regexFloat, 'i'))[0];
      break;
    case outputType == 'string':
      value = output.match(RegExp(regexString, 'i'))[0];
      break;
    case outputType.match(RegExp(regexVectorType, 'i')) != null:
      isVector = true;
      value = output.match(regexCapture)[1];
      break;
  }
  var result = [];
  if (!isVector) {
    result.push('expected = ' + value + ';');
  } else {
    var vectorType = outputType.match(regexVectorType)[1];
    result.push(vectorType + ' outVec[] = {' + value + '};');
    result.push('expected.assign(outVec, outVec + sizeof(outVec) / sizeof(outVec[0]));');
  }
  return result;
}

function findVariables(testNum, content) {
  var input = content.match(/Input:((?:.|\n)*)Output/i);
  var output = content.match(/Output:[\s\n]*(\S+)[\s\n]+(?:Explanation|$)/i);
  if (input == null || output == null) {
    error('Failed to parse sample ' + testNum);
    return;
  }
  input = input[1];
  output = output[1];
  return {
   input: getInput(input),
   output: getOutput(output)
  };
}

function removeReference(s) {
  return s.replace(/&/g, '');
}

function process() {
  if (!getVariables()) {
    return;
  }
  var inputArgs = variables.map(function(v) {
    return v.name;
  });
  
  var finalCode = headerTemplate + '\n' + solutionTemplate + '\n';
  
  runTest = runTest.replace('{{inputs}}', inputs);
  runTest = runTest.replace('{{outputType}}', outputType);
  runTest = runTest.replace('{{funcName}}', funcName);
  runTest = runTest.replace('{{inputArgs}}', inputArgs.join(', '));
  runTest = runTest.replace('{{outputType}}', outputType);
  runTest = runTest.replace('{{printExpected}}', printExpected);
  runTest = runTest.replace('{{printAnswer}}', printAnswer);
  
  finalCode += runTest + '\n';
  
  finalCode += 'int main() {\n'; // Start testing main function
  finalCode += '  bool allSuccess = true;\n'
  
  for (var i = 0; i < variables.length; i++) {
    finalCode += '  ' + removeReference(variables[i].type) + ' ' + variables[i].name + ';\n';
  }
  finalCode += '  ' + outputType + ' expected;\n';
  
  $('.question-content > pre').each(function(index, pre) {
    var testNum = index + 1;
    var inout = findVariables(testNum, $(pre).text());
    
    var testBlock = '  {\n';
    testBlock += '    ' + inout.input.join('\n    ') + '\n';
    testBlock += '    ' + inout.output.join('\n    ') + '\n';
    testBlock += '    bool success = runTest(' + testNum + ', ' + inputArgs.join(', ') + ', expected);\n';
    testBlock += '    allSuccess &= success;\n';
    testBlock += '  }\n';
    
    finalCode += testBlock;
  });
  
  finalCode += '  if (!allSuccess) cout << "Some cases did not pass." << endl;\n';
  finalCode += '  else cout << "All samples succeeded! :)" << endl;\n';
  finalCode += '  return 0;\n}\n'; // end testing main function
  
  $('<pre id="leet-compete-code"></pre>').text(finalCode)
    .insertAfter('.question-content').hide();
}

process();
addButtons();
