# Building React Native Apps


## Building
`react-native run-[ios|android]`

### Navigating the Simulator
1. Normally, this is not set to auto-reload, so refresh as you make changes. `CMD + R`
2. `Command + D` opens the developer console. NOTE: Debug mode runs the app via the V8 engine, *not iOS*. It will behave differently. Don't assume that compiling in debug mode means it will work in iOS, _particularly with console.log statements_.


### Building to a Device
Note: for iOS, you are required to have a developer account, and register your devices. You have to pay (generally $99) for a developer account.

This really needs to be done from XCode, although you can try:

```
react-native run-ios --device
react-native run-ios --udid XXXX --configuration Release
```



### App Transport Security (ATS)
Since El Capitan and iOS 9, there is a new level of security to declare only those external servers you want your app to talk to. It also expects you to communicate to secure, HTTPS servers exclusively, and has disabled no HTTPS by default.

HTTP can be enabled, but you must be explicit. From Apple:

```App Transport Security (ATS) lets an app add a declaration to its Info.plist file that specifies the domains with which it needs secure communication. ATS prevents accidental disclosure, provides secure default behavior, and is easy to adopt.```


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

```
error: Build input file cannot be found: '/Users/Atomox/Sites/mta-node/app/node_modules/react-native/Libraries/WebSocket/libfishhook.a'
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


#### Building to xCode Release, t.typeof is not a function

```
Terminating app due to uncaught exception 'RCTFatalException: Unhandled JS Exception: t.typeof is not a function.
```

If you're using babel, this error can be caused by the `env` babel preset.

If your .babelrc files looks like this:

```
{
  "presets": ["env", "react-native", "stage-0"]
}
```

Change it to this:
```
{
  "presets": ["react-native", "stage-0"]
}
```

This may resolve the error. Others have discussed this here:
https://github.com/facebook/react-native/issues/19788
