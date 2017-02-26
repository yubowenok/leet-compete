# Leet-Compete
Chrome extension for competing in LeetCode contests

This chrome extension parses the contest problem page and generates runnable template code with calls to the Solution class for local testing.
It supports batch testing on all available sample cases.
With the extension you no longer need to use the page's "Run Code" button and suffer the long wait!

**Supported Languages:** C++

Leet-Compete on problem [Longest Word in Dictionary through Deleting](https://leetcode.com/contest/leetcode-weekly-contest-21/problems/longest-word-in-dictionary-through-deleting/).

![Leet-Compete Result](https://cloud.githubusercontent.com/assets/1314429/23338310/325e8a44-fbd5-11e6-82a2-009109c8650d.png)

## Usage

- Goto the chrome extension page (chrome://extensions/) in the chrome settings.
- Enable "Developer Mode"
- Drag the crx file into the page and install the extension. Or "Load unpacked extension" and select the leet-compete source directory.

Note: You may modify the header-template.js to use your own C++ template headers.

## Warning

The extension relies on parsing the sample `<pre>` and the solution code blocks.
However LeetCode does not have a uniform style in formatting sample input/output.
It is possible some problems have special formatting that results in the failure of this extension.
This extension has now only been tested on a very limited set of problems.
Use at your own risk!