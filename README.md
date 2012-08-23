MALUS
=====

Modular Application Loader and Utility Set

Introduction
------------

At its core MALUS is a set of JavaScript classes for Gjs intended to make the
development of modular applications for this platform easier. This is how it
works:

1. The malus shell script is called and passed the directory malus is installed
   in, the directory the application is installed in and the name of the
   application.
2. MALUS sets up the relevant directories with the Gjs importer.
3. A JSON-file is read, containing basic information on the application.
4. The addon containing the extension to the "/" extension point is loaded,
   the extension instantiated and run.
5. The root extension may then request further extensions provided by the same
   or other addons and extending extension points usually defined by the same
   addon.

The framework is in many ways similar to that of other extension mechanisms such
as that of the Eclipse platform or Mono.Addins. Just like those, it defines
Addons which are bundles of *extension points* and *extensions*. The main
difference is that MALUS is for JavaScript/Gjs and is not a library to be used
by appications which are instantiated in a regular fashion but rather makes the
application itself into an addon to MALUS. And, of course, MALUS is currently
far less powerful than the Eclipse platform (and will by all probability remain
so).

Utilities
---------

In addition MALUS contains a number of utilities. These can be accessed through
`imports.malus` and are:

**`imports.malus.application`**  
Contains the class `Application` which is used to represent the basic
information on the application. The application's info.js (or rather the object
generated from the JSON contained therein) is stored in the `info` field, the
path the application is based in in `base_path`.

**`imports.malus.context`**  
This contains four variables initially, but further fields may be added later.
The initial variables are:
1. `paths`: An array of paths. These are: The directory for the application's
   binaries n `bin`, the prefix MALUS is installed in in `malus_prefix`, the
   directory for shared data of MALUS itself in `malus_share`, the prefix the
   application is installed in in `prefix` and the directory containing the
   shared data of the application in `share`.
2. `application`: The Application object. See `imports.malus.application`.
3. `settings`: A `Settings` object. See `imports.malus.settings`.
4. `modules`: A `ModuleManager` which will give you access to addons and
   extensions. See `imports.malus.module_manager`.

**`imports.malus.event`**  
A simple API for adding event logic to JavaScript classes. Events are added to a
prototype by calling `add_event` or `add_events` on it. This will also extend
the prototype with a number of functions, namely `has_event` to check if an
object or its prototype contains a certain event, `add_event_listener`,
`remove_event_listener` and `fire_event`, which should be rather
self-explanatory. Owing to the structure of JavaScript an event is but a string
naming it -- there is no such thing as a definition of a delegate.

**`imports.malus.iface`**  
Provides a mechanism to test an object for conformance to an “interface”.
Basically this checks wheather certain fields are present and of a specified
type (such as `function`). This is used in the definition of extension points.

**`imports.malus.module_manager`**  

**`imports.malus.patches`**  

**`imports.malus.settings`**  

**`imports.malus.version`**  

