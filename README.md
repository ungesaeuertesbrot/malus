MALUS
=====

**Modular Application Loader and Utility Set**

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
   or other modules and extending extension points usually defined by the same
   module.

The framework is in many ways similar to that of other extension mechanisms such
as that of the Eclipse platform or Mono.Addins. Just like those, it defines
modules which are bundles of *extension points* and *extensions*. The main
difference is that MALUS is for JavaScript/Gjs and is not a library to be used
by appications which are instantiated in a regular fashion but rather makes the
application itself into a module for MALUS. And, of course, MALUS is currently
far less powerful than the Eclipse platform (and will by all probability remain
so).

Utilities
---------

In addition MALUS contains a number of utilities. These can be accessed through
`imports.malus` and are:

### `imports.malus.application`
Contains the class `Application` which is used to represent the basic
information on the application. The application's info.js (or rather the object
generated from the JSON contained therein) is stored in the `info` field, the
path the application is based in in `base_path`.

### `imports.malus.context`
This contains four variables initially, but further fields may be added later.
The initial variables are:

1. `paths`: An array of paths. These are:
    1. The directory for the application's binaries in `bin`,
    2. the prefix MALUS is installed in in `malus_prefix`,
    3. the directory for shared data of MALUS itself in `malus_share`,
    4. the prefix the application is installed in in `prefix` and,
    5. the directory containing the shared data of the application in `share`.
2. `application`: The Application object. See `imports.malus.application`.
3. `settings`: A `Settings` object. See `imports.malus.settings`.
4. `modules`: A `ModuleManager` which will give you access to addons and
   extensions. See `imports.malus.module_manager`.

### `imports.malus.event`
A simple API for adding event logic to JavaScript classes. Events are added to a
prototype by calling `add_event` or `add_events` on it. This will also extend
the prototype with a number of functions, namely `has_event` to check if an
object or its prototype contains a certain event, `add_event_listener`,
`remove_event_listener` and `fire_event`, which should be rather
self-explanatory. Owing to the structure of JavaScript an event is but a string
naming it -- there is no such thing as a definition of a delegate.

### `imports.malus.iface`
Provides a mechanism to test an object for conformance to an “interface”.
Basically this checks wheather certain fields are present and of a specified
type (such as `function`). This is used in the definition of extension points.

### `imports.malus.module_manager`

### `imports.malus.patches`

### `imports.malus.settings`

### `imports.malus.version`

Running an Application
----------------------

Running an application using MALUS involves these steps:

1. Launch the malus binary which is located at MALUS_SHARE/parts/malus/malus.js.
   One to Three pieces of information are required for this step. These are:
    1. The prefix MALUS is installed in. This may be passed on the command line
       using the `-m` option (e.g. `malus -m /opt`). If this option is not
       present MALUS will take the value of the `MALUS_PREFIX` environment
       variable. If this variable is not present either it will default to
       /usr/local.
    2. The prefix the application is installed in. The same semantics as above
       apply with the command line option being `-a` and the environment
       variable `MALUS_APP_PREFIX`. Also, it will default to the value of the
       prefix of MALUS instead of a hard coded value.
    3. The name of the application. This *must* be passed as either the argument
       to the `-n` command line option or the value of the `MALUS_APP_NAME`
       environment valiable, the former taking precedent over the latter. If
       none of the two is present, MALUS will fail with an error.
2. MALUS will set up the context (`imports.malus.context`) and calculate the
   paths in context.paths based on the information from step one.
2. MALUS will then create the Application object and read the basic information
   on the application from $MALUS\_APP\_PREFIX/share/$MALUS\_APP\_NAME/info.js.
   This file must contain an unnamed JSON-object which shall carry the following
   fields:
    1. `name`: The name of the application, usually the same as passed to the
       MALUS executable in the step above.
    2. `version`: The version of the application.
    3. `title`: The user-visible name (this might be "BONUS" where `name` is
       "bonus").
    4. `description`: A description of what the application does.
    5. `malus_version`: The minimum version of MALUS required to run the
       application.
    6. `allow_user_modules`: Whether a user may install extra modules in
       addition to those in APP\_SHARE/modules in his home directory. This will
       enable the user to run arbitrary code in the context of the application.
3. MALUS loads the settings for the application if any are present and makes
   them available in `imports.malus.context.settings`.
4. MALUS sets up the ModuleManager and reads basic information on all modules.
5. MALUS will load the extension to the "/" extension point (only one is allowed
   to exist within the application) and execute the `run` function of its
   extension object.
6. After the `run` function returns MALUS stores the settings and terminates.

