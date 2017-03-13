var runTest = `
bool runTest(int testNum, {{inputs}}, {{outputType}} expected) {
  Solution *sol = new Solution();
  clock_t startTime = clock();
  {{outputType}} answer = sol->{{funcName}}({{inputArgs}});
  clock_t endTime = clock();
  delete sol;
  cout << "[ Test " << testNum << " ]" << endl;
  cout << "Execution time: " << double(endTime - startTime) / CLOCKS_PER_SEC << " seconds" << endl;
  cout << "Expected: "{{printExpected}}
  cout << "Received: "{{printAnswer}}
  cout << "Result: ";
  if (double(endTime - startTime) / CLOCKS_PER_SEC >= 1) {
    cout << "Time limited exceeded" << endl;
  } else if (answer != expected) {
    cout << "Wrong Answer" << endl;
  } else {
    cout << "Correct!" << endl << endl;
    return true;
  }
  cout << endl;
  return false;
}
`;