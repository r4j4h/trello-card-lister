Trello Card Lister
------------

Node.js script to parse the Names of Cards on a Board. Kept super slim - no API auth keys required.

Instructions
==============

1. __Browse to__ your desired __Trello board__ in your favorite browser
2. Add `.json` to the end of the __URL__
3. __Copy__ or __Save__ the JSON into or over `input.json`
4. Run the script (`node lister.js`)
5. Look at `output.json`, `output-shortUrls.json`, and `output-descriptions.json`


Future Plans
=================

- Support other input methods
  - URL of Trello Board
    - Would require logging in, or using the API with an auth key
    - _Download is in, just need to do auth piece._
  - stdin
- Support listing more data
  - Enable marrying checklist contents under cards
- Support other output formats than newline strings
  - JSON array
  - CSV
