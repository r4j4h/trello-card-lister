Trello Card Lister
------------

Node.js script to parse the Names of Cards on a Board. Kept super slim - no API auth keys required.

Instructions
==============

1. _Go to_ your desired _Trello board_
2. Add `.json` to the end of the _URL_
3. _Copy_ or _Save_ the JSON into or over `input.json`
4. Run the script (`node lister.js`)
5. Look at `output.json`, `output-shortUrls.json`, and `output-descriptions.json`


Future Plans
=================

- Support other input methods
  - URL of Trello Board
    - Would require logging in, or using the API with an auth key
    - __Download is in, just need to do auth piece.__
  - stdin
- Support listing more data
  - Enable marrying checklist contents under cards
- Support other output formats than newline strings
  - JSON array
  - CSV
