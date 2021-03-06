appMobi Construct2 Plugin
=========================

This plugin will allow you to use appMobi's javascript API and cloud services in your Construct2 game.

Available Actions
=================

Accelerometer
-------------
When using the accelerometer in your game, export using the phone browser instead of DirectCanvas.
- Watch acceleration
- Stop watching acceleration
- Get current acceleration

Analytics
---------
- Log event

Audio
-----
- PreLoad sound
- Play sound
- Play sound (by name)
- Start audio
- Start audio (by name)
- Stop audio
- Toggle audio
- Unload sound file
- Unload Sound File (by name)
- Unload all sounds

Cache
-----
- Set cookie
- Remove cookie
- Clear all cookies
- Add to media cache
- Remove from media cache
- Clear media cache

Camera
------
- Take picture
- Get picture list
- Import picture
- Delete picture
- Clear pictures

Device
------
- Hide Splash Screen
- Show remote site
- Close remote site
- Get remote data
- Install update
- Manage power
- Launch external site
- Execute In Main View
- Set auto-rotate
- Set orientation
- Update connection
- Send SMS
- Hide status bar

Geolocation
-----------
When using geolocation in your game, export using the phone browser instead of DirectCanvas.
- Watch position
- Stop watching position
- Get current position

Notifications / Push Messaging
------------------------------
- Beep
- Vibrate
- Alert
- Add push user
- Delete push user
- Set user attribute
- Find user
- Show rich message
- Send push notification
- Confirmation modal

Virtual Pages
-------------
- Add virtual page
- Remove virtual page

1Touch
------
- Purchase

Available Events
=====================

Device
------
- Caching enabled
- Push enabled
- Streaming enabled
- Updates enabled
- Is in AppMobi
- Compare orientation
- Compare initial orientation

Triggers
--------
- Accelerometer updated
- Geolocation updates
- On barcode scanned
- On remote site closed
- On remote data
- On 'back' button pressed
- On push enabled
- Push Message Received
- Friend User Id Received
- On Push Sent Success
- On Push Sent Fail
- Friend User Id Not Found
- Picture taken
- Picture list loaded
- File uploaded
- Confirmation approved
- Confirmation declined

1Touch
------
- Payment success
- Payment canceled

Available Expressions
=====================

Accelerometer
-------------
- AccelerationX
- AccelerationY
- AccelerationZ

Cache
-----
- Cookie
- MediaCache

Camera
------
- Picture list count
- Picture url
- Current picture url

Device
------
- appMobi Version
- Model
- OS Version
- Phone Gap Version
- Platform
- UUID
- Connection
- Initial Orientation
- Orientation
- Last Station
- Query String
- Remote Data
- Scanned Barcode Data
- Remote Site Window Status

Geolocation
-----------
- GeolocationLat
- GeolocationLong

Notifications
-------------
- New Message Queue Count
- Push Message Text
- Push Message Data
- Push Message Type
- Push Friend User Id


Important Notes About Using 1Touch
=================================================
You will need to include the onetouch.js file in your index.html file.

Important Notes About Exporting Using DirectCanvas
=================================================
- If you are exporting your game using DirectCanvas please include the directcanvasC2.js file in the header of index.html If you do not certain features will not work properly.