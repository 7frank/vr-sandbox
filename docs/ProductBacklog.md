
# backlog
## GUI
* have more complex 3d components for listviews, tables 
* even better hotkeys
    * action + binding
        * intersect, mouseover, focus, document, visible
    * dis/enable hotkeys per category 
        * to be able to switch between modi for transform controls
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
    * sky
* have basic auth and ownership for regions
    * only owner may edit environment
* players can add/remove whatever they want locally
* basic gui    
                
       




 