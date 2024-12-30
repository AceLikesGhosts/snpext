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
WATCH=false DEV=false VERBOSE=true ./scripts/build.ts
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
