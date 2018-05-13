# problems to solve
* actions per region
    * if somehow actions are registered per region how does the user get notified or can change the settings?
* actions for focused/close/visible 3d components
    * how do we handle those cases
    

# better hotkey keymaps
* have some additional methods to enable disable categories
* push/pop categories onto currently relevant stack
* predefined action != on the fly event


* what about if every component registers its hotkeys own hotkeys/actions
    * maybe as a mixin or similar
    * say "global/gameplay"

    *  a video player
        * distance>5 'interact:e' => fullscreen category-push("video-player) 
        * distance>5 'menu-close:esc' => fullscreen category-pop("video-player) 

# Proposal
* actions are registered but not bound to anything by default?
    * if an action is bound to an element 
    * after being registered the actions can be bound to elements
    
    
```
//how would we model player enter/leave vehicle this way



//world-hotkeys.js

Hotkeys.register("player-interact","e")
Hotkeys.register("player-interact")


Hotkeys.on(scene,"player-interact",function(){
sound("error-beep")
})


//car-hotkeys.js
Hotkeys.on(vehicle,"player-interact",function(){

//enter vehicle
Controllers.push(carController)


})

Hotkeys.on(vehicle,"player-interact",function(){

//enter vehicle
Controllers.push(carController)


})

//crate-hotkeys.js
Hotkeys.on(crate,"player-interact",function(){


})


//hud-menue-hotkeys.js
Hotkeys.on(HUDMenu,"player-interact",function(){
//disable specific other controllers while hud is open
//based on type of hud
//non walkable?
//walkable?
//others?

})




```
    



