# snpext

A simple extension to easily allow for modifying Snapchat.


## Installation

```sh
# install build dependencies
bun install --frozen-lockfile
# build extension (these are default settings)

# WATCH   - watches over every file in src/ and rebuilds upon change
# DEV     - minification setting (true = unminified, false = minified)
# VERBOSE - if the logging should verbose
# LFOR    - what plugins to enable verbose logging for, either a space or comma delimited string or `*` for all; defaults to none if `DEV` is false, and defaults to `*` if `DEV` is true
bun ./scripts/build.ts --watch --dev --verbose
```

### Extension Installation

#### Chromium
* Navigate to the respective extensions tab.
* Turn on the Developer Mode switch (typically located in the top right of the extensions page)
* Click on the "Load Unpacked" button
* Browser to the project directory, and select the folder named `dist`

#### Firefox
* Navigate to about:debugging
* Proceed to the This Firefox tab
* Select Load Temporary Add-on…
* Navigate to the `dist` folder and select any file within it.
