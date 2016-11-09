# jsBot - Practical implementation of Major Project
## Experimenting various methods, for extracting metadata from javascript source-code, to determine a possible increase in data-output, in relation to classic HTML crawling.

## /public
Contains the control page used for the experiment.

## /src
Contains the main program files:
- /src/chrome.init.js: Intitialization script for jsBot.
- /src/jsBotClient.js: jsBotClient class, used for traversal and injection.
- /src/jsBotStorage.js: jsBotStorage used as temporary storage for raw results.
- /src/difflib.js,difflibview.js: Differential script dependencies.

### Generating jsBotClient file.
gulp needs to be execute to combine jsBotClient with all its dependencies, before it can be loaded into the chrome extension. The file will appear in the root folder as: jsBotClient.min.js.
This is necessary to import the Google Chrome Extension.

## /analyze
Contains program files for post analysis of raw results:
- /analyze/process_results.js: Post analysis NodeJs software.
- /analyze/results/\*: Directory for raw data .json files.
