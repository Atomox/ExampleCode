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


#### Problems Building to Physical Device

React-Native Versions in the 0.5x series (up to 0.57) trying to compile to Xcode 10 are having issues because of a new build system introduced in 2017's WWDC. As a result, you need to set the build system to `Legacy Build System`. In Xcode, in the project, look in the status bar in the top, center of the screen. There is a hammer icon. Click this to configure build settings, including this one.

#### Cannot Make External HTTP Calls

Since iOS 9, you are not allowed to make http calls, and must make all calls to https-enabled (SSL/TLS 2) servers. In dev mode, localhost is excluded from this.

You can add exceptions to this in your app's info.plist file, but rebuilding or rerunning the run-ios command will likely overwrite this.

You may see an error like below, or your fetch may simply fail.
```
CFNetwork SSLHandshake failed (-9801)
Error Domain=NSURLErrorDomain Code=-1200 "An SSL error has occurred and a secure connection to the server cannot be made." UserInfo=0x7fb080442170 {NSURLErrorFailingURLPeerTrustErrorKey=<SecTrustRef: 0x7fb08043b380>, NSLocalizedRecoverySuggestion=Would you like to connect to the server anyway?, _kCFStreamErrorCodeKey=-9802, NSUnderlyingError=0x7fb08055bc00 "The operation couldn’t be completed. (kCFErrorDomainCFNetwork error -1200.)", NSLocalizedDescription=An SSL error has occurred and a secure connection to the server cannot be made., NSErrorFailingURLKey=https://yourserver.com, NSErrorFailingURLStringKey=https://yourserver.com, _kCFStreamErrorDomainKey=3}
```

To enable the override, you should do it per-domain. Here are the settings for the info.plist file:

```
<!--Include to allow subdomains-->
<key>NSIncludesSubdomains</key>
<true/>
<!--Include to allow HTTP requests-->
<key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key>
<true/>
<!--Include to specify minimum TLS version-->
<key>NSTemporaryExceptionMinimumTLSVersion</key>
<string>TLSv1.1</string>
```

Instead, set these in your XCode Project from inside Xcode itself. This seems to preserve the changes:

1. Open your App in Xcode.
2. Navigate to the filebrowser, and find your info.plist file, which should be in the app folder, at project root.
3. Looks for *App Transit Security Settings*, then _exception domains_. You should see an existing entry for localhost. The plus icon should allow a new item under Exception Domains. Make the name the value of your domain, like www.example.com, or subdomain.example.com. Make the Type a Dictionary.
4. We'll add each key listed in the above XML as a key, using the proper type (bool or string), with the appropriate value.
5. NSIncludesSubdomains: true
6. NSTemporaryExceptionAllowsInsecureHTTPLoads: true
7. NSTemporaryExceptionMinimumTLSVersion:TLSv1.1
