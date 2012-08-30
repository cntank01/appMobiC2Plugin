appMobi Construct2 Plugin
=========================

This plugin will allow you to use appMobi's javascript API and cloud services in your Construct2 game.

Available Actions
=================

Device
------
- Hide Splash Screen
- Show remote site
- Close remote site
- Get remote data
- Install update
- Launch external site
- Execute In Main View
- Set auto-rotate
- Set orientation
- Update connection
- Send SMS

Analytics
---------
- Log event

Cache
-----
- Set cookie
- Remove cookie
- Clear all cookies
- Add to media cache
- Remove from media cache
- Clear media cache

Virtual Pages
-------------
- Add virtual page
- Remove virtual page

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


Available Expressions
=====================

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

Cache
-----
- Cookie
- MediaCache

Notifications
-------------
- New Message Queue Count
- Push Message Text
- Push Message Data
- Push Message Type
- Push Friend User Id


Important Note About Exporting Using DirectCanvas
=================================================
If you are exporting your game using DirectCanvas please include the directcanvasC2.js file in the header of index.html If you do not certain features will not work properly.