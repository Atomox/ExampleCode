# Building React Native Apps


## Building
`react-native run-[ios|android]`

## IOS Errors:

### Third-Party React Native Errors:

#### Glog Error

Xcode 10: third-party: 'config.h' file not found

- `cd node_modules/react-native/scripts &&
./ios-install-third-party.sh`
- `cd <Your-Project-Folder>/node_modules/react-native/third-party/glog-0.3.4 &&
./configure`

- See: https://github.com/facebook/react-native/issues/14382

#### libfishhook.a not found

```error: Build input file cannot be found: '/Users/Atomox/Sites/mta-node/app/node_modules/react-native/Libraries/WebSocket/libfishhook.a'
```

For some reason, this file is built, and needs to be moved into react-native's WebSocket directory.

- copy: `ios/build/Build/Products/Debug-iphonesimulator/libfishhook.a`
- past: `../node_modules/react-native/Libraries/WebSocket/`

- See: https://github.com/facebook/react-native/issues/19569
