
# backlog
## GUI
* have more complex 3d components for listviews, tables 

## work flow
* drag & drop between browser windows
* drag & drop bug fixes of unintended drag
* copy & paste
* export to glb or zip via GLTFExporter
* upload to storage sketchfab
* list elements that are currently loaded in the region
* remove-elements-button from list and region
* grid for region where elements snap

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
* if file dropped it is mp4 use video-player component   

## misc
* async await
* provide correct logger line numbers 


# Sprint (0) (-Infinty - 01.04.)
* <del>store auth in session-storage</del>

# Sprint 1 (02.04. - 15.04.)