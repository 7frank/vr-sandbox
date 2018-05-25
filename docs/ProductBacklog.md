# youtube/paetron
* create videos for new features
    * import transform
    * configure
    


# mai 14.-16. ongoing
## fixme & bug tracking  
* fix rebind not working in hk library
* fix controls, in they general will not be as stable with the 1.0.2 hotkey implementation
    * occurs if waiting for some time and maybe leaving window
        * maybe due to visibility-change event triggering focus/blur
    * <del>moving sometimes get stuck resulting in autowalk(focus change maybe?)</del>
        * stops of window blur so "custom-wasd-controls" 
            * also when start moving and then quickly changing focus by hovering over object a small speed damping occurs
                    * could have to do how custom-wasd-controls handle movement and interfering with the current hotkey implementation
        * Note: adding "debounce keydown 100 => key disabled" will mostly solve the problem 
    * Note: partial solution is removing universal-controls and adding look-controls again
        * this on the other hand creates trouble with pointer lock
        * still it seems that sometimes autowalk occurs with jumping as if 2 or more listeners are accessing the position data of the player
            * or maybe due to physics?   
    * occurs when adding a model via d&d like aviatorgoogles and starting editing  
* fix HOTKEYS keyup should be handled differently because it is not always true that the action was sent from a key event
* fix up vector of billboard
* fix direction vector of glowMaterial 
* fix keyboardinput library currentTarget, see shouldCaptureKeyEvent 
* <del>fix raycaster for simple-car to be able to interact</del>
    * Note:had to add model(setObject3D) after it was fully loaded(emitted model-loaded) 
* <del>fix mem leak when picking ball</del>
    * Note: not calling stopPropagation will result in n+1 handlers being called everytime the action is triggered
* fix create configurable from template => press 't' to open menu => ctrl-z => ctrl+y will recreate the element and all gui elements and will freeze browser 
* test the importer with not working gltf files and make sure something gets rendered
    * if images are missing a missing-texture placeholder should be enough
    * if binaries are not existiing or other things a more meaningfull descriptioin would be nice
* product-config
    * <del>fix mesh selection</del>
        
    * <del>make not selected elements opacity=50%</del>
* <del>drag&drop buggy sometimes showing drop helper and hanging</del>
* fix: adding configurable entity => ctrl+z => ctrl+y => interact will hang frontend    
## fix performance
* fixme performance
    * <del>raycaster intersect object</del>
        * Note dummy-raycaster component for entities that shall not be interacted with
    * <del>getWorldPosition rotation scale quaternion all are badly performing when called often</del>
        * Note: using custom version without updateWorldMatrix(force=true) + foreach children
    * <del>write a issue report and ask for clarification</del>
    * FIXME check if the layer of the boxhelper is visible to the camera if not no update is necessary
* <del>performance of gui-list-view</del>
    * <del>reactive getter and deep are both problematic as they mutate for example the mesh value which in return will slow down significantly</del>
    * <del><b>definitivly somewhere along the line of meshlistview/vue/reactiveGetter</b></del>
    * <del>as a side effect the raycaster for the glasses.zip will be significantly slower</del>
        * <del>raycast glasses.zip will take 40ms every tick but we don't need that precision for the product-configurator</del>
    * TODO refactor listview   
        
## todo & features
* [/] have a region with a helmet/car
    * create some controls
        * a menu with some specific sub-nodes
            * <del> color control </del>
            * <del> material control </del>
            * <del>mesh control to select parts of the el or mesh</del>
            * mesh control to replace a part with some other like a primitive for simplicity
        * <del> use "createTemplateListView" to create a more versatile/stable listview </del>
    * have animation paths when selecting from the mesh list 
        * also make other elements transparent as they are not the focus of the user   
        * animationPath component based on 
            * http://ngokevin.com/blog/aframe-component/#line-component-schema
            * and zoom-utils of previous work with zoom component and tweenjs
* [/]create some different billboard components
    * http://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/billboards/
* add undo manager to template-list-view and color select  
* improve components 
    * http://ngokevin.com/blog/aframe-component/#line-component-schema
    * and see other implementations like gui-button for building/extending other components 
* be able to jump on created templates and boxes via jump-component
* <del>create wireframe preview for specific selected partial mesh within object as overlay</del>
    * <del>then use material and color select lists to alter</del> 
* have different options to alter an element
    * group 'editable' handles all other editing components    
        * eg 
            * configurable (mesh/material/color)
            * transformable (translate/scale/rotate)
        * if one component gets set the previous/others are cached and hidden        
* have dedicated actions 'action-mod-1' 'action-mod-2' action-mod-3' bound to ctrl/shift/ctrl+shift by default 
* component that places menu items directly on the hud (might interfere with picking if pointerlock is enabled)    
* multi-page-dialog
    * every child node is one page
    * use created videos in demo scene where dialog contains video
        * https://you-link.herokuapp.com/?url=https://www.youtube.com/watch?v=IwdB-7uNHfk
* draw placeholder images when gltf-zip does not contain valid links
## loading screen
https://www.npmjs.com/package/loadscreen

        
## todo gui-hud
* have a second renderer for hud-gui
    * render gui at first with depthwrite enabled but depth write value == closest
    * render second time normal but no need for sorting or matrix updates
## undo manager
* use the undo stack to position elements and create a keysequence of that
    * action-component & action-start-animation and listeners for undoMgr
    
# feature outline
## hotkeys
* the hotkeys plugin shouldn't solely work with keyboard but with other arbitary events
    * meaning if I bind an action to a list of events and combos they all will trigger the action
    * problems occur if we rely on data passed by the event like if the first or second handler where triggered
        * so how to handle such cases?    
        
    * also further abstraction  should exist in the form of actions
        * example: an action "move-forward"
            * bound to "keyboard:w" and "mouse:down" and "deviceX:buttonY"
        * menu-up/down  or next prev + child/parent menu 
            * ....  
            
* cors 
    * in case the user does have its private storage attached
        * https://www.npmjs.com/package/cors-anywhere
        * proxy and/or upload files for easier work flow
* preview-table-component
    * have a component that goes into menu mode when an item in the world is clicked and preview it
        * have product configurator work with that one
    * have a table element where the items lie on top of where the forementioned behaviour will be triggered
    




# backlog
## GUI
* have more complex 3d components for listviews, tables 
* even better hotkeys
    * action + binding
        * intersect, mouseover, focus, document, visible
    * dis/enable hotkeys per category 
        * to be able to switch between modes for transform controls
        * to disable hotkeys when mouse leaves browser region
    
    
## work flow
* drag & drop between browser windows
* copy & paste
    * <del>drag & drop bug fixes of unintended drag</del>
* <del>export to glb or zip via GLTFExporter</del>
* upload to storage sketchfab
* list elements that are currently loaded in the region
* remove-elements-button from list and region
* grid for region where elements snap
* if we are overloading ctrl+x,c,v and drag&drop too much then we should add a ring menu that shows details of the potential action
    * user ctrl+c a plane 
        * does he want to copy the texture to alter it or does he want to copy the plane?
    * as an alternative we should/could have a tool bar
* <del>implement an undo manager right from the start</del>
    * <del>bind hotkeys</del>
    * <del>create some convenience functions</del>
    

## network
* disable network via url param to be able to test on your own

## gameplay

## showcases/advertisement
* create short feature/progress videos and upload on youtube 
* link youtube videos into editable-region that works as a tutorial 
* create some interactable demo components like:
    * jump pad
    * <del>vehicle</del>
        * improve car component to have arbitrary chasis and tire- models
* bundle demo and let ppl create content
    * and get feedback of what they want to create next


## terrain
* improve terrain classes 
* add gras (@see https://github.com/spacejack/terra) non-commercial license though

## persistence
* have a db that stores region/owner/contributer information with rudimentary auth and region-admin panel 
* use graphql for persistence


## physics
* override body.world.gravity 
    * use proxy o. Ä to fetch region gravity vector
    * we'll need local-physics per region otherwise server-side authorative physics seems troublesome for lots of regions

## minor tasks 
* networked <del>translate</del> rotate scale of object
* store region data in local-storage
* reset store via url param in case something hangs
* improve downloading entity
    * have a dialog pop up with details of selection and scenegraph listing so user may change selection
* make region look like grid (transparent texture might be enough)
* merge 2 implementations of listviews into one vue-component  
* remove drag & drop flickering bugs
* create video-player component from https://github.com/etiennepinchon/aframe-videoplayer
* if file dropped is texture create 1x1 plane for it
    * if shift? is pressed while dropping the target element under the cursor will receive the image as material
        * library hides drop event so additionally we need to capture the evt or raytrace into the scene from the position
* if file dropped it is mp4 use video-player component  
* implement file & clipboard 'paste' via default event similar to how drag&drop works at the moment 
    * https://ourcodeworld.com/articles/read/491/how-to-retrieve-images-from-the-clipboard-with-javascript-in-the-browser
* fix rescaling of imported model controls
* have an alternative 'grab' mode for imported models

## misc
* async await
* provide correct logger line numbers 
* evaluate: it might be better to have a external map for the registration of components, to prevent naming conflicts in src.. but on the other hand how would the changes reflect in the html portions
*  web worker & transferable objects to improve streaing of regions and models
    * https://github.com/mrdoob/three.js/issues/11746 
    * imp for obj https://kaisalmen.de/proto/test/meshspray/main.src.html


# Sprint (0) (-Infinty - 01.04.)
* <del>store auth in session-storage</del>

# Sprint 1 (02.04. - 15.04.)
* have a somewhat running increment deployed after the first week to support nightly builds
    * register packages in npm
    * integrate travis and try to not fail tests, otherwise circumvent tests
    * deploy to heroku
* have the tutorial section as entry point and create/include some videos
    * the tut section will be a feature overview at first, where users may test each feature for themself      
* build editing system (import, export, storage for 3d models)    
* network (primarily week 2)
    * fix bugs 
        * sync without client reload
        
        
# Sprint 2 (16.04. - 2.05.)
* terrain and physics
    * have one terrain that the user interacts with
    * add grass
    * water
        * http://madebyevan.com/webgl-water/
        * https://github.com/dli/fluid
        
    * sky
* have basic auth and ownership for regions
    * only owner may edit environment
* players can add/remove whatever they want locally
* basic gui    
                
       




 