



| |
| :---: |
| <h1>simple-rocket-league</h1> |
| A-Frame based rudimentary implementation of the game rocket league |
| [![Build Status][ci-image]][ci-url] [![A-Frame Version][aframe-image]][aframe-url] [![Project License][license-image]][license-url] |
| [![Grade Badge][codacy-grade-image]][codacy-grade-url] [![Coverage Badge][coverage-image]][coverage-url]   |
| [![Dependencies][dep-status-image]][dep-status-url] [![Dev Dependencies][devdep-status-image]][devdep-status-url] |


# project overview
* NOTE:currently it is a mix of a quick and dirty rocket-league clone and rudimentary scene/html editing tool

the goal of this project is to test the capabilities of a-frame together with some live-editing by using a etherpad-lite overlay to enter or edit the content of the scene

## Features
* physics - cannon.js
* network - npm i networked-aframe
* visulalisation - a-frame

## credits, references, acknowledgements
* car behaviour and assets -  [jeromeetienne/tquery/car](https://github.com/jeromeetienne/tquery/tree/master/plugins/car)
* boilerplate code -   [mkungla/aframe-webpack-boilerplate](https://github.com/mkungla/aframe-webpack-boilerplate)
* network physics -  [lance-gg/sprocketleague](https://github.com/lance-gg/sprocketleague)



* [Try out online](https://fierce-earth-97894.herokuapp.com/)

## technical goals
* test react components and elements
* use a-frame
* create some a-frame components
* have an easy way to import a-frame components into the project from the viewer to extend scene
* have an <strike>ace-editor</strike> overlay  
    * but use etherpad-lite in the future for the colalboartive demo aspect
* have some diffing tool for the virtual dom and live editing

    
## potential extensions

* xsd validation for html artifacts to make sure that a edited scene is updated as soon as the dom would be in a valid state    
* see stackblitz for how a possible ide container wwould look like
* file system with user access policy to prevent harrasement of public code
* https://oasis.sandstorm.io/grain/2xFiyRc7z9QgLaKG73Log9 for hosting apps
* vs code as basic editor for advanced users with elevated priviliges
    * a-frame-testas a preview extension and standalone viewer for a list of areas (each area owned by a specific user and a list of colalborators which the author may define in a separate file) 
    * SampleWorld 1
        * users.config
            * owner:nkre
            * collaborators: xyz(0,0,100,100),acd(100,100,100,100)
        * nkre.area.html
        * xyz.area.html
    * if the execution time of an area for a certain user drops on a machine, the rendering of his area is temoprarily disabled for the user to prevent frame drops and harrasment
* https://remotestorage.io/        
        



#test scenarios


## issues

* cors for etherpad lite iframe
* etherpad lite change event ...
* universal camera does jump on desktop
* adding network to ball might have broken game logic
* checkout https://msdn.microsoft.com/en-us/magazine/mt826359.aspx
    * for network physics problem
    
*missing global dependencies for building when nppm install after node_modules got deleted
    npm-run-all
    rimraf
    webpack
    babel-cli (for babel node)
    babel-polyfill error


* physics: the slopes at the edges of the playing field accellerate the player to the outside
    * this might be due to some normal vecotr problem which is  shown on the console. It might be the car normals or the ones of the slopes which are generated or used when physics is wrapping the underlying cylinder 


# todo
* better documentation
    * https://github.com/dwyl/repo-badges/blob/master/README.md
* have a standard set of actions for 3d integration
    * entity-move-left/right/up/down/forward/backward
    * more of above might be defined for with a standartised interface so that components could rely on those events being triggered instead of each component defining their own input keys statically

* integrate keyboard-interactions and components 
    * with server client based websocket events
        * say entity is moving on serverURL
        * would it be better to send an event or better to sync the sortObjects
        * or of use in any way for communication
* ```javascript
   /**
    * have some bind method per entity that uses the abstract entity based mapping
    */
       player.bind=function bind(evtName,handler)
           {

              return EntityWrapper(this,evtName,handler)

           }
* the possible actions for a player/entity should include move x-y-z +- and rotate x-y-z +- == 6 degrees of freedom
    * although look would be simmilar to rotate in lots of cases .... lets test some possuble use cases here
    * theere also should be some kind of normalization per device going on 
        * but look-left via keyboard would need other implementation than look-left via headtraciking
   

# Project skeleton based on boilerplate

- **config** project configuration files.
- **devel** development
  - **coverage** coverage report
- **dist** project release files, output of `npm run build`.
- **src** project source files.
  - **api** Dummy API served by Express
  - **assets** project assets
    - **audio** audio files
    - **images** image files
    - **models** 3D objects and models
    - **video** video files
  - **js** javascript files
    - **a-components** custom components
    - **a-primitives** custom primitives
    - **a-shaders** custom shaders
    - **a-systems** custom systems
    - **project** main application
  - **sass**
    - **config** sass variables and themes
    - **vendor** vendor sass files
    - **project** application styles
  - **scene** A-Frame scene
    - **camera** camera templates (handlebars)
    - **entity** entity templates (handlebars)
    - **sky** sky templates (handlebars)
- **test** testsuites.
- **tmp** Temporary files.

### Custom A-Frame Theme
You can change A-Frame themes by modifying SASS configuration [`$theme` variable](src/sass/config/_index.scss)
```sass
// Color themes red !default, yellow, green, blue
$theme: red;
```
| red | blue | green | yellow |
| :---: | :---: | :---: | :---: |
| ![Theme Default][screeenshot-theme-red] | ![Theme Default][screeenshot-theme-blue]  | ![Theme Default][screeenshot-theme-green]  | ![Theme Default][screeenshot-theme-yellow] |

<!-- ASSETS and LINKS -->
<!-- License -->
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: https://raw.githubusercontent.com/mkungla/aframe-php/master/LICENSE

<!-- A-Frame -->
[aframe-image]: https://img.shields.io/badge/a--frame-0.7.1-FC3164.svg?style=flat-square
[aframe-url]: https://aframe.io/

<!-- travis-ci -->
[ci-image]: https://travis-ci.org/frank1147/simple-rocket-league.svg?branch=master
[ci-url]: https://travis-ci.org/frank1147/simple-rocket-league

 [![Build Status](https://travis-ci.org/frank1147/simple-rocket-league.svg?branch=master)]()

<!-- Codacy Badge Grade -->
[codacy-grade-image]: https://api.codacy.com/project/badge/Grade/7a47a8ae8682467b9e33a3d47a6fbd54
[codacy-grade-url]: https://www.codacy.com/app/marko-kungla/aframe-webpack-boilerplate?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mkungla/aframe-webpack-boilerplate&amp;utm_campaign=Badge_Grade

<!-- Codacy Badge Coverage -->
[coverage-image]: https://api.codacy.com/project/badge/Coverage/7a47a8ae8682467b9e33a3d47a6fbd54
[coverage-url]: https://www.codacy.com/app/marko-kungla/aframe-webpack-boilerplate?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mkungla/aframe-webpack-boilerplate&amp;utm_campaign=Badge_Coverage

[dep-status-image]: https://david-dm.org/frank1147/simple-rocket-league/status.svg
[dep-status-url]: https://david-dm.org/frank1147/simple-rocket-league#info=dependencies
[devdep-status-image]: https://david-dm.org/frank1147/simple-rocket-league/dev-status.svg
[devdep-status-url]: https://david-dm.org/frank1147/simple-rocket-league#info=devDependencies

<!-- Screenshots -->
[screeenshot-theme-red]: src/assets/images/screenshots/theme-red.png
[screeenshot-theme-blue]: src/assets/images/screenshots/theme-blue.png
[screeenshot-theme-green]: src/assets/images/screenshots/theme-green.png
[screeenshot-theme-yellow]: src/assets/images/screenshots/theme-yellow.png
