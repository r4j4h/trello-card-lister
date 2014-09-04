Trello Card Lister
------------

Node.js script to parse the Names of Cards on a Board. Kept super slim - no API auth keys required.

Instructions
==============

1. Go to your desired Trello board
2. Add .json to the end of the URL
3. Copy or Save the JSON into or over input.json
4. Run the script
5. Look at output.json


Future Plans
=================

- Support other input methods
  - URL of Trello Board
    - Would require logging in, or using the API with an auth key
  - stdin
- Support listing more data
  - Descriptions
  - Enable marrying checklist contents under cards
- Support other output formats than newline strings
  - JSON array
  - CSV
