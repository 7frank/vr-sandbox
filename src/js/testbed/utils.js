
function createTest(componentName, container) {

    if (!container) container = $("<a-entity>")


}



//TODO handle load  load events and check out if a component emits a "created" - event
function reloadComponent(name,params,container,cycles)
{

    var createdTimer,removedTimer,results=[];


     var arr=createArrayContainer(cycles)

    asyncForEach(arr,function(el,handler){



        function createdCallback(){
            createdTimer.stop()
            container.removeEventListener("created",createdCallback)
            removedTimer.start()
            container.removeAttribute(name)
        }


        function removedCallback(){
            removedTimer.stop()
            container.removeEventListener("removed",removedCallback)


            results.push({tCreated:createdTimer.time(),tRemoved:removedTimer.time()})

            handler.next()
        }


        container.addEventListener("created",createdCallback)
        container.addEventListener("removed",removedCallback)
        createdTimer.start()
        container.setAttribute(name,,params)


  })

}


function sampleTest() {

    var container = $("<a-box>")
    createTest("cdlod-terrain", container)


    //make test where component is fully in viewport (like zoom-to-fit)

    //have one test where the component is outside of camera frustum


    //have a repeated unload load test


}